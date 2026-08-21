import "server-only";
import { headers } from "next/headers";
import { and, count, eq, lt } from "drizzle-orm";
import { getDb } from "@/db";
import { rateLimitHits } from "@/db/auth-schema";

/**
 * Limitation de débit partagée (audit 2026-08, EL-5).
 *
 * Le compteur précédent vivait dans une `Map` du processus : sur Vercel,
 * chaque instance serverless avait le sien et il repartait de zéro à chaque
 * démarrage à froid — la limite effective valait `max × nombre d'instances`,
 * et un attaquant obtenait un quota neuf en espaçant ses requêtes.
 *
 * Le compteur vit désormais en base : une ligne par tentative, purgée à la
 * volée. Pas de service tiers à provisionner — la base est déjà là, et le
 * même code fonctionne sur PGlite en développement.
 *
 * Deux requêtes concurrentes peuvent se compter mutuellement en retard et
 * laisser passer une tentative de trop : c'est acceptable pour du rate
 * limiting, dont l'objet est de casser les boucles, pas de compter juste.
 */

/** Repli mémoire quand la base est injoignable — mieux que ne rien limiter. */
const fallbackBuckets = new Map<string, number[]>();

function memoryLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (fallbackBuckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    fallbackBuckets.set(key, hits);
    return false;
  }
  hits.push(now);
  fallbackBuckets.set(key, hits);
  if (fallbackBuckets.size > 10_000) {
    for (const [k, v] of fallbackBuckets) {
      if (v.every((t) => now - t >= windowMs)) fallbackBuckets.delete(k);
    }
  }
  return true;
}

/** IP de l'appelant, telle que vue derrière le proxy Vercel. */
export async function callerIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "local"
  );
}

/**
 * `true` si la tentative est autorisée, `false` si le quota est atteint.
 * `identifier` remplace l'IP quand un autre axe est plus pertinent
 * (couple IP + chemin pour les endpoints d'authentification, par exemple).
 */
export async function rateLimit(
  action: string,
  max: number,
  windowMs: number,
  identifier?: string,
): Promise<boolean> {
  const key = `${action}:${identifier ?? (await callerIp())}`;
  try {
    const db = await getDb();
    const cutoff = new Date(Date.now() - windowMs);
    // Purge du seau avant comptage : la fenêtre reste glissante et la table
    // ne grossit pas indéfiniment.
    await db.delete(rateLimitHits)
      .where(and(eq(rateLimitHits.bucket, key), lt(rateLimitHits.hitAt, cutoff)));
    const [row] = await db.select({ n: count() }).from(rateLimitHits)
      .where(eq(rateLimitHits.bucket, key));
    if ((row?.n ?? 0) >= max) return false;
    await db.insert(rateLimitHits).values({ id: crypto.randomUUID(), bucket: key });
    return true;
  } catch {
    // Base injoignable : on limite au moins par instance plutôt que d'ouvrir
    // grand les vannes.
    return memoryLimit(key, max, windowMs);
  }
}

export const RATE_LIMITED_ERROR =
  "Trop de tentatives — patientez quelques minutes puis réessayez.";
