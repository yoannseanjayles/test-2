import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumb, ListingExplorer } from "@/components/commerce";
import { getFeatured, getNewProducts } from "@/lib/catalog";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Nouveautés — les dernières pièces sélectionnées",
  description:
    "Les dernières entrées au catalogue chien et chat, toutes espèces confondues : chaque nouveauté a passé la même sélection exigeante.",
  alternates: { canonical: "/nouveautes" },
};

/** Variante du gabarit B (spec Listing) : facette Univers, tri « Nouveautés ». */
export default function NouveautesPage() {
  const prods = getNewProducts();
  const crumbs = [{ name: "Nouveautés", path: "/nouveautes" }];

  return (
    <div className="mx-auto max-w-page px-4 lg:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd(prods)) }}
      />

      <div className="pt-6">
        <Breadcrumb items={crumbs} />
      </div>

      <header className="max-w-3xl py-8">
        <h1 className="font-display text-h1 font-[560] text-bark-900">Nouveautés</h1>
        <p className="mt-3 text-body text-bark-700">
          Les dernières pièces entrées au catalogue — sélectionnées avec la même
          exigence, toutes espèces confondues.
        </p>
      </header>

      <Suspense>
        <ListingExplorer
          products={prods}
          fallback={getFeatured(3)}
          withUniverseFacet
          defaultSort="nouveautes"
        />
      </Suspense>
      <div className="pb-16" />
    </div>
  );
}
