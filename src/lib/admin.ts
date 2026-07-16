"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { and, asc, count, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { newsletterSubscribers, orders, restockAlerts, user } from "@/db/auth-schema";
import { categories, guides, products, productSizes, reviews } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { sendRestockAlert } from "@/lib/email";

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
  // Audit C-7 : en production sans base persistante, la base en mémoire se
  // vide à chaque redéploiement et ce bouton redeviendrait disponible pour
  // le premier visiteur venu. On l'interdit donc hors base réelle.
  if (
    process.env.NODE_ENV === "production" &&
    !process.env.DATABASE_URL &&
    process.env.ALLOW_ADMIN_BOOTSTRAP !== "1"
  ) {
    return {
      ok: false,
      error: "Amorçage désactivé en production sans DATABASE_URL (posez la variable Neon, ou ALLOW_ADMIN_BOOTSTRAP=1 pour une démo).",
    };
  }
  const sessionUser = await getSessionUser(await headers());
  if (!sessionUser) return { ok: false, error: "Connectez-vous d'abord." };
  const db = await getDb();
  // Attribution conditionnelle en une requête (audit S-7) : deux amorçages
  // simultanés ne peuvent pas créer deux admins.
  const updated = await db.update(user).set({ role: "Admin" })
    .where(and(
      eq(user.id, sessionUser.id),
      sql`NOT EXISTS (SELECT 1 FROM "user" WHERE role = 'Admin')`,
    ))
    .returning();
  if (updated.length === 0) return { ok: false, error: "Un administrateur existe déjà." };
  return { ok: true };
}

export async function requireRole(...roles: AdminRole[]): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin || (!roles.includes(admin.role) && admin.role !== "Admin")) {
    throw new Error("Accès refusé.");
  }
  return admin;
}

/** Indicateurs du tableau de bord — chaque rôle voit sa vue d'ensemble. */
export type AdminSummary = {
  pendingOrders: number;
  returnsInProgress: number;
  products: number;
  outOfStock: number;
  lowStock: number;
  drafts: number;
  guides: number;
  subscribers: number;
};

export async function getAdminSummary(): Promise<AdminSummary> {
  await requireRole("Ops", "Catalogue", "Éditorial");
  const db = await getDb();
  const [orderRows, sizeRows, [draftCount], [guideCount], [subscriberCount], [productCount]] =
    await Promise.all([
      db.select({ status: orders.status }).from(orders),
      db.select().from(productSizes),
      db.select({ n: count() }).from(importDrafts).where(eq(importDrafts.status, "draft")),
      db.select({ n: count() }).from(guides),
      db.select({ n: count() }).from(newsletterSubscribers),
      db.select({ n: count() }).from(products),
    ]);
  const stockBySlug = new Map<string, number>();
  for (const s of sizeRows) {
    stockBySlug.set(s.productSlug, (stockBySlug.get(s.productSlug) ?? 0) + s.stock);
  }
  const totals = [...stockBySlug.values()];
  return {
    pendingOrders: orderRows.filter((o) => o.status.startsWith("Payée") || o.status === "En préparation").length,
    returnsInProgress: orderRows.filter((o) => o.status === "Retour en cours").length,
    products: productCount?.n ?? 0,
    outOfStock: totals.filter((t) => t === 0).length,
    lowStock: totals.filter((t) => t > 0 && t <= 5).length,
    drafts: draftCount?.n ?? 0,
    guides: guideCount?.n ?? 0,
    subscribers: subscriberCount?.n ?? 0,
  };
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
  shortDescription: string;
  brand: string;
  sizes: { name: string; stock: number }[];
  supplierRef: string | null;
  sourceUrl: string | null;
  imageCount: number;
  features: string[];
  specifications: { label: string; value: string }[];
  fieldVisibility: Record<string, boolean>;
};

export async function listAdminProducts(): Promise<AdminProduct[]> {
  await requireRole("Catalogue", "Ops");
  const db = await getDb();
  const rows = await db.select().from(products).orderBy(asc(products.curatedRank));
  const sizes = await db.select().from(productSizes);
  return rows.map((p) => ({
    slug: p.slug, name: p.name, animal: p.animal, subcategory: p.subcategory,
    price: p.price, curatedRank: p.curatedRank, isNew: p.isNew, curatorNote: p.curatorNote,
    shortDescription: p.shortDescription, brand: p.brand,
    supplierRef: p.supplierRef, sourceUrl: p.sourceUrl,
    imageCount: p.imageUrls.length, features: p.features,
    specifications: p.specifications, fieldVisibility: p.fieldVisibility,
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
  name?: string;
  brand?: string;
  shortDescription?: string;
  features?: string[];
  specifications?: { label: string; value: string }[];
  fieldVisibility?: Record<string, boolean>;
}): Promise<{ ok: boolean; error?: string }> {
  await requireRole("Catalogue");
  if (!Number.isInteger(input.price) || input.price < 100 || input.price > 1_000_000) {
    return { ok: false, error: "Prix invalide (en centimes, 1 € à 10 000 €)." };
  }
  // Note de curation obligatoire (D-025) — l'import ne court-circuite pas la sélection.
  if (input.curatorNote.trim().length < 20) {
    return { ok: false, error: "La note de curation est obligatoire (20 caractères min, D-025)." };
  }
  if (input.name !== undefined && input.name.trim().length < 3) {
    return { ok: false, error: "Nom trop court." };
  }
  const db = await getDb();
  // État du stock avant mise à jour — pour détecter les retours en stock (M-3).
  const previousSizes = await db.select().from(productSizes)
    .where(eq(productSizes.productSlug, input.slug));
  await db.update(products).set({
    price: input.price,
    curatedRank: input.curatedRank,
    isNew: input.isNew,
    curatorNote: input.curatorNote.trim(),
    ...(input.name !== undefined ? { name: input.name.trim().slice(0, 120) } : {}),
    ...(input.brand !== undefined ? { brand: input.brand.trim().slice(0, 60) || "Sélection import" } : {}),
    ...(input.shortDescription !== undefined && input.shortDescription.trim()
      ? { shortDescription: input.shortDescription.trim().slice(0, 400) }
      : {}),
    ...(input.features !== undefined ? { features: input.features.slice(0, 12) } : {}),
    ...(input.specifications !== undefined ? { specifications: input.specifications.slice(0, 15) } : {}),
    ...(input.fieldVisibility !== undefined ? { fieldVisibility: input.fieldVisibility } : {}),
  }).where(eq(products.slug, input.slug));
  for (const s of input.stocks) {
    await db.update(productSizes)
      .set({ stock: Math.max(0, Math.min(9999, Math.trunc(s.stock))) })
      .where(and(eq(productSizes.productSlug, input.slug), eq(productSizes.name, s.name)));
  }
  await notifyRestocks(input.slug, previousSizes, input.stocks);
  // Produit à jour < 60 s sur la boutique (revalidation ISR, 5.0 §4).
  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * Alertes restock (H15/audit M-3) : quand une taille repasse de 0 à
 * disponible, les inscrits sur cette taille — et, si le produit entier
 * était en rupture, les inscrits « ce produit » — sont prévenus, puis
 * leurs alertes sont purgées. Sans RESEND_API_KEY, les alertes restent en
 * attente (rien n'est purgé sans e-mail parti).
 */
async function notifyRestocks(
  slug: string,
  previousSizes: { name: string; stock: number }[],
  newStocks: { name: string; stock: number }[],
): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;
  const next = new Map(newStocks.map((s) => [s.name, Math.max(0, Math.trunc(s.stock))]));
  const backInStock = previousSizes
    .filter((s) => s.stock === 0 && (next.get(s.name) ?? 0) > 0)
    .map((s) => s.name);
  if (backInStock.length === 0) return;
  const wasAllOut = previousSizes.every((s) => s.stock === 0);
  const watchedSizes = wasAllOut ? [...backInStock, "ce produit"] : backInStock;

  const db = await getDb();
  const [product] = await db
    .select({ name: products.name, animal: products.animal, subcategory: products.subcategory })
    .from(products)
    .where(eq(products.slug, slug));
  if (!product) return;
  const url = `${process.env.BETTER_AUTH_URL ?? "https://comptoir-store.vercel.app"}/${product.animal}/${product.subcategory}/${slug}`;

  const alerts = await db.select().from(restockAlerts)
    .where(eq(restockAlerts.productSlug, slug));
  for (const alert of alerts.filter((a) => watchedSizes.includes(a.size))) {
    await sendRestockAlert(alert.email, product.name, alert.size, url);
    await db.delete(restockAlerts).where(eq(restockAlerts.id, alert.id));
  }
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
        brand: parsed.brand,
        specifications: parsed.specifications,
        variantNames: parsed.variantNames,
        supplierRating: parsed.supplierRating,
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
  brand: string | null;
  specifications: { label: string; value: string }[];
  variantNames: string[];
  supplierRating: string | null;
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
    brand: r.brand, specifications: r.specifications,
    variantNames: r.variantNames, supplierRating: r.supplierRating,
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
  brand: string;
  colorNames: string[];
  features: string[];
  specifications: { label: string; value: string }[];
  visibility: { images: boolean; features: boolean; specifications: boolean };
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
  // Sous-catégorie validée côté serveur (audit M-10) — un produit publié
  // hors des catégories existantes serait invisible en navigation.
  const db = await getDb();
  const [category] = await db.select({ slug: categories.slug }).from(categories)
    .where(and(eq(categories.animal, input.animal), eq(categories.slug, input.subcategory)));
  if (!category) {
    return { ok: false, error: `Sous-catégorie inconnue pour ${input.animal} : « ${input.subcategory} ».` };
  }
  const [draft] = await db.select().from(importDrafts).where(eq(importDrafts.id, input.draftId));
  if (!draft || draft.status !== "draft") return { ok: false, error: "Brouillon introuvable." };
  const [existing] = await db.select({ slug: products.slug }).from(products).where(eq(products.slug, input.slug));
  if (existing) return { ok: false, error: "Ce slug existe déjà." };

  const colorNames = input.colorNames.map((n) => n.trim()).filter(Boolean).slice(0, 12);
  await db.insert(products).values({
    slug: input.slug,
    name: input.name.trim().slice(0, 120),
    brand: input.brand.trim().slice(0, 60) || "Sélection import",
    animal: input.animal,
    subcategory: input.subcategory,
    price: input.price,
    shortDescription: input.shortDescription.trim().slice(0, 400),
    curatorNote: input.curatorNote.trim(),
    material: draft.specifications.find((s) => /mati[èe]re|mat[ée]riau/i.test(s.label))?.value.slice(0, 60) ?? "À préciser",
    details: [{ title: "Description complète", content: input.shortDescription.trim() }],
    colors: colorNames.length > 0
      ? colorNames.map((name) => ({ name: name.slice(0, 40), hex: "#C9BFAC" }))
      : [{ name: "Coloris unique", hex: "#C9BFAC" }],
    gabarits: ["XS", "S", "M", "L", "XL"],
    isNew: true,
    curatedRank: 999,
    pairsWith: [],
    tone: "cream",
    imageUrls: draft.images,
    supplierRef: draft.supplierRef,
    sourceUrl: draft.sourceUrl,
    features: input.features.map((f) => f.trim()).filter(Boolean).slice(0, 12).map((f) => f.slice(0, 200)),
    specifications: input.specifications.slice(0, 15),
    fieldVisibility: {
      images: input.visibility.images,
      features: input.visibility.features,
      specifications: input.visibility.specifications,
    },
  });
  await db.insert(productSizes).values({ productSlug: input.slug, name: "Taille unique", stock: 0 });
  await db.update(importDrafts).set({ status: "published" }).where(eq(importDrafts.id, input.draftId));
  revalidatePath("/", "layout");
  return { ok: true };
}
