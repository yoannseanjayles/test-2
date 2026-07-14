"use server";

import { headers } from "next/headers";
import { and, asc, count, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { pets } from "@/db/auth-schema";
import { getSessionUser } from "@/lib/auth";
import type { Animal, Gabarit } from "@/lib/catalog";

/** CRUD « Mes animaux » persisté (D-036) — max 5 par compte (H24). */

export type PetDto = { id: string; name: string; species: Animal; gabarit: Gabarit };

const MAX_PETS = 5;

async function requireUser() {
  const user = await getSessionUser(await headers());
  if (!user) throw new Error("Non connecté.");
  return user;
}

export async function listPets(): Promise<PetDto[]> {
  const user = await requireUser();
  const db = await getDb();
  const rows = await db
    .select()
    .from(pets)
    .where(eq(pets.userId, user.id))
    .orderBy(asc(pets.createdAt));
  return rows.map((r) => ({ id: r.id, name: r.name, species: r.species, gabarit: r.gabarit }));
}

export async function addPet(input: {
  name: string;
  species: Animal;
  gabarit: Gabarit;
}): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser();
  const name = input.name.trim().slice(0, 40);
  if (!name) return { ok: false, error: "Le prénom est requis." };
  const db = await getDb();
  const [row] = await db.select({ n: count() }).from(pets).where(eq(pets.userId, user.id));
  if ((row?.n ?? 0) >= MAX_PETS) return { ok: false, error: `Maximum ${MAX_PETS} animaux par compte.` };
  await db.insert(pets).values({
    id: crypto.randomUUID(),
    userId: user.id,
    name,
    species: input.species,
    gabarit: input.gabarit,
  });
  return { ok: true };
}

export async function removePet(id: string): Promise<void> {
  const user = await requireUser();
  const db = await getDb();
  await db.delete(pets).where(and(eq(pets.id, id), eq(pets.userId, user.id)));
}
