"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useOrder } from "@/lib/checkout";
import { orderStatuses } from "@/lib/account";
import { Button, FormField } from "@/components/ui";
import { cn } from "@/lib/utils";

export function TrackingForm() {
  const lastOrder = useOrder((state) => state.lastOrder);
  const [result, setResult] = useState<"found" | "not-found" | null>(null);

  return (
    <>
      <form
        className="mt-8 flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const match =
            lastOrder !== null &&
            String(data.get("number")).trim().toUpperCase() === lastOrder.number &&
            String(data.get("email")).trim().toLowerCase() === lastOrder.email.toLowerCase();
          setResult(match ? "found" : "not-found");
        }}
      >
        <FormField label="Numéro de commande" name="number" required placeholder="CC-000000" />
        <FormField label="Adresse e-mail" name="email" type="email" required autoComplete="email" />
        <Button type="submit" className="self-start">Suivre ma commande</Button>
      </form>
      <div aria-live="polite" className="mt-6">
        {result === "found" && lastOrder && (
          <div className="rounded-lg bg-cream-50 p-6 shadow-card">
            <h2 className="font-heading text-h3 font-semibold text-bark-900">
              Commande {lastOrder.number}
            </h2>
            <ol className="mt-4 flex flex-wrap gap-2">
              {orderStatuses.map((status, index) => (
                <li
                  key={status}
                  className={cn(
                    "text-label flex min-h-9 items-center gap-1.5 rounded-full px-3.5",
                    index < 1 && "bg-pine-100 text-pine-900",
                    index === 1 && "bg-pine-700 text-white",
                    index > 1 && "bg-cream-300 text-bark-700",
                  )}
                >
                  {index < 1 && <Check aria-hidden="true" className="size-3.5" />}
                  {status}
                </li>
              ))}
            </ol>
            <p className="mt-3 text-body-sm text-bark-700">
              Votre commande est en préparation à l'atelier — expédition sous 24 h ouvrées.
            </p>
          </div>
        )}
        {result === "not-found" && (
          <p className="text-body-sm text-error">
            Aucune commande trouvée avec ce numéro et cet e-mail. Vérifiez le
            numéro (format CC-000000) ou contactez-nous.
          </p>
        )}
      </div>
    </>
  );
}
