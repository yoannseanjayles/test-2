"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { and, asc, count, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { newsletterSubscribers, orders, restockAlerts, user } from "@/db/auth-schema";
import { categories, guides, products, productVariants, reviews } from "@/db/schema";
import { isBrand, isUsage, sizesForBrand, type Brand, type Usage } from "@/lib/catalog";
import { getSessionUser } from "@/lib/auth";
import { sendRestockAlert } from "@/lib/email";
import { isServingProduction } from "@/lib/runtime-env";
import { rejectNonPageFile } from "@/lib/import-guard";

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
 *
 * Audit 2026-08 (CR-2) — le garde précédent ne se déclenchait QUE si
 * `DATABASE_URL` était absente, c'est-à-dire jamais en production réelle.
 * Sur une base neuve, le premier visiteur inscrit qui cliquait devenait donc
 * administrateur : la page /admin est un composant client servi publiquement,
 * bouton compris. Le rôle est désormais réservé à une adresse désignée hors
 * du code (`ADMIN_BOOTSTRAP_EMAIL`), et seulement si elle est vérifiée.
 */
export async function bootstrapAdmin(): Promise<{ ok: boolean; error?: string }> {
  const sessionUser = await getSessionUser(await headers());
  if (!sessionUser) return { ok: false, error: "Connectez-vous d'abord." };

  if (isServingProduction()) {
    const allowed = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
    // Message identique dans les deux cas : ne pas révéler si la variable
    // est posée, ni sur quelle adresse.
    if (!allowed || sessionUser.email.trim().toLowerCase() !== allowed) {
      return {
        ok: false,
        error: "Amorçage désactivé en production. Attribuez le rôle en base : UPDATE \"user\" SET role = 'Admin' WHERE email = '…'.",
      };
    }
    if (!sessionUser.emailVerified) {
      return { ok: false, error: "Vérifiez votre adresse e-mail avant d'amorcer le compte administrateur." };
    }
  }

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
  const [orderRows, sizeRows, [draftCount], [guideCount], [subscriberCount], [productCount], archivedRows] =
    await Promise.all([
      db.select({ status: orders.status }).from(orders),
      db.select().from(productVariants),
      db.select({ n: count() }).from(importDrafts).where(eq(importDrafts.status, "draft")),
      db.select({ n: count() }).from(guides),
      db.select({ n: count() }).from(newsletterSubscribers),
      db.select({ n: count() }).from(products).where(eq(products.archived, false)),
      db.select({ slug: products.slug }).from(products).where(eq(products.archived, true)),
    ]);
  // Les produits en corbeille ne comptent ni dans le catalogue ni en rupture.
  const archivedSlugs = new Set(archivedRows.map((r) => r.slug));
  const stockBySlug = new Map<string, number>();
  for (const s of sizeRows) {
    if (archivedSlugs.has(s.productSlug)) continue;
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
  brand: Brand;
  subcategory: string;
  price: number;
  curatedRank: number;
  isNew: boolean;
  curatorNote: string;
  shortDescription: string;
  /** Stock ventilé par coloris et pointure (D-054). */
  variants: { color: string; size: string; stock: number }[];
  /** Coloris déclarés sur la fiche — le référentiel des lignes ajoutables. */
  colors: string[];
  supplierRef: string | null;
  sourceUrl: string | null;
  imageCount: number;
  features: string[];
  specifications: { label: string; value: string }[];
  fieldVisibility: Record<string, boolean>;
  archived: boolean;
};

export async function listAdminProducts(): Promise<AdminProduct[]> {
  await requireRole("Catalogue", "Ops");
  const db = await getDb();
  const rows = await db.select().from(products).orderBy(asc(products.curatedRank));
  const variants = await db.select().from(productVariants);
  return rows.map((p) => ({
    slug: p.slug, name: p.name, brand: p.brand, subcategory: p.subcategory,
    price: p.price, curatedRank: p.curatedRank, isNew: p.isNew, curatorNote: p.curatorNote,
    shortDescription: p.shortDescription,
    supplierRef: p.supplierRef, sourceUrl: p.sourceUrl,
    imageCount: p.imageUrls.length, features: p.features,
    specifications: p.specifications, fieldVisibility: p.fieldVisibility,
    archived: p.archived,
    colors: p.colors.map((c) => c.name),
    variants: variants
      .filter((v) => v.productSlug === p.slug)
      .map((v) => ({ color: v.color, size: v.size, stock: v.stock })),
  }));
}

/** Corbeille (P2 audit) : retire le produit de la vente, restaurable à tout moment. */
export async function archiveAdminProduct(slug: string): Promise<{ ok: boolean; error?: string }> {
  await requireRole("Catalogue");
  const db = await getDb();
  const updated = await db.update(products).set({ archived: true })
    .where(eq(products.slug, slug)).returning();
  if (updated.length === 0) return { ok: false, error: "Produit introuvable." };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function restoreAdminProduct(slug: string): Promise<{ ok: boolean; error?: string }> {
  await requireRole("Catalogue");
  const db = await getDb();
  const updated = await db.update(products).set({ archived: false })
    .where(eq(products.slug, slug)).returning();
  if (updated.length === 0) return { ok: false, error: "Produit introuvable." };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateAdminProduct(input: {
  slug: string;
  price: number;
  curatedRank: number;
  isNew: boolean;
  curatorNote: string;
  /** Lignes de variante à créer ou mettre à jour (D-057, correctif BL-2). */
  stocks: { color: string; size: string; stock: number }[];
  /** Lignes de variante à supprimer — refusées si leur stock n'est pas nul. */
  removals?: { color: string; size: string }[];
  name?: string;
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
  const [product] = await db
    .select({ brand: products.brand, colors: products.colors })
    .from(products)
    .where(eq(products.slug, input.slug));
  if (!product) return { ok: false, error: "Produit introuvable." };

  // État du stock avant mise à jour — pour détecter les retours en stock (M-3).
  const previousVariants = await db.select().from(productVariants)
    .where(eq(productVariants.productSlug, input.slug));
  await db.update(products).set({
    price: input.price,
    curatedRank: input.curatedRank,
    isNew: input.isNew,
    curatorNote: input.curatorNote.trim(),
    ...(input.name !== undefined ? { name: input.name.trim().slice(0, 120) } : {}),
    ...(input.shortDescription !== undefined && input.shortDescription.trim()
      ? { shortDescription: input.shortDescription.trim().slice(0, 400) }
      : {}),
    ...(input.features !== undefined ? { features: input.features.slice(0, 12) } : {}),
    ...(input.specifications !== undefined ? { specifications: input.specifications.slice(0, 15) } : {}),
    ...(input.fieldVisibility !== undefined ? { fieldVisibility: input.fieldVisibility } : {}),
  }).where(eq(products.slug, input.slug));
  /*
   * Correctif BL-2. `updateProduct` ne faisait que des UPDATE : la grille de
   * pointures d'un produit était figée à sa création, et un produit créé en
   * back-office naissait avec une seule ligne « Taille unique » à zéro, sans
   * aucun chemin d'interface pour lui ajouter la pointure 42. Il ne pouvait
   * donc jamais être vendu — sans qu'aucune erreur ne le signale.
   */
  const allowedSizes = new Set(sizesForBrand(product.brand));
  const allowedColors = new Set(product.colors.map((c) => c.name));
  const keyOf = (color: string, size: string) => `${color}\u0000${size}`;
  const existing = new Map(previousVariants.map((v) => [keyOf(v.color, v.size), v]));

  /*
   * Les suppressions passent d'abord, et sur le stock réellement en base :
   * `product_variants` porte le stock, et `reserveStock()` s'appuie sur
   * l'existence de la ligne. Supprimer une variante dont des commandes sont
   * en cours de paiement ferait échouer la restitution silencieusement.
   */
  for (const removal of input.removals ?? []) {
    const line = existing.get(keyOf(removal.color, removal.size));
    if (!line) continue;
    if (line.stock > 0) {
      return {
        ok: false,
        error: `Impossible de supprimer « ${removal.color} » en ${removal.size} : ${line.stock} en stock. Passez le stock à zéro d'abord.`,
      };
    }
    await db.delete(productVariants).where(and(
      eq(productVariants.productSlug, input.slug),
      eq(productVariants.color, removal.color),
      eq(productVariants.size, removal.size),
    ));
    existing.delete(keyOf(removal.color, removal.size));
  }

  for (const line of input.stocks) {
    if (!allowedColors.has(line.color)) {
      return { ok: false, error: `Coloris inconnu sur cette fiche : « ${line.color} ».` };
    }
    if (!allowedSizes.has(line.size)) {
      return { ok: false, error: `Pointure hors grille ${product.brand} : « ${line.size} ».` };
    }
    const stock = Math.max(0, Math.min(9999, Math.trunc(line.stock)));
    if (existing.has(keyOf(line.color, line.size))) {
      await db.update(productVariants).set({ stock }).where(and(
        eq(productVariants.productSlug, input.slug),
        eq(productVariants.color, line.color),
        eq(productVariants.size, line.size),
      ));
    } else {
      await db.insert(productVariants).values({
        productSlug: input.slug,
        color: line.color,
        size: line.size,
        stock,
      });
    }
  }
  await notifyRestocks(input.slug, previousVariants, input.stocks);
  // Produit à jour < 60 s sur la boutique (revalidation ISR, 5.0 §4).
  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * Alertes restock (H15/audit M-3) : quand une **variante** repasse de 0 à
 * disponible, les inscrits sur cette variante — et, si le produit entier
 * était en rupture, les inscrits « ce produit » — sont prévenus, puis leurs
 * alertes sont purgées. Sans RESEND_API_KEY, les alertes restent en attente
 * (rien n'est purgé sans e-mail parti).
 */
type VariantStock = { color: string; size: string; stock: number };

async function notifyRestocks(
  slug: string,
  previousVariants: VariantStock[],
  newStocks: VariantStock[],
): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;
  const keyOf = (v: { color: string; size: string }) => `${v.color}\u0000${v.size}`;
  const next = new Map(newStocks.map((v) => [keyOf(v), Math.max(0, Math.trunc(v.stock))]));
  const backInStock = previousVariants.filter(
    (v) => v.stock === 0 && (next.get(keyOf(v)) ?? 0) > 0,
  );
  if (backInStock.length === 0) return;
  const wasAllOut = previousVariants.every((v) => v.stock === 0);

  const db = await getDb();
  const [product] = await db
    .select({ name: products.name, brand: products.brand, subcategory: products.subcategory })
    .from(products)
    .where(eq(products.slug, slug));
  if (!product) return;
  const url = `${process.env.BETTER_AUTH_URL ?? "https://comptoir-store.vercel.app"}/${product.brand}/${product.subcategory}/${slug}`;

  const revived = new Set(backInStock.map((v) => `${v.color}\u0000${v.size}`));
  const alerts = await db.select().from(restockAlerts)
    .where(eq(restockAlerts.productSlug, slug));
  const concerned = alerts.filter((a) =>
    revived.has(`${a.color}\u0000${a.size}`) || (wasAllOut && a.size === "ce produit"),
  );
  for (const alert of concerned) {
    await sendRestockAlert(alert.email, product.name, `${alert.color} — ${alert.size}`, url);
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
  await db.delete(productVariants).where(eq(productVariants.productSlug, slug));
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
      if (entry.size === 0) throw new Error("Fichier vide.");
      const buffer = Buffer.from(await entry.arrayBuffer());
      const rejection = rejectNonPageFile(fileName, entry.type, buffer);
      if (rejection) throw new Error(rejection);
      const raw = buffer.toString("utf-8");
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
  brand: Brand;
  subcategory: Usage;
  price: number;
  curatorNote: string;
  shortDescription: string;
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
  // Marque validée contre le référentiel fermé (D-055/D-058) : `brand` était
  // un texte libre pré-rempli depuis une page fournisseur, publié sans
  // contrôle jusque dans le JSON-LD `Brand`.
  if (!isBrand(input.brand) || !isUsage(input.subcategory)) {
    return { ok: false, error: "Marque ou usage hors référentiel." };
  }
  const db = await getDb();
  const [category] = await db.select({ slug: categories.slug }).from(categories)
    .where(and(eq(categories.brand, input.brand), eq(categories.slug, input.subcategory)));
  if (!category) {
    return { ok: false, error: `Usage inconnu pour ${input.brand} : « ${input.subcategory} ».` };
  }
  const [draft] = await db.select().from(importDrafts).where(eq(importDrafts.id, input.draftId));
  if (!draft || draft.status !== "draft") return { ok: false, error: "Brouillon introuvable." };
  const [existing] = await db.select({ slug: products.slug }).from(products).where(eq(products.slug, input.slug));
  if (existing) return { ok: false, error: "Ce slug existe déjà." };

  const colorNames = input.colorNames.map((n) => n.trim()).filter(Boolean).slice(0, 12);
  await db.insert(products).values({
    slug: input.slug,
    name: input.name.trim().slice(0, 120),
    brand: input.brand,
    subcategory: input.subcategory,
    price: input.price,
    shortDescription: input.shortDescription.trim().slice(0, 400),
    curatorNote: input.curatorNote.trim(),
    material: draft.specifications.find((s) => /mati[èe]re|mat[ée]riau/i.test(s.label))?.value.slice(0, 60) ?? "À préciser",
    details: [{ title: "Description complète", content: input.shortDescription.trim() }],
    colors: colorNames.length > 0
      ? colorNames.map((name) => ({ name: name.slice(0, 40), hex: "#C9BFAC" }))
      : [{ name: "Coloris unique", hex: "#C9BFAC" }],
    genres: ["mixte"],
    isNew: true,
    curatedRank: 999,
    pairsWith: [],
    tone: "chalk",
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
  /*
   * Correctif BL-2 (suite). La publication créait **une seule** ligne
   * « Taille unique » à zéro : `isOutOfStock()` déclarait aussitôt le produit
   * en rupture, la fiche affichait le formulaire d'alerte de retour en stock,
   * et le produit ne pouvait jamais être vendu. On crée désormais la grille
   * complète — chaque coloris décliné sur toute la grille de la marque — à
   * zéro. Le stock se saisit ensuite dans la fiche admin, ligne par ligne.
   */
  const grid = sizesForBrand(input.brand);
  const publishedColors = colorNames.length > 0 ? colorNames : ["Coloris unique"];
  const newVariants = publishedColors.flatMap((color) =>
    grid.map((size) => ({
      productSlug: input.slug,
      color: color.slice(0, 40),
      size,
      stock: 0,
    })),
  );
  for (let i = 0; i < newVariants.length; i += 200) {
    await db.insert(productVariants).values(newVariants.slice(i, i + 200));
  }
  await db.update(importDrafts).set({ status: "published" }).where(eq(importDrafts.id, input.draftId));
  revalidatePath("/", "layout");
  return { ok: true };
}
