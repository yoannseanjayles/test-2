import type { StaticImageData } from "next/image";
import type { Animal } from "@/lib/catalog";

import heroHome from "@/media/M-HOME-01.jpeg";
import heroChat from "@/media/M-HOME-02.jpeg";
import carteChien from "@/media/M-HOME-03.jpeg";
import carteChat from "@/media/M-HOME-04.jpeg";
import carteNac from "@/media/M-HOME-05.jpeg";
import blocMarque from "@/media/M-HOME-06.jpeg";
import catColliersHarnaisChien from "@/media/M-CAT-01.jpeg";
import catCouchagesCoconsChat from "@/media/M-CAT-10.jpeg";
import bandeauNouveautes from "@/media/M-CAT-19.jpeg";
import brdAtelier from "@/media/M-BRD-01.jpeg";
import brdTest from "@/media/M-BRD-03.jpeg";
import brdConfort from "@/media/M-BRD-04.jpeg";
import pdpCollierAmbrePackshot from "@/media/M-PDP-collier-cuir-ambre-1.jpeg";
import pdpCollierAmbrePorte from "@/media/M-PDP-collier-cuir-ambre-5.jpeg";
import illPanier from "@/media/M-ILL-01.jpeg";
import ill404 from "@/media/M-ILL-02.jpeg";
import illRecherche from "@/media/M-ILL-03.jpeg";
import illConfirmation from "@/media/M-ILL-04.jpeg";
import illAnimaux from "@/media/M-ILL-05.jpeg";

/**
 * Registre des médias intégrés (inventaire 3.1, lot 1/2 — H32).
 * Les emplacements sans entrée gardent leur placeholder DA jusqu'au lot 2.
 * Les icônes M-ICO reçues en JPEG attendent leur vectorisation (H35) —
 * Lucide reste la source des icônes UI en attendant.
 */

export const media = {
  heroHome,
  blocMarque,
  bandeauNouveautes,
  brdAtelier,
  brdTest,
  brdConfort,
} as const;

/** Cartes univers de l'accueil (M-HOME-03/04/05) — série complète. */
export const universeCards: Partial<Record<Animal, StaticImageData>> = {
  chien: carteChien,
  chat: carteChat,
  nac: carteNac,
};

/** Bandeaux discrets d'en-tête des pages animal (gabarit A). */
export const universeBanners: Partial<Record<Animal, StaticImageData>> = {
  chien: heroHome,
  chat: heroChat,
};

/** Visuels réels de fiches produit (M-PDP-{slug}-n), par slug. */
export const productImages: Record<
  string,
  { src: StaticImageData; label: string }[]
> = {
  "collier-cuir-ambre": [
    { src: pdpCollierAmbrePackshot, label: "Packshot — collier et harnais assortis" },
    { src: pdpCollierAmbrePorte, label: "Porté par un cocker — taille M" },
  ],
};

/** Vignettes de sous-catégories (M-CAT-*), indexées `{animal}/{sousCategorie}`. */
export const categoryImages: Record<string, StaticImageData> = {
  "chien/colliers-harnais": catColliersHarnaisChien,
  "chat/couchages-cocons": catCouchagesCoconsChat,
};

/** Illustrations d'états (M-ILL-01…05) — série complète. */
export const illustrations = {
  panier: illPanier,
  notFound: ill404,
  recherche: illRecherche,
  confirmation: illConfirmation,
  animaux: illAnimaux,
} as const;
