/**
 * Navigation principale — dérivée du sitemap validé (docs/phase-1-architecture/1.2-sitemap.md, D-012).
 * Source unique pour le méga-menu desktop, le menu mobile et le footer.
 */

export type SubCategory = {
  label: string;
  slug: string;
};

export type Universe = {
  label: string;
  slug: "chien" | "chat" | "nac";
  tagline: string;
  subCategories: SubCategory[];
};

export const UNIVERSES: Universe[] = [
  {
    label: "Chien",
    slug: "chien",
    tagline: "Colliers, couchages, jouets…",
    subCategories: [
      { label: "Colliers & Harnais", slug: "colliers-harnais" },
      { label: "Laisses", slug: "laisses" },
      { label: "Couchages & Paniers", slug: "couchages-paniers" },
      { label: "Jouets", slug: "jouets" },
      { label: "Gamelles & Repas", slug: "gamelles-repas" },
      { label: "Transport & Voyage", slug: "transport-voyage" },
      { label: "Toilettage & Soin", slug: "toilettage-soin" },
      { label: "Manteaux & Textile", slug: "manteaux-textile" },
    ],
  },
  {
    label: "Chat",
    slug: "chat",
    tagline: "Cocons, arbres à chat, jeux…",
    subCategories: [
      { label: "Colliers", slug: "colliers" },
      { label: "Couchages & Cocons", slug: "couchages-cocons" },
      { label: "Arbres à chat & Griffoirs", slug: "arbres-a-chat-griffoirs" },
      { label: "Jouets", slug: "jouets" },
      { label: "Gamelles & Fontaines", slug: "gamelles-fontaines" },
      { label: "Litière & Maison", slug: "litiere-maison" },
      { label: "Transport & Voyage", slug: "transport-voyage" },
    ],
  },
  {
    label: "NAC",
    slug: "nac",
    tagline: "Lapins, rongeurs, oiseaux…",
    subCategories: [
      { label: "Habitat & Couchage", slug: "habitat-couchage" },
      { label: "Jeux & Activité", slug: "jeux-activite" },
      { label: "Repas & Accessoires", slug: "repas-accessoires" },
    ],
  },
];

export const PRIMARY_LINKS = [
  { label: "Nouveautés", href: "/nouveautes" },
  { label: "Guides & Conseils", href: "/guides" },
] as const;

export const FOOTER_COLUMNS = [
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
] as const;

export const REASSURANCE_MESSAGES = [
  "Livraison offerte dès 79 €",
  "Retours 30 jours",
  "Paiement sécurisé",
] as const;
