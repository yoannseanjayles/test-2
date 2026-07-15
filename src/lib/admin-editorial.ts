"use server";

import { asc, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { guides } from "@/db/schema";
import { newsletterSubscribers } from "@/db/auth-schema";
import { requireRole } from "@/lib/admin";
import { parseGuideContent, serializeGuideContent } from "@/lib/guide-content";

/**
 * Éditorial (7.1 jalon 4) — guides en base éditables (rôle Éditorial),
 * export des inscrits newsletter. Revalidation ISR après chaque écriture.
 */

export type AdminGuideDto = {
  slug: string;
  title: string;
  excerpt: string;
  animal: "chien" | "chat" | "nac" | "tous";
  pillar: boolean;
  readingMinutes: number;
  relatedSubcategories: string[];
  /** Corps sérialisé pour l'édition (sections « ## »). */
  contentText: string;
};

export async function listAdminGuides(): Promise<AdminGuideDto[]> {
  await requireRole("Éditorial");
  const db = await getDb();
  const rows = await db.select().from(guides).orderBy(asc(guides.slug));
  return rows.map((g) => ({
    slug: g.slug,
    title: g.title,
    excerpt: g.excerpt,
    animal: g.animal,
    pillar: g.pillar,
    readingMinutes: g.readingMinutes,
    relatedSubcategories: g.relatedSubcategories,
    contentText: serializeGuideContent(g.content),
  }));
}

export async function saveGuide(input: {
  slug: string;
  title: string;
  excerpt: string;
  animal: "chien" | "chat" | "nac" | "tous";
  pillar: boolean;
  readingMinutes: number;
  contentText: string;
  isNew: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  await requireRole("Éditorial");
  if (!/^[a-z0-9-]{3,60}$/.test(input.slug)) {
    return { ok: false, error: "Slug invalide (minuscules, chiffres, tirets)." };
  }
  if (input.title.trim().length < 5) return { ok: false, error: "Titre trop court." };
  if (input.excerpt.trim().length < 10) return { ok: false, error: "Accroche trop courte." };
  if (!Number.isInteger(input.readingMinutes) || input.readingMinutes < 1 || input.readingMinutes > 60) {
    return { ok: false, error: "Temps de lecture invalide (1 à 60 minutes)." };
  }

  const db = await getDb();
  const values = {
    title: input.title.trim().slice(0, 120),
    excerpt: input.excerpt.trim().slice(0, 300),
    animal: input.animal,
    pillar: input.pillar,
    readingMinutes: input.readingMinutes,
    content: parseGuideContent(input.contentText),
  };
  const [existing] = await db.select({ slug: guides.slug }).from(guides).where(eq(guides.slug, input.slug));
  if (input.isNew) {
    if (existing) return { ok: false, error: "Ce slug existe déjà." };
    await db.insert(guides).values({ slug: input.slug, relatedSubcategories: [], ...values });
  } else {
    if (!existing) return { ok: false, error: "Guide introuvable." };
    await db.update(guides).set(values).where(eq(guides.slug, input.slug));
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteGuide(slug: string): Promise<{ ok: boolean; error?: string }> {
  await requireRole("Éditorial");
  const db = await getDb();
  const [existing] = await db.select({ slug: guides.slug }).from(guides).where(eq(guides.slug, slug));
  if (!existing) return { ok: false, error: "Guide introuvable." };
  await db.delete(guides).where(eq(guides.slug, slug));
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Export RGPD-compatible des inscrits newsletter (consentement horodaté). */
export async function exportNewsletterCsv(): Promise<{ csv: string; total: number }> {
  await requireRole("Éditorial");
  const db = await getDb();
  const rows = await db.select().from(newsletterSubscribers).orderBy(asc(newsletterSubscribers.createdAt));
  const lines = rows.map((r) => `${r.email},${r.createdAt.toISOString()}`);
  return { csv: ["email,inscription", ...lines].join("\n"), total: rows.length };
}

export async function countNewsletterSubscribers(): Promise<number> {
  await requireRole("Éditorial");
  const db = await getDb();
  const [row] = await db.select({ n: count() }).from(newsletterSubscribers);
  return row?.n ?? 0;
}
