import type { Metadata } from "next";
import { CookiePreferences } from "./CookiePreferences";

export const metadata: Metadata = { title: "Cookies" };

/** Préférences cookies — CMP interne (D-041), modifiables à tout moment. */
export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12 lg:px-6">
      <h1 className="font-display text-h1 font-[560] text-bark-900">Cookies</h1>
      <p className="mt-3 text-body text-bark-700">
        Choisissez ce que vous acceptez — modifiable à tout moment ici. Les
        cookies essentiels (panier, session) ne peuvent pas être désactivés.
      </p>
      <CookiePreferences />
    </div>
  );
}
