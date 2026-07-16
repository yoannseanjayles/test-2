"use server";

import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { products, productSizes } from "@/db/schema";
import { isFieldVisible } from "@/lib/catalog/types";
import type { PlaceholderTone } from "@/components/commerce/Placeholder/Placeholder";

/**
 * Lecture serveur des produits du panier (audit M-1) : le panier client ne
 * stocke que des références (slug/taille/coloris) — noms, prix, stocks et
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
  sizes: { name: string; stock: number }[];
};

export async function fetchCartProducts(slugs: string[]): Promise<CartProduct[]> {
  const wanted = [...new Set(slugs)].slice(0, 60);
  if (wanted.length === 0) return [];
  const db = await getDb();
  // Produit archivé = retiré de la vente : la ligne s'affiche indisponible.
  const rows = await db.select().from(products)
    .where(and(inArray(products.slug, wanted), eq(products.archived, false)));
  const sizes = await db.select().from(productSizes)
    .where(inArray(productSizes.productSlug, wanted));
  return rows.map((p) => ({
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    price: p.price,
    tone: p.tone,
    path: `/${p.animal}/${p.subcategory}/${p.slug}`,
    imageUrl: isFieldVisible(p, "images") ? p.imageUrls[0] ?? null : null,
    sizes: sizes
      .filter((s) => s.productSlug === p.slug)
      .map((s) => ({ name: s.name, stock: s.stock })),
  }));
}
