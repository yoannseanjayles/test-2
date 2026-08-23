import type { Metadata } from "next";
import { TrackingForm } from "./TrackingForm";
import { PageHero } from "@/components/layout/PageHero/PageHero";

export const metadata: Metadata = {
  title: "Suivi de commande",
  description: "Suivez votre commande avec votre numéro et votre e-mail — sans compte.",
};

/** Suivi invité (sitemap 1.2) : numéro + e-mail, sans compte. */
export default function TrackingPage() {
  return (
    <>
      <PageHero
        kicker="Aide"
        title="Suivi de commande"
        intro="Entrez le numéro reçu par e-mail (ex. CC-123456) et l'adresse utilisée à la commande."
        crumbs={[{ name: "Suivi de commande", path: "/suivi-commande" }]}
      />
      <div className="mx-auto max-w-xl px-4 py-12 lg:px-6">
        <TrackingForm />
      </div>
    </>
  );
}
