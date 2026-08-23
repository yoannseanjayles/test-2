import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { ListingExplorer } from "@/components/commerce";
import { PageHero } from "@/components/layout/PageHero/PageHero";
import { fetchFeatured, fetchNewProducts } from "@/lib/api";
import { media } from "@/lib/media";
import { breadcrumbJsonLd, itemListJsonLd, jsonLdScript } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Nouveautés — les derniers modèles entrés au catalogue",
  description:
    "Les derniers modèles entrés au catalogue, toutes marques confondues.",
  alternates: { canonical: "/nouveautes" },
};

/** Variante du gabarit B (spec Listing) : facette Marque, tri « Nouveautés ». */
export default async function NouveautesPage() {
  const [prods, fallback] = await Promise.all([fetchNewProducts(), fetchFeatured(3)]);
  const crumbs = [{ name: "Nouveautés", path: "/nouveautes" }];

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

      <PageHero
        kicker="Catalogue"
        title="Nouveautés"
        intro="Les derniers modèles entrés au catalogue, toutes marques confondues."
        crumbs={crumbs}
        image={media.bandeauNouveautes}
      />

      <div className="mx-auto max-w-page px-4 pt-10 lg:px-6 lg:pt-12">
      <Suspense>
        <ListingExplorer
          products={prods}
          fallback={fallback}
          withBrandFacet
          defaultSort="nouveautes"
        />
      </Suspense>
      <div className="pb-16" />
      </div>
    </>
  );
}
