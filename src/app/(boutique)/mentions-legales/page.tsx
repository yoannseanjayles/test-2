import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage/LegalPage";

export const metadata: Metadata = { title: "Mentions légales" };

export default function LegalNoticePage() {
  return (
    <LegalPage
      title="Mentions légales"
      updated="14 juillet 2026"
      sections={[
        { heading: "Éditeur du site", body: "chien et chat — société en cours d'immatriculation. Raison sociale, capital, RCS, siège social et directeur de la publication : à compléter avant lancement." },
        { heading: "Hébergement", body: "Site hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis." },
        { heading: "Propriété intellectuelle", body: "L'ensemble des contenus (textes, visuels, marque « chien et chat ») est protégé. Toute reproduction sans autorisation écrite est interdite." },
      ]}
    />
  );
}
