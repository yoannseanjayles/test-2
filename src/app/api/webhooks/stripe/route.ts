import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { orderLines, orders } from "@/db/auth-schema";
import { sendOrderConfirmation } from "@/lib/email";
import { releaseStockForOrder } from "@/lib/stock";

/**
 * Webhook Stripe (6.0 §3) : signature vérifiée, source de vérité des
 * statuts (D-016). La confirmation client (statut « Payée » + e-mail) part
 * d'ici — jamais avant le paiement. Idempotent : la transition ne
 * s'applique que depuis « En attente de paiement », les relances Stripe ne
 * renvoient donc ni e-mail ni double restitution de stock.
 */
export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    return Response.json({ error: "Stripe non configuré" }, { status: 501 });
  }
  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(secretKey);
  const signature = request.headers.get("stripe-signature");
  if (!signature) return Response.json({ error: "Signature absente" }, { status: 400 });

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      await request.text(), signature, webhookSecret);
  } catch {
    return Response.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded" || event.type === "payment_intent.payment_failed") {
    const intent = event.data.object;
    const succeeded = event.type === "payment_intent.succeeded";
    const db = await getDb();
    const updated = await db
      .update(orders)
      .set({ status: succeeded ? "Payée" : "Échec de paiement" })
      .where(and(
        eq(orders.paymentIntentId, intent.id),
        eq(orders.status, "En attente de paiement"),
      ))
      .returning();
    const [order] = updated;
    if (order) {
      if (succeeded) {
        const lines = await db.select().from(orderLines).where(eq(orderLines.orderId, order.id));
        void sendOrderConfirmation({
          number: order.number,
          email: order.email,
          total: order.total,
          lines: lines.map((l) => ({
            productSlug: l.productSlug, productName: l.productName, size: l.size,
            color: l.color, quantity: l.quantity, unitPrice: l.unitPrice,
          })),
        });
      } else {
        // Paiement non abouti : le stock réservé redevient vendable.
        await releaseStockForOrder(order.id);
      }
    }
  }
  return Response.json({ received: true });
}
