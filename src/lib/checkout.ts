"use client";

import { z } from "zod";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FREE_SHIPPING_CENTS, type CartLine } from "@/lib/cart";

/**
 * Checkout 3 étapes (D-032/D-033) — schémas Zod partagés avec l'API en
 * Phase 6 (H37). Paiement simulé : le PSP (Stripe + PayPal, H20) arrive
 * avec le back-end.
 */

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
});

export type ContactValues = z.infer<typeof contactSchema>;
export type AddressValues = z.infer<typeof addressSchema>;

/** 3 modes de livraison (H21). Le seuil D-029 s'applique à domicile et relais. */
export const shippingMethods = [
  { id: "domicile", label: "À domicile", detail: "2–3 jours ouvrés", price: 490, freeAboveThreshold: true },
  { id: "relais", label: "En point relais", detail: "3–4 jours ouvrés", price: 390, freeAboveThreshold: true },
  { id: "express", label: "Express", detail: "24 h ouvrées", price: 990, freeAboveThreshold: false },
] as const;

export type ShippingMethodId = (typeof shippingMethods)[number]["id"];

export function shippingPrice(methodId: ShippingMethodId, subtotal: number): number {
  const method = shippingMethods.find((m) => m.id === methodId)!;
  if (method.freeAboveThreshold && subtotal >= FREE_SHIPPING_CENTS) return 0;
  return method.price;
}

export type Order = {
  number: string;
  placedAt: string;
  email: string;
  address: AddressValues;
  shippingMethod: ShippingMethodId;
  lines: CartLine[];
  subtotal: number;
  shipping: number;
  total: number;
};

type OrderState = {
  lastOrder: Order | null;
  setOrder: (order: Order) => void;
};

/** Dernière commande (démo) — lue par la page de confirmation. */
export const useOrder = create<OrderState>()(
  persist((set) => ({ lastOrder: null, setOrder: (order) => set({ lastOrder: order }) }), {
    name: "chien-et-chat-order",
  }),
);
