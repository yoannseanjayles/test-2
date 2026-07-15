"use server";

import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { orderLines, orders } from "@/db/auth-schema";
import { requireRole } from "@/lib/admin";
import { getSessionUser } from "@/lib/auth";
import { isReturnEligible, orderTransitions } from "@/lib/account";
import { sendOrderStatusUpdate } from "@/lib/email";

/**
 * Commandes & Ops (7.1 jalon 3) — transitions de statuts D-016 gardées
 * serveur, notification client à chaque changement, remboursement Stripe
 * intégral sur Annulée (commande payée) et Remboursée.
 */

export type AdminOrderDto = {
  number: string;
  email: string;
  status: string;
  address: string;
  shippingMethod: string;
  total: number;
  createdAt: string;
  returnReason: string | null;
  hasPaymentIntent: boolean;
  lines: { productName: string; size: string; color: string; quantity: number; unitPrice: number }[];
};

export async function listAdminOrders(): Promise<AdminOrderDto[]> {
  await requireRole("Ops");
  const db = await getDb();
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
  const lines = await db.select().from(orderLines);
  return rows.map((r) => ({
    number: r.number,
    email: r.email,
    status: r.status,
    address: r.address,
    shippingMethod: r.shippingMethod,
    total: r.total,
    createdAt: r.createdAt.toISOString(),
    returnReason: r.returnReason,
    hasPaymentIntent: r.paymentIntentId !== null,
    lines: lines
      .filter((l) => l.orderId === r.id)
      .map((l) => ({
        productName: l.productName, size: l.size, color: l.color,
        quantity: l.quantity, unitPrice: l.unitPrice,
      })),
  }));
}

/** Statuts où l'argent a été encaissé — seuls cas où annuler doit rembourser. */
const paidStatuses = ["Payée", "Payée (démonstration)", "En préparation"];

/** Remboursement intégral — mode démonstration (pas d'intent ou pas de clé) : rien à émettre. */
async function refundPayment(paymentIntentId: string | null) {
  if (!paymentIntentId || !process.env.STRIPE_SECRET_KEY) {
    return { ok: true as const, demo: true };
  }
  try {
    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    await stripe.refunds.create({ payment_intent: paymentIntentId });
    return { ok: true as const, demo: false };
  } catch (error) {
    return {
      ok: false as const,
      demo: false,
      error: error instanceof Error ? error.message : "Remboursement refusé.",
    };
  }
}

export async function setOrderStatus(
  number: string,
  next: string,
): Promise<{ ok: boolean; error?: string; info?: string }> {
  await requireRole("Ops");
  const db = await getDb();
  const [order] = await db.select().from(orders).where(eq(orders.number, number));
  if (!order) return { ok: false, error: "Commande introuvable." };
  const allowed = orderTransitions[order.status] ?? [];
  if (!allowed.includes(next)) {
    return { ok: false, error: `Transition « ${order.status} → ${next} » non autorisée (D-016).` };
  }

  let info: string | undefined;
  const mustRefund =
    next === "Remboursée" || (next === "Annulée" && paidStatuses.includes(order.status));
  if (mustRefund) {
    const refund = await refundPayment(order.paymentIntentId);
    if (!refund.ok) return { ok: false, error: `Remboursement Stripe refusé : ${refund.error}` };
    info = refund.demo
      ? "Aucun paiement Stripe à rembourser (mode démonstration)."
      : "Remboursement Stripe intégral émis.";
  }

  await db.update(orders).set({ status: next }).where(eq(orders.id, order.id));
  void sendOrderStatusUpdate({ number: order.number, email: order.email }, next);
  return { ok: true, info };
}

/** Retour self-service (D-035/D-040) — passe la commande du client en « Retour en cours ». */
export async function requestReturn(
  number: string,
  reason: string,
): Promise<{ ok: boolean; error?: string }> {
  const sessionUser = await getSessionUser(await headers());
  if (!sessionUser) return { ok: false, error: "Connectez-vous pour demander un retour." };
  const db = await getDb();
  const [order] = await db.select().from(orders).where(eq(orders.number, number));
  if (!order) return { ok: false, error: "Commande introuvable." };
  const owns =
    order.userId === sessionUser.id ||
    order.email.toLowerCase() === sessionUser.email.toLowerCase();
  if (!owns) return { ok: false, error: "Cette commande n'est pas rattachée à votre compte." };
  if (!isReturnEligible(order.status)) {
    return {
      ok: false,
      error: `Le retour devient possible une fois la commande expédiée (statut actuel : ${order.status}).`,
    };
  }
  await db.update(orders)
    .set({ status: "Retour en cours", returnReason: reason.trim().slice(0, 200) || null })
    .where(eq(orders.id, order.id));
  void sendOrderStatusUpdate({ number: order.number, email: order.email }, "Retour en cours");
  return { ok: true };
}
