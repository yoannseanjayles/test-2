"use client";

import { AccountShell } from "@/components/account/AccountShell";
import { Button, FormField } from "@/components/ui";
import { useState } from "react";

/** Adresses (démo — persistance serveur en Phase 6). */
export default function AddressesPage() {
  const [saved, setSaved] = useState(false);
  return (
    <AccountShell title="Mes adresses">
      <form
        className="max-w-xl rounded-lg bg-cream-50 p-6 shadow-card"
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(true);
        }}
      >
        <h2 className="font-heading text-h3 font-semibold text-bark-900">Adresse de livraison</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FormField label="Prénom" autoComplete="given-name" required />
          <FormField label="Nom" autoComplete="family-name" required />
        </div>
        <FormField label="Adresse" autoComplete="street-address" required className="mt-4" />
        <div className="mt-4 grid gap-4 sm:grid-cols-[140px_1fr]">
          <FormField label="Code postal" autoComplete="postal-code" required />
          <FormField label="Ville" autoComplete="address-level2" required />
        </div>
        <Button type="submit" className="mt-5">Enregistrer</Button>
        <p aria-live="polite" className="mt-2 text-body-sm text-success">
          {saved ? "Adresse enregistrée (démonstration)." : ""}
        </p>
      </form>
    </AccountShell>
  );
}
