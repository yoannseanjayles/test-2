"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { settings } from "@/db/schema";
import { requireRole } from "@/lib/admin";
import {
  defaultShippingConfig,
  shippingMethods,
  type ShippingConfig,
} from "@/lib/shipping";

/**
 * Réglages boutique (7.1 jalon 4) — config livraison D-039 en base,
 * éditable par le rôle Admin. La lecture est publique : le tunnel et les
 * rappels de seuil affichent les mêmes montants que le recalcul serveur.
 */

const SHIPPING_KEY = "shipping";

export async function getShippingConfig(): Promise<ShippingConfig> {
  const db = await getDb();
  const [row] = await db.select().from(settings).where(eq(settings.key, SHIPPING_KEY));
  if (!row) return defaultShippingConfig;
  const stored = row.value as Partial<ShippingConfig>;
  return {
    freeShippingCents: stored.freeShippingCents ?? defaultShippingConfig.freeShippingCents,
    prices: { ...defaultShippingConfig.prices, ...(stored.prices ?? {}) },
  };
}

export async function saveShippingConfig(
  input: ShippingConfig,
): Promise<{ ok: boolean; error?: string }> {
  await requireRole("Admin");
  const amounts = [input.freeShippingCents, ...shippingMethods.map((m) => input.prices[m.id])];
  if (amounts.some((a) => !Number.isInteger(a) || a < 0 || a > 50_000)) {
    return { ok: false, error: "Montants invalides (0 à 500 €)." };
  }
  const value = {
    freeShippingCents: input.freeShippingCents,
    prices: Object.fromEntries(shippingMethods.map((m) => [m.id, input.prices[m.id]])),
  };
  const db = await getDb();
  const [existing] = await db.select({ key: settings.key }).from(settings).where(eq(settings.key, SHIPPING_KEY));
  if (existing) {
    await db.update(settings).set({ value }).where(eq(settings.key, SHIPPING_KEY));
  } else {
    await db.insert(settings).values({ key: SHIPPING_KEY, value });
  }
  // La page Livraison & retours et les rappels de seuil affichent ces montants.
  revalidatePath("/", "layout");
  return { ok: true };
}
