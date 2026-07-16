import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductCard, EditorialCard } from "@/components/commerce";

import { fetchGuides, fetchProducts, fetchProductsBySlugs, fetchFeatured } from "@/lib/api";
import { SearchForm } from "./SearchForm";

/** Comparaison insensible aux accents et à la casse (audit S-4). */
function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export const metadata: Metadata = {
  title: "Recherche",
  robots: { index: false }, // non indexée (sitemap 1.2)
};

/** Recherche produits + guides (variante gabarit B) — requête en base. */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim().slice(0, 80);

  let foundProducts: Awaited<ReturnType<typeof fetchProductsBySlugs>> = [];
  let foundGuides: Awaited<ReturnType<typeof fetchGuides>> = [];
  if (query.length >= 2) {
    // Filtrage normalisé en mémoire (catalogue curé de petite taille) :
    // « echarpe » trouve « écharpe », quel que soit le driver SQL.
    const q = normalize(query);
    foundProducts = (await fetchProducts()).filter((p) =>
      [p.name, p.shortDescription, p.material, p.brand].some((field) =>
        normalize(field).includes(q),
      ),
    );
    foundGuides = (await fetchGuides()).filter(
      (g) => normalize(g.title).includes(q) || normalize(g.excerpt).includes(q),
    );
  }
  const fallback = query.length >= 2 && foundProducts.length === 0 ? await fetchFeatured(3) : [];

  return (
    <div className="mx-auto max-w-page px-4 py-12 lg:px-6">
      <h1 className="font-display text-h1 font-[560] text-bark-900">
        {query ? `Résultats pour « ${query} »` : "Recherche"}
      </h1>
      <Suspense>
        <SearchForm initialQuery={query} />
      </Suspense>

      {query.length >= 2 && (
        <>
          <section aria-labelledby="res-produits" className="mt-10">
            <h2 id="res-produits" className="font-heading text-h2 font-semibold text-bark-900">
              Produits ({foundProducts.length})
            </h2>
            {foundProducts.length > 0 ? (
              <ul className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
                {foundProducts.map((p) => (
                  <li key={p.slug}><ProductCard product={p} className="h-full" /></li>
                ))}
              </ul>
            ) : (
              <div className="mt-4">
                <p className="text-body text-bark-700">
                  Aucun produit ne correspond — essayez « collier », « couchage », « jouet »…
                </p>
                {fallback.length > 0 && (
                  <ul className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
                    {fallback.map((p) => (
                      <li key={p.slug}><ProductCard product={p} className="h-full" /></li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>
          {foundGuides.length > 0 && (
            <section aria-labelledby="res-guides" className="mt-12">
              <h2 id="res-guides" className="font-heading text-h2 font-semibold text-bark-900">
                Guides ({foundGuides.length})
              </h2>
              <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {foundGuides.map((g) => (
                  <li key={g.slug}><EditorialCard guide={g} className="h-full" /></li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
