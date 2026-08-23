import type { Metadata } from "next";
import { UnderConstruction } from "@/components/layout/UnderConstruction/UnderConstruction";
import { PageHero } from "@/components/layout/PageHero/PageHero";

export const metadata: Metadata = {
  title: "Ensembles de sport — bientôt",
  description:
    "Le rayon textile ouvre après les chaussures : ensembles de sport, sweats et joggings. La route existe déjà, l'assortiment arrive.",
  robots: { index: false },
};

/** Rayon annoncé dans la navigation, pas encore ouvert — zéro lien mort. */
export default function EnsemblesPage() {
  return (
    <>
      <PageHero
        kicker="Rayon"
        title="Ensembles de sport"
        intro="Le textile ouvre après les chaussures."
        crumbs={[{ name: "Ensembles", path: "/ensembles" }]}
      />
      <UnderConstruction
        title="Le rayon textile arrive"
        milestone="prochain jalon catalogue"
        description="Ensembles de sport, sweats à capuche, joggings : le rayon est déjà dans la navigation parce qu'il est décidé, pas parce qu'il est prêt. Nous préférons annoncer la couleur plutôt que d'ouvrir une grille vide. En attendant, les chaussures, elles, sont en stock."
      />
    </>
  );
}
