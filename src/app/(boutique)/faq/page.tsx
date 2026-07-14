import type { Metadata } from "next";
import { Accordion } from "@/components/ui";

export const metadata: Metadata = {
  title: "Questions fréquentes",
  description: "Livraison, retours, tailles, produits : toutes les réponses aux questions fréquentes.",
};

const sections = [
  {
    title: "Commande & livraison",
    items: [
      { title: "Faut-il créer un compte pour commander ?", content: "Non — la commande invitée est le parcours par défaut. Le compte vous est proposé après l'achat, pour le suivi et les retours en un clic." },
      { title: "Quels sont les délais de livraison ?", content: "Expédition sous 24 h ouvrées, puis 2 à 3 jours à domicile, 3 à 4 jours en point relais, 24 h en express. Livraison offerte dès 79 € (domicile et relais)." },
      { title: "Quels moyens de paiement acceptez-vous ?", content: "Carte bancaire (CB, Visa, Mastercard) et PayPal, en paiement sécurisé. Apple Pay arrive prochainement." },
    ],
  },
  {
    title: "Tailles & produits",
    items: [
      { title: "Comment choisir la bonne taille ?", content: "Chaque fiche produit propose un guide des tailles avec les correspondances par gabarit, et notre guide « Comment mesurer votre animal » détaille les trois mesures utiles. Entre deux tailles, prenez la plus grande." },
      { title: "Comment sont choisis les produits ?", content: "Chaque référence est testée et comparée par notre équipe et relue par nos experts (vétérinaires, éducateurs). Nous refusons plus de produits que nous n'en retenons — le bloc « Pourquoi nous l'avons choisi » de chaque fiche vous dit pourquoi celui-ci a passé la sélection." },
      { title: "Un produit est en rupture, que faire ?", content: "Laissez votre e-mail sur la fiche produit (« Me prévenir du retour ») : nous vous écrivons dès le retour en stock, sans engagement." },
    ],
  },
  {
    title: "Retours & SAV",
    items: [
      { title: "Comment faire un retour ?", content: "Depuis votre compte (Mes commandes → Faire un retour) ou via le contact si vous avez commandé en invité. Premier retour offert, 30 jours pour changer d'avis." },
      { title: "Comment vous contacter ?", content: "Par le formulaire de contact — nous répondons sous 24 h ouvrées. Nous avons fait le choix d'un support écrit soigné plutôt que d'une hotline." },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-6">
      <h1 className="font-display text-h1 font-[560] text-bark-900">Questions fréquentes</h1>
      {sections.map((section) => (
        <section key={section.title} aria-label={section.title} className="mt-10">
          <h2 className="font-heading text-h2 font-semibold text-bark-900">{section.title}</h2>
          <Accordion className="mt-4" items={section.items} />
        </section>
      ))}
    </div>
  );
}
