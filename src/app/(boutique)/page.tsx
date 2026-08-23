import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, Ruler, RotateCcw, ShieldCheck } from "lucide-react";
import {
  CategoryCard,
  EditorialCard,
  HeroWord,
  ProductCard,
  ReviewCard,
  SectionHeading,
} from "@/components/commerce";
import { NewsletterForm } from "@/components/layout/Footer/NewsletterForm";
import { brandCategories } from "@/lib/navigation";
import type { Review } from "@/lib/catalog";
import { fetchFeatured, fetchGuides, fetchProducts } from "@/lib/api";
import { getShippingConfig } from "@/lib/admin-settings";
import { formatPrice } from "@/lib/format";

import { media, universeCards } from "@/lib/media";
import { Placeholder } from "@/components/commerce";
import type { Brand } from "@/lib/catalog";
import { organizationJsonLd, webSiteJsonLd, jsonLdScript } from "@/lib/jsonld";

export async function generateMetadata(): Promise<Metadata> {
  const seuil = formatPrice((await getShippingConfig()).freeShippingCents);
  return {
    title: "Baskets On, Nike, Saucony, ASICS et Salomon",
    description: `Treize modèles, cinq marques, 88 coloris. Grille de tailles par marque et conseil de chaussant sur chaque fiche. Livraison offerte dès ${seuil}.`,
  };
}

/*
   Les trois piliers d'origine promettaient des tests produits et une relecture
   par des experts. Rien ne les étaye ici : ils sont remplacés par trois
   engagements vérifiables, tenus par le code de ce dépôt.
*/
const pillars = [
  {
    Icon: Ruler,
    label: "La bonne pointure du premier coup",
    text: "Grille de tailles de la marque et conseil de chaussant du modèle, sur chaque fiche.",
  },
  {
    Icon: ShieldCheck,
    label: "Ce que la marque publie, et rien de plus",
    text: "Poids, drop et hauteurs viennent des fiches officielles. Une mesure de laboratoire est signalée comme telle.",
  },
  {
    Icon: RotateCcw,
    label: "Premier retour offert",
    text: "Trente jours pour changer d'avis, sur un article non porté et à semelle non marquée.",
  },
];

const heroTones: Record<Brand, "graphite" | "chalk" | "sand" | "signal"> = {
  on: "chalk",
  nike: "graphite",
  saucony: "sand",
  asics: "graphite",
  salomon: "signal",
};

/*
 * Refonte Azeno — l'accueil reprend l'enchaînement de la boutique de
 * référence : hero scindé en deux panneaux à typographie contourée, trois
 * bandes promo, sélection « tendance » centrée, entrées marque, bandeau
 * encre, éditorial, preuve sociale, newsletter. Le contenu reste celui de la
 * spec 2.1 (D-020/D-021/D-022) : seule la mise en scène change.
 */

/**
 * Panneaux du hero — les deux rayons de tête, comme les panneaux MEN'S /
 * WOMEN'S de la boutique de référence.
 */
const heroPanels = [
  {
    word: "Homme",
    href: "/homme",
    kicker: "Le rayon",
    text: "Treize modèles portables au quotidien, du daily trainer à la réédition d'archive.",
    tone: "graphite" as const,
    /* Le panneau homme est un aplat cyan : un trait cyan s'y noierait, le
       volt est la couleur de signature du rayon et tranche dessus. */
    accent: "var(--color-volt)",
    image: media.heroHomme,
  },
  {
    word: "Femme",
    href: "/femme",
    kicker: "Le rayon",
    text: "Les mêmes modèles, du 36 au 45, avec le conseil de chaussant sur chaque fiche.",
    tone: "signal" as const,
    /* Le panneau femme est violet profond : le cyan du thème y ressort. */
    accent: "var(--color-sky)",
    image: media.heroFemme,
  },
];

/** Trois bandes promo, à l'image des tuiles « NEW ARRIVALS » du thème. */
const promoTiles = [
  {
    label: "Nouveautés",
    href: "/nouveautes",
    text: "Les derniers coloris entrés au catalogue",
    tone: "chalk" as const,
    image: media.promoNouveautes,
  },
  {
    label: "Chaussures",
    href: "/chaussures",
    text: "Le rayon complet — 13 modèles, 5 marques",
    tone: "graphite" as const,
    image: media.promoChaussures,
  },
  {
    label: "Ensembles",
    href: "/ensembles",
    text: "Le textile ouvre bientôt",
    tone: "signal" as const,
    image: media.promoEnsembles,
    soon: true,
  },
];

const ticker = [
  "Livraison offerte",
  "Premier retour offert",
  "Grille de tailles par marque",
  "13 modèles, 5 marques",
  "Paiement sécurisé",
];

/** Accueil — spec 2.1 (10 sections, D-020/D-021/D-022), habillage Azeno. */
export default async function HomePage() {
  const [featured, products, guides] = await Promise.all([fetchFeatured(8), fetchProducts(), fetchGuides()]);
  const featuredGuide = guides.find((g) => g.pillar);
  const secondaryGuides = guides.filter((g) => g !== featuredGuide).slice(0, 2);

  const highlightedReviews: { review: Review; productName: string }[] = products
    .flatMap((p) =>
      p.reviews.map((review) => ({ review, productName: p.name })),
    )
    .filter(({ review }) => review.rating === 5)
    .slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(organizationJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(webSiteJsonLd()) }}
      />

      {/* S3 — Hero scindé : deux panneaux plein cadre, mot contouré au centre. */}
      <section aria-labelledby="hero" className="bg-bark-900">
        <h1 id="hero" className="sr-only">
          Treize modèles, cinq marques. Baskets On, Nike, Saucony, ASICS et Salomon.
        </h1>
        <div className="grid lg:grid-cols-2">
          {heroPanels.map((panel) => (
            <Link
              key={panel.href}
              href={panel.href}
              className="group relative flex min-h-[58vh] items-center justify-center overflow-hidden lg:min-h-[76vh]"
            >
              {panel.image ? (
                <Image
                  src={panel.image}
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              ) : (
                <Placeholder
                  tone={panel.tone}
                  ratio="4 / 5"
                  className="absolute inset-0 h-full transition-transform duration-700 ease-out group-hover:scale-105"
                />
              )}
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-bark-900/30 bg-gradient-to-t from-bark-900/80 via-bark-900/20 to-bark-900/45"
              />
              <div className="relative flex flex-col items-center px-6 text-center">
                <p className="text-label text-white/80">{panel.kicker}</p>
                <HeroWord
                  word={panel.word}
                  color={panel.accent}
                  className="mt-3"
                />
                <p className="mt-4 max-w-xs text-body-sm text-white/80">{panel.text}</p>
                <span className="text-label mt-7 inline-flex items-center gap-3 border border-white/70 px-8 py-3.5 text-white transition-colors duration-250 group-hover:border-white group-hover:bg-white group-hover:text-bark-900">
                  Découvrir
                  <ArrowRight aria-hidden="true" className="size-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bandeau de réassurance en capitales — signature du thème sport. */}
      <div className="overflow-hidden bg-bark-900 py-3.5">
        <ul className="text-label flex flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 text-white lg:gap-x-10 lg:px-6">
          {ticker.map((item) => (
            <li key={item} className="flex items-center gap-8 lg:gap-10">
              {item}
              <span aria-hidden="true" className="text-volt">
                ✦
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* S4a — Trois bandes promo plein cadre. */}
      <section aria-labelledby="entrees" className="mx-auto max-w-page px-4 py-12 lg:px-6 lg:py-16">
        <h2 id="entrees" className="sr-only">
          Entrées rapides
        </h2>
        <ul className="grid gap-4 sm:grid-cols-3 lg:gap-6">
          {promoTiles.map((tile) => (
            <li key={tile.href}>
              <CategoryCard
                href={tile.href}
                label={tile.label}
                description={tile.text}
                tone={tile.tone}
                image={tile.image}
                soon={"soon" in tile ? tile.soon : undefined}
              />
            </li>
          ))}
        </ul>
      </section>

      {/* S5 — Sélection curée (H17 : ordre manuel), façon « TRENDING. » */}
      <section
        aria-labelledby="selection"
        id="selection"
        className="mx-auto max-w-page scroll-mt-24 px-4 py-12 lg:px-6 lg:py-16"
      >
        <SectionHeading
          id="selection"
          align="center"
          title="Les plus demandés"
          intro="Treize modèles au catalogue, remis en ordre à la main — jamais par un algorithme de vente."
          link={{ label: "Voir les nouveautés", href: "/nouveautes" }}
        />
        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
          {featured.map((product) => (
            <li key={product.slug}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </section>

      {/* S4b — Entrées marque. */}
      <section
        aria-labelledby="univers"
        className="mx-auto max-w-page px-4 py-12 lg:px-6 lg:py-16"
      >
        <SectionHeading id="univers" title="Choisir par marque" />
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {brandCategories.map((category) => (
            <li key={category.href}>
              <CategoryCard
                href={category.href}
                label={category.label}
                description={`${category.children
                  .slice(0, 3)
                  .map((c) => c.label)
                  .join(", ")}…`}
                tone={heroTones[category.href.slice(1) as Brand] ?? "chalk"}
                image={universeCards[category.href.slice(1) as keyof typeof universeCards]}
              />
            </li>
          ))}
        </ul>
      </section>

      {/* S6 — Bloc marque sur fond encre (héros / problème / guide). */}
      <section aria-labelledby="marque" className="bg-bark-900 text-white">
        <div className="mx-auto grid max-w-page gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-6 lg:py-24">
          <div className="order-2 lg:order-1">
            <p className="text-label text-volt">Notre parti pris</p>
            <h2 id="marque" className="font-display mt-4 text-h1 leading-none text-white">
              La bonne pointure, dès la première commande.
            </h2>
            <p className="mt-6 max-w-xl text-body text-white/70">
              La cause numéro un de retour sur une chaussure, c'est le
              chaussant. Nous publions donc la grille de tailles de chaque
              marque, en disant d'où elle vient : une seule des cinq est une
              grille officielle de fabricant, les autres sont des
              redistributions de revendeurs. Le chaussant particulier d'un
              modèle — avant-pied étroit, rodage long, taille au-dessus
              recommandée — est écrit sur sa fiche, pas dissimulé.
            </p>
            <Link
              href="/notre-histoire"
              className="text-label mt-7 inline-flex items-center gap-2 border-b border-volt pb-1 text-volt transition-colors duration-250 hover:border-white hover:text-white"
            >
              Notre histoire <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <ul className="mt-10 grid gap-8 sm:grid-cols-3">
              {pillars.map(({ Icon, label, text }) => (
                <li key={label} className="flex flex-col gap-2 border-t border-white/15 pt-4">
                  <Icon aria-hidden="true" className="size-6 text-volt" strokeWidth={1.75} />
                  <h3 className="text-label mt-1 text-white">{label}</h3>
                  <p className="text-body-sm text-white/65">{text}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="order-1 overflow-hidden lg:order-2">
            {media.blocMarque ? (
              <Image
                src={media.blocMarque}
                alt=""
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="h-auto w-full object-cover"
                style={{ aspectRatio: "4 / 3" }}
              />
            ) : (
              <Placeholder tone="signal" ratio="4 / 3" />
            )}
          </div>
        </div>
      </section>

      {/* S7 — Conseil incarné : 1 guide phare + 2 vignettes. */}
      <section
        aria-labelledby="conseils"
        className="mx-auto max-w-page px-4 py-12 lg:px-6 lg:py-16"
      >
        <SectionHeading
          id="conseils"
          title="Le conseil avant la vente"
          link={{ label: "Tous nos conseils", href: "/guides" }}
        />
        <div className="mt-8 grid gap-10">
          {featuredGuide && <EditorialCard guide={featuredGuide} featured />}
          <div className="grid gap-8 sm:grid-cols-2 lg:gap-6">
            {secondaryGuides.map((guide) => (
              <EditorialCard key={guide.slug} guide={guide} />
            ))}
          </div>
        </div>
      </section>

      {/* S8 — Preuve sociale (pas de widget tiers — H6).
          Masquée tant qu'aucun avis réel n'existe (audit 2026-08, MO-7). */}
      {highlightedReviews.length > 0 && (
        <section aria-labelledby="avis" className="bg-cream-300">
          <div className="mx-auto max-w-page px-4 py-12 lg:px-6 lg:py-16">
            <SectionHeading
              id="avis"
              align="center"
              title="Ils nous font confiance"
              intro="Retours d'acheteurs sur les modèles du catalogue."
            />
            <ul className="mt-10 grid gap-6 lg:grid-cols-3">
              {highlightedReviews.map(({ review, productName }) => (
                <li key={`${review.author}-${productName}`}>
                  <ReviewCard review={review} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* S9 — Newsletter (D-021 : jamais de pop-up). */}
      <section aria-labelledby="newsletter" className="bg-pine-700">
        <div className="mx-auto grid max-w-page gap-8 px-4 py-14 lg:grid-cols-2 lg:items-center lg:px-6 lg:py-16">
          <div>
            <h2 id="newsletter" className="font-display text-h2 leading-none text-white">
              Nouveaux coloris, une fois par mois
            </h2>
            <p className="mt-3 max-w-md text-body text-white/75">
              Nouveaux coloris et guides d'achat. Pas de spam, désinscription en
              un clic.
            </p>
          </div>
          <div className="lg:justify-self-end lg:pl-8">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
