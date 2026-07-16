import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage/LegalPage";
import { getShippingConfig } from "@/lib/admin-settings";
import { company } from "@/lib/company";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Conditions générales de vente" };

export default async function CgvPage() {
  const seuil = formatPrice((await getShippingConfig()).freeShippingCents);
  return (
    <LegalPage
      title="Conditions générales de vente"
      updated="14 juillet 2026"
      sections={[
        { heading: "Objet et champ d'application", body: "Les présentes conditions régissent les ventes conclues sur le site chien et chat entre la société éditrice et tout client consommateur, pour la livraison en France, Belgique, Suisse et Luxembourg." },
        { heading: "Prix", body: "Les prix sont indiqués en euros, toutes taxes comprises, hors frais de livraison. Le total exact, frais compris, est affiché avant la validation du paiement et recalculé côté serveur." },
        { heading: "Commande et paiement", body: "La commande peut être passée sans création de compte et vaut acceptation des présentes CGV (case à cocher au moment du paiement). Le paiement est exigible immédiatement, par carte bancaire via notre prestataire de paiement sécurisé Stripe (conformité PCI-DSS)." },
        { heading: "Livraison", body: `Expédition sous 24 h ouvrées. Délais indicatifs : 2–3 jours ouvrés à domicile, 3–4 jours en point relais, 24 h en express. Livraison offerte dès ${seuil} (domicile et relais).` },
        { heading: "Rétractation et retours", body: "Conformément au Code de la consommation, le client dispose de 14 jours pour se rétracter, étendus à 30 jours par notre garantie commerciale. Les retours sont offerts (étiquette prépayée). Remboursement sous 14 jours après réception." },
        { heading: "Garanties légales", body: "Tous les produits bénéficient de la garantie légale de conformité (2 ans) et de la garantie des vices cachés, sans paiement supplémentaire." },
        { heading: "Service client", body: "Le support est joignable par le formulaire de contact — réponse sous 24 h ouvrées." },
        { heading: "Médiation de la consommation", body: `Après démarche préalable écrite auprès de notre service client restée sans réponse satisfaisante sous 60 jours, le client consommateur peut saisir gratuitement le médiateur de la consommation : ${company.mediator.name}, ${company.mediator.address} — ${company.mediator.website} (art. L.612-1 c. conso.). Plateforme européenne de règlement en ligne des litiges : https://ec.europa.eu/consumers/odr.` },
      ]}
    />
  );
}
