import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { categories, products, productSizes, reviews } from "@/db/schema";
import type { Animal, Product, Review, Subcategory } from "@/lib/catalog/types";

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
  const sizes = await db.select().from(productSizes);
  const revs = await db.select().from(reviews).orderBy(asc(reviews.id));
  return rows.map((row) => ({
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    animal: row.animal,
    subcategory: row.subcategory,
    price: row.price,
    shortDescription: row.shortDescription,
    curatorNote: row.curatorNote,
    material: row.material,
    details: row.details,
    colors: row.colors,
    gabarits: row.gabarits,
    isNew: row.isNew,
    curatedRank: row.curatedRank,
    pairsWith: row.pairsWith,
    tone: row.tone,
    sizes: sizes
      .filter((s) => s.productSlug === row.slug)
      .map((s) => ({ name: s.name, stock: s.stock })),
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

export async function fetchProducts(animal?: Animal, subcategory?: string): Promise<Product[]> {
  const db = await getDb();
  const conditions = [
    ...(animal ? [eq(products.animal, animal)] : []),
    ...(subcategory ? [eq(products.subcategory, subcategory)] : []),
  ];
  const rows = await db
    .select()
    .from(products)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(products.curatedRank));
  return hydrate(rows);
}

export async function fetchProduct(
  animal: Animal,
  subcategory: string,
  slug: string,
): Promise<Product | undefined> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.animal, animal), eq(products.subcategory, subcategory)));
  const [product] = await hydrate(rows);
  return product;
}

export async function fetchProductsBySlugs(slugs: string[]): Promise<Product[]> {
  if (slugs.length === 0) return [];
  const all = await fetchProducts();
  const bySlug = new Map(all.map((p) => [p.slug, p]));
  return slugs.map((s) => bySlug.get(s)).filter((p) => p !== undefined);
}

/** Sélection curée (H17). */
export async function fetchFeatured(n: number, animal?: Animal): Promise<Product[]> {
  return (await fetchProducts(animal)).slice(0, n);
}

export async function fetchNewProducts(): Promise<Product[]> {
  return (await fetchProducts()).filter((p) => p.isNew);
}

export async function fetchSubcategories(animal: Animal): Promise<Subcategory[]> {
  const db = await getDb();
  return db.select().from(categories).where(eq(categories.animal, animal));
}

export async function fetchSubcategory(
  animal: Animal,
  slug: string,
): Promise<Subcategory | undefined> {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.animal, animal), eq(categories.slug, slug)));
  return row;
}
