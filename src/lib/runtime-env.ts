import "server-only";

/**
 * Distinguer « compilation » de « production en train de servir » (audit
 * 2026-08, CR-1/EL-4).
 *
 * `next build` s'exécute avec `NODE_ENV === "production"` : un garde posé sur
 * ce seul critère fait échouer la CI et tout clone frais, ce qui est
 * exactement la raison pour laquelle le premier correctif de C-7 a été
 * annulé le 18/07/2026. Next pose `NEXT_PHASE=phase-production-build`
 * pendant la compilation — c'est le seul moment où le repli de développement
 * (PGlite en mémoire, secret par défaut) reste légitime en production.
 */
export const isBuildPhase = () =>
  process.env.NEXT_PHASE === "phase-production-build";

/** Production en train de servir des requêtes réelles. */
export const isServingProduction = () =>
  process.env.NODE_ENV === "production" && !isBuildPhase();
