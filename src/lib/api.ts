import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { categories, guides, products, productVariants, reviews } from "@/db/schema";
import type { Brand, Product, Review, Subcategory, Usage } from "@/lib/catalog/types";
import { coverFor, type Guide } from "@/lib/guides";

/**
 * Couche d'accès serveur (6.1 jalon 1) — remplace le mock de la Phase 5
 * pour toutes les lectures RSC/SSG. Retourne les types front inchangés
 * (H37) ; les helpers purs de `lib/catalog` continuent de s'appliquer.
 * Les lookups côté client (panier) migrent vers des routes API au jalon 3.
 */

type ProductRow = typeof products.$inferSelect;

async function hydrate(rows: ProductRow[]): Promise<Product[]> {
  if (rows.length === 0) return [];
  const db = await getDb();
  const variants = await db.select().from(productVariants);
  const revs = await db.select().from(reviews).orderBy(asc(reviews.id));
  return rows.map((row) => ({
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    subcategory: row.subcategory,
    price: row.price,
    shortDescription: row.shortDescription,
    curatorNote: row.curatorNote,
    material: row.material,
    details: row.details,
    colors: row.colors,
    genres: row.genres,
    ...(row.sizeAdvice ? { sizeAdvice: row.sizeAdvice } : {}),
    isNew: row.isNew,
    curatedRank: row.curatedRank,
    pairsWith: row.pairsWith,
    tone: row.tone,
    imageUrls: row.imageUrls,
    supplierRef: row.supplierRef,
    sourceUrl: row.sourceUrl,
    features: row.features,
    specifications: row.specifications,
    fieldVisibility: row.fieldVisibility,
    variants: variants
      .filter((v) => v.productSlug === row.slug)
      .map((v) => ({ color: v.color, size: v.size, stock: v.stock })),
    reviews: revs
      .filter((r) => r.productSlug === row.slug)
      .map((r): Review => ({
        author: r.author,
        rating: r.rating as Review["rating"],
        title: r.title,
        text: r.text,
        context: r.context,
        date: r.date,
        verified: r.verified,
      })),
  }));
}

export async function fetchProducts(brand?: Brand, subcategory?: Usage): Promise<Product[]> {
  const db = await getDb();
  // Les produits archivés (corbeille admin) n'apparaissent jamais en boutique.
  const conditions = [
    eq(products.archived, false),
    ...(brand ? [eq(products.brand, brand)] : []),
    ...(subcategory ? [eq(products.subcategory, subcategory)] : []),
  ];
  const rows = await db
    .select()
    .from(products)
    .where(and(...conditions))
    .orderBy(asc(products.curatedRank));
  return hydrate(rows);
}

export async function fetchProduct(
  brand: Brand,
  subcategory: Usage,
  slug: string,
): Promise<Product | undefined> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(products)
    .where(and(
      eq(products.slug, slug),
      eq(products.brand, brand),
      eq(products.subcategory, subcategory),
      eq(products.archived, false),
    ));
  const [product] = await hydrate(rows);
  return product;
}

export async function fetchProductsBySlugs(slugs: string[]): Promise<Product[]> {
  if (slugs.length === 0) return [];
  const all = await fetchProducts();
  const bySlug = new Map(all.map((p) => [p.slug, p]));
  return slugs.map((s) => bySlug.get(s)).filter((p) => p !== undefined);
}

/**
 * Les deux rayons, séparés là où la distinction compte.
 *
 * Le rayon Chaussures ne doit pas se remplir de sweats, et le rayon Ensembles
 * ne doit rien montrer d'autre. Partout ailleurs — nouveautés, listings par
 * genre, accueil — les deux cohabitent : c'est une même boutique, et la
 * facette Marque suffit à s'y retrouver.
 */
export async function fetchShoes(): Promise<Product[]> {
  return (await fetchProducts()).filter((p) => p.subcategory !== "textile");
}

export async function fetchTextile(): Promise<Product[]> {
  return fetchProducts(undefined, "textile");
}

/** Sélection curée (H17). */
export async function fetchFeatured(n: number, brand?: Brand): Promise<Product[]> {
  return (await fetchProducts(brand)).slice(0, n);
}

export async function fetchNewProducts(): Promise<Product[]> {
  return (await fetchProducts()).filter((p) => p.isNew);
}

export async function fetchSubcategories(brand: Brand): Promise<Subcategory[]> {
  const db = await getDb();
  return db.select().from(categories).where(eq(categories.brand, brand));
}

export async function fetchSubcategory(
  brand: Brand,
  slug: Usage,
): Promise<Subcategory | undefined> {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.brand, brand), eq(categories.slug, slug)));
  return row;
}

// ——— Guides éditoriaux (D-037) — en base depuis 7.1 jalon 4 ———

type GuideRow = typeof guides.$inferSelect;

/** Couverture statique (H32) ré-attachée par slug — absente pour les guides créés en admin. */
function hydrateGuide(row: GuideRow): Guide {
  const cover = coverFor(row.slug);
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    brand: row.brand,
    pillar: row.pillar,
    readingMinutes: row.readingMinutes,
    relatedSubcategories: row.relatedSubcategories,
    ...(cover ? { cover } : {}),
    ...(row.author ? { author: row.author } : {}),
    ...(row.content ? { content: row.content } : {}),
  };
}

export async function fetchGuides(): Promise<Guide[]> {
  const db = await getDb();
  const rows = await db.select().from(guides).orderBy(asc(guides.slug));
  return rows.map(hydrateGuide);
}

export async function fetchGuide(slug: string): Promise<Guide | undefined> {
  const db = await getDb();
  const [row] = await db.select().from(guides).where(eq(guides.slug, slug));
  return row ? hydrateGuide(row) : undefined;
}

export async function fetchGuidesFor(brand: Brand, count: number): Promise<Guide[]> {
  return (await fetchGuides())
    .filter((g) => g.brand === brand || g.brand === "tous")
    .slice(0, count);
}

export async function fetchGuideForSubcategory(subcategory: string): Promise<Guide | undefined> {
  return (await fetchGuides()).find((g) => g.relatedSubcategories.includes(subcategory));
}
