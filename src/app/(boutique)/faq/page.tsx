import type { Metadata } from "next";
import { Accordion } from "@/components/ui";
import { getShippingConfig } from "@/lib/admin-settings";
import { formatPrice } from "@/lib/format";
import { PageHero } from "@/components/layout/PageHero/PageHero";

export const metadata: Metadata = {
  title: "Questions fréquentes",
  description: "Livraison, retours, tailles, produits : toutes les réponses aux questions fréquentes.",
};

const sections = (seuil: string) => [
  {
    title: "Commande & livraison",
    items: [
      { title: "Faut-il créer un compte pour commander ?", content: "Non — la commande invitée est le parcours par défaut. Le compte vous est proposé après l'achat, pour le suivi et les retours en un clic." },
      { title: "Quels sont les délais de livraison ?", content: `Expédition sous 24 h ouvrées, puis 2 à 3 jours à domicile, 3 à 4 jours en point relais, 24 h en express. Livraison offerte dès ${seuil} (domicile et relais).` },
      { title: "Quels moyens de paiement acceptez-vous ?", content: "Carte bancaire (CB, Visa, Mastercard) et PayPal, en paiement sécurisé. Apple Pay arrive prochainement." },
    ],
  },
  {
    title: "Tailles & produits",
    items: [
      { title: "Comment choisir la bonne pointure ?", content: "Chaque fiche produit ouvre le guide des tailles de la marque du modèle — correspondances EU, UK, US et longueur — accompagné du conseil de chaussant propre au modèle. Mesurez la longueur de votre pied en centimètres, debout et en fin de journée, et comparez-la à la colonne de longueur plutôt que de reporter votre pointure habituelle. Notre guide « Bien choisir sa pointure » détaille les pièges de conversion." },
      { title: "Les grilles de tailles sont-elles fiables ?", content: "Inégalement, et nous le disons sur chaque grille. Sur les cinq marques du catalogue, une seule grille provient directement du fabricant : celle de Nike. Les quatre autres sont des redistributions de revendeurs, concordantes entre elles mais non confirmées par la marque. La mention d'origine est affichée avec la grille." },
      { title: "Une réédition d'archive vaut-elle pour courir ?", content: "Non. La ProGrid Omni 9 et les GEL-KAYANO 14 et 20 étaient des chaussures de stabilité à leur sortie ; elles sont aujourd'hui vendues en gamme lifestyle. Ces mentions n'ont plus de valeur prescriptive et nous ne les présentons pas comme des chaussures correctrices. Une correction de foulée se prescrit, elle ne s'achète pas sur une fiche produit." },
      { title: "Un produit est en rupture, que faire ?", content: "Laissez votre e-mail sur la fiche produit (« Me prévenir du retour ») : nous vous écrivons dès le retour en stock, sans engagement." },
    ],
  },
  {
    title: "Retours & SAV",
    items: [
      { title: "Comment faire un retour ?", content: "Depuis votre compte (Mes commandes → Faire un retour) ou via le contact si vous avez commandé en invité. Retours offerts — 30 jours pour changer d'avis." },
      { title: "Comment vous contacter ?", content: "Par le formulaire de contact — nous répondons sous 24 h ouvrées. Nous avons fait le choix d'un support écrit soigné plutôt que d'une hotline." },
    ],
  },
];

export default async function FaqPage() {
  const seuil = formatPrice((await getShippingConfig()).freeShippingCents);
  return (
    <>
      <PageHero
        kicker="Aide"
        title="Questions fréquentes"
        intro="Livraison, retours, tailles, produits : les réponses aux questions qui reviennent le plus."
        crumbs={[{ name: "FAQ", path: "/faq" }]}
        tone="light"
      />
      <div className="mx-auto max-w-3xl px-4 py-12 lg:px-6">
      {sections(seuil).map((section) => (
        <section key={section.title} aria-label={section.title} className="mt-10">
          <h2 className="font-display text-h2 leading-none text-bark-900">{section.title}</h2>
          <Accordion className="mt-4" items={section.items} />
        </section>
      ))}
      </div>
    </>
  );
}
