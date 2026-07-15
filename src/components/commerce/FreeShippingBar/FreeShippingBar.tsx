"use client";

import { Truck } from "lucide-react";
import { useShippingConfig } from "@/lib/use-shipping-config";
import { formatPrice } from "@/lib/format";

/**
 * Barre de progression vers la livraison offerte (D-029) — levier n°1 de
 * l'objectif panier ≥ 70 € (D-009). En tête du drawer et de la page panier.
 * Seuil lu depuis les réglages boutique (jalon 4).
 */
export function FreeShippingBar({ subtotal }: { subtotal: number }) {
  const { freeShippingCents } = useShippingConfig();
  const remaining = Math.max(0, freeShippingCents - subtotal);
  const progress = Math.min(100, (subtotal / freeShippingCents) * 100);

  return (
    <div className="rounded-md bg-cream-100 p-4">
      <p aria-live="polite" className="flex items-center gap-2 text-body-sm text-bark-900">
        <Truck aria-hidden="true" className="size-4 shrink-0 text-pine-700" strokeWidth={1.75} />
        {remaining === 0 ? (
          <span className="font-semibold text-pine-700">
            La livraison vous est offerte.
          </span>
        ) : (
          <span>
            Plus que <strong>{formatPrice(remaining)}</strong> pour la livraison
            offerte.
          </span>
        )}
      </p>
      <div
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progression vers la livraison offerte"
        className="mt-3 h-2 overflow-hidden rounded-full bg-cream-500"
      >
        <div
          className="h-full rounded-full bg-pine-700 transition-[width] duration-250 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
