import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Une question sur un produit, une commande, un retour ? Écrivez-nous — réponse sous 24 h ouvrées.",
};

/** Contact écrit uniquement — pas de téléphone, choix assumé (H29). */
export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12 lg:px-6">
      <h1 className="font-display text-h1 font-[560] text-bark-900">Contact</h1>
      <p className="mt-3 text-body text-bark-700">
        Une question sur un produit, une taille, une commande ? Nous répondons
        sous 24 h ouvrées, avec de vraies réponses — pas de robot.
      </p>
      <ContactForm />
    </div>
  );
}
