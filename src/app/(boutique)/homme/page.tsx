import type { Metadata } from "next";
import { GenreListing } from "../_shared/GenreListing";
import { media } from "@/lib/media";

export const metadata: Metadata = {
  title: "Homme — chaussures et sneakers",
  description:
    "Le rayon homme : treize modèles unisexes signés On, Nike, Saucony, ASICS et Salomon, du 36 au 45, avec la grille de tailles de chaque marque.",
  // Même assortiment que /chaussures : la page de référence reste le listing complet.
  alternates: { canonical: "/chaussures" },
};

export default function HommePage() {
  return (
    <GenreListing
      genre="homme"
      title="Homme"
      intro="Treize modèles portables au quotidien — running route, marche urbaine, rééditions d'archive et trail passé en ville."
      image={media.heroHomme}
    />
  );
}
