"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";

/**
 * Lien panier avec badge compteur (`aria-live` discret).
 * Le compteur n'est rendu qu'après hydratation (stockage local → pas de SSR).
 */
export function CartLink() {
  const lines = useCart((state) => state.lines);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const count = hydrated ? lines.reduce((acc, l) => acc + l.quantity, 0) : 0;

  return (
    <Link
      href="/panier"
      aria-label={count > 0 ? `Panier, ${count} article${count > 1 ? "s" : ""}` : "Panier"}
      className="relative flex size-11 items-center justify-center rounded-sm text-bark-900 transition-colors duration-150 hover:bg-cream-300"
    >
      <ShoppingBag aria-hidden="true" className="size-5" />
      <span aria-live="polite" className="sr-only">
        {count > 0 ? `${count} article${count > 1 ? "s" : ""} dans le panier` : ""}
      </span>
      {count > 0 && (
        <span
          aria-hidden="true"
          className="text-caption absolute right-0.5 top-0.5 flex size-5 items-center justify-center rounded-full bg-pine-700 font-semibold text-white"
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
