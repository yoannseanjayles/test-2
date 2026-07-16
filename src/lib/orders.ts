"use server";

import { headers } from "next/headers";
import { desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { orderLines, orders, user } from "@/db/auth-schema";
import { products } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { addressSchema, contactSchema } from "@/lib/checkout-schemas";
import { shippingMethods, shippingPrice, type ShippingMethodId } from "@/lib/shipping";
import { getShippingConfig } from "@/lib/admin-settings";
import { releaseStock, reserveStock } from "@/lib/stock";
import { RATE_LIMITED_ERROR, rateLimit } from "@/lib/rate-limit";
import type { CartLine } from "@/lib/cart";
import { sendOrderConfirmation } from "@/lib/email";

/**
 * Commandes (6.1 jalon 3) — le total est TOUJOURS recalculé serveur depuis
 * la base (D-033) ; le stock est réservé à l'enregistrement (décrément
 * conditionnel, restitué si le paiement échoue). Stripe crée un
 * PaymentIntent si les clés sont posées — la confirmation (statut « Payée »
 * + e-mail) vient alors du webhook ; sinon la commande démo est enregistrée
 * directement (statut explicite) et confirmée immédiatement.
 */

export type PlacedOrder = {
  ok: boolean;
  error?: string;
  number?: string;
  total?: number;
  clientSecret?: string | null;
};

export async function placeOrder(input: {
  email: string;
  address: Record<string, string>;
  shippingMethod: ShippingMethodId;
  lines: CartLine[];
}): Promise<PlacedOrder> {
  if (!(await rateLimit("place-order", 10, 10 * 60 * 1000))) {
    return { ok: false, error: RATE_LIMITED_ERROR };
  }
  const contact = contactSchema.safeParse({ email: input.email });
  const address = addressSchema.safeParse(input.address);
  if (!contact.success || !address.success || input.lines.length === 0) {
    return { ok: false, error: "Commande invalide — vérifiez vos informations." };
  }
  if (!shippingMethods.some((m) => m.id === input.shippingMethod)) {
    return { ok: false, error: "Mode de livraison inconnu." };
  }
  if (input.lines.some((l) => !Number.isInteger(l.quantity) || l.quantity < 1)) {
    return { ok: false, error: "Quantité invalide dans le panier." };
  }
  if (input.lines.some((l) => l.quantity > 20)) {
    return { ok: false, error: "Maximum 20 exemplaires par article — contactez-nous pour une commande en volume." };
  }

  const db = await getDb();
  // Recalcul serveur : prix lus en base, jamais depuis le client (D-033).
  const rows = await db
    .select({ slug: products.slug, name: products.name, price: products.price })
    .from(products)
    .where(inArray(products.slug, input.lines.map((l) => l.slug)));
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  if (input.lines.some((l) => !bySlug.has(l.slug))) {
    return { ok: false, error: "Un article du panier n'est plus disponible." };
  }
  const subtotal = input.lines.reduce(
    (acc, l) => acc + bySlug.get(l.slug)!.price * l.quantity, 0);
  // Tarifs livraison lus en base (réglages admin, jalon 4) — repli sur D-039.
  const shipping = shippingPrice(input.shippingMethod, subtotal, await getShippingConfig());
  const total = subtotal + shipping;

  // Réservation de stock (audit C-2) : échoue si une taille n'existe pas ou
  // n'a plus assez d'unités — restituée si la suite échoue.
  const stockLines = input.lines.map((l) => ({ slug: l.slug, size: l.size, quantity: l.quantity }));
  const reservation = await reserveStock(stockLines);
  if (!reservation.ok) {
    const name = bySlug.get(/« ([^»]+) »/.exec(reservation.error)?.[1] ?? "")?.name;
    return { ok: false, error: name ? `Stock insuffisant pour « ${name} ».` : reservation.error };
  }

  const sessionUser = await getSessionUser(await headers());
  const id = crypto.randomUUID();
  // 10 hexadécimaux (audit M-8) : collisions négligeables à notre échelle.
  const number = `CC-${id.replace(/-/g, "").slice(0, 10).toUpperCase()}`;

  try {
    // Stripe (H20) : PaymentIntent si la clé est configurée, sinon mode démo.
    let clientSecret: string | null = null;
    let paymentIntentId: string | null = null;
    let status = "Payée (démonstration)";
    if (process.env.STRIPE_SECRET_KEY) {
      const { default: Stripe } = await import("stripe");
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const intent = await stripe.paymentIntents.create({
        amount: total,
        currency: "eur",
        automatic_payment_methods: { enabled: true },
        receipt_email: contact.data.email,
        metadata: { orderNumber: number },
      });
      clientSecret = intent.client_secret;
      paymentIntentId = intent.id;
      status = "En attente de paiement";
    }

    await db.insert(orders).values({
      id,
      number,
      userId: sessionUser?.id ?? null,
      email: contact.data.email,
      status,
      address: `${address.data.firstName} ${address.data.lastName}, ${address.data.address}, ${address.data.postalCode} ${address.data.city}, ${address.data.country} — tél. ${address.data.phone}`,
      shippingMethod: input.shippingMethod,
      subtotal,
      shipping,
      total,
      paymentIntentId,
    });
    await db.insert(orderLines).values(input.lines.map((l) => ({
      id: crypto.randomUUID(),
      orderId: id,
      productSlug: l.slug,
      productName: bySlug.get(l.slug)!.name,
      size: l.size,
      color: l.color,
      quantity: l.quantity,
      unitPrice: bySlug.get(l.slug)!.price,
    })));

    // Mode démo : confirmée immédiatement. Avec Stripe, l'e-mail de
    // confirmation part du webhook une fois le paiement réellement validé
    // (audit C-1/C-3) — jamais avant.
    if (!paymentIntentId) {
      void sendOrderConfirmation({
        number,
        email: contact.data.email,
        total,
        lines: input.lines.map((l) => ({
          productSlug: l.slug,
          productName: bySlug.get(l.slug)!.name,
          size: l.size,
          color: l.color,
          quantity: l.quantity,
          unitPrice: bySlug.get(l.slug)!.price,
        })),
      });
    }

    return { ok: true, number, total, clientSecret };
  } catch (error) {
    await releaseStock(stockLines);
    console.error("[orders] Échec d'enregistrement de commande :", error);
    return { ok: false, error: "Impossible d'enregistrer la commande — réessayez." };
  }
}

export type OrderDto = {
  number: string;
  status: string;
  email: string;
  address: string;
  shippingMethod: string;
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: string;
  lines: { productSlug: string; productName: string; size: string; color: string; quantity: number; unitPrice: number }[];
};

async function toDto(row: typeof orders.$inferSelect): Promise<OrderDto> {
  const db = await getDb();
  const lines = await db.select().from(orderLines).where(eq(orderLines.orderId, row.id));
  return {
    number: row.number,
    status: row.status,
    email: row.email,
    address: row.address,
    shippingMethod: row.shippingMethod,
    subtotal: row.subtotal,
    shipping: row.shipping,
    total: row.total,
    createdAt: row.createdAt.toISOString(),
    lines: lines.map((l) => ({
      productSlug: l.productSlug, productName: l.productName, size: l.size,
      color: l.color, quantity: l.quantity, unitPrice: l.unitPrice,
    })),
  };
}

/**
 * Commandes du compte connecté. Rattachement par userId toujours ; par
 * e-mail uniquement si l'adresse du compte est vérifiée (audit C-4) — sinon
 * n'importe qui pourrait lire les commandes d'autrui en s'inscrivant avec
 * son adresse.
 */
export async function listMyOrders(): Promise<OrderDto[]> {
  const sessionUser = await getSessionUser(await headers());
  if (!sessionUser) return [];
  const db = await getDb();
  const [account] = await db.select().from(user).where(eq(user.id, sessionUser.id));
  if (!account) return [];
  const own = await db.select().from(orders)
    .where(eq(orders.userId, account.id))
    .orderBy(desc(orders.createdAt));
  const byEmail = account.emailVerified
    ? await db.select().from(orders)
        .where(eq(orders.email, account.email))
        .orderBy(desc(orders.createdAt))
    : [];
  const seen = new Set<string>();
  const all = [...own, ...byEmail]
    .filter((r) => !seen.has(r.id) && seen.add(r.id))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return Promise.all(all.map(toDto));
}

/**
 * Rattache au compte connecté une commande invité passée avec la même
 * adresse (création de compte post-achat). Même niveau de preuve que le
 * suivi invité : connaître le numéro ET l'adresse e-mail de la commande.
 */
export async function claimOrder(number: string): Promise<{ ok: boolean }> {
  const sessionUser = await getSessionUser(await headers());
  if (!sessionUser) return { ok: false };
  const db = await getDb();
  const [row] = await db.select().from(orders)
    .where(eq(orders.number, number.trim().toUpperCase()));
  if (!row || row.userId !== null) return { ok: false };
  if (row.email.toLowerCase() !== sessionUser.email.toLowerCase()) return { ok: false };
  await db.update(orders).set({ userId: sessionUser.id }).where(eq(orders.id, row.id));
  return { ok: true };
}

/** Suivi invité : numéro + e-mail (sans compte). */
export async function findOrder(number: string, email: string): Promise<OrderDto | null> {
  if (!(await rateLimit("find-order", 20, 10 * 60 * 1000))) return null;
  const db = await getDb();
  const [row] = await db.select().from(orders)
    .where(eq(orders.number, number.trim().toUpperCase()));
  if (!row || row.email.toLowerCase() !== email.trim().toLowerCase()) return null;
  return toDto(row);
}
