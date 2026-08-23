"use server";

import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { products, productVariants } from "@/db/schema";
import { isFieldVisible } from "@/lib/catalog/types";
import type { PlaceholderTone } from "@/components/commerce/Placeholder/Placeholder";

/**
 * Lecture serveur des produits du panier (audit M-1) : le panier client ne
 * stocke que des références (slug/pointure/coloris) — noms, prix, stocks et
 * photos viennent d'ici, donc de la base, jamais du catalogue statique
 * compilé. Les produits importés et les prix modifiés en admin s'affichent
 * ainsi correctement dans le tunnel.
 */

export type CartProduct = {
  slug: string;
  name: string;
  brand: string;
  price: number;
  tone: PlaceholderTone;
  path: string;
  /** Première photo fournisseur (produits importés) — null pour le catalogue à médias statiques. */
  imageUrl: string | null;
  /** Stock par variante (D-054) — le coloris fait partie de la clé. */
  variants: { color: string; size: string; stock: number }[];
  /** Coloris et leurs photos — la vignette du panier suit le coloris commandé. */
  colors: { name: string; images?: string[] }[];
};

export async function fetchCartProducts(slugs: string[]): Promise<CartProduct[]> {
  const wanted = [...new Set(slugs)].slice(0, 60);
  if (wanted.length === 0) return [];
  const db = await getDb();
  // Produit archivé = retiré de la vente : la ligne s'affiche indisponible.
  const rows = await db.select().from(products)
    .where(and(inArray(products.slug, wanted), eq(products.archived, false)));
  const variants = await db.select().from(productVariants)
    .where(inArray(productVariants.productSlug, wanted));
  return rows.map((p) => ({
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    price: p.price,
    tone: p.tone,
    path: `/${p.brand}/${p.subcategory}/${p.slug}`,
    imageUrl: isFieldVisible(p, "images") ? p.imageUrls[0] ?? null : null,
    colors: isFieldVisible(p, "images")
      ? p.colors.map((c) => ({ name: c.name, ...(c.images ? { images: c.images } : {}) }))
      : p.colors.map((c) => ({ name: c.name })),
    variants: variants
      .filter((v) => v.productSlug === p.slug)
      .map((v) => ({ color: v.color, size: v.size, stock: v.stock })),
  }));
}
