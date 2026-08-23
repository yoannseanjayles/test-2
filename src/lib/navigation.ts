/**
 * Structure de navigation — refonte « boutique streetwear » (août 2026).
 *
 * L'axe primaire n'est plus la marque mais le **rayon**, comme sur les
 * boutiques de sneakers et de streetwear : Homme, Femme, Chaussures,
 * Ensembles. La marque redevient ce qu'elle est en magasin — un filtre et une
 * colonne de méga-menu, pas la porte d'entrée.
 *
 * Les routes produit ne bougent pas (`/{marque}/{usage}/{modèle}`, D-055) :
 * changer la navigation ne change pas les URLs indexées. Les nouveaux rayons
 * sont des **pages de listing** qui filtrent le même catalogue.
 *
 * Les entrées `soon: true` mènent à une page « en construction » assumée : le
 * catalogue de lancement ne contient que des chaussures, et une rubrique qui
 * ouvre sur une grille vide coûte plus cher qu'une rubrique qui annonce sa
 * date. Elles portent la mention « Bientôt » dans le menu.
 *
 * Les libellés sont écrits ici plutôt que dérivés de `lib/catalog` : ce module
 * est consommé par le méga-menu et le menu mobile, donc par des composants
 * client. Importer le catalogue depuis un composant client embarquerait les
 * 13 fiches et leurs 1 000 variantes dans le bundle de chaque page.
 */

export type NavLink = {
  label: string;
  href: string;
  /** Rubrique annoncée mais pas encore ouverte — badge « Bientôt ». */
  soon?: boolean;
};

export type NavColumn = {
  title: string;
  links: NavLink[];
};

export type NavSection = NavLink & {
  /** Colonnes du méga-menu ; absentes = lien simple dans la barre. */
  columns?: NavColumn[];
  /**
   * Accroche du panneau de mise en avant, à droite du méga-menu.
   *
   * Le visuel n'est pas porté ici mais dans `lib/media` (`menuImages`),
   * indexé par l'intitulé du rayon : ce module est importé côté client comme
   * côté serveur, y coller des imports d'images alourdirait chaque bundle qui
   * ne lit que les libellés.
   */
  highlight?: { title: string; text: string; href: string; cta: string };
};

/** Les six usages réellement présents au catalogue, avec leur route. */
export const usageLinks: NavLink[] = [
  { label: "Running route", href: "/on/running" },
  { label: "Marche urbaine", href: "/on/lifestyle" },
  { label: "Lifestyle", href: "/nike/lifestyle" },
  { label: "Originals", href: "/saucony/lifestyle" },
  { label: "SportStyle", href: "/asics/sportstyle" },
  { label: "Trail en ville", href: "/salomon/sportstyle" },
];

/** Les cinq marques du catalogue. */
export const brandLinks: NavLink[] = [
  { label: "On", href: "/on" },
  { label: "Nike", href: "/nike" },
  { label: "Saucony", href: "/saucony" },
  { label: "ASICS", href: "/asics" },
  { label: "Salomon", href: "/salomon" },
];

/** Rayons textile — annoncés, pas encore ouverts. */
const textileLinks: NavLink[] = [
  { label: "Ensembles de sport", href: "/ensembles" },
  { label: "Sweats & hoodies", href: "/ensembles" },
  { label: "Pantalons & joggings", href: "/ensembles" },
];

const accessoryLinks: NavLink[] = [
  { label: "Chaussettes", href: "/accessoires", soon: true },
  { label: "Sacs & bananes", href: "/accessoires", soon: true },
  { label: "Casquettes", href: "/accessoires", soon: true },
];

const genreColumns = (genre: "homme" | "femme"): NavColumn[] => [
  {
    title: "Chaussures",
    links: [
      { label: "Toutes les chaussures", href: `/${genre}` },
      ...usageLinks,
    ],
  },
  { title: "Ensembles & vêtements", links: textileLinks },
  { title: "Accessoires", links: accessoryLinks },
];

/** Barre de navigation principale — l'ordre est celui de l'en-tête. */
export const mainNav: NavSection[] = [
  {
    label: "Homme",
    href: "/homme",
    columns: genreColumns("homme"),
    highlight: {
      title: "Treize modèles, cinq marques",
      text: "Tous nos modèles sont unisexes : la même paire, la même grille de tailles, deux façons de la porter.",
      href: "/homme",
      cta: "Voir le rayon homme",
    },
  },
  {
    label: "Femme",
    href: "/femme",
    columns: genreColumns("femme"),
    highlight: {
      title: "Du 36 au 45",
      text: "La grille de tailles de chaque marque est publiée sur la fiche, avec le conseil de chaussant du modèle.",
      href: "/femme",
      cta: "Voir le rayon femme",
    },
  },
  {
    label: "Chaussures",
    href: "/chaussures",
    columns: [
      {
        title: "Par usage",
        links: [{ label: "Toutes les chaussures", href: "/chaussures" }, ...usageLinks],
      },
      { title: "Par marque", links: brandLinks },
      {
        title: "À découvrir",
        links: [
          { label: "Nouveautés", href: "/nouveautes" },
          { label: "Guides & conseils", href: "/guides" },
          { label: "Guide des tailles", href: "/guides/bien-choisir-sa-pointure" },
        ],
      },
    ],
    highlight: {
      title: "Le rayon complet",
      text: "Treize modèles, 88 coloris, filtrables par marque, pointure disponible et matière.",
      href: "/chaussures",
      cta: "Ouvrir le listing",
    },
  },
  {
    label: "Ensembles",
    href: "/ensembles",
  },
  { label: "Nouveautés", href: "/nouveautes" },
  { label: "Guides", href: "/guides" },
];

export type BrandCategory = NavLink & {
  /** Usages affichés sur la page marque et dans les cartes d'accueil. */
  children: NavLink[];
  /** Accroche du visuel de mise en avant. */
  highlight: string;
};

/**
 * Axe marque — il ne porte plus la barre de navigation, mais il reste la
 * matière des cartes « Choisir par marque » de l'accueil, de la page 404 et
 * de la colonne « Par marque » du méga-menu. Aligné sur `subcategories` de
 * `catalog/data`.
 */
export const brandCategories: BrandCategory[] = [
  {
    label: "On",
    href: "/on",
    highlight: "Amorti sculpté en géométries : deux daily trainers, deux modèles de marche urbaine.",
    children: [
      { label: "Running route", href: "/on/running" },
      { label: "Marche urbaine", href: "/on/lifestyle" },
    ],
  },
  {
    label: "Nike",
    href: "/nike",
    highlight: "Quatre silhouettes, quatre décennies — de l'Air Force 1 de 1982 à la P-6000.",
    children: [{ label: "Lifestyle", href: "/nike/lifestyle" }],
  },
  {
    label: "Saucony",
    href: "/saucony",
    highlight: "Deux rééditions d'archive de la gamme Originals.",
    children: [{ label: "Originals", href: "/saucony/lifestyle" }],
  },
  {
    label: "ASICS",
    href: "/asics",
    highlight: "La GEL-KAYANO 14 et la 20, rééditées en gamme SportStyle.",
    children: [{ label: "SportStyle", href: "/asics/sportstyle" }],
  },
  {
    label: "Salomon",
    href: "/salomon",
    highlight: "La XT-6, héritage ultra-trail passé en ville. Deux coloris GORE-TEX.",
    children: [{ label: "Sportstyle", href: "/salomon/sportstyle" }],
  },
];

/** Liens de la barre, hors méga-menus (conservé pour compatibilité). */
export const primaryLinks: NavLink[] = [
  { label: "Nouveautés", href: "/nouveautes" },
  { label: "Guides & Conseils", href: "/guides" },
];

export const footerColumns: { title: string; links: NavLink[] }[] = [
  {
    title: "Rayons",
    links: [
      { label: "Homme", href: "/homme" },
      { label: "Femme", href: "/femme" },
      { label: "Chaussures", href: "/chaussures" },
      { label: "Nouveautés", href: "/nouveautes" },
      { label: "Ensembles de sport", href: "/ensembles" },
      { label: "Accessoires", href: "/accessoires", soon: true },
    ],
  },
  {
    title: "Marques",
    links: brandLinks,
  },
  {
    title: "Aide",
    links: [
      { label: "Livraison & retours", href: "/livraison-retours" },
      { label: "FAQ", href: "/faq" },
      { label: "Suivi de commande", href: "/suivi-commande" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "La boutique",
    links: [
      { label: "Notre histoire", href: "/notre-histoire" },
      { label: "Guides & Conseils", href: "/guides" },
      { label: "CGV", href: "/cgv" },
      { label: "Confidentialité", href: "/confidentialite" },
    ],
  },
];

/** Liens secondaires du menu mobile (sitemap 1.2 : en bas de menu). */
export const mobileSecondaryLinks: NavLink[] = [
  { label: "Mon compte", href: "/compte" },
  { label: "Livraison & retours", href: "/livraison-retours" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

/**
 * Messages de réassurance du bandeau (D-039/D-040) — le message seuil est
 * construit par AnnouncementBar depuis les réglages boutique.
 */
export const announcementMessages: string[] = [
  "Retours offerts — 30 jours pour changer d'avis",
  "Guide des tailles par marque sur chaque fiche",
];
