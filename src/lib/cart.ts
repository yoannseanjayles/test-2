"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Panier client minimal du jalon 2 : ajout + compteur (badge header).
 * Le drawer, la page panier et la persistance serveur (D-029/D-030)
 * arrivent au jalon 3 ; le stockage local préfigure le cookie 30 j invité.
 */

export type CartLine = {
  slug: string;
  size: string;
  color: string;
  quantity: number;
};

type CartState = {
  lines: CartLine[];
  add: (line: Omit<CartLine, "quantity">) => void;
  count: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (line) =>
        set((state) => {
          const existing = state.lines.find(
            (l) =>
              l.slug === line.slug && l.size === line.size && l.color === line.color,
          );
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l === existing ? { ...l, quantity: l.quantity + 1 } : l,
              ),
            };
          }
          return { lines: [...state.lines, { ...line, quantity: 1 }] };
        }),
      count: () => get().lines.reduce((acc, l) => acc + l.quantity, 0),
    }),
    { name: "chien-et-chat-cart" },
  ),
);
