"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronDown, Minus, Plus, Trash2 } from "lucide-react";
import { cartSubtotal, useCart, type CartLine } from "@/lib/cart";
import { useShippingConfig } from "@/lib/use-shipping-config";
import { getProductBySlug, productPath } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { illustrations, productImages } from "@/lib/media";
import { Button, FormField } from "@/components/ui";
import { FreeShippingBar, Placeholder } from "@/components/commerce";

/**
 * Contenu panier — FreeShippingBar en tête (D-029), code promo replié
 * (D-030, anti-fuite), prix TTC (H18). Persistant localement (D-030).
 */
export function CartPageContent() {
  const lines = useCart((state) => state.lines);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const shippingConfig = useShippingConfig();
  const subtotal = cartSubtotal(lines);

  if (!hydrated) {
    return <div className="mx-auto max-w-page px-4 py-16 lg:px-6" aria-busy="true" />;
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-page flex-col items-center px-4 py-16 text-center lg:px-6">
        <Image src={illustrations.panier} alt="" sizes="288px" className="h-auto w-72 rounded-lg" />
        <h1 className="font-display mt-6 text-h1 font-[560] text-bark-900">
          Votre panier est vide
        </h1>
        <p className="mt-3 max-w-md text-body text-bark-700">
          Nos indispensables vous attendent — chaque pièce est testée et
          approuvée par nos experts.
        </p>
        <Link
          href="/"
          className="text-label mt-8 inline-flex min-h-11 items-center rounded-md bg-action px-6 py-3 text-white transition duration-150 hover:bg-action-hover"
        >
          Découvrir la sélection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-page px-4 py-10 lg:px-6">
      <h1 className="font-display text-h1 font-[560] text-bark-900">Votre panier</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
        <div>
          <FreeShippingBar subtotal={subtotal} />
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {lines.map((line) => (
              <CartPageLine key={`${line.slug}-${line.size}-${line.color}`} line={line} />
            ))}
          </ul>
        </div>

        <aside className="rounded-lg bg-cream-50 p-6 shadow-card lg:sticky lg:top-8">
          <h2 className="font-heading text-h3 font-semibold text-bark-900">Récapitulatif</h2>
          <dl className="mt-4 space-y-2 text-body-sm text-bark-700">
            <div className="flex justify-between">
              <dt>Sous-total TTC</dt>
              <dd className="text-price text-bark-900">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Livraison</dt>
              <dd>{subtotal >= shippingConfig.freeShippingCents ? "Offerte" : "calculée au paiement"}</dd>
            </div>
          </dl>
          <PromoCode />
          <Link
            href="/checkout"
            className="text-label mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-action px-6 py-3 text-white transition duration-150 hover:bg-action-hover"
          >
            Passer commande
          </Link>
          <p className="text-caption mt-3 text-center text-bark-700">
            Paiement sécurisé · Commande sans compte (invité)
          </p>
        </aside>
      </div>
    </div>
  );
}

/** Code promo replié par défaut (D-030) — validation serveur en Phase 6. */
function PromoCode() {
  const [message, setMessage] = useState("");
  return (
    <details className="group mt-5 border-t border-border pt-4">
      <summary className="text-label flex cursor-pointer list-none items-center justify-between text-bark-700 [&::-webkit-details-marker]:hidden">
        Vous avez un code promo ?
        <ChevronDown aria-hidden="true" className="size-4 transition-transform duration-150 group-open:rotate-180" />
      </summary>
      <form
        className="mt-3 flex items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          setMessage("Code inconnu — la validation des codes arrive avec la Phase 6.");
        }}
      >
        <FormField label="Code promo" name="promo" className="flex-1" />
        <Button type="submit" variant="secondary" className="shrink-0">
          Appliquer
        </Button>
      </form>
      <p aria-live="polite" className="mt-2 text-body-sm text-bark-700">
        {message}
      </p>
    </details>
  );
}

function CartPageLine({ line }: { line: CartLine }) {
  const { setQuantity, remove } = useCart();
  const product = getProductBySlug(line.slug);
  if (!product) return null;
  const image = productImages[line.slug]?.[0];
  const size = product.sizes.find((s) => s.name === line.size);
  const lowStock = size !== undefined && size.stock > 0 && size.stock <= 3;

  return (
    <li className="flex gap-4 py-5">
      <Link href={productPath(product)} className="w-24 shrink-0 overflow-hidden rounded-md sm:w-28">
        {image ? (
          <Image src={image.src} alt="" sizes="112px" className="aspect-square h-auto w-full object-cover" />
        ) : (
          <Placeholder tone={product.tone} ratio="1 / 1" />
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <Link
            href={productPath(product)}
            className="font-heading text-body font-semibold text-bark-900 hover:text-action"
          >
            {product.name}
          </Link>
          <p className="text-price text-bark-900">{formatPrice(product.price * line.quantity)}</p>
        </div>
        <p className="text-caption mt-1 text-bark-700">
          {product.brand} · {line.size} · {line.color}
        </p>
        {/* Changement de stock signalé explicitement (D-030). */}
        {lowStock && (
          <p className="text-caption mt-1 text-warning">
            Plus que {size.stock} en stock dans cette taille.
          </p>
        )}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center rounded-md border border-border">
            <button
              type="button"
              aria-label="Diminuer la quantité"
              onClick={() => setQuantity(line, line.quantity - 1)}
              className="flex size-10 items-center justify-center text-bark-700 hover:bg-cream-300"
            >
              <Minus aria-hidden="true" className="size-4" />
            </button>
            <span aria-live="polite" className="text-label w-9 text-center text-bark-900">
              {line.quantity}
            </span>
            <button
              type="button"
              aria-label="Augmenter la quantité"
              onClick={() => setQuantity(line, line.quantity + 1)}
              className="flex size-10 items-center justify-center text-bark-700 hover:bg-cream-300"
            >
              <Plus aria-hidden="true" className="size-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => remove(line)}
            className="text-label inline-flex min-h-10 items-center gap-1.5 text-bark-500 hover:text-error"
          >
            <Trash2 aria-hidden="true" className="size-4" />
            Retirer
          </button>
        </div>
      </div>
    </li>
  );
}
