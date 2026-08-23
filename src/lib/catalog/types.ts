/**
 * Types du catalogue — contrat de la couche `lib/api` (H37) :
 * le front consomme ces types ; le mock (H33) sera remplacé par l'API
 * réelle en Phase 6 sans toucher aux composants.
 *
 * Pivot baskets (D-053) : l'axe primaire est la **marque** (D-055), la
 * sous-catégorie est l'**usage**, le **genre** est une facette (D-056) et
 * le stock est porté par la variante `(coloris, pointure)` (D-054).
 */

/** Axe de navigation primaire — référentiel fermé (D-055, D-058). */
export type Brand = "on" | "nike" | "saucony" | "asics" | "salomon";

/** Niveau sous-catégorie — usage du modèle (D-055). */
export type Usage = "running" | "lifestyle" | "sportstyle";

export const usageLabels: Record<Usage, string> = {
  running: "Running",
  lifestyle: "Lifestyle",
  sportstyle: "Sportstyle",
};

export function isUsage(value: string): value is Usage {
  return value === "running" || value === "lifestyle" || value === "sportstyle";
}

/**
 * Facette signature, présente sur toutes les sous-catégories (D-027, D-056).
 * Remplace le gabarit animal. `mixte` est la valeur par défaut d'un catalogue
 * de sneakers : elle n'est pas un fourre-tout, elle est l'état normal.
 */
export type Genre = "homme" | "femme" | "mixte" | "enfant";

export const genreLabels: Record<Genre, string> = {
  homme: "Homme",
  femme: "Femme",
  mixte: "Mixte",
  enfant: "Enfant",
};

export type ProductColor = {
  /** Dénomination du coloris — c'est la clé de la variante (D-054). */
  name: string;
  /** Pastille de la couleur. */
  hex: string;
  /** Photos du coloris, la première servant de visuel principal. */
  images?: string[];
};

/**
 * Unité de stock (D-054) : un coloris en 42 et le même modèle en 42 dans un
 * autre coloris sont deux articles distincts. `color` référence
 * `ProductColor.name`, `size` une valeur du référentiel de pointures.
 */
export type ProductVariant = {
  color: string;
  size: string;
  /** Unités en stock — 0 = rupture, affichée « Bientôt de retour » (spec PDP S3). */
  stock: number;
};

export type Review = {
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  text: string;
  /** Contexte d'usage affiché avec l'avis (D-025) — pointure portée, usage. */
  context: string;
  date: string;
  verified: boolean;
};

export type Product = {
  slug: string;
  name: string;
  /** Marque — axe de route et facette transverse (D-055, D-056). */
  brand: Brand;
  /** Usage — slug de sous-catégorie, unique par marque. */
  subcategory: Usage;
  /** Genres auxquels le modèle s'adresse — facette (D-056). */
  genres: Genre[];
  /** Prix TTC en centimes d'euro (H18). */
  price: number;
  shortDescription: string;
  /** Bloc « Pourquoi nous l'avons choisi » (D-025). */
  curatorNote: string;
  material: string;
  /** Sections d'accordéon de la fiche (spec PDP S5). */
  details: { title: string; content: string }[];
  colors: ProductColor[];
  /** Stock ventilé par coloris et pointure (D-054). */
  variants: ProductVariant[];
  /** Conseil de chaussant affiché près du sélecteur de pointure (D-024, ST-3). */
  sizeAdvice?: string;
  isNew: boolean;
  /** Rang du tri « Notre sélection » (H17) — plus petit = plus haut. */
  curatedRank: number;
  reviews: Review[];
  /** Slugs des compléments curés (spec PDP S6) — dont les autres modèles de la marque. */
  pairsWith: string[];
  /** Teinte de fond du placeholder visuel (H32 : remplacé par les vraies photos). */
  tone: "chalk" | "graphite" | "sand" | "signal";
  /** Photos fournisseur distantes (produits importés 7.1) — prioritaires sur le placeholder. */
  imageUrls?: string[];
  /** Traçabilité import (7.1) — référence article et page fournisseur, usage interne. */
  supplierRef?: string | null;
  sourceUrl?: string | null;
  /** Points clés (import enrichi) — puces sous l'accroche si visibles. */
  features?: string[];
  /** Caractéristiques techniques (import enrichi) — accordéon dédié si visibles. */
  specifications?: { label: string; value: string }[];
  /** Visibilité par champ sur la fiche (images, features, specifications) — true par défaut. */
  fieldVisibility?: Record<string, boolean>;
};

/** Un champ est visible sauf s'il est explicitement masqué. */
export function isFieldVisible(product: Pick<Product, "fieldVisibility">, field: string): boolean {
  return product.fieldVisibility?.[field] !== false;
}

export type Subcategory = {
  slug: Usage;
  label: string;
  brand: Brand;
  description: string;
};
