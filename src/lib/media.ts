import type { StaticImageData } from "next/image";
import type { Brand } from "@/lib/catalog";

import heroHomme from "@/media/hero-homme.webp";
import heroFemme from "@/media/hero-femme.webp";
import promoNouveautes from "@/media/promo-nouveautes.webp";
import promoChaussures from "@/media/promo-chaussures.webp";
import promoEnsembles from "@/media/promo-ensembles.webp";
import blocMarque from "@/media/bloc-marque.webp";
import bandeauNouveautes from "@/media/bandeau-nouveautes.webp";
import bandeauEnsembles from "@/media/bandeau-ensembles.webp";

// Vues supplémentaires du carousel du hero.
import heroHomme2 from "@/media/hero-homme-2.webp";
import heroHomme3 from "@/media/hero-homme-3.webp";
import heroFemme2 from "@/media/hero-femme-2.webp";
import heroFemme3 from "@/media/hero-femme-3.webp";

// Mise en avant du méga-menu.
import menuHomme from "@/media/menu-homme.webp";
import menuFemme from "@/media/menu-femme.webp";
import menuChaussures from "@/media/menu-chaussures.webp";

import marqueOn from "@/media/marque-on.webp";
import marqueNike from "@/media/marque-nike.webp";
import marqueSaucony from "@/media/marque-saucony.webp";
import marqueAsics from "@/media/marque-asics.webp";
import marqueSalomon from "@/media/marque-salomon.webp";

import banniereOn from "@/media/banniere-on.webp";
import banniereNike from "@/media/banniere-nike.webp";
import banniereSaucony from "@/media/banniere-saucony.webp";
import banniereAsics from "@/media/banniere-asics.webp";
import banniereSalomon from "@/media/banniere-salomon.webp";

import usageOnRunning from "@/media/usage-on-running.webp";
import usageOnTextile from "@/media/usage-on-textile.webp";
import usageNikeTextile from "@/media/usage-nike-textile.webp";
import usageSalomonTextile from "@/media/usage-salomon-textile.webp";

import brdAtelier from "@/media/brd-atelier.webp";

import etatPanier from "@/media/etat-panier.webp";
import etatNotFound from "@/media/etat-not-found.webp";
import etatRecherche from "@/media/etat-recherche.webp";
import etatConfirmation from "@/media/etat-confirmation.webp";

/**
 * Registre des médias éditoriaux (H32).
 *
 * Rempli le 23/08/2026 avec la série couleur (v2) produite d'après les
 * prompts de `docs/phase-3-medias/3.3-prompts-visuels-azeno.md` : 21 des 26
 * emplacements, convertis en WebP au gabarit de la série (≈ 1,7 Mo au total,
 * 174 ko pour le plus lourd) et importés statiquement — `next/image` connaît
 * donc leurs dimensions, et aucun emplacement ne décale la mise en page.
 *
 * Restent sur la série v1, faute de rendu dans le lot : `banniere-salomon`
 * et les quatre `etat-*`.
 *
 * Un emplacement laissé vide continue de rendre un `Placeholder` au bon
 * ratio : la structure du registre reste la garantie du zéro-CLS.
 *
 * ⚠️ Les photos **produit** ne passent pas par ici : elles sont portées par
 * `Product.colors[].images` (une série par coloris, servie depuis
 * `public/produits/`), parce que la galerie suit la pastille de coloris.
 */

/** Visuels éditoriaux nommés (hero d'accueil, bandes promo, bloc marque). */
export const media: Partial<Record<
  | "heroHomme"
  | "heroFemme"
  | "promoNouveautes"
  | "promoChaussures"
  | "promoEnsembles"
  | "blocMarque"
  | "bandeauNouveautes"
  | "bandeauEnsembles"
  | "brdAtelier",
  StaticImageData
>> = {
  heroHomme,
  heroFemme,
  promoNouveautes,
  promoChaussures,
  promoEnsembles,
  blocMarque,
  bandeauNouveautes,
  bandeauEnsembles,
  brdAtelier,
};

/**
 * Vues du carousel de chaque panneau du hero.
 *
 * Une seule vue par rayon aujourd'hui : le carousel se rend alors en panneau
 * fixe, sans puces ni défilement — il n'y a rien à faire défiler. Les vues
 * supplémentaires (`hero-homme-2`, `hero-femme-2`…) sont décrites dans
 * `docs/phase-3-medias/3.4-prompts-medias-manquants.md` ; les déposer et les
 * ajouter ici suffit à activer le défilement.
 */
export const heroSlides: Record<"homme" | "femme", { image?: StaticImageData; label: string }[]> = {
  homme: [
    { image: heroHomme, label: "Le rayon homme" },
    { image: heroHomme2, label: "En mouvement" },
    { image: heroHomme3, label: "Au lacet" },
  ],
  femme: [
    { image: heroFemme, label: "Le rayon femme" },
    { image: heroFemme2, label: "En mouvement" },
    { image: heroFemme3, label: "De profil" },
  ],
};

/** Mise en avant du méga-menu, indexée par intitulé de rayon. */
export const menuImages: Record<string, StaticImageData> = {
  Homme: menuHomme,
  Femme: menuFemme,
  Chaussures: menuChaussures,
};

/** Cartes marque de l'accueil, indexées par marque (4:3, mise en situation). */
export const universeCards: Partial<Record<Brand, StaticImageData>> = {
  on: marqueOn,
  nike: marqueNike,
  saucony: marqueSaucony,
  asics: marqueAsics,
  salomon: marqueSalomon,
};

/** Bandeaux d'en-tête des pages marque (21:9, silhouette studio sur fond encre). */
export const universeBanners: Partial<Record<Brand, StaticImageData>> = {
  on: banniereOn,
  nike: banniereNike,
  saucony: banniereSaucony,
  asics: banniereAsics,
  salomon: banniereSalomon,
};

/**
 * Visuels de fiche produit hors catalogue (lifestyle, détail matière).
 * Le catalogue courant n'en a pas : ses photos viennent des coloris.
 */
export const productImages: Record<
  string,
  { src: StaticImageData; label: string }[]
> = {};

/**
 * Vignettes de sous-catégories, indexées `{marque}/{usage}`.
 *
 * Le running a son visuel propre ; les usages lifestyle et sportstyle
 * reprennent la mise en situation de leur marque — le catalogue compte six
 * couples marque/usage pour cinq marques, produire six visuels de plus
 * n'apporterait rien de neuf à l'écran.
 *
 * Le rayon textile, lui, a ses trois visuels propres : un ensemble molleton
 * ne se laisse pas illustrer par une photo de basket.
 */
export const categoryImages: Record<string, StaticImageData> = {
  "on/running": usageOnRunning,
  "on/lifestyle": marqueOn,
  "nike/lifestyle": marqueNike,
  "saucony/lifestyle": marqueSaucony,
  "asics/sportstyle": marqueAsics,
  "salomon/sportstyle": marqueSalomon,
  "on/textile": usageOnTextile,
  "nike/textile": usageNikeTextile,
  "salomon/textile": usageSalomonTextile,
};

/** Illustrations d'états (panier vide, 404, recherche vide, confirmation). */
export const illustrations: Partial<Record<
  "panier" | "notFound" | "recherche" | "confirmation" | "profils",
  StaticImageData
>> = {
  panier: etatPanier,
  notFound: etatNotFound,
  recherche: etatRecherche,
  confirmation: etatConfirmation,
};
