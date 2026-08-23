import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";
import { PageHero } from "@/components/layout/PageHero/PageHero";

export const metadata: Metadata = {
  title: "Contact",
  description: "Une question sur un produit, une commande, un retour ? Écrivez-nous — réponse sous 24 h ouvrées.",
};

/** Contact écrit uniquement — pas de téléphone, choix assumé (H29). */
export default function ContactPage() {
  return (
    <>
      <PageHero
        kicker="Aide"
        title="Contact"
        intro="Une question sur un produit, une taille, une commande ? Nous répondons sous 24 h ouvrées, avec de vraies réponses — pas de robot."
        crumbs={[{ name: "Contact", path: "/contact" }]}
      />
      <div className="mx-auto max-w-xl px-4 py-12 lg:px-6">
        <ContactForm />
      </div>
    </>
  );
}
