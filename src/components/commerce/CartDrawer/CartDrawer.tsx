"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { Minus, Plus, Trash2, X } from "lucide-react";
import {
  cartSubtotal,
  useCart,
  useCartDrawer,
  type CartLine,
} from "@/lib/cart";
import { getProductBySlug, productPath } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { productImages, illustrations } from "@/lib/media";
import { Button } from "@/components/ui";
import { FreeShippingBar } from "../FreeShippingBar/FreeShippingBar";
import { Placeholder } from "../Placeholder/Placeholder";

/**
 * Mini-panier drawer (D-029) : ouvert à chaque ajout, FreeShippingBar en
 * tête, quantités éditables. Largeur 440px desktop / plein écran mobile
 * (4.1 §6), focus-trap simple, fermeture Échap/voile/×.
 */
export function CartDrawer() {
  const { isOpen, closeDrawer } = useCartDrawer();
  const lines = useCart((state) => state.lines);
  const drawerRef = useRef<HTMLDivElement>(null);
  const subtotal = cartSubtotal(lines);

  useEffect(() => {
    if (!isOpen) return;
    drawerRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Fermer le panier"
        onClick={closeDrawer}
        className="absolute inset-0 bg-scrim"
      />
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Panier"
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key === "Escape") closeDrawer();
        }}
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col rounded-l-lg bg-cream-50 shadow-overlay"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-heading text-h3 font-semibold text-bark-900">
            Votre panier
          </h2>
          <button
            type="button"
            aria-label="Fermer le panier"
            onClick={closeDrawer}
            className="flex size-11 items-center justify-center rounded-sm text-bark-700 hover:bg-cream-300"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <Image src={illustrations.panier} alt="" sizes="192px" className="h-auto w-48 rounded-lg" />
            <p className="text-body text-bark-700">Votre panier est vide.</p>
            <Button variant="secondary" onClick={closeDrawer}>
              Continuer mes découvertes
            </Button>
          </div>
        ) : (
          <>
            <div className="px-5 pt-4">
              <FreeShippingBar subtotal={subtotal} />
            </div>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-5 py-2">
              {lines.map((line) => (
                <CartDrawerLine key={`${line.slug}-${line.size}-${line.color}`} line={line} />
              ))}
            </ul>
            <div className="border-t border-border px-5 py-4">
              <p className="flex items-baseline justify-between text-body text-bark-900">
                Sous-total
                <span className="text-price text-xl">{formatPrice(subtotal)}</span>
              </p>
              <p className="text-caption mt-1 text-bark-700">
                TTC — livraison calculée à l'étape suivante.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="text-label inline-flex min-h-11 items-center justify-center rounded-md bg-action px-6 py-3 text-white transition duration-150 hover:bg-action-hover"
                >
                  Passer commande
                </Link>
                <Link
                  href="/panier"
                  onClick={closeDrawer}
                  className="text-label inline-flex min-h-11 items-center justify-center rounded-md border-[1.5px] border-action px-6 py-3 text-action transition duration-150 hover:bg-pine-50"
                >
                  Voir le panier
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CartDrawerLine({ line }: { line: CartLine }) {
  const { setQuantity, remove } = useCart();
  const closeDrawer = useCartDrawer((state) => state.closeDrawer);
  const product = getProductBySlug(line.slug);
  if (!product) return null;
  const image = productImages[line.slug]?.[0];

  return (
    <li className="flex gap-3 py-4">
      <Link
        href={productPath(product)}
        onClick={closeDrawer}
        className="w-20 shrink-0 overflow-hidden rounded-md"
      >
        {image ? (
          <Image src={image.src} alt="" sizes="80px" className="aspect-square h-auto w-full object-cover" />
        ) : (
          <Placeholder tone={product.tone} ratio="1 / 1" />
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={productPath(product)}
          onClick={closeDrawer}
          className="text-body-sm font-semibold text-bark-900 hover:text-action"
        >
          {product.name}
        </Link>
        <p className="text-caption mt-0.5 text-bark-700">
          {line.size} · {line.color}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center rounded-md border border-border">
            <button
              type="button"
              aria-label="Diminuer la quantité"
              onClick={() => setQuantity(line, line.quantity - 1)}
              className="flex size-9 items-center justify-center text-bark-700 hover:bg-cream-300"
            >
              <Minus aria-hidden="true" className="size-3.5" />
            </button>
            <span aria-live="polite" className="text-label w-8 text-center text-bark-900">
              {line.quantity}
            </span>
            <button
              type="button"
              aria-label="Augmenter la quantité"
              onClick={() => setQuantity(line, line.quantity + 1)}
              className="flex size-9 items-center justify-center text-bark-700 hover:bg-cream-300"
            >
              <Plus aria-hidden="true" className="size-3.5" />
            </button>
          </div>
          <p className="text-price text-bark-900">
            {formatPrice(product.price * line.quantity)}
          </p>
        </div>
      </div>
      <button
        type="button"
        aria-label={`Retirer ${product.name} du panier`}
        onClick={() => remove(line)}
        className="flex size-9 shrink-0 items-center justify-center rounded-sm text-bark-500 hover:bg-cream-300 hover:text-error"
      >
        <Trash2 aria-hidden="true" className="size-4" />
      </button>
    </li>
  );
}
