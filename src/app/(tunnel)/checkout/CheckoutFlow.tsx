"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Check, Lock, PencilLine } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useCartProducts } from "@/lib/use-cart-products";
import { useShippingConfig } from "@/lib/use-shipping-config";
import {
  addressSchema,
  contactSchema,
  countries,
  shippingMethods,
  shippingPrice,
  useOrder,
  type AddressValues,
  type ContactValues,
  type ShippingMethodId,
} from "@/lib/checkout";
import { placeOrder as placeOrderAction } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { Button, FormField } from "@/components/ui";
import { cn } from "@/lib/utils";

const steps = ["Coordonnées", "Livraison", "Paiement"] as const;

/** Clé publiable Stripe — sans elle, le tunnel reste en mode démonstration. */
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

/**
 * Checkout linéaire 3 étapes sur une URL (D-032) : invité par défaut
 * (D-004/D-014), stepper avec édition en place, validation à la sortie du
 * champ (D-033), données préservées à l'échec. Paiement réel via le Payment
 * Element Stripe quand les clés sont posées ; mode démonstration explicite
 * sinon. CGV à accepter avant paiement (opposabilité).
 */
export function CheckoutFlow() {
  const router = useRouter();
  const lines = useCart((state) => state.lines);
  const clearCart = useCart((state) => state.clear);
  const setOrder = useOrder((state) => state.setOrder);

  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState(0);
  const [contact, setContact] = useState<ContactValues | null>(null);
  const [address, setAddress] = useState<AddressValues | null>(null);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethodId>("domicile");
  const [placing, setPlacing] = useState(false);
  const [payError, setPayError] = useState("");
  const [cgvAccepted, setCgvAccepted] = useState(false);
  const [cgvError, setCgvError] = useState(false);
  // Paiement Stripe en cours : PaymentIntent créé, Payment Element affiché.
  const [payment, setPayment] = useState<{ clientSecret: string; total: number } | null>(null);
  useEffect(() => setHydrated(true), []);

  // Tarifs livraison depuis les réglages boutique (jalon 4), repli D-039.
  const shippingConfig = useShippingConfig();
  // Prix et noms résolus depuis la base (audit M-1) — mêmes montants que le
  // recalcul serveur de placeOrder.
  const { get, subtotal } = useCartProducts(lines);
  const shipping = shippingPrice(shippingMethod, subtotal, shippingConfig);
  const total = subtotal + shipping;

  const contactForm = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
    defaultValues: { email: "" },
  });
  const addressForm = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    mode: "onBlur",
    defaultValues: { country: "France" } as Partial<AddressValues> as AddressValues,
  });

  if (!hydrated) {
    return <div className="mx-auto max-w-page px-4 py-16 lg:px-6" aria-busy="true" />;
  }

  if (lines.length === 0 && !placing && !payment) {
    return (
      <div className="mx-auto max-w-page px-4 py-16 text-center lg:px-6">
        <h1 className="font-display text-h1 font-[560] text-bark-900">
          Votre panier est vide
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

  // Enregistrement serveur : prix, stock et total recalculés depuis la base
  // (D-033). Avec Stripe, la commande n'est confirmée qu'après paiement.
  const placeOrder = async () => {
    if (!cgvAccepted) {
      setCgvError(true);
      return;
    }
    setPlacing(true);
    setPayError("");
    const result = await placeOrderAction({
      email: contact!.email,
      address: address! as unknown as Record<string, string>,
      shippingMethod,
      lines,
    });
    if (!result.ok) {
      setPlacing(false);
      setPayError(result.error ?? "Impossible d'enregistrer la commande.");
      return;
    }
    setOrder({
      number: result.number!,
      placedAt: new Date().toISOString(),
      email: contact!.email,
      address: address!,
      shippingMethod,
      lines,
      subtotal,
      shipping,
      total: result.total!,
    });
    if (result.clientSecret) {
      // Stripe configuré : le Payment Element encaisse — le panier n'est
      // vidé qu'une fois le paiement abouti (page de confirmation).
      if (!stripePromise) {
        setPlacing(false);
        setPayError("Paiement indisponible : NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY manque côté client.");
        return;
      }
      setPayment({ clientSecret: result.clientSecret, total: result.total! });
      setPlacing(false);
      return;
    }
    // Mode démonstration : commande enregistrée directement.
    clearCart();
    router.push("/checkout/confirmation");
  };

  return (
    <div className="mx-auto max-w-page px-4 py-10 lg:px-6">
      <h1 className="font-display text-h1 font-[560] text-bark-900">Commande</h1>

      {/* Stepper : champs perçus < champs réels (D-032) */}
      <ol className="mt-6 flex flex-wrap gap-2" aria-label="Étapes de la commande">
        {steps.map((label, index) => (
          <li
            key={label}
            aria-current={step === index ? "step" : undefined}
            className={cn(
              "text-label flex min-h-9 items-center gap-2 rounded-full px-4",
              step === index && "bg-pine-700 text-white",
              step > index && "bg-pine-100 text-pine-900",
              step < index && "bg-cream-300 text-bark-700",
            )}
          >
            {step > index && <Check aria-hidden="true" className="size-3.5" />}
            {index + 1}. {label}
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="flex flex-col gap-6">
          {/* Étape 1 — Coordonnées (invité par défaut, D-014) */}
          <section className="rounded-lg border border-border bg-cream-50 p-5 lg:p-6">
            <header className="flex items-center justify-between">
              <h2 className="font-heading text-h3 font-semibold text-bark-900">
                1. Coordonnées
              </h2>
              {step > 0 && !payment && (
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="text-label inline-flex min-h-9 items-center gap-1.5 text-action hover:text-action-hover"
                >
                  <PencilLine aria-hidden="true" className="size-4" /> Modifier
                </button>
              )}
            </header>
            {step === 0 ? (
              <form
                noValidate
                onSubmit={contactForm.handleSubmit((values) => {
                  setContact(values);
                  setStep(1);
                })}
                className="mt-4 flex flex-col gap-4"
              >
                <FormField
                  label="Adresse e-mail"
                  type="email"
                  autoComplete="email"
                  placeholder="prenom@exemple.fr"
                  help="Uniquement pour le suivi de votre commande. Pas de compte requis."
                  error={contactForm.formState.errors.email?.message}
                  {...contactForm.register("email")}
                />
                <Button type="submit" className="self-start">
                  Continuer vers la livraison
                </Button>
              </form>
            ) : (
              <p className="mt-2 text-body-sm text-bark-700">{contact?.email}</p>
            )}
          </section>

          {/* Étape 2 — Livraison */}
          <section
            className={cn(
              "rounded-lg border border-border bg-cream-50 p-5 lg:p-6",
              step < 1 && "opacity-50",
            )}
          >
            <header className="flex items-center justify-between">
              <h2 className="font-heading text-h3 font-semibold text-bark-900">
                2. Livraison
              </h2>
              {step > 1 && !payment && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-label inline-flex min-h-9 items-center gap-1.5 text-action hover:text-action-hover"
                >
                  <PencilLine aria-hidden="true" className="size-4" /> Modifier
                </button>
              )}
            </header>
            {step === 1 && (
              <form
                noValidate
                onSubmit={addressForm.handleSubmit((values) => {
                  setAddress(values);
                  setStep(2);
                })}
                className="mt-4 flex flex-col gap-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Prénom"
                    autoComplete="given-name"
                    error={addressForm.formState.errors.firstName?.message}
                    {...addressForm.register("firstName")}
                  />
                  <FormField
                    label="Nom"
                    autoComplete="family-name"
                    error={addressForm.formState.errors.lastName?.message}
                    {...addressForm.register("lastName")}
                  />
                </div>
                <FormField
                  label="Adresse"
                  autoComplete="street-address"
                  error={addressForm.formState.errors.address?.message}
                  {...addressForm.register("address")}
                />
                <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
                  <FormField
                    label="Code postal"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    error={addressForm.formState.errors.postalCode?.message}
                    {...addressForm.register("postalCode")}
                  />
                  <FormField
                    label="Ville"
                    autoComplete="address-level2"
                    error={addressForm.formState.errors.city?.message}
                    {...addressForm.register("city")}
                  />
                </div>
                <FormField
                  label="Téléphone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  help="Utilisé par le transporteur pour la livraison (relais, express)."
                  error={addressForm.formState.errors.phone?.message}
                  {...addressForm.register("phone")}
                />
                <label className="flex flex-col gap-1.5">
                  <span className="text-label text-bark-900">Pays</span>
                  <select
                    {...addressForm.register("country")}
                    className="h-12 rounded-sm border border-border bg-cream-50 px-4 text-body text-bark-900 focus:border-pine-500"
                  >
                    {countries.map((country) => (
                      <option key={country}>{country}</option>
                    ))}
                  </select>
                </label>

                <fieldset className="mt-2">
                  <legend className="text-label text-bark-900">Mode de livraison</legend>
                  <div className="mt-2 flex flex-col gap-2">
                    {shippingMethods.map((method) => {
                      const price = shippingPrice(method.id, subtotal, shippingConfig);
                      return (
                        <label
                          key={method.id}
                          className={cn(
                            "flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-md border px-4 py-2.5",
                            shippingMethod === method.id
                              ? "border-pine-700 bg-pine-50"
                              : "border-border bg-cream-50 hover:border-bark-300",
                          )}
                        >
                          <span className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="shipping"
                              checked={shippingMethod === method.id}
                              onChange={() => setShippingMethod(method.id)}
                              className="size-4 accent-pine-700"
                            />
                            <span className="text-body-sm text-bark-900">
                              {method.label}
                              <span className="text-caption block text-bark-700">{method.detail}</span>
                            </span>
                          </span>
                          <span className="text-price text-body-sm">
                            {price === 0 ? "Offerte" : formatPrice(price)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                <Button type="submit" className="self-start">
                  Continuer vers le paiement
                </Button>
              </form>
            )}
            {step > 1 && address && (
              <p className="mt-2 text-body-sm text-bark-700">
                {address.firstName} {address.lastName} — {address.address},{" "}
                {address.postalCode} {address.city}, {address.country} ·{" "}
                {shippingMethods.find((m) => m.id === shippingMethod)?.label}
              </p>
            )}
          </section>

          {/* Étape 3 — Paiement (Payment Element Stripe, D-033/H20) */}
          <section
            className={cn(
              "rounded-lg border border-border bg-cream-50 p-5 lg:p-6",
              step < 2 && "opacity-50",
            )}
          >
            <h2 className="font-heading text-h3 font-semibold text-bark-900">3. Paiement</h2>
            {step === 2 && (
              <div className="mt-4">
                {payment && stripePromise ? (
                  <Elements stripe={stripePromise} options={{ clientSecret: payment.clientSecret }}>
                    <StripePaymentForm total={payment.total} />
                  </Elements>
                ) : (
                  <>
                    {!publishableKey && (
                      <div className="rounded-md border border-dashed border-bark-300 bg-cream-100 p-5 text-center">
                        <Lock aria-hidden="true" className="mx-auto size-5 text-bark-500" strokeWidth={1.75} />
                        <p className="mt-2 text-body-sm text-bark-700">
                          Mode démonstration : aucun paiement réel n'est encaissé.
                          La commande est enregistrée avec le statut
                          « Payée (démonstration) ».
                        </p>
                      </div>
                    )}
                    <label className="mt-4 flex items-start gap-3 text-body-sm text-bark-700">
                      <input
                        type="checkbox"
                        checked={cgvAccepted}
                        onChange={(event) => {
                          setCgvAccepted(event.target.checked);
                          if (event.target.checked) setCgvError(false);
                        }}
                        className="mt-0.5 size-4 shrink-0 accent-pine-700"
                      />
                      <span>
                        J'ai lu et j'accepte les{" "}
                        <Link href="/cgv" target="_blank" className="text-action underline-offset-4 hover:underline">
                          conditions générales de vente
                        </Link>{" "}
                        et la{" "}
                        <Link href="/confidentialite" target="_blank" className="text-action underline-offset-4 hover:underline">
                          politique de confidentialité
                        </Link>
                        .
                      </span>
                    </label>
                    {cgvError && (
                      <p className="mt-2 text-body-sm text-error">
                        Merci d'accepter les conditions générales de vente pour continuer.
                      </p>
                    )}
                    <Button className="mt-4 w-full" onClick={placeOrder} loading={placing}>
                      {publishableKey
                        ? `Continuer vers le paiement de ${formatPrice(total)}`
                        : `Payer ${formatPrice(total)} (démonstration)`}
                    </Button>
                    <p aria-live="assertive" className="mt-2 text-body-sm text-error">{payError}</p>
                  </>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Récapitulatif — coûts transparents dès l'entrée (D-004) */}
        <aside className="rounded-lg bg-cream-50 p-6 shadow-card lg:sticky lg:top-8">
          <h2 className="font-heading text-h3 font-semibold text-bark-900">Votre commande</h2>
          <ul className="mt-4 divide-y divide-border">
            {lines.map((line) => {
              const product = get(line.slug);
              if (!product) return null;
              return (
                <li key={`${line.slug}-${line.size}-${line.color}`} className="flex justify-between gap-3 py-2.5 text-body-sm">
                  <span className="text-bark-700">
                    {line.quantity} × {product.name}
                    <span className="text-caption block">{line.size} · {line.color}</span>
                  </span>
                  <span className="text-price shrink-0">{formatPrice(product.price * line.quantity)}</span>
                </li>
              );
            })}
          </ul>
          <dl className="mt-3 space-y-1.5 border-t border-border pt-3 text-body-sm text-bark-700">
            <div className="flex justify-between">
              <dt>Sous-total TTC</dt>
              <dd className="text-price">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Livraison ({shippingMethods.find((m) => m.id === shippingMethod)?.label.toLowerCase()})</dt>
              <dd>{shipping === 0 ? "Offerte" : formatPrice(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-body text-bark-900">
              <dt className="font-semibold">Total TTC</dt>
              <dd className="text-price text-lg">{formatPrice(payment?.total ?? total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}

/**
 * Formulaire Stripe : le Payment Element encaisse le montant du
 * PaymentIntent (recalculé serveur). Succès = redirection vers la
 * confirmation ; le statut définitif vient du webhook.
 */
function StripePaymentForm({ total }: { total: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const pay = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError("");
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/confirmation?paiement=stripe`,
      },
    });
    // On ne revient ici qu'en cas d'échec — sinon Stripe redirige.
    setError(result.error.message ?? "Le paiement n'a pas abouti — réessayez.");
    setSubmitting(false);
  };

  return (
    <div>
      <PaymentElement />
      <Button className="mt-4 w-full" onClick={pay} loading={submitting} disabled={!stripe || !elements}>
        Payer {formatPrice(total)}
      </Button>
      <p className="text-caption mt-2 flex items-center justify-center gap-1.5 text-bark-700">
        <Lock aria-hidden="true" className="size-3.5" strokeWidth={1.75} />
        Paiement sécurisé par Stripe — vos données bancaires ne transitent jamais par nos serveurs.
      </p>
      <p aria-live="assertive" className="mt-2 text-body-sm text-error">{error}</p>
    </div>
  );
}
