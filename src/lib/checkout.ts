"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/lib/cart";

/**
 * Checkout 3 étapes (D-032/D-033) — schémas Zod partagés avec l'API en
 * Phase 6 (H37). Paiement simulé : le PSP (Stripe + PayPal, H20) arrive
 * avec le back-end.
 */

export {
  addressSchema,
  contactSchema,
  countries,
  type AddressValues,
  type ContactValues,
} from "@/lib/checkout-schemas";
import type { AddressValues } from "@/lib/checkout-schemas";

export { shippingMethods, shippingPrice, type ShippingMethodId } from "@/lib/shipping";
import type { ShippingMethodId } from "@/lib/shipping";

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
