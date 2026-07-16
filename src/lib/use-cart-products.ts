"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchCartProducts, type CartProduct } from "@/lib/cart-data";
import { getProductBySlug, productPath } from "@/lib/catalog";
import type { CartLine } from "@/lib/cart";

/**
 * Résolution des lignes de panier depuis la base (audit M-1), avec repli
 * immédiat sur le catalogue statique le temps de la réponse serveur (pas de
 * flash). `null` en cache = produit retiré de la vente : la ligne est
 * affichée comme indisponible plutôt que masquée.
 */

/** Cache de session de navigation — rafraîchi à chaque rechargement de page. */
const cache = new Map<string, CartProduct | null>();

function fromStaticCatalog(slug: string): CartProduct | undefined {
  const p = getProductBySlug(slug);
  if (!p) return undefined;
  return {
    slug,
    name: p.name,
    brand: p.brand,
    price: p.price,
    tone: p.tone,
    path: productPath(p),
    imageUrl: null,
    sizes: p.sizes,
  };
}

export type ResolvedCart = {
  /** Produit d'une ligne — `null` si retiré de la vente, `undefined` si pas encore chargé. */
  get: (slug: string) => CartProduct | null | undefined;
  /** Sous-total TTC en centimes des lignes résolues. */
  subtotal: number;
  /** true quand toutes les lignes ont une réponse de la base. */
  ready: boolean;
};

export function useCartProducts(lines: CartLine[]): ResolvedCart {
  const slugs = useMemo(
    () => [...new Set(lines.map((l) => l.slug))],
    // La liste des slugs suffit comme dépendance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lines.map((l) => l.slug).join("\n")],
  );
  const [, setVersion] = useState(0);
  const missing = slugs.filter((s) => !cache.has(s));

  useEffect(() => {
    if (missing.length === 0) return;
    let cancelled = false;
    fetchCartProducts(missing)
      .then((found) => {
        for (const slug of missing) {
          cache.set(slug, found.find((p) => p.slug === slug) ?? null);
        }
        if (!cancelled) setVersion((v) => v + 1);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missing.join("\n")]);

  const get = (slug: string): CartProduct | null | undefined => {
    const cached = cache.get(slug);
    if (cached !== undefined) return cached;
    return fromStaticCatalog(slug);
  };

  const subtotal = lines.reduce((acc, line) => {
    const product = get(line.slug);
    return acc + (product ? product.price * line.quantity : 0);
  }, 0);

  return { get, subtotal, ready: missing.length === 0 };
}
