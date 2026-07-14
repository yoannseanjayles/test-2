import "server-only";
import type { OrderDto } from "@/lib/orders";
import { formatPrice } from "@/lib/format";

/**
 * E-mails transactionnels (6.0) via l'API Resend quand RESEND_API_KEY est
 * posée — silencieux sinon (les templates React Email raffineront en finition).
 */
export async function sendOrderConfirmation(order: Pick<OrderDto, "number" | "email" | "total" | "lines">) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const lines = order.lines
    .map((l) => `${l.quantity} × ${l.productName} (${l.size} · ${l.color})`)
    .join("<br>");
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "chien et chat <commandes@resend.dev>",
      to: order.email,
      subject: `Commande ${order.number} confirmée — chien et chat`,
      html: `<p>Merci ! Votre commande <strong>${order.number}</strong> est confirmée.</p><p>${lines}</p><p>Total TTC : <strong>${formatPrice(order.total)}</strong></p><p>Nous vous préviendrons à chaque étape.</p>`,
    }),
  }).catch(() => {});
}
