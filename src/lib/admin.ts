"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { and, asc, count, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { restockAlerts, user } from "@/db/auth-schema";
import { products, productSizes, reviews } from "@/db/schema";
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

export async function requireRole(...roles: AdminRole[]): Promise<AdminUser> {
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
  supplierRef: string | null;
  sourceUrl: string | null;
};

export async function listAdminProducts(): Promise<AdminProduct[]> {
  await requireRole("Catalogue", "Ops");
  const db = await getDb();
  const rows = await db.select().from(products).orderBy(asc(products.curatedRank));
  const sizes = await db.select().from(productSizes);
  return rows.map((p) => ({
    slug: p.slug, name: p.name, animal: p.animal, subcategory: p.subcategory,
    price: p.price, curatedRank: p.curatedRank, isNew: p.isNew, curatorNote: p.curatorNote,
    supplierRef: p.supplierRef, sourceUrl: p.sourceUrl,
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

/**
 * Suppression définitive d'un produit — avis, stocks et alertes restock
 * associés compris. Les lignes de commande passées conservent leur copie
 * dénormalisée (nom, prix) : l'historique client reste intact.
 */
export async function deleteAdminProduct(slug: string): Promise<{ ok: boolean; error?: string }> {
  await requireRole("Catalogue");
  const db = await getDb();
  const [existing] = await db.select({ slug: products.slug }).from(products).where(eq(products.slug, slug));
  if (!existing) return { ok: false, error: "Produit introuvable." };
  await db.delete(reviews).where(eq(reviews.productSlug, slug));
  await db.delete(productSizes).where(eq(productSizes.productSlug, slug));
  await db.delete(restockAlerts).where(eq(restockAlerts.productSlug, slug));
  await db.delete(products).where(eq(products.slug, slug));
  revalidatePath("/", "layout");
  return { ok: true };
}

// ——— Import AliExpress (D-052/H41) : fichiers téléchargés, analyse hors ligne ———

import { importDrafts } from "@/db/auth-schema";
import { parseAliexpressPage } from "@/lib/aliexpress";
import { desc } from "drizzle-orm";

export type ImportReport = { fileName: string; ok: boolean; title?: string; error?: string };

export async function importAliexpressFiles(formData: FormData): Promise<ImportReport[]> {
  await requireRole("Catalogue");
  const db = await getDb();
  const reports: ImportReport[] = [];
  for (const entry of formData.getAll("files")) {
    if (!(entry instanceof File)) continue;
    const fileName = entry.name;
    try {
      if (entry.size > 15 * 1024 * 1024) throw new Error("Fichier > 15 Mo.");
      const raw = Buffer.from(await entry.arrayBuffer()).toString("utf-8");
      const parsed = parseAliexpressPage(raw);
      if (!parsed) throw new Error("Titre introuvable — page non reconnue.");
      await db.insert(importDrafts).values({
        id: crypto.randomUUID(),
        fileName,
        title: parsed.title,
        supplierPrice: parsed.supplierPrice,
        images: parsed.images,
        sourceUrl: parsed.sourceUrl,
        supplierRef: parsed.supplierRef,
        description: parsed.description,
      });
      reports.push({ fileName, ok: true, title: parsed.title });
    } catch (error) {
      reports.push({ fileName, ok: false, error: error instanceof Error ? error.message : "Échec d'analyse." });
    }
  }
  return reports;
}

export type DraftDto = {
  id: string;
  fileName: string;
  title: string;
  supplierPrice: number | null;
  images: string[];
  sourceUrl: string | null;
  supplierRef: string | null;
  description: string | null;
};

export async function listDrafts(): Promise<DraftDto[]> {
  await requireRole("Catalogue");
  const db = await getDb();
  const rows = await db.select().from(importDrafts)
    .where(eq(importDrafts.status, "draft"))
    .orderBy(desc(importDrafts.createdAt));
  return rows.map((r) => ({
    id: r.id, fileName: r.fileName, title: r.title,
    supplierPrice: r.supplierPrice, images: r.images, sourceUrl: r.sourceUrl,
    supplierRef: r.supplierRef, description: r.description,
  }));
}

/** Publication d'un brouillon : fiche complétée + curation obligatoire (D-025). */
export async function publishDraft(input: {
  draftId: string;
  name: string;
  slug: string;
  animal: "chien" | "chat" | "nac";
  subcategory: string;
  price: number;
  curatorNote: string;
  shortDescription: string;
}): Promise<{ ok: boolean; error?: string }> {
  await requireRole("Catalogue");
  if (input.curatorNote.trim().length < 20) {
    return { ok: false, error: "Note de curation obligatoire (20 caractères min, D-025)." };
  }
  if (!/^[a-z0-9-]{3,60}$/.test(input.slug)) {
    return { ok: false, error: "Slug invalide (minuscules, chiffres, tirets)." };
  }
  if (!Number.isInteger(input.price) || input.price < 100) {
    return { ok: false, error: "Prix de vente invalide." };
  }
  const db = await getDb();
  const [draft] = await db.select().from(importDrafts).where(eq(importDrafts.id, input.draftId));
  if (!draft || draft.status !== "draft") return { ok: false, error: "Brouillon introuvable." };
  const [existing] = await db.select({ slug: products.slug }).from(products).where(eq(products.slug, input.slug));
  if (existing) return { ok: false, error: "Ce slug existe déjà." };

  await db.insert(products).values({
    slug: input.slug,
    name: input.name.trim().slice(0, 120),
    brand: "Sélection import",
    animal: input.animal,
    subcategory: input.subcategory,
    price: input.price,
    shortDescription: input.shortDescription.trim().slice(0, 400),
    curatorNote: input.curatorNote.trim(),
    material: "À préciser",
    details: [{ title: "Description complète", content: input.shortDescription.trim() }],
    colors: [{ name: "Coloris unique", hex: "#C9BFAC" }],
    gabarits: ["XS", "S", "M", "L", "XL"],
    isNew: true,
    curatedRank: 999,
    pairsWith: [],
    tone: "cream",
    imageUrls: draft.images,
    supplierRef: draft.supplierRef,
    sourceUrl: draft.sourceUrl,
  });
  await db.insert(productSizes).values({ productSlug: input.slug, name: "Taille unique", stock: 0 });
  await db.update(importDrafts).set({ status: "published" }).where(eq(importDrafts.id, input.draftId));
  revalidatePath("/", "layout");
  return { ok: true };
}
