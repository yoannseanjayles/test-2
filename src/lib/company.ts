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

export const company = {
  /** Nom commercial affiché sur le site. */
  tradeName: "chien et chat",
  /** Raison sociale (ex. « Chien et Chat SAS »). */
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
