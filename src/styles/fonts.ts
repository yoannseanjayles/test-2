import localFont from "next/font/local";

/**
 * Deux familles self-hostées, subset latin, `font-display: swap`, fallbacks
 * ajustés par next/font (5.0 §3).
 *
 * Refonte Azeno : la paire d'origine (Fraunces serif + Work Sans + Nunito
 * Sans) est remplacée par le couple du thème sport —
 * - **Bebas Neue** : display condensé, capitales uniquement, réservé aux
 *   titres de section et aux grands blocs typographiques ;
 * - **Jost** : grotesque géométrique (substitut libre de Sofia Pro, utilisé
 *   par Azeno) pour toute l'interface, le corps de texte et les prix.
 */
export const bebasNeue = localFont({
  src: "../fonts/bebas-neue-latin-400-normal.woff2",
  weight: "400",
  display: "swap",
  variable: "--font-bebas",
  adjustFontFallback: "Arial",
});

export const jost = localFont({
  src: "../fonts/jost-latin-wght-normal.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-jost",
  adjustFontFallback: "Arial",
});
