import localFont from "next/font/local";

/**
 * 3 familles variables self-hostées, subset latin, `font-display: swap`
 * avec fallbacks ajustés automatiquement par next/font (5.0 §3, D-046).
 */
export const fraunces = localFont({
  src: "../fonts/fraunces-latin-opsz-normal.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-fraunces",
  adjustFontFallback: "Times New Roman",
});

export const workSans = localFont({
  src: "../fonts/work-sans-latin-wght-normal.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-work-sans",
  adjustFontFallback: "Arial",
});

export const nunitoSans = localFont({
  src: "../fonts/nunito-sans-latin-wght-normal.woff2",
  weight: "200 1000",
  display: "swap",
  variable: "--font-nunito-sans",
  adjustFontFallback: "Arial",
});
