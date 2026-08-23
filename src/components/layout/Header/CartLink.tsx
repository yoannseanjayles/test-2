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
      className="relative flex size-11 items-center justify-center text-bark-900 transition-colors duration-250 hover:text-action"
    >
      <ShoppingBag aria-hidden="true" className="size-5" strokeWidth={1.75} />
      <span aria-live="polite" className="sr-only">
        {count > 0 ? `${count} article${count > 1 ? "s" : ""} dans le panier` : ""}
      </span>
      {count > 0 && (
        <span
          aria-hidden="true"
          className="text-caption absolute right-0 top-1 flex size-4.5 items-center justify-center rounded-full bg-terracotta-700 font-semibold leading-none text-white"
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
