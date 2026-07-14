import type { Animal, Gabarit, Product } from "./types";
import { averageRating } from "./index";

/**
 * Filtres et tris du listing (spec 2.1 Listing, D-027/D-028).
 * Fonctions pures : l'état vit dans la query-string, canonique vers la
 * catégorie nue (hygiène SEO D-028).
 */

export type SortKey = "selection" | "prix-asc" | "prix-desc" | "notes" | "nouveautes";

export const sortLabels: Record<SortKey, string> = {
  selection: "Notre sélection",
  "prix-asc": "Prix croissant",
  "prix-desc": "Prix décroissant",
  notes: "Meilleures notes",
  nouveautes: "Nouveautés",
};

export type Filters = {
  gabarits: Gabarit[];
  sizes: string[];
  materials: string[];
  colors: string[];
  animals: Animal[];
  priceMin?: number;
  priceMax?: number;
};

export const emptyFilters: Filters = {
  gabarits: [],
  sizes: [],
  materials: [],
  colors: [],
  animals: [],
};

/** OR au sein d'une facette, AND entre facettes (spec Listing S3). */
export function matchesFilters(product: Product, filters: Filters): boolean {
  if (
    filters.gabarits.length > 0 &&
    !filters.gabarits.some((g) => product.gabarits.includes(g))
  ) {
    return false;
  }
  if (
    filters.sizes.length > 0 &&
    !filters.sizes.some((s) => product.sizes.some((ps) => ps.name === s))
  ) {
    return false;
  }
  if (filters.materials.length > 0 && !filters.materials.includes(product.material)) {
    return false;
  }
  if (
    filters.colors.length > 0 &&
    !filters.colors.some((c) => product.colors.some((pc) => pc.name === c))
  ) {
    return false;
  }
  if (filters.animals.length > 0 && !filters.animals.includes(product.animal)) {
    return false;
  }
  if (filters.priceMin !== undefined && product.price < filters.priceMin * 100) {
    return false;
  }
  if (filters.priceMax !== undefined && product.price > filters.priceMax * 100) {
    return false;
  }
  return true;
}

export function applyFilters(prods: Product[], filters: Filters): Product[] {
  return prods.filter((p) => matchesFilters(p, filters));
}

export function sortProducts(prods: Product[], sort: SortKey): Product[] {
  const sorted = prods.slice();
  switch (sort) {
    case "prix-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "prix-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "notes":
      return sorted.sort(
        (a, b) => (averageRating(b) ?? 0) - (averageRating(a) ?? 0),
      );
    case "nouveautes":
      return sorted.sort(
        (a, b) => Number(b.isNew) - Number(a.isNew) || a.curatedRank - b.curatedRank,
      );
    case "selection":
    default:
      return sorted.sort((a, b) => a.curatedRank - b.curatedRank);
  }
}

/**
 * Compte les résultats qu'ajouterait chaque valeur d'une facette, la facette
 * elle-même exclue du calcul (compteurs par valeur, combinaisons vides
 * désactivées — spec Listing S3).
 */
export function facetCounts<K extends keyof Filters>(
  prods: Product[],
  filters: Filters,
  facet: K,
  values: string[],
  matcher: (product: Product, value: string) => boolean,
): Record<string, number> {
  const others: Filters = { ...filters, [facet]: [] };
  const base = applyFilters(prods, others);
  const counts: Record<string, number> = {};
  for (const value of values) {
    counts[value] = base.filter((p) => matcher(p, value)).length;
  }
  return counts;
}

export function countActiveFilters(filters: Filters): number {
  return (
    filters.gabarits.length +
    filters.sizes.length +
    filters.materials.length +
    filters.colors.length +
    filters.animals.length +
    (filters.priceMin !== undefined ? 1 : 0) +
    (filters.priceMax !== undefined ? 1 : 0)
  );
}

/** Sérialisation query-string ⇄ filtres (état restaurable depuis une URL partagée). */
export function filtersToSearchParams(filters: Filters, sort: SortKey): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.gabarits.length) params.set("gabarit", filters.gabarits.join(","));
  if (filters.sizes.length) params.set("taille", filters.sizes.join(","));
  if (filters.materials.length) params.set("matiere", filters.materials.join(","));
  if (filters.colors.length) params.set("couleur", filters.colors.join(","));
  if (filters.animals.length) params.set("univers", filters.animals.join(","));
  if (filters.priceMin !== undefined) params.set("prix-min", String(filters.priceMin));
  if (filters.priceMax !== undefined) params.set("prix-max", String(filters.priceMax));
  if (sort !== "selection") params.set("tri", sort);
  return params;
}

export function filtersFromSearchParams(params: URLSearchParams): {
  filters: Filters;
  sort: SortKey;
} {
  const list = (key: string) =>
    params.get(key)?.split(",").filter(Boolean) ?? [];
  const num = (key: string) => {
    const raw = params.get(key);
    if (raw === null || raw === "") return undefined;
    const value = Number(raw);
    return Number.isFinite(value) && value >= 0 ? value : undefined;
  };
  const rawSort = params.get("tri");
  const sort: SortKey =
    rawSort !== null && rawSort in sortLabels ? (rawSort as SortKey) : "selection";
  return {
    filters: {
      gabarits: list("gabarit") as Filters["gabarits"],
      sizes: list("taille"),
      materials: list("matiere"),
      colors: list("couleur"),
      animals: list("univers") as Filters["animals"],
      priceMin: num("prix-min"),
      priceMax: num("prix-max"),
    },
    sort,
  };
}
