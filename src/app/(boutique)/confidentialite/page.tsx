import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage/LegalPage";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      updated="14 juillet 2026"
      sections={[
        { heading: "Données collectées", body: "Nous collectons uniquement les données nécessaires : e-mail et adresse pour la commande, profil animal facultatif pour la personnalisation, données de navigation soumises à votre consentement (bandeau cookies)." },
        { heading: "Finalités et bases légales", body: "Exécution du contrat (commande, livraison, SAV), intérêt légitime (prévention de la fraude), consentement (newsletter, mesure d'audience). Aucune vente de données à des tiers." },
        { heading: "Durées de conservation", body: "Données de commande : 5 ans (obligations comptables). Compte inactif : suppression après 3 ans. Newsletter : jusqu'à désinscription." },
        { heading: "Vos droits", body: "Accès, rectification, effacement, portabilité, opposition : exercez-les depuis votre compte (Mes informations) ou via le formulaire de contact. Réclamation possible auprès de la CNIL." },
        { heading: "Sous-traitants", body: "Hébergement, paiement et livraison font appel à des prestataires conformes au RGPD, listés dans la version définitive de cette page." },
      ]}
    />
  );
}
