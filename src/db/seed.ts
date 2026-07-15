import { count } from "drizzle-orm";
import { categories, guides, products, productSizes, reviews } from "./schema";
import { products as demoProducts, subcategories } from "@/lib/catalog/data";
import { guideSeed } from "@/lib/guides";

/**
 * Seed du catalogue démo (H33) — source unique : les données de la Phase 5.
 * Idempotent : ne fait rien si la base contient déjà des produits.
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
      animal: g.animal,
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
    animal: s.animal,
    slug: s.slug,
    label: s.label,
    description: s.description,
  })));

  await db.insert(products).values(demoProducts.map((p) => ({
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    animal: p.animal,
    subcategory: p.subcategory,
    price: p.price,
    shortDescription: p.shortDescription,
    curatorNote: p.curatorNote,
    material: p.material,
    details: p.details,
    colors: p.colors,
    gabarits: p.gabarits,
    isNew: p.isNew,
    curatedRank: p.curatedRank,
    pairsWith: p.pairsWith,
    tone: p.tone,
  })));

  await db.insert(productSizes).values(
    demoProducts.flatMap((p) =>
      p.sizes.map((s) => ({ productSlug: p.slug, name: s.name, stock: s.stock })),
    ),
  );

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
