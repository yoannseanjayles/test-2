"use server";

import { headers } from "next/headers";
import { desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { orderLines, orders } from "@/db/auth-schema";
import { products } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { addressSchema, contactSchema } from "@/lib/checkout-schemas";
import { shippingMethods, shippingPrice, type ShippingMethodId } from "@/lib/shipping";
import { getShippingConfig } from "@/lib/admin-settings";
import type { CartLine } from "@/lib/cart";
import { sendOrderConfirmation } from "@/lib/email";

/**
 * Commandes (6.1 jalon 3) — le total est TOUJOURS recalculé serveur depuis
 * la base (D-033) ; Stripe crée un PaymentIntent si les clés sont posées,
 * sinon la commande démo est enregistrée directement (statut explicite).
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
  const contact = contactSchema.safeParse({ email: input.email });
  const address = addressSchema.safeParse(input.address);
  if (!contact.success || !address.success || input.lines.length === 0) {
    return { ok: false, error: "Commande invalide — vérifiez vos informations." };
  }
  if (!shippingMethods.some((m) => m.id === input.shippingMethod)) {
    return { ok: false, error: "Mode de livraison inconnu." };
  }

  const db = await getDb();
  // Recalcul serveur : prix lus en base, jamais depuis le client (D-033).
  const rows = await db
    .select({ slug: products.slug, name: products.name, price: products.price })
    .from(products)
    .where(inArray(products.slug, input.lines.map((l) => l.slug)));
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  if (input.lines.some((l) => !bySlug.has(l.slug) || l.quantity < 1 || l.quantity > 20)) {
    return { ok: false, error: "Un article du panier n'est plus disponible." };
  }
  const subtotal = input.lines.reduce(
    (acc, l) => acc + bySlug.get(l.slug)!.price * l.quantity, 0);
  // Tarifs livraison lus en base (réglages admin, jalon 4) — repli sur D-039.
  const shipping = shippingPrice(input.shippingMethod, subtotal, await getShippingConfig());
  const total = subtotal + shipping;

  const user = await getSessionUser(await headers());
  const id = crypto.randomUUID();
  const number = `CC-${id.slice(0, 6).toUpperCase()}`;

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
    userId: user?.id ?? null,
    email: contact.data.email,
    status,
    address: `${address.data.firstName} ${address.data.lastName}, ${address.data.address}, ${address.data.postalCode} ${address.data.city}, ${address.data.country}`,
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

  return { ok: true, number, total, clientSecret };
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

/** Commandes du compte connecté (rattachées par userId ou par e-mail, D-014). */
export async function listMyOrders(): Promise<OrderDto[]> {
  const user = await getSessionUser(await headers());
  if (!user) return [];
  const db = await getDb();
  const rows = await db.select().from(orders)
    .where(eq(orders.email, user.email))
    .orderBy(desc(orders.createdAt));
  const own = await db.select().from(orders)
    .where(eq(orders.userId, user.id))
    .orderBy(desc(orders.createdAt));
  const seen = new Set<string>();
  const all = [...own, ...rows].filter((r) => !seen.has(r.id) && seen.add(r.id));
  return Promise.all(all.map(toDto));
}

/** Suivi invité : numéro + e-mail (sans compte). */
export async function findOrder(number: string, email: string): Promise<OrderDto | null> {
  const db = await getDb();
  const [row] = await db.select().from(orders)
    .where(eq(orders.number, number.trim().toUpperCase()));
  if (!row || row.email.toLowerCase() !== email.trim().toLowerCase()) return null;
  return toDto(row);
}
