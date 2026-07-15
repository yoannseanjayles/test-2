import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PenLine } from "lucide-react";
import { Accordion } from "@/components/ui";
import {
  Breadcrumb,
  EditorialCard,
  ProductCard,
  ProductView,
  ReviewCard,
  SectionHeading,
} from "@/components/commerce";
import { animalLabels, averageRating, isAnimal, products } from "@/lib/catalog";
import { fetchGuideForSubcategory, fetchProduct, fetchProducts, fetchProductsBySlugs, fetchSubcategory } from "@/lib/api";
import { getShippingConfig } from "@/lib/admin-settings";
import { formatPrice } from "@/lib/format";

import { breadcrumbJsonLd, productJsonLd } from "@/lib/jsonld";

type Params = { animal: string; sousCategorie: string; produit: string };

export function generateStaticParams(): Params[] {
  return products.map((p) => ({
    animal: p.animal,
    sousCategorie: p.subcategory,
    produit: p.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { animal, sousCategorie, produit } = await params;
  if (!isAnimal(animal)) return {};
  const product = await fetchProduct(animal, sousCategorie, produit);
  const subcat = await fetchSubcategory(animal, sousCategorie);
  if (!product || !subcat) return {};
  const animalName = animal === "nac" ? "NAC" : animal;
  return {
    title: `${product.name} — ${subcat.label} ${animalName}`,
    description: product.shortDescription,
    // Canonique unique par produit : les variantes ne créent pas d'URL (D-026).
    alternates: { canonical: `/${animal}/${sousCategorie}/${produit}` },
  };
}

/** Fiche produit (spec 2.1 PDP, D-024/D-025). */
export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { animal, sousCategorie, produit } = await params;
  if (!isAnimal(animal)) notFound();
  const [product, subcat] = await Promise.all([
    fetchProduct(animal, sousCategorie, produit),
    fetchSubcategory(animal, sousCategorie),
  ]);
  if (!product || !subcat) notFound();

  const crumbs = [
    { name: animalLabels[animal], path: `/${animal}` },
    { name: subcat.label, path: `/${animal}/${sousCategorie}` },
    { name: product.name, path: `/${animal}/${sousCategorie}/${produit}` },
  ];

  const pairsWith = await fetchProductsBySlugs(product.pairsWith);
  const guide = await fetchGuideForSubcategory(sousCategorie);
  const alsoLike = (await fetchProducts(animal))
    .filter((p) => p.slug !== product.slug && !product.pairsWith.includes(p.slug))
    .sort((a, b) => {
      const sameSubcatFirst =
        Number(b.subcategory === sousCategorie) - Number(a.subcategory === sousCategorie);
      return sameSubcatFirst || a.curatedRank - b.curatedRank;
    })
    .slice(0, 4);

  const rating = averageRating(product);
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: product.reviews.filter((r) => r.rating === stars).length,
  }));

  const detailItems = [
    ...product.details.map((d) => ({ title: d.title, content: d.content })),
    {
      title: "Livraison & retours",
      content: `Expédition en 24 h, livraison estimée 2–3 jours ouvrés (France, Belgique, Suisse, Luxembourg). Livraison offerte dès ${formatPrice((await getShippingConfig()).freeShippingCents)}. Premier retour offert, 30 jours pour changer d'avis.`,
    },
  ];

  return (
    <div className="mx-auto max-w-page px-4 pb-24 lg:px-6 lg:pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs)) }}
      />

      {/* S1 — Fil d'Ariane */}
      <div className="py-6">
        <Breadcrumb items={crumbs} />
      </div>

      {/* S2 + S3 — Galerie et bloc achat */}
      <ProductView product={product} />

      <div className="mx-auto max-w-3xl">
        {/* S4 — « Pourquoi nous l'avons choisi » (D-025) */}
        <section aria-labelledby="curation" className="mt-14 rounded-lg bg-sage-50 p-6 lg:p-8">
          <h2
            id="curation"
            className="font-heading flex items-center gap-2 text-h3 font-semibold text-bark-900"
          >
            <PenLine aria-hidden="true" className="size-5 text-pine-700" strokeWidth={1.75} />
            Pourquoi nous l'avons choisi
          </h2>
          <p className="mt-3 text-body text-bark-700">{product.curatorNote}</p>
          <p className="text-body-sm mt-3 font-semibold text-bark-900">— L'équipe chien et chat</p>
        </section>

        {/* S5 — Caractéristiques en accordéons (D-024 : pas d'onglets) */}
        <section aria-labelledby="caracteristiques" className="mt-14">
          <h2 id="caracteristiques" className="sr-only">
            Caractéristiques
          </h2>
          <Accordion items={detailItems} defaultOpen={0} />
        </section>
      </div>

      {/* S6 — Compléments curés */}
      {pairsWith.length > 0 && (
        <section aria-labelledby="complements" className="mt-16">
          <SectionHeading id="complements" title="Souvent achetés ensemble" />
          <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {pairsWith.map((p) => (
              <li key={p.slug}>
                <ProductCard product={p} className="h-full" />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* S7 — Maillage éditorial */}
      {guide && (
        <section aria-labelledby="guide-lie" className="mt-16">
          <h2 id="guide-lie" className="sr-only">
            Guide lié
          </h2>
          <EditorialCard guide={guide} featured />
        </section>
      )}

      {/* S8 — Avis clients */}
      <section aria-labelledby="avis" id="avis" className="mt-16 scroll-mt-24">
        <SectionHeading id="avis-titre" title="Avis clients" />
        {product.reviews.length > 0 && rating !== null ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
            <div>
              <p className="font-display text-display font-[560] text-bark-900">
                {rating.toLocaleString("fr-FR")}
                <span className="text-h3 text-bark-700"> / 5</span>
              </p>
              <p className="text-body-sm mt-1 text-bark-700">
                {product.reviews.length} avis vérifié{product.reviews.length > 1 ? "s" : ""}
              </p>
              <ul className="mt-4 flex flex-col gap-1.5">
                {distribution.map(({ stars, count }) => (
                  <li key={stars} className="flex items-center gap-2 text-caption text-bark-700">
                    <span className="w-8 shrink-0">{stars} ★</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-cream-300">
                      <span
                        className="block h-full rounded-full bg-caramel-500"
                        style={{
                          width: `${(count / product.reviews.length) * 100}%`,
                        }}
                      />
                    </span>
                    <span className="w-4 shrink-0 text-right">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {product.reviews.map((review) => (
                <li key={`${review.author}-${review.date}`}>
                  <ReviewCard review={review} />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-6 text-body text-bark-700">
            Soyez le premier à donner votre avis — nous sollicitons chaque
            acheteur par e-mail après la livraison.
          </p>
        )}
      </section>

      {/* S9 — « Vous aimerez aussi » */}
      {alsoLike.length > 0 && (
        <section aria-labelledby="aimerez-aussi" className="mt-16">
          <SectionHeading id="aimerez-aussi" title="Vous aimerez aussi" />
          <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {alsoLike.map((p) => (
              <li key={p.slug}>
                <ProductCard product={p} className="h-full" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
