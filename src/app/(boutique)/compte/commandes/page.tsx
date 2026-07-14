"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { AccountShell } from "@/components/account/AccountShell";
import { shippingMethods } from "@/lib/shipping";
import { listMyOrders, type OrderDto } from "@/lib/orders";
import { useEffect } from "react";
import { orderStatuses } from "@/lib/account";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

/** Historique + détail (démo : dernière commande) — retour self-service ≤ 3 écrans (D-035). */
export default function OrdersPage() {
  return (
    <AccountShell title="Mes commandes">
      <Orders />
    </AccountShell>
  );
}

const CURRENT_STATUS = 1; // « En préparation » (démo)

function Orders() {
  const [ordersList, setOrdersList] = useState<OrderDto[] | null>(null);
  useEffect(() => {
    listMyOrders().then(setOrdersList).catch(() => setOrdersList([]));
  }, []);

  if (ordersList === null) {
    return <p aria-busy="true" className="text-body-sm text-bark-700">Chargement…</p>;
  }
  const order = ordersList[0];
  if (!order) {
    return (
      <div className="rounded-lg bg-cream-50 p-6 shadow-card">
        <p className="text-body text-bark-700">Aucune commande pour l'instant.</p>
        <Link href="/" className="text-label mt-3 inline-flex min-h-11 items-center gap-2 text-action">
          Découvrir la sélection <span aria-hidden="true">→</span>
        </Link>
      </div>
    );
  }

  const method = shippingMethods.find((m) => m.id === order.shippingMethod);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-lg bg-cream-50 p-6 shadow-card">
        <h2 className="font-heading text-h3 font-semibold text-bark-900">
          Commande {order.number}
        </h2>
        {/* Timeline des statuts (D-016) */}
        <ol className="mt-5 flex flex-wrap gap-2" aria-label="Suivi de commande">
          {orderStatuses.map((status, index) => (
            <li
              key={status}
              aria-current={index === CURRENT_STATUS ? "step" : undefined}
              className={cn(
                "text-label flex min-h-9 items-center gap-1.5 rounded-full px-3.5",
                index < CURRENT_STATUS && "bg-pine-100 text-pine-900",
                index === CURRENT_STATUS && "bg-pine-700 text-white",
                index > CURRENT_STATUS && "bg-cream-300 text-bark-700",
              )}
            >
              {index < CURRENT_STATUS && <Check aria-hidden="true" className="size-3.5" />}
              {status}
            </li>
          ))}
        </ol>
        <ul className="mt-5 divide-y divide-border border-t border-border">
          {order.lines.map((line) => (
            <li key={`${line.productSlug}-${line.size}`} className="flex justify-between gap-3 py-2.5 text-body-sm">
              <span className="text-bark-700">
                {line.quantity} × {line.productName} — {line.size} · {line.color}
              </span>
              <span className="text-price shrink-0">{formatPrice(line.unitPrice * line.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-body-sm text-bark-700">
          {method?.label} · Total {formatPrice(order.total)}
        </p>
      </section>

      <ReturnFlow orderNumber={order.number} />
    </div>
  );
}

/** Retour self-service en 3 écrans max : motif → méthode → confirmation (D-035/D-040). */
function ReturnFlow({ orderNumber }: { orderNumber: string }) {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [reason, setReason] = useState("");

  return (
    <section className="rounded-lg bg-cream-50 p-6 shadow-card">
      <h2 className="font-heading text-h3 font-semibold text-bark-900">Besoin d'un retour ?</h2>
      {step === 0 && (
        <>
          <p className="mt-2 text-body-sm text-bark-700">
            Premier retour offert, 30 jours pour changer d'avis. Les retours
            suivants sont à 4,90 €.
          </p>
          <Button variant="secondary" className="mt-4" onClick={() => setStep(1)}>
            Faire un retour
          </Button>
        </>
      )}
      {step === 1 && (
        <fieldset className="mt-4">
          <legend className="text-label text-bark-900">1/3 — Motif du retour</legend>
          <div className="mt-2 flex flex-col gap-2">
            {["Taille trop petite", "Taille trop grande", "Ne convient pas à mon animal", "Autre raison"].map((r) => (
              <label key={r} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-border px-4 text-body-sm text-bark-900 hover:border-bark-300">
                <input type="radio" name="motif" className="size-4 accent-pine-700" onChange={() => setReason(r)} checked={reason === r} />
                {r}
              </label>
            ))}
          </div>
          <Button className="mt-4" disabled={!reason} onClick={() => setStep(2)}>
            Continuer
          </Button>
        </fieldset>
      )}
      {step === 2 && (
        <div className="mt-4">
          <p className="text-label text-bark-900">2/3 — Méthode</p>
          <p className="mt-2 text-body-sm text-bark-700">
            Étiquette prépayée envoyée par e-mail, dépôt en point relais.
            Remboursement sous 5 jours après réception.
          </p>
          <Button className="mt-4" onClick={() => setStep(3)}>
            Confirmer le retour
          </Button>
        </div>
      )}
      {step === 3 && (
        <p aria-live="polite" className="mt-3 text-body-sm font-semibold text-success">
          3/3 — Retour enregistré pour la commande {orderNumber} (motif :{" "}
          {reason.toLowerCase()}). L'étiquette arrive par e-mail — démonstration,
          logistique réelle en Phase 6.
        </p>
      )}
    </section>
  );
}
