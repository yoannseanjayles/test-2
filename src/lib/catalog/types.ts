/**
 * Types du catalogue — contrat de la couche `lib/api` (H37) :
 * le front consomme ces types ; le mock (H33) sera remplacé par l'API
 * réelle en Phase 6 sans toucher aux composants.
 */

export type Animal = "chien" | "chat" | "nac";

/** Gabarit animal — facette signature, présente sur toutes les sous-catégories (D-027). */
export type Gabarit = "XS" | "S" | "M" | "L" | "XL";

export const gabaritLabels: Record<Gabarit, string> = {
  XS: "XS — moins de 5 kg",
  S: "S — 5 à 10 kg",
  M: "M — 10 à 20 kg",
  L: "L — 20 à 40 kg",
  XL: "XL — plus de 40 kg",
};

export type ProductColor = {
  name: string;
  /** Pastille de la couleur (DA D-044). */
  hex: string;
};

export type ProductSize = {
  name: string;
  /** Unités en stock — 0 = rupture, affichée « Bientôt de retour » (spec PDP S3). */
  stock: number;
};

export type Review = {
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  text: string;
  /** Contexte animal affiché avec l'avis (D-025). */
  context: string;
  date: string;
  verified: boolean;
};

export type Product = {
  slug: string;
  name: string;
  brand: string;
  animal: Animal;
  subcategory: string;
  /** Prix TTC en centimes d'euro (H18). */
  price: number;
  shortDescription: string;
  /** Bloc « Pourquoi nous l'avons choisi » (D-025). */
  curatorNote: string;
  material: string;
  /** Sections d'accordéon de la fiche (spec PDP S5). */
  details: { title: string; content: string }[];
  colors: ProductColor[];
  sizes: ProductSize[];
  gabarits: Gabarit[];
  isNew: boolean;
  /** Rang du tri « Notre sélection » (H17) — plus petit = plus haut. */
  curatedRank: number;
  reviews: Review[];
  /** Slugs des compléments curés (spec PDP S6). */
  pairsWith: string[];
  /** Teinte de fond du placeholder visuel (H32 : remplacé par les vraies photos). */
  tone: "cream" | "sage" | "caramel" | "terracotta";
};

export type Subcategory = {
  slug: string;
  label: string;
  animal: Animal;
  description: string;
};
