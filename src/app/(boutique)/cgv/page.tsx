import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage/LegalPage";
import { getShippingConfig } from "@/lib/admin-settings";
import { company } from "@/lib/company";
import { formatPrice } from "@/lib/format";
import {
  CGV_UPDATED,
  withdrawalFormBody,
  withdrawalFormIntro,
  withdrawalFormTitle,
} from "@/lib/legal";

export const metadata: Metadata = { title: "Conditions générales de vente" };

export default async function CgvPage() {
  const seuil = formatPrice((await getShippingConfig()).freeShippingCents);
  return (
    <LegalPage
      title="Conditions générales de vente"
      updated={CGV_UPDATED}
      sections={[
        { heading: "Objet et champ d'application", body: `Les présentes conditions régissent les ventes conclues sur le site ${company.tradeName} entre la société éditrice et tout client consommateur, pour la livraison en France, Belgique, Suisse et Luxembourg.` },
        { heading: "Prix", body: "Les prix sont indiqués en euros, toutes taxes comprises, hors frais de livraison. Le total exact, frais compris, est affiché avant la validation du paiement et recalculé côté serveur." },
        { heading: "Commande et paiement", body: "La commande peut être passée sans création de compte et vaut acceptation des présentes CGV (case à cocher au moment du paiement). Le paiement est exigible immédiatement, par carte bancaire via notre prestataire de paiement sécurisé Stripe (conformité PCI-DSS)." },
        { heading: "Livraison", body: `Expédition sous 24 h ouvrées. Délais indicatifs : 2–3 jours ouvrés à domicile, 3–4 jours en point relais, 24 h en express. Livraison offerte dès ${seuil} (domicile et relais).` },
        { heading: "Rétractation et retours", body: "Conformément aux articles L.221-18 et suivants du Code de la consommation, le client consommateur dispose de 14 jours calendaires à compter de la réception du bien pour se rétracter, sans avoir à motiver sa décision ni à supporter de pénalité — délai que notre garantie commerciale étend à 30 jours. Pour l'exercer, adressez-nous une déclaration dénuée d'ambiguïté via le formulaire de contact, ou utilisez le formulaire type reproduit en fin de page. Les retours sont offerts (étiquette prépayée) : nous prenons en charge les frais de renvoi. Le remboursement intervient sous 14 jours à compter de la réception du colis retourné, par le même moyen de paiement que celui utilisé lors de la commande." },
        { heading: "Garanties légales", body: "Tous les produits bénéficient de la garantie légale de conformité (2 ans) et de la garantie des vices cachés, sans paiement supplémentaire." },
        { heading: "Service client", body: "Le support est joignable par le formulaire de contact — réponse sous 24 h ouvrées." },
        { heading: "Médiation de la consommation", body: `Après démarche préalable écrite auprès de notre service client restée sans réponse satisfaisante sous 60 jours, le client consommateur peut saisir gratuitement le médiateur de la consommation : ${company.mediator.name}, ${company.mediator.address} — ${company.mediator.website} (art. L.612-1 c. conso.). Plateforme européenne de règlement en ligne des litiges : https://ec.europa.eu/consumers/odr.` },
      ]}
      appendix={
        <section className="mt-10 border border-border p-5">
          <h2 className="font-display text-h3 leading-tight text-bark-900">
            Annexe — {withdrawalFormTitle}
          </h2>
          <p className="mt-2 text-body-sm leading-relaxed text-bark-700">
            {withdrawalFormIntro}
          </p>
          <div className="mt-4 space-y-2 border-l-2 border-caramel-300 pl-4">
            {withdrawalFormBody.map((line) => (
              <p key={line} className="text-body-sm leading-relaxed text-bark-700">
                {line}
              </p>
            ))}
          </div>
        </section>
      }
    />
  );
}
