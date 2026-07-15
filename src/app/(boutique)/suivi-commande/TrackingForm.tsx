"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { findOrder, type OrderDto } from "@/lib/orders";
import { orderStatuses, statusDescriptions, statusIndex } from "@/lib/account";
import { Badge, Button, FormField } from "@/components/ui";
import { cn } from "@/lib/utils";

export function TrackingForm() {
  const [found, setFound] = useState<OrderDto | null>(null);
  const [result, setResult] = useState<"found" | "not-found" | null>(null);

  return (
    <>
      <form
        className="mt-8 flex flex-col gap-4"
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const order = await findOrder(String(data.get("number")), String(data.get("email")));
          setFound(order);
          setResult(order ? "found" : "not-found");
        }}
      >
        <FormField label="Numéro de commande" name="number" required placeholder="CC-000000" />
        <FormField label="Adresse e-mail" name="email" type="email" required autoComplete="email" />
        <Button type="submit" className="self-start">Suivre ma commande</Button>
      </form>
      <div aria-live="polite" className="mt-6">
        {result === "found" && found && (
          <div className="rounded-lg bg-cream-50 p-6 shadow-card">
            <h2 className="font-heading text-h3 font-semibold text-bark-900">
              Commande {found.number}
            </h2>
            {/* Timeline sur le statut réel (D-016) — badge seul hors parcours nominal. */}
            {statusIndex(found.status) >= 0 ? (
              <ol className="mt-4 flex flex-wrap gap-2">
                {orderStatuses.map((status, index) => (
                  <li
                    key={status}
                    className={cn(
                      "text-label flex min-h-9 items-center gap-1.5 rounded-full px-3.5",
                      index < statusIndex(found.status) && "bg-pine-100 text-pine-900",
                      index === statusIndex(found.status) && "bg-pine-700 text-white",
                      index > statusIndex(found.status) && "bg-cream-300 text-bark-700",
                    )}
                  >
                    {index < statusIndex(found.status) && <Check aria-hidden="true" className="size-3.5" />}
                    {status}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-4"><Badge variant="neutral">{found.status}</Badge></p>
            )}
            <p className="mt-3 text-body-sm text-bark-700">
              {statusDescriptions[found.status] ?? ""}
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
