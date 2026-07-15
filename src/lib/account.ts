/** Statuts de commande (D-016) — partagés compte / suivi invité / admin. */
export const orderStatuses = ["Payée", "En préparation", "Expédiée", "Livrée", "Clôturée"] as const;

/**
 * Position dans la timeline nominale. « Payée (démonstration) » compte comme
 * payée ; -1 = statut hors parcours (paiement en attente/échoué, retour,
 * remboursée, annulée) affiché en badge plutôt qu'en timeline.
 */
export function statusIndex(status: string): number {
  if (status.startsWith("Payée")) return 0;
  return orderStatuses.indexOf(status as (typeof orderStatuses)[number]);
}

/**
 * Transitions autorisées côté admin (D-016). Passer à « Annulée » ou
 * « Remboursée » déclenche le remboursement Stripe quand la commande a un
 * PaymentIntent. « Remboursée » et « Annulée » sont terminaux.
 */
export const orderTransitions: Record<string, string[]> = {
  "En attente de paiement": ["Payée", "Annulée"],
  "Échec de paiement": ["Annulée"],
  "Payée": ["En préparation", "Annulée"],
  "Payée (démonstration)": ["En préparation", "Annulée"],
  "En préparation": ["Expédiée", "Annulée"],
  "Expédiée": ["Livrée"],
  "Livrée": ["Clôturée", "Retour en cours"],
  "Clôturée": ["Retour en cours"],
  "Retour en cours": ["Remboursée"],
};

/** Retour client self-service (D-035/D-040) : possible une fois la commande expédiée. */
export function isReturnEligible(status: string): boolean {
  return ["Expédiée", "Livrée", "Clôturée"].includes(status);
}

/** Message client par statut — suivi invité et espace compte. */
export const statusDescriptions: Record<string, string> = {
  "En attente de paiement": "Votre paiement est en cours de validation.",
  "Échec de paiement": "Le paiement n'a pas abouti — la commande n'est pas engagée.",
  "Payée": "Commande confirmée — préparation à l'atelier sous 24 h ouvrées.",
  "Payée (démonstration)": "Commande de démonstration confirmée.",
  "En préparation": "Votre commande est en préparation à l'atelier — expédition sous 24 h ouvrées.",
  "Expédiée": "Votre colis est en route — livraison estimée sous 2 à 3 jours ouvrés.",
  "Livrée": "Votre commande a été livrée. Un souci ? Le retour est offert pendant 30 jours.",
  "Clôturée": "Commande clôturée — merci pour votre confiance.",
  "Retour en cours": "Retour en cours — remboursement sous 5 jours après réception du colis.",
  "Remboursée": "Commande remboursée — le montant réapparaît sous 2 à 5 jours ouvrés selon votre banque.",
  "Annulée": "Commande annulée. Si elle avait été payée, le remboursement est en route.",
};
