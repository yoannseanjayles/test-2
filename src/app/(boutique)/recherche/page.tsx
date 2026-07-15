import type { Metadata } from "next";
import { Suspense } from "react";
import { ilike, or } from "drizzle-orm";
import { ProductCard, EditorialCard } from "@/components/commerce";
import { getDb } from "@/db";
import { products as productsTable } from "@/db/schema";

import { fetchGuides, fetchProductsBySlugs, fetchFeatured } from "@/lib/api";
import { SearchForm } from "./SearchForm";

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
    const db = await getDb();
    const pattern = `%${query}%`;
    const rows = await db
      .select({ slug: productsTable.slug })
      .from(productsTable)
      .where(or(
        ilike(productsTable.name, pattern),
        ilike(productsTable.shortDescription, pattern),
        ilike(productsTable.material, pattern),
        ilike(productsTable.brand, pattern),
      ));
    foundProducts = await fetchProductsBySlugs(rows.map((r) => r.slug));
    const lower = query.toLowerCase();
    foundGuides = (await fetchGuides()).filter(
      (g) => g.title.toLowerCase().includes(lower) || g.excerpt.toLowerCase().includes(lower),
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
