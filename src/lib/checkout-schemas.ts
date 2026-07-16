import { z } from "zod";

/** Schémas partagés front / server actions (H37) — module neutre (ni client ni serveur). */

export const contactSchema = z.object({
  email: z
    .string()
    .min(1, "L'adresse e-mail est requise.")
    .email("Cette adresse e-mail n'est pas valide."),
});

/** Livraison FR/BE/CH/LU au lancement (H5). */
export const countries = ["France", "Belgique", "Suisse", "Luxembourg"] as const;

export const addressSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis."),
  lastName: z.string().min(1, "Le nom est requis."),
  address: z.string().min(4, "L'adresse est requise."),
  postalCode: z
    .string()
    .regex(/^[0-9]{4,5}$/, "Code postal invalide (4 à 5 chiffres)."),
  city: z.string().min(1, "La ville est requise."),
  country: z.enum(countries),
  /** Exigé par les transporteurs (point relais, express) — audit M-7. */
  phone: z
    .string()
    .regex(/^\+?[0-9 ().-]{6,20}$/, "Numéro de téléphone invalide."),
});

export type ContactValues = z.infer<typeof contactSchema>;
export type AddressValues = z.infer<typeof addressSchema>;
