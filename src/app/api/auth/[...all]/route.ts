import { getAuth } from "@/lib/auth";
import { RATE_LIMITED_ERROR, callerIp, rateLimit } from "@/lib/rate-limit";

/** Handler universel Better Auth (connexion, inscription, session, déconnexion). */

/**
 * Limitation de débit des endpoints d'authentification (audit 2026-08, EL-5).
 *
 * `/api/auth/*` ne passait par aucun compteur : connexion, inscription et
 * réinitialisation de mot de passe étaient les cibles les moins protégées du
 * site, alors que ce sont celles que le Check 17 du référentiel nomme en
 * premier. Better Auth n'était pas configuré non plus — on héritait de ses
 * seuls défauts, eux aussi en mémoire.
 *
 * Le contrôle est posé ici plutôt que dans un `middleware.ts` : un middleware
 * intercepterait aussi `/api/webhooks/stripe`, qui n'envoie aucun cookie de
 * session (piège du Check 11).
 *
 * Seuls les endpoints sensibles sont comptés. `get-session` est appelé à
 * chaque rendu par `useSession()` : le limiter casserait la navigation.
 */
const LIMITS: { match: string; max: number; windowMs: number }[] = [
  { match: "sign-in", max: 10, windowMs: 10 * 60 * 1000 },
  { match: "sign-up", max: 5, windowMs: 60 * 60 * 1000 },
  { match: "forget-password", max: 5, windowMs: 60 * 60 * 1000 },
  { match: "reset-password", max: 5, windowMs: 60 * 60 * 1000 },
  { match: "change-password", max: 10, windowMs: 60 * 60 * 1000 },
  { match: "send-verification-email", max: 5, windowMs: 60 * 60 * 1000 },
];

async function handler(request: Request) {
  // Les lectures (GET) ne consomment pas de quota : seules les tentatives
  // effectives — POST — sont comptées.
  if (request.method === "POST") {
    const path = new URL(request.url).pathname;
    const rule = LIMITS.find((l) => path.includes(l.match));
    if (rule) {
      const ip = await callerIp();
      const allowed = await rateLimit("auth", rule.max, rule.windowMs, `${ip}:${rule.match}`);
      if (!allowed) {
        return Response.json(
          { error: { message: RATE_LIMITED_ERROR } },
          { status: 429, headers: { "Retry-After": String(Math.ceil(rule.windowMs / 1000)) } },
        );
      }
    }
  }
  const auth = await getAuth();
  return auth.handler(request);
}

export { handler as GET, handler as POST };
