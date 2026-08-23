import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CategoryCard,
  EditorialCard,
  ProductCard,
  SectionHeading,
} from "@/components/commerce";
import { PageHero } from "@/components/layout/PageHero/PageHero";
import { brandLabels, brands, getBrand, isBrand } from "@/lib/catalog";
import { fetchFeatured, fetchGuidesFor, fetchProducts, fetchSubcategories } from "@/lib/api";

import { categoryImages, universeBanners } from "@/lib/media";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import type { PlaceholderTone } from "@/components/commerce";

type Params = { marque: string };

/*
 * Les présentations de marque ne sont plus écrites ici : elles vivent dans le
 * référentiel (`lib/catalog/brands`), à côté de la grille de tailles et de sa
 * réserve de fiabilité. Un seul endroit à tenir à jour quand une marque entre
 * ou sort du catalogue.
 */
const CARD_TONES: PlaceholderTone[] = ["graphite", "chalk", "sand", "signal"];

export function generateStaticParams(): Params[] {
  return brands.map((b) => ({ marque: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { marque } = await params;
  if (!isBrand(marque)) return {};
  const brand = getBrand(marque);
  return {
    title: `${brand.label} — tous les modèles`,
    description: brand.tagline,
    alternates: { canonical: `/${marque}` },
  };
}

/** Gabarit A — page marque (spec Listing) : router vers le bon usage. */
export default async function BrandPage({ params }: { params: Promise<Params> }) {
  const { marque } = await params;
  if (!isBrand(marque)) notFound();

  const brand = getBrand(marque);
  const label = brandLabels[marque];
  const [subcats, brandProducts] = await Promise.all([
    fetchSubcategories(marque),
    fetchProducts(marque),
  ]);
  const bestSellers = brandProducts.slice(0, 4);
  const brandGuides = await fetchGuidesFor(marque, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            breadcrumbJsonLd([{ name: label, path: `/${marque}` }]),
          ),
        }}
      />

      {/* 1. En-tête d'univers — bandeau encre ou visuel de marque */}
      <PageHero
        kicker="Marque"
        title={label}
        intro={brand.intro}
        crumbs={[{ name: label, path: `/${marque}` }]}
        image={universeBanners[marque]}
      />

      <div className="mx-auto max-w-page px-4 pt-12 lg:px-6 lg:pt-16">
      {/* 2. Grille d'usages (D-012, D-055) */}
      <section aria-labelledby="sous-categories" className="pb-12 lg:pb-16">
        <h2 id="sous-categories" className="sr-only">
          Usages
        </h2>
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {subcats.map((subcat, index) => (
            <li key={subcat.slug}>
              <CategoryCard
                href={`/${marque}/${subcat.slug}`}
                label={subcat.label}
                productCount={brandProducts.filter((p) => p.subcategory === subcat.slug).length}
                tone={CARD_TONES[index % CARD_TONES.length]}
                image={categoryImages[`${marque}/${subcat.slug}`]}
              />
            </li>
          ))}
        </ul>
      </section>

      {/* 3. Best-sellers de l'univers */}
      {bestSellers.length > 0 && (
        <section aria-labelledby="best-sellers" className="pb-12 lg:pb-16">
          <SectionHeading
            id="best-sellers"
            title={`Les modèles ${label} les plus demandés`}
            link={{ label: "Voir les nouveautés", href: "/nouveautes" }}
          />
          <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {bestSellers.map((product) => (
              <li key={product.slug}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 4. Guides liés */}
      {brandGuides.length > 0 && (
        <section aria-labelledby="guides-univers" className="pb-16 lg:pb-24">
          <SectionHeading
            id="guides-univers"
            title="Nos conseils pour bien choisir"
            link={{ label: "Tous nos guides", href: "/guides" }}
          />
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {brandGuides.map((guide) => (
              <li key={guide.slug}>
                <EditorialCard guide={guide} />
              </li>
            ))}
          </ul>
        </section>
      )}
      </div>
    </>
  );
}
