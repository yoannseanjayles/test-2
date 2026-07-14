"use client";

import { PawPrint, Trash2 } from "lucide-react";
import { AccountShell } from "@/components/account/AccountShell";
import { MAX_PETS, usePets } from "@/lib/account";
import { animalLabels, gabaritLabels, type Animal, type Gabarit } from "@/lib/catalog";
import { Button, FormField } from "@/components/ui";
import { useState } from "react";

/**
 * « Mes animaux » (D-036) : gabarit aligné sur le filtre listing (D-027),
 * bénéfice explicité, max 5 (H24), photo privée non gérée en démo (H25).
 */
export default function PetsPage() {
  return (
    <AccountShell title="Mes animaux">
      <Pets />
    </AccountShell>
  );
}

function Pets() {
  const { pets, addPet, removePet } = usePets();
  const [error, setError] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-xl text-body-sm text-bark-700">
        Renseignez le gabarit de votre animal : sur chaque listing, le filtre
        « pour mon animal » applique sa taille en un clic, et nos
        recommandations de taille s'affichent sur les fiches produit.
      </p>

      {pets.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {pets.map((pet) => (
            <li key={pet.id} className="flex items-start justify-between gap-3 rounded-lg bg-cream-50 p-5 shadow-card">
              <div className="flex items-start gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-sage-100">
                  <PawPrint aria-hidden="true" className="size-5 text-sage-700" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="font-heading text-body font-semibold text-bark-900">{pet.name}</p>
                  <p className="text-caption text-bark-700">
                    {animalLabels[pet.species]} · {gabaritLabels[pet.gabarit]}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label={`Retirer ${pet.name}`}
                onClick={() => removePet(pet.id)}
                className="flex size-9 items-center justify-center rounded-sm text-bark-500 hover:bg-cream-300 hover:text-error"
              >
                <Trash2 aria-hidden="true" className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {pets.length < MAX_PETS ? (
        <form
          className="rounded-lg bg-cream-50 p-6 shadow-card"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const data = new FormData(form);
            const ok = addPet({
              name: String(data.get("name") ?? ""),
              species: data.get("species") as Animal,
              gabarit: data.get("gabarit") as Gabarit,
            });
            if (!ok) {
              setError(`Maximum ${MAX_PETS} animaux par compte.`);
              return;
            }
            setError("");
            form.reset();
          }}
        >
          <h2 className="font-heading text-h3 font-semibold text-bark-900">Ajouter un animal</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <FormField label="Prénom" name="name" required />
            <label className="flex flex-col gap-1.5">
              <span className="text-label text-bark-900">Espèce</span>
              <select name="species" required className="h-12 rounded-sm border border-border bg-cream-50 px-4 text-body text-bark-900">
                {(["chien", "chat", "nac"] as const).map((s) => (
                  <option key={s} value={s}>{animalLabels[s]}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-label text-bark-900">Gabarit</span>
              <select name="gabarit" required className="h-12 rounded-sm border border-border bg-cream-50 px-4 text-body text-bark-900">
                {(["XS", "S", "M", "L", "XL"] as const).map((g) => (
                  <option key={g} value={g}>{gabaritLabels[g]}</option>
                ))}
              </select>
            </label>
          </div>
          <Button type="submit" className="mt-4">Ajouter</Button>
          <p aria-live="polite" className="mt-2 text-body-sm text-error">{error}</p>
        </form>
      ) : (
        <p className="text-body-sm text-bark-700">
          Maximum {MAX_PETS} animaux par compte — retirez-en un pour en ajouter un autre.
        </p>
      )}
    </div>
  );
}
