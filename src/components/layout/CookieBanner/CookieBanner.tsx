"use client";

import Link from "next/link";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect, useState } from "react";
import { STORAGE_PREFIX } from "@/lib/company";

/**
 * CMP interne (D-041) : Accepter / Refuser / Personnaliser d'égale
 * visibilité, conforme CNIL. Aucun traceur n'est posé avant consentement
 * (le site n'en pose d'ailleurs aucun à ce stade).
 */

export type Consent = { analytics: boolean; marketing: boolean };

type ConsentState = {
  consent: Consent | null;
  setConsent: (consent: Consent) => void;
};

export const useConsent = create<ConsentState>()(
  persist((set) => ({ consent: null, setConsent: (consent) => set({ consent }) }), {
    name: `${STORAGE_PREFIX}-consent`,
  }),
);

const buttonClass =
  "text-label inline-flex min-h-11 flex-1 items-center justify-center border border-white/40 px-5 text-white transition-colors duration-250 hover:bg-white hover:text-bark-900 sm:flex-none";

export function CookieBanner() {
  const { consent, setConsent } = useConsent();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  if (!hydrated || consent !== null) return null;

  return (
    <div
      role="region"
      aria-label="Consentement aux cookies"
      className="fixed inset-x-0 bottom-0 z-[60] bg-bark-900 text-white shadow-overlay"
    >
      <div className="mx-auto flex max-w-page flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <p className="text-body-sm max-w-2xl text-white/75">
          Nous utilisons des cookies essentiels au fonctionnement du site et,
          avec votre accord, des cookies de mesure d'audience. Détails dans la{" "}
          <Link href="/cookies" className="text-white underline underline-offset-4 hover:text-pine-300">
            politique cookies
          </Link>
          .
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={buttonClass} onClick={() => setConsent({ analytics: true, marketing: true })}>
            Tout accepter
          </button>
          <button type="button" className={buttonClass} onClick={() => setConsent({ analytics: false, marketing: false })}>
            Tout refuser
          </button>
          <Link href="/cookies" className={buttonClass}>
            Personnaliser
          </Link>
        </div>
      </div>
    </div>
  );
}
