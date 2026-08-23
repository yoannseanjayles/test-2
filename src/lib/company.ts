/**
 * Fiche d'identité de la société éditrice — SOURCE UNIQUE des mentions
 * légales, des CGV (médiation) et de la politique de confidentialité.
 *
 * ⚠️ AVANT LANCEMENT : remplacer chaque valeur « À COMPLÉTER » par les
 * informations réelles (immatriculation en cours). Le médiateur de la
 * consommation est OBLIGATOIRE pour un e-commerçant français (art.
 * L.612-1 c. conso.) — adhérer à un dispositif agréé (ex. CM2C, Médicys,
 * CNPM Médiation) et reporter ses coordonnées ici.
 */

export const TO_COMPLETE = "À COMPLÉTER" as const;

/**
 * Préfixe des clés de persistance navigateur (panier, dernière commande,
 * consentement cookies).
 *
 * ⚠️ Il est **volontairement dissocié du nom commercial** et écrit en dur.
 * Ces clés ne sont pas un habillage : les renommer orpheline l'état des
 * visiteurs qui les portent déjà — panier vidé, consentement redemandé.
 * Sans conséquence avant le lancement ; à ne plus toucher après. Le
 * changement de nom commercial (D-059) ne doit donc PAS entraîner celui-ci.
 */
export const STORAGE_PREFIX = "chien-et-chat";

export const company = {
  /**
   * Nom commercial affiché sur le site — **source unique** (D-059).
   * Il était écrit en dur en huit endroits (JSON-LD, layout, e-mails,
   * en-tête, pied de page, admin, page d'erreur…). Le pivot les fait tous
   * pointer ici : trancher le nom devient une édition d'une ligne, faite en
   * une fois, au lieu d'une chasse dans huit fichiers.
   */
  tradeName: "snikerz",
  /** Raison sociale (ex. « Snikerz SAS »). */
  legalName: `${TO_COMPLETE} — raison sociale`,
  /** Forme juridique et capital (ex. « SAS au capital de 10 000 € »). */
  legalForm: `${TO_COMPLETE} — forme juridique et capital`,
  /** Immatriculation (ex. « RCS Paris 123 456 789 »). */
  rcs: `${TO_COMPLETE} — RCS`,
  /** SIRET du siège. */
  siret: `${TO_COMPLETE} — SIRET`,
  /** N° de TVA intracommunautaire. */
  vat: `${TO_COMPLETE} — TVA intracommunautaire`,
  /** Adresse du siège social. */
  address: `${TO_COMPLETE} — siège social`,
  /** Directeur·rice de la publication. */
  publicationDirector: `${TO_COMPLETE} — directeur·rice de la publication`,
  /** Hébergeur du site. */
  host: "Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
  /** Médiateur de la consommation (dispositif agréé auquel la société adhère). */
  mediator: {
    name: `${TO_COMPLETE} — médiateur de la consommation`,
    address: `${TO_COMPLETE} — adresse du médiateur`,
    website: `${TO_COMPLETE} — site du médiateur`,
  },
} as const;
