import type { Metadata } from "next";
import { UnderConstruction } from "@/components/layout/UnderConstruction/UnderConstruction";
import { PageHero } from "@/components/layout/PageHero/PageHero";

export const metadata: Metadata = {
  title: "Accessoires — bientôt",
  description:
    "Chaussettes, sacs et casquettes : le rayon accessoires ouvre après le textile. La route existe déjà, l'assortiment arrive.",
  robots: { index: false },
};

/** Rayon annoncé dans la navigation, pas encore ouvert — zéro lien mort. */
export default function AccessoiresPage() {
  return (
    <>
      <PageHero
        kicker="Rayon"
        title="Accessoires"
        intro="Chaussettes, sacs, casquettes — après le textile."
        crumbs={[{ name: "Accessoires", path: "/accessoires" }]}
      />
      <UnderConstruction
        title="Le rayon accessoires arrive"
        milestone="prochain jalon catalogue"
        description="Chaussettes techniques, bananes et casquettes complèteront la boutique une fois le textile en ligne. La rubrique figure déjà dans le menu pour que la navigation soit stable le jour où elle s'ouvre."
      />
    </>
  );
}
