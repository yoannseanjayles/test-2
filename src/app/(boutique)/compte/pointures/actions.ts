"use server";

import { headers } from "next/headers";
import { and, asc, count, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { shoeProfiles } from "@/db/auth-schema";
import { getSessionUser } from "@/lib/auth";
import { allSizes, type Genre } from "@/lib/catalog";

/**
 * CRUD « Mes pointures » persisté (D-036, D-060) — max 5 par compte (H24).
 *
 * Reconversion du profil animal : même table, même CRUD, même limite, et
 * surtout même décision D-015 — optionnel, différé, jamais bloquant. Ce qui
 * change est la finalité : pré-filtrer un listing sur sa propre pointure.
 */

export type ShoeProfileDto = {
  id: string;
  name: string;
  genre: Genre;
  /** Pointure EU canonique — même forme qu'en variante (« 42 », « 42.5 »). */
  size: string;
};

const MAX_PROFILES = 5;

async function requireUser() {
  const user = await getSessionUser(await headers());
  if (!user) throw new Error("Non connecté.");
  return user;
}

export async function listShoeProfiles(): Promise<ShoeProfileDto[]> {
  const user = await requireUser();
  const db = await getDb();
  const rows = await db
    .select()
    .from(shoeProfiles)
    .where(eq(shoeProfiles.userId, user.id))
    .orderBy(asc(shoeProfiles.createdAt));
  return rows.map((r) => ({ id: r.id, name: r.name, genre: r.genre, size: r.size }));
}

export async function addShoeProfile(input: {
  name: string;
  genre: Genre;
  size: string;
}): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser();
  const name = input.name.trim().slice(0, 40);
  if (!name) return { ok: false, error: "Le prénom est requis." };
  // La pointure est validée contre le référentiel : une valeur libre ne
  // filtrerait jamais rien, sans le dire.
  if (!allSizes.includes(input.size)) {
    return { ok: false, error: "Pointure hors référentiel." };
  }
  const db = await getDb();
  const [row] = await db
    .select({ n: count() })
    .from(shoeProfiles)
    .where(eq(shoeProfiles.userId, user.id));
  if ((row?.n ?? 0) >= MAX_PROFILES) {
    return { ok: false, error: `Maximum ${MAX_PROFILES} pointures par compte.` };
  }
  await db.insert(shoeProfiles).values({
    id: crypto.randomUUID(),
    userId: user.id,
    name,
    genre: input.genre,
    size: input.size,
  });
  return { ok: true };
}

export async function removeShoeProfile(id: string): Promise<void> {
  const user = await requireUser();
  const db = await getDb();
  await db
    .delete(shoeProfiles)
    .where(and(eq(shoeProfiles.id, id), eq(shoeProfiles.userId, user.id)));
}
