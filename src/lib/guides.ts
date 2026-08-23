import type { StaticImageData } from "next/image";
import type { Brand } from "@/lib/catalog/types";

import couvPointure from "@/media/guide-bien-choisir-sa-pointure.webp";
import couvEntretien from "@/media/guide-entretenir-ses-baskets.webp";
import couvAmorti from "@/media/guide-technologies-amorti-expliquees.webp";
import couvUsage from "@/media/guide-running-ou-lifestyle.webp";

/**
 * Guides éditoriaux (topic clusters D-037 : 2 piliers + satellites au
 * lancement). Réécrits pour le pivot baskets (D-053, constat CO-4).
 *
 * ⚠️ Aucun `author` n'est renseigné, et c'est délibéré. Le champ porte un
 * appareil E-E-A-T — nom de rédacteur, mention « relu par … » — qui n'a de
 * valeur que s'il est vrai. Y inscrire un expert fictif pour remplir
 * l'interface, c'est exactement ce qui a valu le retrait de 14 avis en
 * août 2026 (MO-7, art. L.121-4 : pratique commerciale trompeuse). Le champ
 * reste vide jusqu'à ce qu'un rédacteur et un relecteur réels soient
 * identifiés ; la mise en page le supporte déjà.
 *
 * Tout le contenu ci-dessous provient des consignes officielles des marques
 * telles que reprises dans le dossier catalogue du 21/08/2026.
 */

export type Guide = {
  slug: string;
  title: string;
  excerpt: string;
  /** Marque concernée, ou « tous » pour un guide transverse. */
  brand: Brand | "tous";
  pillar: boolean;
  readingMinutes: number;
  /** Slugs d'usage liés (running, lifestyle, sportstyle). */
  relatedSubcategories: string[];
  /** Couverture — placeholder DA si absente (H32). */
  cover?: StaticImageData;
  /** E-E-A-T (D-037) : auteur, relecture, dates. Vide tant qu'il n'est pas réel. */
  author?: { name: string; role: string; reviewedBy: string; updated: string };
  /** Corps de l'article — sections ancrées (sommaire). */
  content?: { heading: string; paragraphs: string[] }[];
};

/**
 * Contenu de lancement — seed de la table `guides` ; l'édition passe ensuite
 * par le back-office, plus par ce fichier.
 */
export const guideSeed: Guide[] = [
  {
    slug: "bien-choisir-sa-pointure",
    cover: couvPointure,
    title: "Bien choisir sa pointure : ce que les grilles ne disent pas",
    excerpt:
      "Une 42 n'est pas une 42 partout. Correspondances EU/US/UK, chaussant par modèle, et les pièges de conversion qui causent l'essentiel des retours.",
    brand: "tous",
    pillar: true,
    readingMinutes: 8,
    relatedSubcategories: ["running", "lifestyle", "sportstyle"],
    content: [
      {
        heading: "Les marques ne découpent pas les pointures de la même façon",
        paragraphs: [
          "On s'en tient aux pointures entières, avec une seule demi-pointure dans la plage courante (42,5). Nike saute les 37 et 38 pour proposer des 37,5 et 38,5. ASICS ajoute des 39,5, 41,5 et 43,5 là où les autres n'en ont pas. Salomon, enfin, travaille en tiers de pointure : 37 ⅓, 38 ⅔, 41 ⅓, 43 ⅓, 44 ⅔.",
          "Conséquence pratique : si vous chaussez du 41 chez On, votre équivalent Nike n'est pas « 41 » mais se situe entre le 40 et le 41 selon la longueur de votre pied. Fiez-vous à la colonne de longueur, pas au nombre.",
        ],
      },
      {
        heading: "Chez Nike, la mesure en centimètres n'est pas votre pied",
        paragraphs: [
          "Nike l'indique explicitement : le chiffre en centimètres imprimé sur la boîte est une taille de conversion, pas une mesure de longueur de pied. Le confondre avec la mesure d'un pied fait systématiquement descendre d'une pointure.",
          "Nike précise également qu'entre deux tailles, il faut choisir la taille au-dessus — et qu'aucune largeur alternative n'existe sur l'Air Force 1, l'Air Max 90, l'Air Max Plus et la P-6000.",
        ],
      },
      {
        heading: "Le chaussant compte autant que la pointure",
        paragraphs: [
          "La Cloudmonster 3 taille juste selon On, mais son chaussant est plus étroit que celui de la génération précédente : l'avant-pied mesure 71,0 mm contre 74,5 mm, et le volume de cou-de-pied est bas. Pied large ou cambrure marquée : une demi-pointure au-dessus, ou la déclinaison Wide.",
          "L'Air Force 1 pose un problème différent : environ 465 g, cuir rigide, temps de rodage long. Elle n'est pas inconfortable, elle demande simplement des semaines avant de se faire au pied.",
          "Chez Saucony, les pointures affichées sur les deux modèles Originals sont des pointures homme. Un revendeur agréé indique qu'une femme doit commander environ 1,5 pointure en dessous de sa pointure running habituelle.",
        ],
      },
      {
        heading: "Toutes nos grilles n'ont pas la même valeur",
        paragraphs: [
          "Nous préférons le dire clairement : sur les cinq grilles publiées sur ce site, une seule provient directement de la marque, celle de Nike. Les quatre autres sont des redistributions de revendeurs, concordantes entre elles mais non confirmées par le fabricant.",
          "Chaque grille porte donc sa mention d'origine. En cas de doute sur une pointure limite, mesurez votre pied en centimètres et comparez à la colonne de longueur plutôt qu'au numéro.",
        ],
      },
    ],
  },
  {
    slug: "entretenir-ses-baskets",
    cover: couvEntretien,
    title: "Entretenir ses baskets : les protocoles officiels des cinq marques",
    excerpt:
      "Ce que On, Nike, Saucony, ASICS et Salomon interdisent toutes, la méthode commune en six étapes, et les exceptions par matière.",
    brand: "tous",
    pillar: true,
    readingMinutes: 9,
    relatedSubcategories: ["running", "lifestyle", "sportstyle"],
    content: [
      {
        heading: "Ce que les cinq marques interdisent, sans exception",
        paragraphs: [
          "La machine à laver et le sèche-linge. Les cinq marques l'écrivent chacune dans leurs consignes officielles. On est la plus explicite sur le pourquoi : la chaleur prolongée combinée aux détergents endommage les coutures, les collages et l'intégrité de la chaussure.",
          "Toute source de chaleur directe, également : radiateur, sèche-cheveux, plein soleil. Salomon ajoute un interdit qui lui est propre — pas de savon ni de lessive, qui attaquent les colles et les membranes.",
        ],
      },
      {
        heading: "La méthode commune",
        paragraphs: [
          "Brosser à sec d'abord. Sur de la boue, mouiller avant de brosser étale la salissure au lieu de la retirer. Taper les semelles l'une contre l'autre, puis brosse souple ou vieille brosse à dents.",
          "Retirer les lacets et les semelles de propreté, et les traiter séparément. Les semelles ne se trempent jamais : ASICS précise que cela endommage la mousse.",
          "Laver l'extérieur à l'eau tiède avec un détergent doux, au chiffon ou à l'éponge. Rincer abondamment — un résidu de savon laisse une auréole en séchant.",
          "Sécher à l'air libre, à température ambiante, en bourrant l'intérieur de papier froissé. Nike recommande huit heures au minimum. Ne remettre lacets et semelles qu'une fois les chaussures complètement sèches.",
        ],
      },
      {
        heading: "Les exceptions par matière",
        paragraphs: [
          "Mesh blanc : Nike recommande une pâte de deux doses de bicarbonate pour une dose d'eau, laissée agir trente minutes avant d'essuyer au chiffon humide. Sur le mesh, brosser dans le sens du maillage et n'utiliser que de l'eau froide ou tiède — l'eau chaude altère la teinture.",
          "Daim et nubuck (empiècements de la ProGrid Omni 9) : brosse à poils souples à sec, puis spray imperméabilisant si besoin. Jamais d'eau de Javel. Quand une tige mêle plusieurs matières, appliquez la consigne la plus prudente, celle du daim.",
          "Cuir (Air Force 1, empiècements de l'Air Max 90 et de la GEL-KAYANO 14) : nettoyage doux, puis produit nourrissant après séchage.",
          "GORE-TEX (deux des cinq coloris de la XT-6) : un produit ré-imperméabilisant adapté aux membranes entretient la déperlance. Ni savon, ni lessive.",
        ],
      },
      {
        heading: "À quelle fréquence",
        paragraphs: [
          "Moins souvent qu'on ne le croit. On déconseille explicitement les lavages fréquents : un brossage léger régulier après chaque sortie prolonge la durée de vie de la chaussure bien mieux qu'un lavage complet occasionnel.",
          "Salomon ajoute deux réflexes simples et gratuits : aérer les chaussures après chaque utilisation, et ne jamais les stocker en sac plastique ou en boîte hermétique.",
        ],
      },
    ],
  },
  {
    slug: "technologies-amorti-expliquees",
    cover: couvAmorti,
    title: "Les technologies d'amorti, expliquées",
    excerpt:
      "CloudTec, Air, GEL, ProGrid, EnergyCell : ce que chaque système fait réellement sous le pied, sans le vocabulaire marketing.",
    brand: "tous",
    pillar: false,
    readingMinutes: 7,
    relatedSubcategories: ["running", "sportstyle"],
    content: [
      {
        heading: "On — sculpter la mousse plutôt que l'empiler",
        paragraphs: [
          "Le CloudTec sculpte la semelle en géométries qui se compriment à la fois verticalement et horizontalement : amorti à l'impact, maintien multidirectionnel. Le CloudTec Phase va plus loin — les Clouds sont inclinés et se compriment en séquence, comme une rangée de dominos, ce qui donne un déroulé talon-pointe roulé.",
          "La mousse Helion en règle la densité modèle par modèle, et le Speedboard, plaque souple insérée dans la semelle intermédiaire, fléchit à l'avant-pied puis relance le pied. Sur ce catalogue, il n'équipe que la Cloudmonster 3.",
        ],
      },
      {
        heading: "Nike — de l'air sous pression, réglé par zones",
        paragraphs: [
          "L'unité Air est un gaz pressurisé scellé dans une membrane souple. Elle se comprime à l'impact puis reprend sa forme, sans se tasser dans le temps comme le fait une mousse. Sur l'Air Force 1, elle est encapsulée et invisible.",
          "Le Max Air en est la version à grand volume, rendue visible par une fenêtre dans la semelle — c'est la technologie de l'Air Max 90. Le Tuned Air, lui, insère dans l'unité des hémisphères de polymère prémoulés qui règlent la pression zone par zone : plus souple sous le talon, plus ferme là où le pied a besoin de maintien. C'est ce qui donne à l'Air Max Plus sa sensation ferme caractéristique.",
          "Un point à ne pas confondre : la P-6000 n'a pas d'unité Air. C'est la seule des quatre Nike de ce catalogue dans ce cas.",
        ],
      },
      {
        heading: "ASICS — silicone et contrôle de torsion",
        paragraphs: [
          "Le GEL est un silicone inséré dans la semelle intermédiaire pour absorber les chocs. Au talon seulement sur la GEL-KAYANO 14 ; à l'avant-pied et au talon sur la 20 — c'est la principale différence de sensation entre les deux.",
          "Le Trusstic System est une pièce moulée sous le médio-pied qui allège la semelle tout en contrôlant la torsion. Le FluidFit, croisillons de TPU posés en zigzag sur la tige, est la signature visuelle immédiate de la KAYANO 20.",
        ],
      },
      {
        heading: "Saucony et Salomon",
        paragraphs: [
          "Chez Saucony, le ProGrid est un système d'amorti au talon construit au plus près du pied ; le GRID en est la génération antérieure, et les deux coexistent sur l'Omni 9. Le SRC, placé dans le crash pad du talon, absorbe les chocs et facilite la transition vers le médio-pied.",
          "Chez Salomon, l'EnergyCell est une EVA double densité, complétée par l'agileCHASSIS — un châssis logé entre semelle intermédiaire et semelle d'usure qui combine stabilité latérale et amorti. La gomme Mud Contagrip, conçue pour les sols meubles, se révèle très adhérente sur pavés mouillés.",
        ],
      },
    ],
  },
  {
    slug: "running-ou-lifestyle",
    cover: couvUsage,
    title: "Running ou lifestyle : ne pas se tromper d'usage",
    excerpt:
      "Une réédition d'archive n'est pas une chaussure de running. Ce que chaque modèle du catalogue est réellement fait pour supporter.",
    brand: "tous",
    pillar: false,
    readingMinutes: 6,
    relatedSubcategories: ["running", "lifestyle", "sportstyle"],
    content: [
      {
        heading: "Une réédition d'archive n'est pas une chaussure correctrice",
        paragraphs: [
          "La ProGrid Omni 9 était, en 2010, une chaussure de stabilité pour pronateurs légers à modérés. La GEL-KAYANO 14 et la 20 étaient également des chaussures de stabilité, en 2008 et 2013. Ces trois modèles sont aujourd'hui vendus en gamme lifestyle.",
          "Ces mentions appartiennent à leur passé running et n'ont plus de valeur prescriptive. Nous ne les présentons pas comme des chaussures correctrices, et personne ne devrait les acheter pour cette raison. Une correction de foulée se prescrit, elle ne s'achète pas sur une fiche produit.",
        ],
      },
      {
        heading: "Les deux seules chaussures de running du catalogue",
        paragraphs: [
          "La Cloudmonster 3 et la Cloudsurfer Max. Toutes deux pour foulée neutre, sur route et bitume, du 10 km au marathon. Toutes deux orientées confort et endurance : On déconseille explicitement la Cloudsurfer Max pour le travail rapide, et situe la Cloudmonster 3 du côté des sorties longues et de la récupération plutôt que des séances au seuil.",
        ],
      },
      {
        heading: "Marche urbaine : une catégorie à part entière",
        paragraphs: [
          "La Cloudtilt et la Cloudtilt Remix appartiennent à la gamme Active Life d'On, pensée pour la marche urbaine, le voyage et la station debout prolongée. Ce ne sont pas des chaussures de running, et On ne les présente pas comme telles.",
          "Nike présente de son côté la P-6000 comme conçue pour la marche.",
        ],
      },
      {
        heading: "Le poids, critère sous-estimé",
        paragraphs: [
          "L'Air Force 1 pèse environ 465 g, l'Air Max Plus environ 398 g, l'Air Max 90 environ 380 g. Ce sont des mesures de laboratoires indépendants — Nike ne publie pas cette donnée.",
          "Pour une journée entière debout, l'écart avec une Cloudtilt (environ 266 g mesurés) ou une P-6000 (environ 292 g) se ressent nettement en fin de journée. Ce n'est pas un défaut de l'Air Force 1 : c'est le prix de sa construction en cuir.",
        ],
      },
    ],
  },
];

/** Couverture statique d'un guide seedé (H32) — les nouveaux guides n'en ont pas encore. */
export function coverFor(slug: string): StaticImageData | undefined {
  return guideSeed.find((g) => g.slug === slug)?.cover;
}
