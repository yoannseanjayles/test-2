"use client";

import { AccountShell } from "@/components/account/AccountShell";
import { useAuth } from "@/lib/account";
import { Button, FormField } from "@/components/ui";
import { useState } from "react";

/** Informations + RGPD self-service (D-035). */
export default function InfoPage() {
  return (
    <AccountShell title="Mes informations">
      <Info />
    </AccountShell>
  );
}

function Info() {
  const { user, signOut } = useAuth();
  const [saved, setSaved] = useState(false);
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <form
        className="rounded-lg bg-cream-50 p-6 shadow-card"
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(true);
        }}
      >
        <h2 className="font-heading text-h3 font-semibold text-bark-900">Coordonnées</h2>
        <div className="mt-4 flex flex-col gap-4">
          <FormField label="Adresse e-mail" type="email" defaultValue={user?.email} required />
          <FormField label="Prénom" defaultValue={user?.firstName} required />
          <label className="flex items-center gap-3 text-body-sm text-bark-700">
            <input type="checkbox" className="size-4 accent-pine-700" defaultChecked />
            Recevoir la newsletter mensuelle (conseils et nouveautés)
          </label>
        </div>
        <Button type="submit" className="mt-5">Enregistrer</Button>
        <p aria-live="polite" className="mt-2 text-body-sm text-success">
          {saved ? "Informations enregistrées (démonstration)." : ""}
        </p>
      </form>

      <section className="rounded-lg border border-border bg-cream-50 p-6">
        <h2 className="font-heading text-h3 font-semibold text-bark-900">Vos données (RGPD)</h2>
        <p className="mt-2 text-body-sm text-bark-700">
          Exportez ou supprimez vos données vous-même — sans passer par le
          support. Opérationnel avec le back-end (Phase 6).
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary" disabled title="Phase 6">Exporter mes données</Button>
          <Button
            variant="ghost"
            onClick={() => {
              localStorage.clear();
              signOut();
            }}
          >
            Supprimer mon compte (démo)
          </Button>
        </div>
      </section>
    </div>
  );
}
