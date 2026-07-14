import { products, subcategories } from "./data";
import type { Animal, Product, Subcategory } from "./types";

export * from "./types";
export { products, subcategories };

export const animalLabels: Record<Animal, string> = {
  chien: "Chien",
  chat: "Chat",
  nac: "NAC",
};

export function isAnimal(value: string): value is Animal {
  return value === "chien" || value === "chat" || value === "nac";
}

export function getSubcategories(animal: Animal): Subcategory[] {
  return subcategories.filter((s) => s.animal === animal);
}

export function getSubcategory(
  animal: Animal,
  slug: string,
): Subcategory | undefined {
  return subcategories.find((s) => s.animal === animal && s.slug === slug);
}

export function getProducts(animal?: Animal, subcategory?: string): Product[] {
  return products.filter(
    (p) =>
      (animal === undefined || p.animal === animal) &&
      (subcategory === undefined || p.subcategory === subcategory),
  );
}

export function getProduct(
  animal: Animal,
  subcategory: string,
  slug: string,
): Product | undefined {
  return products.find(
    (p) =>
      p.animal === animal && p.subcategory === subcategory && p.slug === slug,
  );
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

/** Sélection curée « Nos indispensables » (H17 : ordre manuel). */
export function getFeatured(count: number, animal?: Animal): Product[] {
  return getProducts(animal)
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

export function isOutOfStock(product: Product): boolean {
  return product.sizes.every((s) => s.stock === 0);
}

export function productPath(product: Product): string {
  return `/${product.animal}/${product.subcategory}/${product.slug}`;
}
