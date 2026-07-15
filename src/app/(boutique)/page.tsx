import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { BadgeCheck, Leaf, MessagesSquare } from "lucide-react";
import {
  CategoryCard,
  EditorialCard,
  ProductCard,
  ReviewCard,
  SectionHeading,
} from "@/components/commerce";
import { NewsletterForm } from "@/components/layout/Footer/NewsletterForm";
import { animalCategories } from "@/lib/navigation";
import type { Review } from "@/lib/catalog";
import { fetchFeatured, fetchGuides, fetchProducts } from "@/lib/api";
import { getShippingConfig } from "@/lib/admin-settings";
import { formatPrice } from "@/lib/format";

import { media, universeCards } from "@/lib/media";
import { organizationJsonLd, webSiteJsonLd } from "@/lib/jsonld";

export async function generateMetadata(): Promise<Metadata> {
  const seuil = formatPrice((await getShippingConfig()).freeShippingCents);
  return {
    title: "Accessoires premium pour chiens, chats & NAC — chien et chat",
    description: `Une sélection exigeante de colliers, couchages et jouets — choisis pour leur qualité, dessinés pour durer. Livraison offerte dès ${seuil}.`,
  };
}

const pillars = [
  { Icon: Leaf, label: "Matériaux durables", text: "Cuir, laine, bois : des matières nobles qui vieillissent bien." },
  { Icon: BadgeCheck, label: "Sélection exigeante", text: "Chaque produit est testé et comparé avant d'entrer au catalogue." },
  { Icon: MessagesSquare, label: "Conseil d'experts", text: "Vétérinaires et éducateurs relisent nos guides et nos choix." },
];

const heroTones: Record<string, "caramel" | "sage" | "terracotta"> = {
  chien: "caramel",
  chat: "sage",
  nac: "terracotta",
};

/** Accueil — spec 2.1 (10 sections, D-020/D-021/D-022). */
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
  const allReviews = products.flatMap((p) => p.reviews);
  const globalAverage =
    Math.round(
      (allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length) * 10,
    ) / 10;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd()) }}
      />

      {/* S3 — Hero statique (D-020) : M-HOME-01, texte posé sur l'espace négatif gauche du visuel. */}
      <section className="relative overflow-hidden">
        <Image
          src={media.heroHome}
          alt="Un golden retriever installé sur un couchage sauge, collier et laisse en cuir caramel suspendus au mur"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_center]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-cream-100/95 via-cream-100/60 to-transparent lg:via-cream-100/30"
        />
        <div className="relative mx-auto flex min-h-[60vh] max-w-page flex-col justify-center px-4 py-16 lg:min-h-[75vh] lg:px-6">
          <h1 className="font-display max-w-3xl text-display font-[560] text-bark-900">
            Des accessoires d'exception pour ceux qui comptent le plus.
          </h1>
          <p className="mt-6 max-w-xl text-body text-bark-700">
            Une sélection exigeante de colliers, couchages et jouets — choisis
            pour leur qualité, dessinés pour durer.
          </p>
          <div className="mt-8">
            <a
              href="#selection"
              className="text-label inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-action px-6 py-3 text-white transition duration-150 ease-out hover:-translate-y-px hover:bg-action-hover"
            >
              Découvrir la sélection
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-page px-4 lg:px-6">
        {/* S4 — Entrées univers (mission n°2 : router en 1 clic). */}
        <section aria-labelledby="univers" className="py-12 lg:py-16">
          <SectionHeading id="univers" title="Choisir par animal" />
          <ul className="mt-8 grid gap-6 sm:grid-cols-3">
            {animalCategories.map((category) => (
              <li key={category.href}>
                <CategoryCard
                  href={category.href}
                  label={category.label}
                  description={`${category.children
                    .slice(0, 3)
                    .map((c) => c.label)
                    .join(", ")}…`}
                  tone={heroTones[category.href.slice(1)] ?? "cream"}
                  image={universeCards[category.href.slice(1) as keyof typeof universeCards]}
                />
              </li>
            ))}
          </ul>
        </section>

        {/* S5 — Sélection curée (H17 : ordre manuel). */}
        <section aria-labelledby="selection" id="selection" className="scroll-mt-24 py-12 lg:py-16">
          <SectionHeading
            id="selection-titre"
            title="Nos indispensables"
            link={{ label: "Voir tous les best-sellers", href: "/nouveautes" }}
          />
          <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {featured.map((product) => (
              <li key={product.slug}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* S6 — Bloc marque (héros / problème / guide). */}
      <section aria-labelledby="marque" className="bg-cream-300">
        <div className="mx-auto grid max-w-page gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-6 lg:py-24">
          <div className="order-2 lg:order-1">
            <h2 id="marque" className="font-display text-h1 font-[560] text-bark-900">
              Vous cherchez le meilleur pour lui. Nous l'avons déjà trouvé.
            </h2>
            <p className="mt-6 max-w-xl text-body text-bark-700">
              Entre les marketplaces saturées et les avis invérifiables, choisir
              un bon accessoire est devenu un travail à plein temps. Chez chien
              et chat, nous le faisons pour vous : chaque produit du catalogue a
              été testé, comparé et validé par notre équipe et ses experts. Ce
              que nous ne mettrions pas entre les pattes de nos propres animaux
              n'entre pas ici.
            </p>
            <Link
              href="/notre-histoire"
              className="text-label mt-6 inline-flex items-center gap-2 text-action transition-colors duration-150 hover:text-action-hover"
            >
              Notre histoire <span aria-hidden="true">→</span>
            </Link>
            <ul className="mt-10 grid gap-6 sm:grid-cols-3">
              {pillars.map(({ Icon, label, text }) => (
                <li key={label} className="flex flex-col gap-2">
                  <Icon aria-hidden="true" className="size-6 text-pine-700" strokeWidth={1.75} />
                  <h3 className="font-heading text-body font-semibold text-bark-900">{label}</h3>
                  <p className="text-body-sm text-bark-700">{text}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="order-1 overflow-hidden rounded-lg lg:order-2">
            <Image
              src={media.blocMarque}
              alt="Mains d'artisan cousant un collier en cuir caramel sur un établi en bois"
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="h-auto w-full object-cover"
              style={{ aspectRatio: "4 / 3" }}
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-page px-4 lg:px-6">
        {/* S7 — Conseil incarné : 1 guide phare + 2 vignettes. */}
        <section aria-labelledby="conseils" className="py-12 lg:py-16">
          <SectionHeading
            id="conseils"
            title="Le conseil avant la vente"
            link={{ label: "Tous nos conseils", href: "/guides" }}
          />
          <div className="mt-8 grid gap-6">
            {featuredGuide && <EditorialCard guide={featuredGuide} featured />}
            <div className="grid gap-6 sm:grid-cols-2">
              {secondaryGuides.map((guide) => (
                <EditorialCard key={guide.slug} guide={guide} />
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* S8 — Preuve sociale (fond teinté, pas de widget tiers — H6). */}
      <section aria-labelledby="avis" className="bg-sage-50">
        <div className="mx-auto max-w-page px-4 py-12 lg:px-6 lg:py-16">
          <SectionHeading id="avis" title="Ils nous font confiance" />
          <p className="mt-2 text-body-sm text-bark-700">
            {globalAverage.toLocaleString("fr-FR")} sur 5 — {allReviews.length} avis
            vérifiés sur l'ensemble du catalogue.
          </p>
          <ul className="mt-8 grid gap-6 lg:grid-cols-3">
            {highlightedReviews.map(({ review, productName }) => (
              <li key={`${review.author}-${productName}`}>
                <ReviewCard review={review} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* S9 — Newsletter (D-021 : jamais de pop-up). */}
      <section aria-labelledby="newsletter" className="mx-auto max-w-page px-4 py-12 lg:px-6 lg:py-16">
        <div className="mx-auto max-w-xl text-center">
          <h2 id="newsletter" className="font-heading text-h2 font-semibold text-bark-900">
            Conseils d'experts, une fois par mois
          </h2>
          <p className="mt-3 text-body text-bark-700">
            Nouveautés choisies et guides pratiques. Pas de spam, désinscription
            en un clic.
          </p>
          <div className="mx-auto mt-2 max-w-sm text-left">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
