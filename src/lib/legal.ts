import { company } from "@/lib/company";

/**
 * Éléments contractuels opposables (audit 2026-08, EL-7 et MO-6).
 *
 * `CGV_VERSION` est enregistrée avec chaque commande, en même temps que
 * l'horodatage d'acceptation : en cas de litige, on doit pouvoir prouver
 * QUELLES conditions le client a acceptées, pas seulement qu'il a coché une
 * case. À incrémenter à chaque modification de fond des CGV.
 */
export const CGV_VERSION = "2026-08-21";

/** Date affichée en tête des CGV — même révision que CGV_VERSION. */
export const CGV_UPDATED = "21 août 2026";

/**
 * Formulaire type de rétractation — annexe I, partie B de la directive
 * 2011/83/UE, repris à l'article R.221-1 du Code de la consommation.
 *
 * Sa fourniture est obligatoire : son omission prolonge de plein droit le
 * délai de rétractation de douze mois (art. L.221-20 c. conso.).
 */
export const withdrawalFormTitle = "Formulaire type de rétractation";

export const withdrawalFormIntro =
  "Veuillez compléter et renvoyer le présent formulaire uniquement si vous souhaitez vous rétracter du contrat. " +
  "Vous pouvez aussi nous notifier votre décision par toute autre déclaration dénuée d'ambiguïté, via le formulaire de contact du site.";

export const withdrawalFormBody = [
  `À l'attention de ${company.legalName}, ${company.address} — ${company.tradeName} :`,
  "Je/nous (*) vous notifie/notifions (*) par la présente ma/notre (*) rétractation du contrat portant sur la vente du bien ci-dessous :",
  "— Commandé le (*) / reçu le (*) :",
  "— Numéro de commande :",
  "— Nom du (des) consommateur(s) :",
  "— Adresse du (des) consommateur(s) :",
  "— Signature du (des) consommateur(s) (uniquement en cas de notification du présent formulaire sur papier) :",
  "— Date :",
  "(*) Rayez la mention inutile.",
];
