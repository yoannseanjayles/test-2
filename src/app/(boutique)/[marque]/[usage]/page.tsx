import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ListingExplorer, SeoTextBlock } from "@/components/commerce";
import { PageHero } from "@/components/layout/PageHero/PageHero";
import { brandLabels, getBrand, isBrand, isUsage, subcategories } from "@/lib/catalog";
import { fetchFeatured, fetchGuideForSubcategory, fetchProducts, fetchSubcategories, fetchSubcategory } from "@/lib/api";

import { breadcrumbJsonLd, itemListJsonLd, jsonLdScript } from "@/lib/jsonld";

type Params = { marque: string; usage: string };

export function generateStaticParams(): Params[] {
  return subcategories.map((s) => ({ marque: s.brand, usage: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { marque, usage } = await params;
  if (!isBrand(marque) || !isUsage(usage)) return {};
  const subcat = await fetchSubcategory(marque, usage);
  if (!subcat) return {};
  return {
    title: `${brandLabels[marque]} ${subcat.label} — toutes les paires`,
    description: subcat.description,
    // Canonique vers la catégorie nue : les facettes en query-string
    // n'engendrent pas d'URLs indexables (D-028).
    alternates: { canonical: `/${marque}/${usage}` },
  };
}

/** Gabarit B — page sous-catégorie : listing à facettes (spec 2.1 Listing). */
export default async function SubcategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { marque, usage } = await params;
  if (!isBrand(marque) || !isUsage(usage)) notFound();
  const subcat = await fetchSubcategory(marque, usage);
  if (!subcat) notFound();

  const prods = await fetchProducts(marque, usage);
  const label = brandLabels[marque];
  const brandInfo = getBrand(marque);
  const guide = await fetchGuideForSubcategory(usage);
  const siblings = (await fetchSubcategories(marque)).filter((s) => s.slug !== usage);

  const crumbs = [
    { name: label, path: `/${marque}` },
    { name: subcat.label, path: `/${marque}/${usage}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbJsonLd(crumbs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(itemListJsonLd(prods)) }}
      />

      {/* S1 — En-tête */}
      <PageHero
        kicker={label}
        title={`${label} ${subcat.label}`}
        intro={subcat.description}
        crumbs={crumbs}
        tone="light"
      />

      <div className="mx-auto max-w-page px-4 pt-10 lg:px-6 lg:pt-12">
      <Suspense>
        <ListingExplorer
          products={prods}
          fallback={await fetchFeatured(3, marque)}
          editorialGuide={guide}
        />
      </Suspense>

      {/* S5 — Bloc SEO dépliable + maillage */}
      <SeoTextBlock
        title={`${label} ${subcat.label} : ce qu'il faut regarder`}
        paragraphs={[
          subcat.description,
          brandInfo.intro,
          brandInfo.sizeChartVerified
            ? `La grille de tailles ${label} affichée sur chaque fiche est la grille officielle de la marque. En cas de doute entre deux pointures, comparez la longueur de votre pied à la colonne « ${brandInfo.lengthLabel} » plutôt que de reporter votre pointure habituelle.`
            : `La grille de tailles ${label} affichée sur chaque fiche provient d'un revendeur et n'est pas confirmée par la marque : nous le signalons plutôt que de le taire. Comparez la longueur de votre pied à la colonne « ${brandInfo.lengthLabel} » avant de commander.`,
        ]}
        related={[
          ...(guide
            ? [{ label: guide.title, href: `/guides/${guide.slug}` }]
            : []),
          // Le guide pointure n'est ajouté que s'il n'est pas déjà le guide
          // rattaché à l'usage — sinon le même lien apparaît deux fois.
          ...(guide?.slug === "bien-choisir-sa-pointure"
            ? []
            : [{ label: "Bien choisir sa pointure", href: "/guides/bien-choisir-sa-pointure" }]),
          ...siblings.slice(0, 3).map((s) => ({
            label: `${label} ${s.label}`,
            href: `/${marque}/${s.slug}`,
          })),
        ]}
      />
      <div className="pb-16" />
      </div>
    </>
  );
}
