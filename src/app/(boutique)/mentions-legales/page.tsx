import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage/LegalPage";
import { company } from "@/lib/company";

export const metadata: Metadata = { title: "Mentions légales" };

/** Contenu construit depuis la fiche société unique (lib/company.ts). */
export default function LegalNoticePage() {
  return (
    <LegalPage
      title="Mentions légales"
      updated="16 juillet 2026"
      sections={[
        {
          heading: "Éditeur du site",
          body: `Le site « ${company.tradeName} » est édité par ${company.legalName}, ${company.legalForm}, immatriculée au ${company.rcs} (SIRET ${company.siret}, TVA ${company.vat}), dont le siège social est situé ${company.address}. Directeur·rice de la publication : ${company.publicationDirector}.`,
        },
        {
          heading: "Contact",
          body: "Le service client est joignable via le formulaire de contact du site — réponse sous 24 h ouvrées.",
        },
        { heading: "Hébergement", body: `Site hébergé par ${company.host}.` },
        {
          heading: "Médiation de la consommation",
          body: `Conformément à l'article L.612-1 du Code de la consommation, après démarche préalable écrite auprès de notre service client, tout consommateur peut recourir gratuitement au médiateur suivant : ${company.mediator.name}, ${company.mediator.address} — ${company.mediator.website}. Plateforme européenne de règlement en ligne des litiges : https://ec.europa.eu/consumers/odr.`,
        },
        {
          heading: "Propriété intellectuelle",
          body: `L'ensemble des contenus (textes, visuels, marque « ${company.tradeName} ») est protégé. Toute reproduction sans autorisation écrite est interdite.`,
        },
      ]}
    />
  );
}
