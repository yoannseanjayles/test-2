import type { Metadata } from "next";
import { TrackingForm } from "./TrackingForm";

export const metadata: Metadata = {
  title: "Suivi de commande",
  description: "Suivez votre commande avec votre numéro et votre e-mail — sans compte.",
};

/** Suivi invité (sitemap 1.2) : numéro + e-mail, sans compte. */
export default function TrackingPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12 lg:px-6">
      <h1 className="font-display text-h1 font-[560] text-bark-900">Suivi de commande</h1>
      <p className="mt-3 text-body text-bark-700">
        Entrez le numéro reçu par e-mail (ex. CC-123456) et l'adresse utilisée
        à la commande.
      </p>
      <TrackingForm />
    </div>
  );
}
