"use client";

import { useCallback, useEffect, useState } from "react";
import { Footprints, Trash2 } from "lucide-react";
import { AccountShell } from "@/components/account/AccountShell";
import {
  addShoeProfile,
  listShoeProfiles,
  removeShoeProfile,
  type ShoeProfileDto,
} from "./actions";
import { allSizes, formatSize, genreLabels, type Genre } from "@/lib/catalog";
import { Button, FormField } from "@/components/ui";

/**
 * « Mes pointures » (D-036, D-060) — persistées en base par compte, max 5
 * (H24). Le sélecteur de pointure est alimenté par le référentiel, jamais par
 * une liste écrite ici : c'est exactement la faute que corrige BL-1.
 */
export default function ShoeProfilesPage() {
  return (
    <AccountShell title="Mes pointures">
      <ShoeProfiles />
    </AccountShell>
  );
}

function ShoeProfiles() {
  const [profiles, setProfiles] = useState<ShoeProfileDto[] | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(() => {
    listShoeProfiles().then(setProfiles).catch(() => setProfiles([]));
  }, []);
  useEffect(refresh, [refresh]);

  if (profiles === null) {
    return <p aria-busy="true" className="text-body-sm text-bark-700">Chargement…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-xl text-body-sm text-bark-700">
        Enregistrez votre pointure — et celle de vos proches si vous achetez
        pour eux. Le filtre « ma pointure » s'applique alors en un clic sur
        chaque listing, et ne montre que les paires réellement disponibles dans
        cette pointure.
      </p>

      {profiles.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {profiles.map((profile) => (
            <li
              key={profile.id}
              className="flex items-start justify-between gap-3 border border-border bg-cream-50 p-5"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-sage-100">
                  <Footprints aria-hidden="true" className="size-5 text-sage-700" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="font-heading text-body font-semibold text-bark-900">
                    {profile.name}
                  </p>
                  <p className="text-caption text-bark-700">
                    {genreLabels[profile.genre]} · pointure {formatSize(profile.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label={`Retirer ${profile.name}`}
                onClick={() => removeShoeProfile(profile.id).then(refresh)}
                className="flex size-9 items-center justify-center text-bark-500 hover:bg-cream-300 hover:text-error"
              >
                <Trash2 aria-hidden="true" className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {profiles.length < 5 ? (
        <form
          className="border border-border bg-cream-50 p-6"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const data = new FormData(form);
            setSaving(true);
            const result = await addShoeProfile({
              name: String(data.get("name") ?? ""),
              genre: data.get("genre") as Genre,
              size: String(data.get("size") ?? ""),
            });
            setSaving(false);
            setError(result.error ?? "");
            if (result.ok) {
              form.reset();
              refresh();
            }
          }}
        >
          <h2 className="font-display text-h3 leading-tight text-bark-900">
            Ajouter une pointure
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <FormField label="Prénom" name="name" required />
            <label className="flex flex-col gap-1.5">
              <span className="text-label text-bark-900">Genre</span>
              <select
                name="genre"
                required
                defaultValue="mixte"
                className="h-12 border border-border bg-cream-50 px-4 text-body text-bark-900"
              >
                {(["homme", "femme", "mixte", "enfant"] as const).map((g) => (
                  <option key={g} value={g}>
                    {genreLabels[g]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-label text-bark-900">Pointure (EU)</span>
              <select
                name="size"
                required
                defaultValue="42"
                className="h-12 border border-border bg-cream-50 px-4 text-body text-bark-900"
              >
                {allSizes.map((size) => (
                  <option key={size} value={size}>
                    {formatSize(size)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <Button type="submit" className="mt-4" loading={saving}>
            Ajouter
          </Button>
          <p aria-live="polite" className="mt-2 text-body-sm text-error">
            {error}
          </p>
        </form>
      ) : (
        <p className="text-body-sm text-bark-700">
          Maximum 5 pointures par compte — retirez-en une pour en ajouter une
          autre.
        </p>
      )}
    </div>
  );
}
