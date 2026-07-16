/**
 * Structure de navigation issue du sitemap validé (1.2, D-012).
 * Les noms de sous-catégories restent affinables avec le catalogue réel (H7).
 */

export type NavLink = {
  label: string;
  href: string;
};

export type AnimalCategory = NavLink & {
  /** Sous-catégories affichées dans le méga-menu et sur la page animal. */
  children: NavLink[];
  /** Accroche du visuel de mise en avant du méga-menu (M-NAV, Phase 3). */
  highlight: string;
};

export const animalCategories: AnimalCategory[] = [
  {
    label: "Chien",
    href: "/chien",
    highlight: "La sélection promenade : colliers, harnais et laisses assortis.",
    children: [
      { label: "Colliers & Harnais", href: "/chien/colliers-harnais" },
      { label: "Laisses", href: "/chien/laisses" },
      { label: "Couchages & Paniers", href: "/chien/couchages-paniers" },
      { label: "Jouets", href: "/chien/jouets" },
      { label: "Gamelles & Repas", href: "/chien/gamelles-repas" },
      { label: "Transport & Voyage", href: "/chien/transport-voyage" },
      { label: "Toilettage & Soin", href: "/chien/toilettage-soin" },
      { label: "Manteaux & Textile", href: "/chien/manteaux-textile" },
    ],
  },
  {
    label: "Chat",
    href: "/chat",
    highlight: "Cocons et griffoirs qui trouvent leur place dans le salon.",
    children: [
      { label: "Colliers", href: "/chat/colliers" },
      { label: "Couchages & Cocons", href: "/chat/couchages-cocons" },
      { label: "Arbres à chat & Griffoirs", href: "/chat/arbres-a-chat-griffoirs" },
      { label: "Jouets", href: "/chat/jouets" },
      { label: "Gamelles & Fontaines", href: "/chat/gamelles-fontaines" },
      { label: "Litière & Maison", href: "/chat/litiere-maison" },
      { label: "Transport & Voyage", href: "/chat/transport-voyage" },
    ],
  },
  {
    label: "NAC",
    href: "/nac",
    highlight: "L'essentiel soigné pour lapins, rongeurs et furets.",
    children: [
      { label: "Habitat & Couchage", href: "/nac/habitat-couchage" },
      { label: "Jeux & Activité", href: "/nac/jeux-activite" },
      { label: "Repas & Accessoires", href: "/nac/repas-accessoires" },
    ],
  },
];

export const primaryLinks: NavLink[] = [
  { label: "Nouveautés", href: "/nouveautes" },
  { label: "Guides & Conseils", href: "/guides" },
];

export const footerColumns: { title: string; links: NavLink[] }[] = [
  {
    title: "Boutique",
    links: [
      { label: "Chien", href: "/chien" },
      { label: "Chat", href: "/chat" },
      { label: "NAC", href: "/nac" },
      { label: "Nouveautés", href: "/nouveautes" },
    ],
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
    title: "La marque",
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
 * construit par AnnouncementBar depuis les réglages boutique (jalon 4).
 */
export const announcementMessages: string[] = [
  "Retours offerts — 30 jours pour changer d'avis",
  "Sélection testée et approuvée par nos experts",
];
