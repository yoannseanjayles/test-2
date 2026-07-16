"use client";

import Link from "next/link";
import { AccountShell } from "@/components/account/AccountShell";
import { useSession } from "@/lib/auth-client";

/**
 * Informations du compte — lecture seule pour l'instant : l'édition des
 * coordonnées et l'export/suppression RGPD self-service restent à livrer
 * (aucun formulaire factice en attendant, audit C-6).
 */
export default function InfoPage() {
  return (
    <AccountShell title="Mes informations">
      <Info />
    </AccountShell>
  );
}

function Info() {
  const user = useSession().data?.user;
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <section className="rounded-lg bg-cream-50 p-6 shadow-card">
        <h2 className="font-heading text-h3 font-semibold text-bark-900">Coordonnées</h2>
        <dl className="mt-4 space-y-3 text-body-sm">
          <div>
            <dt className="text-label text-bark-700">Adresse e-mail</dt>
            <dd className="mt-0.5 text-bark-900">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-label text-bark-700">Prénom</dt>
            <dd className="mt-0.5 text-bark-900">{user?.name || "—"}</dd>
          </div>
        </dl>
        <p className="text-caption mt-4 text-bark-700">
          Pour modifier ces informations, contactez-nous via le{" "}
          <Link href="/contact" className="text-action underline-offset-4 hover:underline">
            formulaire de contact
          </Link>
          .
        </p>
      </section>

      <section className="rounded-lg border border-border bg-cream-50 p-6">
        <h2 className="font-heading text-h3 font-semibold text-bark-900">Vos données (RGPD)</h2>
        <p className="mt-2 text-body-sm text-bark-700">
          Vous pouvez demander l'export ou la suppression de l'ensemble de vos
          données (compte, commandes, profils animaux) via le{" "}
          <Link href="/contact" className="text-action underline-offset-4 hover:underline">
            formulaire de contact
          </Link>
          {" "}— nous traitons les demandes sous 30 jours, conformément au RGPD.
          L'export et la suppression self-service arrivent prochainement.
        </p>
      </section>
    </div>
  );
}
