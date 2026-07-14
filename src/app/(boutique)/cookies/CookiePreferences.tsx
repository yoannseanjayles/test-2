"use client";

import { useEffect, useState } from "react";
import { useConsent } from "@/components/layout/CookieBanner/CookieBanner";
import { Button } from "@/components/ui";

const rows = [
  { key: "essential" as const, label: "Essentiels", detail: "Panier, session, préférences — toujours actifs.", locked: true },
  { key: "analytics" as const, label: "Mesure d'audience", detail: "Statistiques anonymes pour améliorer le site.", locked: false },
  { key: "marketing" as const, label: "Marketing", detail: "Personnalisation des campagnes. Aucun traceur tiers à ce jour.", locked: false },
];

export function CookiePreferences() {
  const { consent, setConsent } = useConsent();
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    if (consent) {
      setAnalytics(consent.analytics);
      setMarketing(consent.marketing);
    }
  }, [consent]);

  if (!hydrated) return null;

  const values = { essential: true, analytics, marketing };
  const setters = { essential: () => {}, analytics: setAnalytics, marketing: setMarketing };

  return (
    <div className="mt-8 flex flex-col gap-3">
      {rows.map((row) => (
        <label
          key={row.key}
          className="flex items-start justify-between gap-4 rounded-lg bg-cream-50 p-5 shadow-card"
        >
          <span>
            <span className="font-heading block text-body font-semibold text-bark-900">{row.label}</span>
            <span className="text-body-sm text-bark-700">{row.detail}</span>
          </span>
          <input
            type="checkbox"
            checked={values[row.key]}
            disabled={row.locked}
            onChange={(event) => setters[row.key](event.target.checked)}
            className="mt-1 size-5 shrink-0 accent-pine-700"
          />
        </label>
      ))}
      <Button
        className="mt-2 self-start"
        onClick={() => {
          setConsent({ analytics, marketing });
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }}
      >
        Enregistrer mes choix
      </Button>
      <p aria-live="polite" className="text-body-sm text-success">
        {saved ? "Préférences enregistrées." : ""}
      </p>
    </div>
  );
}
