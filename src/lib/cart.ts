"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getProductBySlug } from "@/lib/catalog";

/**
 * Panier client (jalon 3) — drawer à chaque ajout (D-029), persistance
 * locale préfigurant le cookie 30 j invité (D-030, fusion serveur en Phase 6).
 * Prix TTC en centimes (H18).
 */

export { FREE_SHIPPING_CENTS } from "@/lib/shipping";
import { FREE_SHIPPING_CENTS } from "@/lib/shipping";

export type CartLine = {
  slug: string;
  size: string;
  color: string;
  quantity: number;
};

const sameLine = (a: CartLine, b: Omit<CartLine, "quantity">) =>
  a.slug === b.slug && a.size === b.size && a.color === b.color;

type CartState = {
  lines: CartLine[];
  add: (line: Omit<CartLine, "quantity">) => void;
  setQuantity: (line: Omit<CartLine, "quantity">, quantity: number) => void;
  remove: (line: Omit<CartLine, "quantity">) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (line) =>
        set((state) => {
          const existing = state.lines.find((l) => sameLine(l, line));
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l === existing ? { ...l, quantity: l.quantity + 1 } : l,
              ),
            };
          }
          return { lines: [...state.lines, { ...line, quantity: 1 }] };
        }),
      setQuantity: (line, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => !sameLine(l, line))
              : state.lines.map((l) => (sameLine(l, line) ? { ...l, quantity } : l)),
        })),
      remove: (line) =>
        set((state) => ({ lines: state.lines.filter((l) => !sameLine(l, line)) })),
      clear: () => set({ lines: [] }),
    }),
    { name: "chien-et-chat-cart" },
  ),
);

/** État UI du mini-panier (ouvert à chaque ajout, D-029). */
type CartDrawerState = {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

export const useCartDrawer = create<CartDrawerState>((set) => ({
  isOpen: false,
  openDrawer: () => set({ isOpen: true }),
  closeDrawer: () => set({ isOpen: false }),
}));

/** Sous-total TTC en centimes — jointure catalogue (les lignes ne stockent pas de prix). */
export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((acc, line) => {
    const product = getProductBySlug(line.slug);
    return acc + (product ? product.price * line.quantity : 0);
  }, 0);
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((acc, l) => acc + l.quantity, 0);
}

/** Reste à ajouter pour la livraison offerte (0 = seuil atteint). */
export function freeShippingRemaining(subtotalCents: number): number {
  return Math.max(0, FREE_SHIPPING_CENTS - subtotalCents);
}
