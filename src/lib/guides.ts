import type { StaticImageData } from "next/image";
import type { Animal } from "@/lib/catalog";
import coverHarnais from "@/media/M-EDI-03.jpeg";
import coverCoinRepos from "@/media/M-EDI-04.jpeg";
import coverMesurer from "@/media/M-EDI-11.jpeg";
import coverLapin from "@/media/M-HOME-05.jpeg";

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
  /** Couverture (M-EDI-*) — placeholder DA si absente (H32). */
  cover?: StaticImageData;
  /** E-E-A-T (D-037) : auteur, relecture pro (H27), dates. */
  author?: { name: string; role: string; reviewedBy: string; updated: string };
  /** Corps de l'article — sections ancrées (sommaire). */
  content?: { heading: string; paragraphs: string[] }[];
};

/**
 * Contenu de lancement — seed de la table `guides` (7.1 jalon 4) ; les
 * couvertures (imports statiques) sont ré-attachées par slug à l'hydratation.
 * L'édition passe par le back-office, plus par ce fichier.
 */
export const guideSeed: Guide[] = [
  {
    slug: "bien-choisir-un-harnais",
    title: "Bien choisir un harnais : le guide complet",
    excerpt:
      "Coupe en Y ou en H, réglages, matières : ce qu'il faut vérifier pour un harnais qui ne frotte pas et n'entrave pas l'épaule.",
    animal: "chien",
    pillar: true,
    readingMinutes: 12,
    relatedSubcategories: ["colliers-harnais"],
    cover: coverHarnais,
    author: {
      name: "Camille Aubert",
      role: "Rédactrice — comportement canin",
      reviewedBy: "Relu par Marc Delorme, éducateur canin diplômé",
      updated: "2026-07-01",
    },
    content: [
      {
        heading: "Coupe en Y ou coupe en H : la vraie différence",
        paragraphs: [
          "La coupe en Y libère entièrement l'épaule : la sangle passe sur le sternum puis entre les pattes avant, sans barrer l'articulation. C'est la coupe que nous recommandons pour la marche quotidienne, la randonnée et les chiens qui tirent — l'amplitude du mouvement est préservée et les frottements disparaissent.",
          "La coupe en H, elle, entoure le poitrail de deux sangles parallèles. Bien réglée, elle convient aux trajets urbains calmes et aux chiens fins qui « sortent » des harnais en Y. Mal réglée, elle appuie sur l'épaule à chaque foulée : si vous voyez la sangle bouger sur l'omoplate en mouvement, changez de coupe.",
        ],
      },
      {
        heading: "Les trois mesures qui comptent",
        paragraphs: [
          "Tour de poitrail (le plus large, juste derrière les pattes avant), tour de cou bas (là où repose un collier), et longueur de sternum. Mesurez au repos, sans serrer, et ajoutez deux doigts d'aisance. Entre deux tailles, prenez toujours la plus grande : un harnais se règle vers le bas, jamais vers le haut.",
          "Un harnais est à la bonne taille quand vous passez deux doigts à plat sous chaque sangle, ni plus ni moins, et qu'aucune sangle ne touche l'aisselle.",
        ],
      },
      {
        heading: "Matières : ce qui dure et ce qui frotte",
        paragraphs: [
          "Le textile technique (ripstop, maille rembourrée) sèche vite et se lave en machine — idéal pour les chiens actifs. Le cuir doublé de lainage est superbe en ville mais craint la pluie prolongée. Évitez les néoprènes bas de gamme : ils gardent l'humidité contre la peau et échauffent.",
          "Vérifiez les coutures aux points de traction (anneau dorsal, boucles) : des coutures en X ou en W tiennent des années, une simple ligne droite non.",
        ],
      },
      {
        heading: "Anti-traction : anneau avant ou éducation ?",
        paragraphs: [
          "L'anneau ventral réoriente le chien qui tire — utile en transition, mais ce n'est pas une solution seule. Combinez-le avec un travail de marche en laisse : c'est l'avis de tous les éducateurs que nous consultons. Un harnais ne remplace jamais l'éducation, il la facilite.",
        ],
      },
      {
        heading: "Les erreurs qui coûtent un retour",
        paragraphs: [
          "Choisir la taille sur le poids seul (deux chiens de 20 kg peuvent avoir 15 cm d'écart de poitrail), serrer pour compenser une taille trop grande, ou garder le harnais d'un chiot en croissance plus de quelques mois. En cas de doute, mesurez — notre guide « Comment mesurer votre animal » prend cinq minutes.",
        ],
      },
    ],
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
    cover: coverMesurer,
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
    cover: coverCoinRepos,
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
    cover: coverLapin,
  },
];

/** Couverture statique d'un guide seedé (H32) — les nouveaux guides n'en ont pas encore. */
export function coverFor(slug: string): StaticImageData | undefined {
  return guideSeed.find((g) => g.slug === slug)?.cover;
}
