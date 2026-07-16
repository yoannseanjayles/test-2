import "server-only";
import { headers } from "next/headers";

/**
 * Limitation de débit en mémoire (audit S-1) — fenêtre glissante par IP et
 * par action. Par instance serverless : imperfait à grande échelle (chaque
 * instance a son compteur) mais bloque déjà les boucles de spam évidentes ;
 * un stockage partagé (Upstash/Redis) prendra le relais si besoin.
 */

const buckets = new Map<string, number[]>();

export async function rateLimit(
  action: string,
  max: number,
  windowMs: number,
): Promise<boolean> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "local";
  const key = `${action}:${ip}`;
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  // Purge opportuniste pour borner la mémoire.
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }
  return true;
}

export const RATE_LIMITED_ERROR =
  "Trop de tentatives — patientez quelques minutes puis réessayez.";
