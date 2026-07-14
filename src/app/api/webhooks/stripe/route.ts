import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { orders } from "@/db/auth-schema";

/**
 * Webhook Stripe (6.0 §3) : signature vérifiée, source de vérité des
 * statuts (D-016). Payée au paiement confirmé — le stock suivra (H39).
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
    const status = event.type === "payment_intent.succeeded" ? "Payée" : "Échec de paiement";
    const db = await getDb();
    await db.update(orders).set({ status }).where(eq(orders.paymentIntentId, intent.id));
  }
  return Response.json({ received: true });
}
