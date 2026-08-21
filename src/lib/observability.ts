import "server-only";

/**
 * Journalisation d'incident centralisée (audit 2026-08, EL-6).
 *
 * Next masque déjà les messages d'erreur serveur en production (remplacés par
 * un digest) : il n'y a pas de fuite de trace d'exécution. Le problème était
 * ailleurs — quand une Server Action échouait, **personne n'était prévenu**.
 * Les échecs d'envoi d'e-mail de confirmation de commande, notamment,
 * étaient invisibles.
 *
 * Une ligne JSON par incident, corrélable au `digest` que Next affiche au
 * visiteur : la recherche « ce client dit avoir vu une erreur à 14 h 02 »
 * devient possible dans les logs Vercel.
 *
 * ⚠️ La rétention des logs Vercel est d'une heure en offre Hobby. Pour
 * conserver l'historique et être alerté, brancher un collecteur sur
 * `reportError` — l'emplacement est marqué ci-dessous.
 */

export type ErrorContext = Record<string, string | number | boolean | null | undefined>;

export function reportError(
  scope: string,
  error: unknown,
  context: ErrorContext = {},
): void {
  const payload = {
    level: "error",
    scope,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    at: new Date().toISOString(),
    ...context,
  };
  // Une seule ligne : les collecteurs de logs agrègent mal le multiligne.
  console.error(JSON.stringify(payload));

  // ── Point de branchement d'un collecteur ────────────────────────────
  // Sentry n'est pas installé : il exige un compte, un DSN et une clé
  // d'authentification que cet audit n'avait pas à créer. Une fois le
  // paquet ajouté (`pnpm add @sentry/nextjs`) et `SENTRY_DSN` posé, il
  // suffit d'appeler ici `Sentry.captureException(error, { extra: payload })`.
  // Tout le code applicatif passe déjà par cette fonction — rien d'autre
  // à modifier.
}
