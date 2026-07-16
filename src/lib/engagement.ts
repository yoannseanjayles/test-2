"use server";

import { getDb } from "@/db";
import { newsletterSubscribers, restockAlerts } from "@/db/auth-schema";
import { contactSchema } from "@/lib/checkout-schemas";
import { sendContactMessage } from "@/lib/email";
import { RATE_LIMITED_ERROR, rateLimit } from "@/lib/rate-limit";

/** Alerte restock (H15) — l'e-mail de retour en stock partira via l'admin (Phase 7). */
export async function subscribeRestock(input: {
  productSlug: string;
  size: string;
  email: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!(await rateLimit("restock-alert", 20, 10 * 60 * 1000))) {
    return { ok: false, error: RATE_LIMITED_ERROR };
  }
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

/** Formulaire de contact — relayé par e-mail à la boutique (audit C-6). */
export async function submitContactMessage(input: {
  name: string;
  email: string;
  orderNumber?: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!(await rateLimit("contact", 5, 10 * 60 * 1000))) {
    return { ok: false, error: RATE_LIMITED_ERROR };
  }
  const parsed = contactSchema.safeParse({ email: input.email });
  const name = input.name.trim().slice(0, 80);
  const message = input.message.trim().slice(0, 4000);
  if (!parsed.success) return { ok: false, error: "Adresse e-mail invalide." };
  if (!name || message.length < 10) {
    return { ok: false, error: "Merci d'indiquer votre nom et un message d'au moins 10 caractères." };
  }
  const sent = await sendContactMessage({
    name,
    email: parsed.data.email,
    orderNumber: input.orderNumber?.trim().slice(0, 20) || undefined,
    message,
  });
  if (!sent) {
    return {
      ok: false,
      error: "L'envoi de messages n'est pas encore configuré (RESEND_API_KEY absente) — réessayez plus tard.",
    };
  }
  return { ok: true };
}

/** Inscription newsletter (D-021) — consentement horodaté. */
export async function subscribeNewsletter(email: string): Promise<{ ok: boolean; error?: string }> {
  if (!(await rateLimit("newsletter", 10, 10 * 60 * 1000))) {
    return { ok: false, error: RATE_LIMITED_ERROR };
  }
  const parsed = contactSchema.safeParse({ email });
  if (!parsed.success) return { ok: false, error: "Adresse e-mail invalide." };
  const db = await getDb();
  await db
    .insert(newsletterSubscribers)
    .values({ email: parsed.data.email })
    .onConflictDoNothing();
  return { ok: true };
}
