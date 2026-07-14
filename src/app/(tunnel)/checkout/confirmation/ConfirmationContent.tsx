"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useOrder, shippingMethods } from "@/lib/checkout";
import { getProductBySlug } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { illustrations } from "@/lib/media";
import { Button, FormField } from "@/components/ui";

export function ConfirmationContent() {
  const order = useOrder((state) => state.lastOrder);
  const [hydrated, setHydrated] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  useEffect(() => setHydrated(true), []);

  if (!hydrated) {
    return <div className="mx-auto max-w-page px-4 py-16 lg:px-6" aria-busy="true" />;
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-page px-4 py-16 text-center lg:px-6">
        <h1 className="font-display text-h1 font-[560] text-bark-900">
          Aucune commande récente
        </h1>
        <Link
          href="/"
          className="text-label mt-6 inline-flex min-h-11 items-center rounded-md bg-action px-6 py-3 text-white"
        >
          Retour à la boutique
        </Link>
      </div>
    );
  }

  const method = shippingMethods.find((m) => m.id === order.shippingMethod);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-6">
      <div className="text-center">
        <Image
          src={illustrations.confirmation}
          alt=""
          sizes="224px"
          className="mx-auto h-auto w-56 rounded-lg"
        />
        <h1 className="font-display mt-6 text-h1 font-[560] text-bark-900">
          Merci ! Votre commande est confirmée.
        </h1>
        <p className="mt-3 text-body text-bark-700">
          Commande <strong>{order.number}</strong> — un e-mail de confirmation
          part vers {order.email}. Nous vous préviendrons à chaque étape :
          préparation, expédition, livraison.
        </p>
      </div>

      <section className="mt-10 rounded-lg bg-cream-50 p-6 shadow-card">
        <h2 className="font-heading text-h3 font-semibold text-bark-900">Récapitulatif</h2>
        <ul className="mt-4 divide-y divide-border">
          {order.lines.map((line) => {
            const product = getProductBySlug(line.slug);
            if (!product) return null;
            return (
              <li key={`${line.slug}-${line.size}-${line.color}`} className="flex justify-between gap-3 py-2.5 text-body-sm">
                <span className="text-bark-700">
                  {line.quantity} × {product.name} — {line.size} · {line.color}
                </span>
                <span className="text-price shrink-0">{formatPrice(product.price * line.quantity)}</span>
              </li>
            );
          })}
        </ul>
        <dl className="mt-3 space-y-1.5 border-t border-border pt-3 text-body-sm text-bark-700">
          <div className="flex justify-between">
            <dt>Livraison — {method?.label}</dt>
            <dd>{order.shipping === 0 ? "Offerte" : formatPrice(order.shipping)}</dd>
          </div>
          <div className="flex justify-between text-body text-bark-900">
            <dt className="font-semibold">Total TTC</dt>
            <dd className="text-price text-lg">{formatPrice(order.total)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-body-sm text-bark-700">
          Livraison : {order.address.firstName} {order.address.lastName},{" "}
          {order.address.address}, {order.address.postalCode} {order.address.city},{" "}
          {order.address.country}.
        </p>
      </section>

      {/* Création de compte proposée APRÈS l'achat (D-014) — jamais avant. */}
      <section className="mt-8 rounded-lg bg-sage-50 p-6">
        <h2 className="font-heading text-h3 font-semibold text-bark-900">
          Suivez votre commande en un clic
        </h2>
        <p className="mt-2 text-body-sm text-bark-700">
          Créez votre compte avec l'adresse {order.email} : suivi de commande,
          retours self-service et rachat facile. Optionnel, comme il se doit.
        </p>
        {accountCreated ? (
          <p aria-live="polite" className="mt-4 text-body-sm font-semibold text-success">
            Compte créé (démonstration) — l'espace client complet arrive au jalon 4.
          </p>
        ) : (
          <form
            className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={(event) => {
              event.preventDefault();
              setAccountCreated(true);
            }}
          >
            <FormField
              label="Choisissez un mot de passe"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="flex-1"
            />
            <Button type="submit" variant="secondary" className="shrink-0">
              Créer mon compte
            </Button>
          </form>
        )}
      </section>

      <div className="mt-10 text-center">
        <Link
          href="/"
          className="text-label inline-flex min-h-11 items-center gap-2 text-action hover:text-action-hover"
        >
          Retour à la boutique <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
