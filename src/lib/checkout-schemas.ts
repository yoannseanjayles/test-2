import { z } from "zod";

/** Schémas partagés front / server actions (H37) — module neutre (ni client ni serveur). */

export const contactSchema = z.object({
  email: z
    .string()
    .min(1, "L'adresse e-mail est requise.")
    // 254 = longueur maximale d'une adresse e-mail (RFC 5321), audit MO-3.
    .max(254, "Adresse e-mail trop longue.")
    .email("Cette adresse e-mail n'est pas valide."),
});

/** Livraison FR/BE/CH/LU au lancement (H5). */
export const countries = ["France", "Belgique", "Suisse", "Luxembourg"] as const;

/**
 * Bornes maximales (audit 2026-08, MO-3) : les champs n'avaient qu'un
 * `min()`. Un client — ou un appel direct à la Server Action — pouvait donc
 * soumettre et faire stocker plusieurs mégaoctets par champ. Les longueurs
 * retenues couvrent largement les formats postaux FR/BE/CH/LU.
 */
export const addressSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis.").max(60, "Prénom trop long (60 caractères max)."),
  lastName: z.string().min(1, "Le nom est requis.").max(60, "Nom trop long (60 caractères max)."),
  address: z.string().min(4, "L'adresse est requise.").max(200, "Adresse trop longue (200 caractères max)."),
  postalCode: z
    .string()
    .regex(/^[0-9]{4,5}$/, "Code postal invalide (4 à 5 chiffres)."),
  city: z.string().min(1, "La ville est requise.").max(80, "Nom de ville trop long (80 caractères max)."),
  country: z.enum(countries),
  /** Exigé par les transporteurs (point relais, express) — audit M-7. */
  phone: z
    .string()
    .regex(/^\+?[0-9 ().-]{6,20}$/, "Numéro de téléphone invalide."),
});

export type ContactValues = z.infer<typeof contactSchema>;
export type AddressValues = z.infer<typeof addressSchema>;
