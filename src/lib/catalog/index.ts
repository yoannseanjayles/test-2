import { products, subcategories } from "./data";
import type { Brand, Product, Subcategory, Usage } from "./types";
import { uniqueSortedSizes } from "./sizes";
import { brandLabels } from "./brands";

export * from "./types";
export * from "./sizes";
export * from "./brands";
export { products, subcategories };

export function getSubcategories(brand: Brand): Subcategory[] {
  return subcategories.filter((s) => s.brand === brand);
}

export function getSubcategory(
  brand: Brand,
  slug: string,
): Subcategory | undefined {
  return subcategories.find((s) => s.brand === brand && s.slug === slug);
}

export function getProducts(brand?: Brand, subcategory?: Usage): Product[] {
  return products.filter(
    (p) =>
      (brand === undefined || p.brand === brand) &&
      (subcategory === undefined || p.subcategory === subcategory),
  );
}

export function getProduct(
  brand: Brand,
  subcategory: string,
  slug: string,
): Product | undefined {
  return products.find(
    (p) =>
      p.brand === brand && p.subcategory === subcategory && p.slug === slug,
  );
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

/** Sélection curée « Nos indispensables » (H17 : ordre manuel). */
export function getFeatured(count: number, brand?: Brand): Product[] {
  return getProducts(brand)
    .slice()
    .sort((a, b) => a.curatedRank - b.curatedRank)
    .slice(0, count);
}

export function getNewProducts(): Product[] {
  return products
    .filter((p) => p.isNew)
    .sort((a, b) => a.curatedRank - b.curatedRank);
}

export function averageRating(product: Product): number | null {
  if (product.reviews.length === 0) return null;
  const sum = product.reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / product.reviews.length) * 10) / 10;
}

// ——— Variantes (coloris × pointure, D-054) ———
//
// Le stock ne vit plus sur la pointure seule : une paire en 42 « triple black »
// et la même en 42 « white/red » sont deux articles. Ces helpers sont la seule
// façon d'interroger la disponibilité — additionner `variants[].stock` à la main
// ailleurs dans le code rouvrirait exactement le trou que D-054 ferme.

/** Toutes les pointures du modèle, tous coloris confondus, ordonnées. */
export function productSizes(product: Product): string[] {
  return uniqueSortedSizes(product.variants.map((v) => v.size));
}

/** Pointures déclinées dans un coloris donné, ordonnées (y compris à zéro). */
export function sizesForColor(product: Product, color: string): string[] {
  return uniqueSortedSizes(
    product.variants.filter((v) => v.color === color).map((v) => v.size),
  );
}

/** Stock d'une variante précise — 0 si la combinaison n'existe pas au catalogue. */
export function stockFor(product: Product, color: string, size: string): number {
  return product.variants.find((v) => v.color === color && v.size === size)?.stock ?? 0;
}

/** Stock d'une pointure tous coloris confondus — pour la facette, pas pour la vente. */
export function stockForSize(product: Product, size: string): number {
  return product.variants
    .filter((v) => v.size === size)
    .reduce((sum, v) => sum + v.stock, 0);
}

export function isColorOutOfStock(product: Product, color: string): boolean {
  return product.variants
    .filter((v) => v.color === color)
    .every((v) => v.stock === 0);
}

export function totalStock(product: Product): number {
  return product.variants.reduce((sum, v) => sum + v.stock, 0);
}

export function isOutOfStock(product: Product): boolean {
  return product.variants.every((v) => v.stock === 0);
}

/**
 * Marque à afficher en surtitre, ou `null` si le nom du modèle la porte déjà.
 * Les noms du catalogue sont les noms complets (« On Cloudmonster 3 ») parce
 * que ce sont eux que l'on recherche et que l'on indexe ; les répéter sous une
 * pastille de marque donnerait « On · On Cloudmonster 3 ».
 */
export function brandEyebrow(product: Product): string | null {
  const label = brandLabels[product.brand];
  return product.name.toLowerCase().startsWith(label.toLowerCase()) ? null : label;
}

export function productPath(product: Product): string {
  return `/${product.brand}/${product.subcategory}/${product.slug}`;
}
