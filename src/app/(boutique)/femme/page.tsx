import type { Metadata } from "next";
import { GenreListing } from "../_shared/GenreListing";
import { media } from "@/lib/media";

export const metadata: Metadata = {
  title: "Femme — chaussures et sneakers",
  description:
    "Le rayon femme : treize modèles unisexes signés On, Nike, Saucony, ASICS et Salomon, du 36 au 45, avec le conseil de chaussant de chaque modèle.",
  // Même assortiment que /chaussures : la page de référence reste le listing complet.
  alternates: { canonical: "/chaussures" },
};

export default function FemmePage() {
  return (
    <GenreListing
      genre="femme"
      title="Femme"
      intro="Les mêmes treize modèles, la même grille de tailles — et le conseil de chaussant du modèle sur chaque fiche."
      image={media.heroFemme}
    />
  );
}
