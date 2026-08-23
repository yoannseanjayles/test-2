import type { Brand, Usage } from "./types";
import { uniqueSortedSizes, type SizeChartRow } from "./sizes";

/**
 * Référentiel de marques (D-055, D-058) — axe de route et facette transverse.
 *
 * Fermé, et c'est le but : `brand` était un champ **texte libre**, pré-rempli
 * depuis le titre d'une page fournisseur et publié sans contrôle jusque dans
 * le JSON-LD `Brand`. Rien ne distinguait une marque revendiquée d'une marque
 * réelle. Toute valeur hors de ce référentiel est refusée à l'écriture.
 *
 * ⚠️ D-058 reste ouverte : la revente d'articles estampillés suppose un
 * sourcing authentique et facturé. Ce référentiel décrit les modèles tels que
 * définis par leurs fabricants ; il ne vaut pas preuve d'approvisionnement.
 *
 * Les grilles de tailles proviennent du dossier catalogue du 21/08/2026. Leur
 * fiabilité est **inégale** et l'écart est porté par `sizeChartVerified` :
 * seule celle de Nike est une grille officielle de marque. Les autres sont des
 * redistributions de revendeurs, à revalider avant publication — le guide des
 * tailles doit le dire au client, pas le masquer.
 */

export type BrandInfo = {
  slug: Brand;
  /** Libellé d'affichage — la casse est celle de la marque (« ASICS », pas « Asics »). */
  label: string;
  /** Usages proposés par la marque au catalogue — les sous-catégories de son axe. */
  usages: Usage[];
  /** Accroche courte, utilisée en méga-menu. */
  tagline: string;
  /** Présentation de la marque, en tête de sa page (contenu du dossier catalogue). */
  intro: string;
  sizeChart: SizeChartRow[];
  /** Intitulé exact de la colonne de longueur, tel que la marque la publie. */
  lengthLabel: string;
  /** `true` seulement si la grille vient de la marque, pas d'un revendeur. */
  sizeChartVerified: boolean;
  /** Réserve à afficher avec la grille. Jamais vide quand `sizeChartVerified` est faux. */
  sizeChartNote: string;
};

export const brands: BrandInfo[] = [
  {
    slug: "on",
    label: "On",
    usages: ["running", "lifestyle"],
    tagline:
      "Marque suisse fondée à Zurich en 2010 : sculpter la mousse en géométries plutôt qu'empiler des couches d'amorti.",
    intro:
      "Marque suisse fondée à Zurich en 2010, On s'est imposée sur le running avec une idée unique : sculpter la mousse en géométries — les « Clouds » — plutôt qu'empiler des couches d'amorti. Quatre modèles au catalogue, deux orientés running route, deux orientés marche urbaine.",
    lengthLabel: "Longueur pied",
    sizeChartVerified: false,
    sizeChartNote:
      "Correspondances issues de revendeurs spécialisés français concordants. Chez On, la pointure US femme est décalée d'environ 1,5 pointure par rapport à la pointure US homme pour une même pointure EU. À vérifier avant publication.",
    sizeChart: [
      { eu: "36", uk: "3", usWomen: "5", length: "22 cm" },
      { eu: "37", uk: "4", usWomen: "6", length: "23 cm" },
      { eu: "38", uk: "5", usWomen: "7", length: "24 cm" },
      { eu: "39", uk: "6", usWomen: "8", length: "25 cm" },
      { eu: "40", uk: "6,5", usMen: "7", usWomen: "8,5", length: "25 cm" },
      { eu: "41", uk: "7,5", usMen: "8", usWomen: "9,5", length: "26 cm" },
      { eu: "42", uk: "8", usMen: "8,5", usWomen: "10", length: "26,5 cm" },
      { eu: "42.5", uk: "8,5", usMen: "9", usWomen: "10,5", length: "27 cm" },
      { eu: "43", uk: "9", usMen: "9,5", usWomen: "11", length: "27,5 cm" },
      { eu: "44", uk: "9,5", usMen: "10", length: "28 cm" },
      { eu: "45", uk: "10,5", usMen: "11", length: "29 cm" },
    ],
  },
  {
    slug: "nike",
    label: "Nike",
    usages: ["lifestyle"],
    tagline:
      "Quatre silhouettes, quatre décennies : Air Force 1 (1982), Air Max 90 (1990), Air Max Plus (1998) et P-6000 (2019).",
    intro:
      "Quatre silhouettes, quatre décennies : l'Air Force 1 (1982), l'Air Max 90 (1990), l'Air Max Plus (1998) et la P-6000 (2019). Trois d'entre elles reposent sur une unité Air ; la quatrième, la P-6000, n'en a pas — c'est la confusion la plus fréquente sur cette gamme.",
    lengthLabel: "CM (conversion)",
    sizeChartVerified: true,
    sizeChartNote:
      "Grille officielle nike.com/fr. La mesure en centimètres indiquée sur la boîte est une taille de conversion, pas une longueur de pied. Entre deux tailles, Nike recommande la taille au-dessus. Aucune largeur alternative sur ces quatre modèles.",
    sizeChart: [
      { eu: "36", uk: "3,5", usMen: "4", usWomen: "5,5", length: "23 cm" },
      { eu: "37.5", uk: "4,5", usMen: "5", usWomen: "6,5", length: "23,5 cm" },
      { eu: "38.5", uk: "5,5", usMen: "6", usWomen: "7,5", length: "24 cm" },
      { eu: "39", uk: "6", usMen: "6,5", usWomen: "8", length: "24,5 cm" },
      { eu: "40", uk: "6", usMen: "7", usWomen: "8,5", length: "25 cm" },
      { eu: "41", uk: "7", usMen: "8", usWomen: "9,5", length: "26 cm" },
      { eu: "42", uk: "7,5", usMen: "8,5", usWomen: "10", length: "26,5 cm" },
      { eu: "42.5", uk: "8", usMen: "9", usWomen: "10,5", length: "27 cm" },
      { eu: "43", uk: "8,5", usMen: "9,5", usWomen: "11", length: "27,5 cm" },
      { eu: "44", uk: "9", usMen: "10", usWomen: "11,5", length: "28 cm" },
      { eu: "44.5", uk: "9,5", usMen: "10,5", usWomen: "12", length: "28,5 cm" },
      { eu: "45", uk: "10", usMen: "11", length: "29 cm" },
    ],
  },
  {
    slug: "saucony",
    label: "Saucony",
    usages: ["lifestyle"],
    tagline:
      "Deux rééditions d'archive de la gamme Originals, devenues des chaussures lifestyle.",
    intro:
      "Deux rééditions d'archive de la gamme Originals : la ProGrid Ride 1, modèle de 2008 revenu en 2026, et la ProGrid Omni 9, modèle de 2010 revenu en 2023. Ce sont aujourd'hui des chaussures lifestyle — les mentions de stabilité et de contrôle de pronation appartiennent à leur passé running et n'ont plus de valeur prescriptive.",
    lengthLabel: "Longueur (JP)",
    sizeChartVerified: false,
    sizeChartNote:
      "Les deux modèles sont unisexes et les pointures affichées sont des pointures homme. Un revendeur agréé indique qu'une femme doit commander environ 1,5 pointure en dessous de sa pointure running habituelle. Grille redistribuée par revendeur, à revalider avant publication.",
    sizeChart: [
      { eu: "36", uk: "3", usMen: "4", usWomen: "6" },
      { eu: "37", uk: "3,5", usMen: "4,5", usWomen: "6,5", length: "22,5 cm" },
      { eu: "37.5", uk: "4", usMen: "5", usWomen: "7", length: "23 cm" },
      { eu: "38", uk: "4,5", usMen: "5,5", usWomen: "7,5", length: "23,5 cm" },
      { eu: "38.5", uk: "5", usMen: "6", usWomen: "8", length: "24 cm" },
      { eu: "39", uk: "5,5", usMen: "6,5", usWomen: "8,5", length: "24,5 cm" },
      { eu: "40", uk: "6", usMen: "7", usWomen: "9", length: "25 cm" },
      { eu: "40.5", uk: "6,5", usMen: "7,5", usWomen: "9,5", length: "25,5 cm" },
      { eu: "41", uk: "7", usMen: "8", usWomen: "10", length: "26 cm" },
      { eu: "42", uk: "7,5", usMen: "8,5", usWomen: "10,5", length: "26,5 cm" },
      { eu: "42.5", uk: "8", usMen: "9", usWomen: "11", length: "27 cm" },
      { eu: "43", uk: "8,5", usMen: "9,5", length: "27,5 cm" },
      { eu: "44", uk: "9", usMen: "10", length: "28 cm" },
      { eu: "44.5", uk: "9,5", usMen: "10,5", length: "28,5 cm" },
      { eu: "45", uk: "10", usMen: "11", length: "29 cm" },
    ],
  },
  {
    slug: "asics",
    label: "ASICS",
    usages: ["sportstyle"],
    tagline:
      "Deux rééditions de la gamme SportStyle — à ne pas confondre avec la GEL-KAYANO de running actuelle.",
    intro:
      "Deux rééditions de la gamme SportStyle : la GEL-KAYANO 14, modèle de 2008 rééditée en décembre 2020, et la GEL-KAYANO 20, modèle de 2013 rééditée à partir de 2024. À ne pas confondre avec la GEL-KAYANO 31/32, qui est la chaussure de running actuelle de la marque.",
    lengthLabel: "CM",
    sizeChartVerified: false,
    sizeChartNote:
      "Grille de marque redistribuée par revendeur, à revalider sur asics.com avant publication.",
    sizeChart: [
      { eu: "36", uk: "3", usMen: "4", length: "22,5 cm" },
      { eu: "37", uk: "3,5", usMen: "4,5", usWomen: "6", length: "23 cm" },
      { eu: "37.5", uk: "4", usMen: "5", usWomen: "6,5", length: "23,5 cm" },
      { eu: "38", uk: "4,5", usMen: "5,5", usWomen: "7", length: "24 cm" },
      { eu: "39", uk: "5", usMen: "6", usWomen: "7,5", length: "24,5 cm" },
      { eu: "39.5", uk: "5,5", usMen: "6,5", usWomen: "8", length: "25 cm" },
      { eu: "40", uk: "6", usMen: "7", usWomen: "8,5", length: "25,25 cm" },
      { eu: "40.5", uk: "6,5", usMen: "7,5", usWomen: "9", length: "25,5 cm" },
      { eu: "41.5", uk: "7", usMen: "8", usWomen: "9,5", length: "26 cm" },
      { eu: "42", uk: "7,5", usMen: "8,5", usWomen: "10", length: "26,5 cm" },
      { eu: "42.5", uk: "8", usMen: "9", usWomen: "10,5", length: "27 cm" },
      { eu: "43.5", uk: "8,5", usMen: "9,5", usWomen: "11", length: "27,5 cm" },
      { eu: "44", uk: "9", usMen: "10", usWomen: "12", length: "28 cm" },
      { eu: "44.5", uk: "9,5", usMen: "10,5", length: "28,25 cm" },
      { eu: "45", uk: "10", usMen: "11", length: "28,5 cm" },
    ],
  },
  {
    slug: "salomon",
    label: "Salomon",
    usages: ["sportstyle"],
    tagline:
      "La XT-6, née en 2013 pour l'ultra-trail et rééditée en 2018 dans la gamme Sportstyle.",
    intro:
      "Un seul modèle au catalogue, mais l'un des plus reconnaissables du marché : la XT-6, née en 2013 pour l'ultra-trail et rééditée en 2018 dans la gamme Sportstyle. Cinq coloris, dont deux protégés par une membrane GORE-TEX.",
    lengthLabel: "Longueur pied",
    sizeChartVerified: false,
    sizeChartNote:
      "Salomon utilise des tiers de pointure (38 ⅔, 40 ⅔…). Correspondances indicatives, à vérifier sur l'étiquette avant publication.",
    sizeChart: [
      { eu: "36", uk: "3,5", usMen: "4", usWomen: "5", length: "22,5 cm" },
      { eu: "37.33", uk: "4,5", usMen: "5", usWomen: "6", length: "23,3 cm" },
      { eu: "38.67", uk: "5,5", usMen: "6", usWomen: "7", length: "24,2 cm" },
      { eu: "40", uk: "6,5", usMen: "7", usWomen: "8", length: "25,3 cm" },
      { eu: "41.33", uk: "7,5", usMen: "8", usWomen: "9", length: "26,2 cm" },
      { eu: "42", uk: "8,5", usMen: "9", usWomen: "10", length: "27,0 cm" },
      { eu: "43.33", uk: "9", usMen: "9,5", usWomen: "10,5", length: "27,5 cm" },
      { eu: "44.67", uk: "10", usMen: "10,5", usWomen: "11,5", length: "28,3 cm" },
      { eu: "45.33", uk: "10,5", usMen: "11", usWomen: "12", length: "28,8 cm" },
    ],
  },
];

const brandBySlug = new Map(brands.map((b) => [b.slug, b]));

export function isBrand(value: string): value is Brand {
  return brandBySlug.has(value as Brand);
}

export function getBrand(slug: Brand): BrandInfo {
  const brand = brandBySlug.get(slug);
  if (!brand) throw new Error(`Marque hors référentiel : ${slug}`);
  return brand;
}

export const brandLabels: Record<Brand, string> = Object.fromEntries(
  brands.map((b) => [b.slug, b.label]),
) as Record<Brand, string>;

/** Pointures vendables d'une marque, ordonnées — source du sélecteur admin (D-057). */
export function sizesForBrand(slug: Brand): string[] {
  return uniqueSortedSizes(getBrand(slug).sizeChart.map((row) => row.eu));
}

/** Union ordonnée de toutes les pointures du catalogue — listings transverses. */
export const allSizes: string[] = uniqueSortedSizes(
  brands.flatMap((b) => b.sizeChart.map((row) => row.eu)),
);
