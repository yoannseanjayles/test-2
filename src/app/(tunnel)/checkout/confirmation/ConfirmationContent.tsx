"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useOrder, shippingMethods } from "@/lib/checkout";
import { useCart } from "@/lib/cart";
import { useCartProducts } from "@/lib/use-cart-products";
import { claimOrder } from "@/lib/orders";
import { signUp, useSession } from "@/lib/auth-client";
import { formatPrice } from "@/lib/format";
import { illustrations } from "@/lib/media";
import { Button, FormField } from "@/components/ui";

/**
 * Confirmation : en mode démonstration la commande est déjà enregistrée ;
 * au retour de Stripe, `redirect_status` dit si le paiement a abouti (le
 * statut définitif reste posé par le webhook). Le panier n'est vidé qu'en
 * cas de succès.
 */
export function ConfirmationContent() {
  const order = useOrder((state) => state.lastOrder);
  const clearCart = useCart((state) => state.clear);
  // Noms/prix des lignes résolus depuis la base (audit M-1).
  const { get } = useCartProducts(order?.lines ?? []);
  const searchParams = useSearchParams();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const stripeReturn = searchParams.get("paiement") === "stripe" || searchParams.has("payment_intent");
  const redirectStatus = searchParams.get("redirect_status");
  const paymentFailed = stripeReturn && redirectStatus !== "succeeded" && redirectStatus !== "processing";
  const paymentProcessing = stripeReturn && redirectStatus === "processing";

  useEffect(() => {
    if (hydrated && (!stripeReturn || redirectStatus === "succeeded" || redirectStatus === "processing")) {
      clearCart();
    }
  }, [hydrated, stripeReturn, redirectStatus, clearCart]);

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

  if (paymentFailed) {
    return (
      <div className="mx-auto max-w-page px-4 py-16 text-center lg:px-6">
        <h1 className="font-display text-h1 font-[560] text-bark-900">
          Le paiement n'a pas abouti
        </h1>
        <p className="mt-3 text-body text-bark-700">
          Votre commande {order.number} n'a pas été débitée. Votre panier est
          conservé — vous pouvez réessayer avec un autre moyen de paiement.
        </p>
        <Link
          href="/checkout"
          className="text-label mt-8 inline-flex min-h-11 items-center rounded-md bg-action px-6 py-3 text-white"
        >
          Réessayer le paiement
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
          {paymentProcessing
            ? "Merci ! Votre paiement est en cours de validation."
            : "Merci ! Votre commande est confirmée."}
        </h1>
        <p className="mt-3 text-body text-bark-700">
          Commande <strong>{order.number}</strong> —{" "}
          {paymentProcessing
            ? `vous recevrez un e-mail à ${order.email} dès que le paiement sera validé.`
            : `un e-mail de confirmation part vers ${order.email}.`}{" "}
          Nous vous préviendrons à chaque étape : préparation, expédition,
          livraison.
        </p>
      </div>

      <section className="mt-10 rounded-lg bg-cream-50 p-6 shadow-card">
        <h2 className="font-heading text-h3 font-semibold text-bark-900">Récapitulatif</h2>
        <ul className="mt-4 divide-y divide-border">
          {order.lines.map((line) => {
            const product = get(line.slug);
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

      <PostPurchaseAccount
        email={order.email}
        firstName={order.address.firstName}
        orderNumber={order.number}
      />

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

/**
 * Création de compte proposée APRÈS l'achat (D-014) — réelle : inscription
 * Better Auth puis rattachement de la commande invitée au compte.
 */
function PostPurchaseAccount({
  email,
  firstName,
  orderNumber,
}: {
  email: string;
  firstName: string;
  orderNumber: string;
}) {
  const { data: session } = useSession();
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<"created" | "verify" | null>(null);

  if (session && done === null) return null;

  const create = async () => {
    setCreating(true);
    setError("");
    const result = await signUp.email({ email, password, name: firstName || email });
    setCreating(false);
    if (result.error) {
      setError(
        result.error.message ??
          "Impossible de créer le compte — cette adresse a peut-être déjà un compte.",
      );
      return;
    }
    // Session immédiate (pas de vérification d'e-mail exigée) : on rattache
    // la commande tout de suite. Sinon, elle sera visible une fois
    // l'adresse vérifiée (rattachement par e-mail vérifié).
    const claimed = await claimOrder(orderNumber).catch(() => ({ ok: false }));
    setDone(claimed.ok ? "created" : "verify");
  };

  return (
    <section className="mt-8 rounded-lg bg-sage-50 p-6">
      <h2 className="font-heading text-h3 font-semibold text-bark-900">
        Suivez votre commande en un clic
      </h2>
      <p className="mt-2 text-body-sm text-bark-700">
        Créez votre compte avec l'adresse {email} : suivi de commande,
        retours self-service et rachat facile. Optionnel, comme il se doit.
      </p>
      {done ? (
        <p aria-live="polite" className="mt-4 text-body-sm font-semibold text-success">
          {done === "created"
            ? "Compte créé — retrouvez cette commande dans « Mes commandes »."
            : "Compte créé. Confirmez votre adresse e-mail (un message vient de partir) pour retrouver vos commandes."}
        </p>
      ) : (
        <form
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            void create();
          }}
        >
          <FormField
            label="Choisissez un mot de passe"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="flex-1"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button type="submit" variant="secondary" className="shrink-0" loading={creating}>
            Créer mon compte
          </Button>
        </form>
      )}
      <p aria-live="assertive" className="mt-2 text-body-sm text-error">{error}</p>
    </section>
  );
}
