"use client";

import Link from "next/link";
import { PawPrint, Package, RotateCcw } from "lucide-react";
import { AccountShell } from "@/components/account/AccountShell";
import { useOrder } from "@/lib/checkout";
import { orderStatuses, statusIndex } from "@/lib/account";
import { listMyOrders } from "@/lib/orders";
import { listPets, type PetDto } from "./animaux/actions";
import { useEffect, useState } from "react";
import { useCart, useCartDrawer } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { Badge, Button } from "@/components/ui";

/** Dashboard-hub (D-035) : la commande en cours d'abord, « Racheter » en 1 clic. */
export default function AccountDashboard() {
  return (
    <AccountShell title="Mon compte">
      <Dashboard />
    </AccountShell>
  );
}

function Dashboard() {
  const order = useOrder((state) => state.lastOrder);
  const [pets, setPets] = useState<PetDto[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  useEffect(() => {
    listPets().then(setPets).catch(() => setPets([]));
  }, []);
  // Statut réel de la commande (D-016) — lu en base, plus de badge de démo.
  useEffect(() => {
    listMyOrders()
      .then((list) => {
        const match = (order && list.find((o) => o.number === order.number)) ?? list[0];
        if (match) setStatus(match.status);
      })
      .catch(() => {});
  }, [order]);
  const add = useCart((state) => state.add);
  const openDrawer = useCartDrawer((state) => state.openDrawer);

  const reorder = () => {
    order?.lines.forEach((line) =>
      add({ slug: line.slug, size: line.size, color: line.color }),
    );
    openDrawer();
  };

  return (
    <div className="flex flex-col gap-6">
      {order ? (
        <section className="rounded-lg bg-cream-50 p-6 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading flex items-center gap-2 text-h3 font-semibold text-bark-900">
              <Package aria-hidden="true" className="size-5 text-pine-700" strokeWidth={1.75} />
              Commande en cours — {order.number}
            </h2>
            <Badge variant={status !== null && statusIndex(status) < 0 ? "neutral" : "new"}>
              {status ?? orderStatuses[0]}
            </Badge>
          </div>
          <p className="mt-2 text-body-sm text-bark-700">
            {order.lines.length} article{order.lines.length > 1 ? "s" : ""} ·{" "}
            {formatPrice(order.total)} · commandée le{" "}
            {new Date(order.placedAt).toLocaleDateString("fr-FR")}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/compte/commandes"
              className="text-label inline-flex min-h-11 items-center rounded-md border-[1.5px] border-action px-5 text-action hover:bg-pine-50"
            >
              Suivre la commande
            </Link>
            <Button variant="ghost" onClick={reorder}>
              <RotateCcw aria-hidden="true" className="size-4" /> Racheter
            </Button>
          </div>
        </section>
      ) : (
        <section className="rounded-lg bg-cream-50 p-6 shadow-card">
          <h2 className="font-heading text-h3 font-semibold text-bark-900">
            Aucune commande en cours
          </h2>
          <Link
            href="/"
            className="text-label mt-3 inline-flex min-h-11 items-center gap-2 text-action hover:text-action-hover"
          >
            Découvrir la sélection <span aria-hidden="true">→</span>
          </Link>
        </section>
      )}

      <section className="rounded-lg bg-sage-50 p-6">
        <h2 className="font-heading flex items-center gap-2 text-h3 font-semibold text-bark-900">
          <PawPrint aria-hidden="true" className="size-5 text-pine-700" strokeWidth={1.75} />
          Mes animaux
        </h2>
        <p className="mt-2 text-body-sm text-bark-700">
          {pets.length > 0
            ? `${pets.map((p) => p.name).join(", ")} — le filtre « pour mon animal » s'active sur tous les listings.`
            : "Ajoutez votre animal pour filtrer le catalogue à son gabarit en un clic."}
        </p>
        <Link
          href="/compte/animaux"
          className="text-label mt-3 inline-flex min-h-11 items-center gap-2 text-action hover:text-action-hover"
        >
          {pets.length > 0 ? "Gérer mes animaux" : "Ajouter un animal"}{" "}
          <span aria-hidden="true">→</span>
        </Link>
      </section>
    </div>
  );
}
