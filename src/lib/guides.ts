import type { Animal } from "@/lib/catalog";

/**
 * Guides mock (topic clusters D-037 : 2 piliers + satellites au lancement).
 * Le contenu complet des articles arrive au jalon 4 ; ces métadonnées
 * alimentent les cartes éditoriales de l'Accueil et des pages animal.
 */

export type Guide = {
  slug: string;
  title: string;
  excerpt: string;
  animal: Animal | "tous";
  pillar: boolean;
  readingMinutes: number;
  relatedSubcategories: string[];
};

export const guides: Guide[] = [
  {
    slug: "bien-choisir-un-harnais",
    title: "Bien choisir un harnais : le guide complet",
    excerpt:
      "Coupe en Y ou en H, réglages, matières : ce qu'il faut vérifier pour un harnais qui ne frotte pas et n'entrave pas l'épaule.",
    animal: "chien",
    pillar: true,
    readingMinutes: 12,
    relatedSubcategories: ["colliers-harnais"],
  },
  {
    slug: "comment-mesurer-votre-animal",
    title: "Comment mesurer votre animal (sans vous tromper)",
    excerpt:
      "Tour de cou, poitrail, longueur de dos : les trois mesures qui évitent 90 % des erreurs de taille, schémas à l'appui.",
    animal: "tous",
    pillar: false,
    readingMinutes: 5,
    relatedSubcategories: ["colliers-harnais", "manteaux-textile"],
  },
  {
    slug: "amenager-un-coin-repos",
    title: "Aménager un vrai coin repos pour votre chien",
    excerpt:
      "Emplacement, matière, taille du couchage : les règles simples pour un panier réellement adopté.",
    animal: "chien",
    pillar: false,
    readingMinutes: 7,
    relatedSubcategories: ["couchages-paniers"],
  },
  {
    slug: "griffades-comprendre-et-canaliser",
    title: "Griffades : comprendre et canaliser sans conflit",
    excerpt:
      "Pourquoi votre chat griffe le canapé, et comment un griffoir bien choisi et bien placé change tout.",
    animal: "chat",
    pillar: true,
    readingMinutes: 9,
    relatedSubcategories: ["arbres-a-chat-griffoirs"],
  },
  {
    slug: "enrichir-lhabitat-dun-lapin",
    title: "Enrichir l'habitat d'un lapin d'intérieur",
    excerpt:
      "Cachettes, matières à ronger, zones de fraîcheur : l'essentiel pour un lapin serein en appartement.",
    animal: "nac",
    pillar: false,
    readingMinutes: 6,
    relatedSubcategories: ["habitat-couchage", "jeux-activite"],
  },
];

export function getGuidesFor(animal: Animal, count: number): Guide[] {
  return guides
    .filter((g) => g.animal === animal || g.animal === "tous")
    .slice(0, count);
}

export function getGuideForSubcategory(subcategory: string): Guide | undefined {
  return guides.find((g) => g.relatedSubcategories.includes(subcategory));
}
