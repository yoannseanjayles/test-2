import "server-only";
import type { OrderDto } from "@/lib/orders";
import { formatPrice } from "@/lib/format";

/**
 * E-mails transactionnels (6.0) via l'API Resend quand RESEND_API_KEY est
 * posée — silencieux sinon (les templates React Email raffineront en finition).
 */
async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "chien et chat <commandes@resend.dev>",
      to,
      subject,
      html,
    }),
  }).catch(() => {});
}

export async function sendOrderConfirmation(order: Pick<OrderDto, "number" | "email" | "total" | "lines">) {
  const lines = order.lines
    .map((l) => `${l.quantity} × ${l.productName} (${l.size} · ${l.color})`)
    .join("<br>");
  await sendEmail(
    order.email,
    `Commande ${order.number} confirmée — chien et chat`,
    `<p>Merci ! Votre commande <strong>${order.number}</strong> est confirmée.</p><p>${lines}</p><p>Total TTC : <strong>${formatPrice(order.total)}</strong></p><p>Nous vous préviendrons à chaque étape.</p>`,
  );
}

/** Notification client à chaque transition de statut (D-016). */
const statusEmails: Record<string, { subject: string; body: string }> = {
  "En préparation": {
    subject: "est en préparation",
    body: "Notre atelier prépare votre commande — expédition sous 24 h ouvrées.",
  },
  "Expédiée": {
    subject: "est expédiée",
    body: "Votre colis est en route — livraison estimée sous 2 à 3 jours ouvrés.",
  },
  "Livrée": {
    subject: "a été livrée",
    body: "Votre commande est arrivée. Un souci ? Le premier retour est offert pendant 30 jours.",
  },
  "Clôturée": {
    subject: "est clôturée",
    body: "Merci pour votre confiance — à bientôt sur chien et chat.",
  },
  "Retour en cours": {
    subject: "— retour enregistré",
    body: "Votre retour est enregistré : l'étiquette prépayée arrive par e-mail. Remboursement sous 5 jours après réception du colis.",
  },
  "Remboursée": {
    subject: "est remboursée",
    body: "Le remboursement est parti — le montant réapparaît sous 2 à 5 jours ouvrés selon votre banque.",
  },
  "Annulée": {
    subject: "est annulée",
    body: "Votre commande est annulée. Si elle avait été payée, le remboursement est en route.",
  },
  "Payée": {
    subject: "est confirmée",
    body: "Votre paiement est validé — nous préparons votre commande.",
  },
};

export async function sendOrderStatusUpdate(order: { number: string; email: string }, status: string) {
  const template = statusEmails[status];
  if (!template) return;
  await sendEmail(
    order.email,
    `Votre commande ${order.number} ${template.subject} — chien et chat`,
    `<p>${template.body}</p><p>Suivi : <a href="${process.env.BETTER_AUTH_URL ?? "https://comptoir-store.vercel.app"}/suivi-commande">suivi de commande</a> (numéro ${order.number}).</p>`,
  );
}
