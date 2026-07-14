"use server";

import { getDb } from "@/db";
import { newsletterSubscribers, restockAlerts } from "@/db/auth-schema";
import { contactSchema } from "@/lib/checkout-schemas";

/** Alerte restock (H15) — l'e-mail de retour en stock partira via l'admin (Phase 7). */
export async function subscribeRestock(input: {
  productSlug: string;
  size: string;
  email: string;
}): Promise<{ ok: boolean; error?: string }> {
  const parsed = contactSchema.safeParse({ email: input.email });
  if (!parsed.success) return { ok: false, error: "Adresse e-mail invalide." };
  const db = await getDb();
  await db.insert(restockAlerts).values({
    id: crypto.randomUUID(),
    productSlug: input.productSlug.slice(0, 80),
    size: input.size.slice(0, 40),
    email: parsed.data.email,
  });
  return { ok: true };
}

/** Inscription newsletter (D-021) — consentement horodaté. */
export async function subscribeNewsletter(email: string): Promise<{ ok: boolean; error?: string }> {
  const parsed = contactSchema.safeParse({ email });
  if (!parsed.success) return { ok: false, error: "Adresse e-mail invalide." };
  const db = await getDb();
  await db
    .insert(newsletterSubscribers)
    .values({ email: parsed.data.email })
    .onConflictDoNothing();
  return { ok: true };
}
