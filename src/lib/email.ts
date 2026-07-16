import "server-only";
import type { OrderDto } from "@/lib/orders";
import { formatPrice } from "@/lib/format";

/**
 * E-mails transactionnels (6.0) via l'API Resend quand RESEND_API_KEY est
 * posée — silencieux sinon (les templates React Email raffineront en finition).
 */

/** Contenu variable (noms de produits importés, saisies) toujours échappé. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendEmail(to: string, subject: string, html: string, replyTo?: string) {
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
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  }).catch((error) => {
    console.error(`[email] Échec d'envoi « ${subject} » à ${to}:`, error);
  });
}

export async function sendOrderConfirmation(order: Pick<OrderDto, "number" | "email" | "total" | "lines">) {
  const lines = order.lines
    .map((l) => escapeHtml(`${l.quantity} × ${l.productName} (${l.size} · ${l.color})`))
    .join("<br>");
  await sendEmail(
    order.email,
    `Commande ${order.number} confirmée — chien et chat`,
    `<p>Merci ! Votre commande <strong>${escapeHtml(order.number)}</strong> est confirmée.</p><p>${lines}</p><p>Total TTC : <strong>${formatPrice(order.total)}</strong></p><p>Nous vous préviendrons à chaque étape.</p>`,
  );
}

/** Vérification d'e-mail (Better Auth) — conditionne le rattachement des commandes. */
export async function sendVerificationEmail(to: string, url: string) {
  await sendEmail(
    to,
    "Confirmez votre adresse e-mail — chien et chat",
    `<p>Bienvenue ! Confirmez votre adresse pour activer votre compte :</p><p><a href="${escapeHtml(url)}">Confirmer mon adresse e-mail</a></p><p>Si vous n'êtes pas à l'origine de cette inscription, ignorez ce message.</p>`,
  );
}

/** Formulaire de contact : message relayé à la boutique (répondre = répondre au client). */
export async function sendContactMessage(input: {
  name: string;
  email: string;
  orderNumber?: string;
  message: string;
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false;
  const to = process.env.CONTACT_EMAIL ?? process.env.EMAIL_FROM;
  if (!to) return false;
  await sendEmail(
    to,
    `Contact — ${escapeHtml(input.name)}${input.orderNumber ? ` (commande ${escapeHtml(input.orderNumber)})` : ""}`,
    `<p><strong>De :</strong> ${escapeHtml(input.name)} &lt;${escapeHtml(input.email)}&gt;</p>${input.orderNumber ? `<p><strong>Commande :</strong> ${escapeHtml(input.orderNumber)}</p>` : ""}<p>${escapeHtml(input.message).replace(/\n/g, "<br>")}</p>`,
    input.email,
  );
  return true;
}

/** Alerte « retour en stock » (H15/audit M-3) — envoyée depuis l'admin au resaisi du stock. */
export async function sendRestockAlert(to: string, productName: string, size: string, url: string) {
  await sendEmail(
    to,
    `De retour en stock : ${productName} — chien et chat`,
    `<p>Bonne nouvelle ! <strong>${escapeHtml(productName)}</strong>${size !== "ce produit" ? ` (taille ${escapeHtml(size)})` : ""} est de nouveau disponible.</p><p><a href="${escapeHtml(url)}">Voir le produit</a> — les quantités restent limitées.</p><p>Vous recevez ce message car vous aviez demandé à être prévenu·e du retour en stock.</p>`,
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
    body: "Votre commande est arrivée. Un souci ? Les retours sont offerts pendant 30 jours.",
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
    `<p>${template.body}</p><p>Suivi : <a href="${process.env.BETTER_AUTH_URL ?? "https://comptoir-store.vercel.app"}/suivi-commande">suivi de commande</a> (numéro ${escapeHtml(order.number)}).</p>`,
  );
}
