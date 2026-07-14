"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { and, asc, count, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { user } from "@/db/auth-schema";
import { products, productSizes } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

/**
 * Actions back-office (7.1 jalon 1) — garde serveur par rôle (D-017/H42),
 * jamais côté client seul. Revalidation ISR après chaque écriture (5.0 §4).
 */

export type AdminRole = "Admin" | "Ops" | "Catalogue" | "Éditorial";

export type AdminUser = { id: string; email: string; name: string; role: AdminRole };

/** Rôle lu en base à chaque appel (jamais depuis le client). */
export async function getAdminUser(): Promise<AdminUser | null> {
  const sessionUser = await getSessionUser(await headers());
  if (!sessionUser) return null;
  const db = await getDb();
  const [row] = await db.select().from(user).where(eq(user.id, sessionUser.id));
  if (!row?.role) return null;
  return { id: row.id, email: row.email, name: row.name, role: row.role };
}

/**
 * Amorçage démo (H42) : tant qu'aucun admin n'existe, l'utilisateur connecté
 * peut prendre le rôle Admin. En production : comptes créés en base.
 */
export async function bootstrapAdmin(): Promise<{ ok: boolean; error?: string }> {
  const sessionUser = await getSessionUser(await headers());
  if (!sessionUser) return { ok: false, error: "Connectez-vous d'abord." };
  const db = await getDb();
  const [existing] = await db.select({ n: count() }).from(user).where(eq(user.role, "Admin"));
  if ((existing?.n ?? 0) > 0) return { ok: false, error: "Un administrateur existe déjà." };
  await db.update(user).set({ role: "Admin" }).where(eq(user.id, sessionUser.id));
  return { ok: true };
}

async function requireRole(...roles: AdminRole[]): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin || (!roles.includes(admin.role) && admin.role !== "Admin")) {
    throw new Error("Accès refusé.");
  }
  return admin;
}

export type AdminProduct = {
  slug: string;
  name: string;
  animal: string;
  subcategory: string;
  price: number;
  curatedRank: number;
  isNew: boolean;
  curatorNote: string;
  sizes: { name: string; stock: number }[];
};

export async function listAdminProducts(): Promise<AdminProduct[]> {
  await requireRole("Catalogue", "Ops");
  const db = await getDb();
  const rows = await db.select().from(products).orderBy(asc(products.curatedRank));
  const sizes = await db.select().from(productSizes);
  return rows.map((p) => ({
    slug: p.slug, name: p.name, animal: p.animal, subcategory: p.subcategory,
    price: p.price, curatedRank: p.curatedRank, isNew: p.isNew, curatorNote: p.curatorNote,
    sizes: sizes.filter((s) => s.productSlug === p.slug).map((s) => ({ name: s.name, stock: s.stock })),
  }));
}

export async function updateAdminProduct(input: {
  slug: string;
  price: number;
  curatedRank: number;
  isNew: boolean;
  curatorNote: string;
  stocks: { name: string; stock: number }[];
}): Promise<{ ok: boolean; error?: string }> {
  await requireRole("Catalogue");
  if (!Number.isInteger(input.price) || input.price < 100 || input.price > 1_000_000) {
    return { ok: false, error: "Prix invalide (en centimes, 1 € à 10 000 €)." };
  }
  // Note de curation obligatoire (D-025) — l'import ne court-circuite pas la sélection.
  if (input.curatorNote.trim().length < 20) {
    return { ok: false, error: "La note de curation est obligatoire (20 caractères min, D-025)." };
  }
  const db = await getDb();
  await db.update(products).set({
    price: input.price,
    curatedRank: input.curatedRank,
    isNew: input.isNew,
    curatorNote: input.curatorNote.trim(),
  }).where(eq(products.slug, input.slug));
  for (const s of input.stocks) {
    await db.update(productSizes)
      .set({ stock: Math.max(0, Math.min(9999, Math.trunc(s.stock))) })
      .where(and(eq(productSizes.productSlug, input.slug), eq(productSizes.name, s.name)));
  }
  // Produit à jour < 60 s sur la boutique (revalidation ISR, 5.0 §4).
  revalidatePath("/", "layout");
  return { ok: true };
}
