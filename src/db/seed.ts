import { count } from "drizzle-orm";
import { categories, guides, products, productVariants, reviews } from "./schema";
import { products as demoProducts, subcategories } from "@/lib/catalog/data";
import { guideSeed } from "@/lib/guides";

/**
 * Seed du catalogue (H33) — source unique : `lib/catalog/data`.
 * Idempotent : ne fait rien si la base contient déjà des produits.
 *
 * ⚠️ Cette idempotence est un piège sur une base persistante (audit pivot,
 * OU-2) : remplacer `data.ts` ne produit aucun effet sur une base déjà
 * peuplée. En PGlite (dev, CI, build) la base est reconstruite à chaque
 * démarrage et l'écart ne se voit pas. La bascule d'un catalogue à l'autre
 * passe par une branche Neon neuve, pas par une purge manuelle — et la garde
 * de schéma de `db/index.ts` refuse désormais de démarrer sur l'ancien.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function seedIfEmpty(db: any): Promise<void> {
  // Guides éditoriaux (D-037) : garde indépendante — une base existante
  // (Neon de prod, seedée avant le jalon 4) reçoit quand même ses guides.
  const [existingGuides] = await db.select({ n: count() }).from(guides);
  if (!existingGuides || existingGuides.n === 0) {
    await db.insert(guides).values(guideSeed.map((g) => ({
      slug: g.slug,
      title: g.title,
      excerpt: g.excerpt,
      brand: g.brand,
      pillar: g.pillar,
      readingMinutes: g.readingMinutes,
      relatedSubcategories: g.relatedSubcategories,
      author: g.author ?? null,
      content: g.content ?? null,
    })));
  }

  const [existing] = await db.select({ n: count() }).from(products);
  if (existing && existing.n > 0) return;

  await db.insert(categories).values(subcategories.map((s) => ({
    brand: s.brand,
    slug: s.slug,
    label: s.label,
    description: s.description,
  })));

  await db.insert(products).values(demoProducts.map((p) => ({
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    subcategory: p.subcategory,
    price: p.price,
    shortDescription: p.shortDescription,
    curatorNote: p.curatorNote,
    material: p.material,
    details: p.details,
    colors: p.colors,
    genres: p.genres,
    sizeAdvice: p.sizeAdvice ?? null,
    isNew: p.isNew,
    curatedRank: p.curatedRank,
    pairsWith: p.pairsWith,
    tone: p.tone,
  })));

  // Variantes (D-054) : une ligne de stock par (produit, coloris, pointure).
  // Le catalogue en compte plus d'un millier — insérées par lots, le driver
  // HTTP Neon plafonnant la taille d'une requête.
  const allVariants = demoProducts.flatMap((p) =>
    p.variants.map((v) => ({
      productSlug: p.slug,
      color: v.color,
      size: v.size,
      stock: v.stock,
    })),
  );
  for (let i = 0; i < allVariants.length; i += 200) {
    await db.insert(productVariants).values(allVariants.slice(i, i + 200));
  }

  const allReviews = demoProducts.flatMap((p) =>
    p.reviews.map((r) => ({
      productSlug: p.slug,
      author: r.author,
      rating: r.rating,
      title: r.title,
      text: r.text,
      context: r.context,
      date: r.date,
      verified: r.verified,
    })),
  );
  if (allReviews.length > 0) await db.insert(reviews).values(allReviews);
}
