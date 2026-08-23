/**
 * Pointures — helpers de tri et d'affichage (D-057, correctif BL-1).
 *
 * Le référentiel des valeurs **n'est pas ici** : il vit dans `brands.ts`, une
 * grille par marque, parce que les marques ne partagent pas le même pas. ON
 * s'arrête aux entiers avec une demi-pointure, Nike et ASICS utilisent des
 * demies, Salomon des **tiers** (37 ⅓, 38 ⅔). Générer une plage 35→48 aurait
 * produit des pointures que personne ne vend et manqué celles de Salomon.
 *
 * Ce qui compte ici : plus aucune valeur filtrable n'est figée dans un
 * composant. `ListingExplorer` figeait `["XS","S","M","L","XL"]`, si bien
 * qu'aucune pointure n'apparaissait dans la facette — sans erreur, sans test
 * rouge et sans page cassée.
 *
 * Forme canonique : décimale à point (`"42"`, `"42.5"`, `"37.33"`). C'est la
 * valeur qui circule en base, en query-string et en ligne de commande — jamais
 * celle qu'on affiche. `formatSize()` rend la notation française.
 */

const THIRD = 1 / 3;

/**
 * Échelle textile. Les tailles vêtement ne se trient ni comme des nombres ni
 * comme du texte : l'ordre alphabétique rendrait « L, M, S, XL ». Le rayon
 * Ensembles partage la facette Taille avec les chaussures, les deux systèmes
 * doivent donc cohabiter dans une même liste triée.
 */
const APPAREL_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

function apparelRank(size: string): number {
  return APPAREL_ORDER.indexOf(size.trim().toUpperCase());
}

/** Valeur numérique d'une pointure, ou `NaN` hors référentiel. */
export function sizeValue(size: string): number {
  return Number(size.replace(",", "."));
}

/**
 * Tri **numérique**. Trié comme du texte, `["40", "41", "9"]` placerait `9`
 * après `41`. Les valeurs non numériques passent en fin, ordonnées entre elles.
 */
export function compareSizes(a: string, b: string): number {
  const na = sizeValue(a);
  const nb = sizeValue(b);
  const aNum = Number.isFinite(na);
  const bNum = Number.isFinite(nb);
  if (aNum && bNum) return na - nb;
  // Les pointures passent avant les tailles textile : un listing mixte range
  // les chaussures puis les vêtements, jamais l'inverse.
  if (aNum) return -1;
  if (bNum) return 1;
  const ra = apparelRank(a);
  const rb = apparelRank(b);
  if (ra !== -1 && rb !== -1) return ra - rb;
  if (ra !== -1) return -1;
  if (rb !== -1) return 1;
  return a.localeCompare(b, "fr");
}

export function sortSizes(sizes: readonly string[]): string[] {
  return sizes.slice().sort(compareSizes);
}

/** Dédoublonne et ordonne — l'ordre d'affichage de toute liste de pointures. */
export function uniqueSortedSizes(sizes: readonly string[]): string[] {
  return sortSizes([...new Set(sizes)]);
}

/**
 * Notation française : `"42.5"` → `"42,5"`, `"37.33"` → `"37 ⅓"`,
 * `"38.67"` → `"38 ⅔"`. Une valeur inconnue est rendue telle quelle.
 */
export function formatSize(size: string): string {
  const value = sizeValue(size);
  if (!Number.isFinite(value)) return size;
  const whole = Math.floor(value);
  const fraction = value - whole;
  if (Math.abs(fraction) < 0.01) return String(whole);
  if (Math.abs(fraction - 0.5) < 0.01) return `${whole},5`;
  if (Math.abs(fraction - THIRD) < 0.02) return `${whole} ⅓`;
  if (Math.abs(fraction - 2 * THIRD) < 0.02) return `${whole} ⅔`;
  return size.replace(".", ",");
}

/**
 * Ligne de correspondance du guide des tailles (ST-3, D-024).
 * Les colonnes sont optionnelles : aucune marque ne les publie toutes, et le
 * document source signale explicitement les trous (« — »). Ne jamais combler
 * un trou par interpolation : une correspondance inventée se paie en retours.
 */
export type SizeChartRow = {
  /** Pointure EU sous forme canonique — la clé de la variante. */
  eu: string;
  uk?: string;
  usMen?: string;
  usWomen?: string;
  /** Longueur de pied ou conversion CM, telle que publiée par la marque. */
  length?: string;
};
