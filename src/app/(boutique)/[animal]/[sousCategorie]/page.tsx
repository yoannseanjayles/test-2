import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumb, ListingExplorer, SeoTextBlock } from "@/components/commerce";
import {
  animalLabels,
  getFeatured,
  getProducts,
  getSubcategories,
  getSubcategory,
  isAnimal,
  subcategories,
} from "@/lib/catalog";
import { getGuideForSubcategory } from "@/lib/guides";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/jsonld";

type Params = { animal: string; sousCategorie: string };

export function generateStaticParams(): Params[] {
  return subcategories.map((s) => ({ animal: s.animal, sousCategorie: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { animal, sousCategorie } = await params;
  if (!isAnimal(animal)) return {};
  const subcat = getSubcategory(animal, sousCategorie);
  if (!subcat) return {};
  const animalName = animal === "nac" ? "NAC" : animal;
  return {
    title: `${subcat.label} pour ${animalName} — sélection premium`,
    description: subcat.description,
    // Canonique vers la catégorie nue : les facettes en query-string
    // n'engendrent pas d'URLs indexables (D-028).
    alternates: { canonical: `/${animal}/${sousCategorie}` },
  };
}

/** Gabarit B — page sous-catégorie : listing à facettes (spec 2.1 Listing). */
export default async function SubcategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { animal, sousCategorie } = await params;
  if (!isAnimal(animal)) notFound();
  const subcat = getSubcategory(animal, sousCategorie);
  if (!subcat) notFound();

  const prods = getProducts(animal, sousCategorie);
  const label = animalLabels[animal];
  const animalName = animal === "nac" ? "NAC" : animal;
  const guide = getGuideForSubcategory(sousCategorie);
  const siblings = getSubcategories(animal).filter((s) => s.slug !== sousCategorie);

  const crumbs = [
    { name: label, path: `/${animal}` },
    { name: subcat.label, path: `/${animal}/${sousCategorie}` },
  ];

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

      {/* S1 — En-tête */}
      <header className="max-w-3xl py-8">
        <h1 className="font-display text-h1 font-[560] text-bark-900">
          {subcat.label} pour {animalName}
        </h1>
        <p className="mt-3 text-body text-bark-700">{subcat.description}</p>
      </header>

      <Suspense>
        <ListingExplorer
          products={prods}
          fallback={getFeatured(3, animal)}
          editorialGuide={guide}
        />
      </Suspense>

      {/* S5 — Bloc SEO dépliable + maillage */}
      <SeoTextBlock
        title={`Bien choisir : ${subcat.label.toLowerCase()} pour ${animalName}`}
        paragraphs={[
          subcat.description,
          `Chaque référence de cette sélection ${subcat.label.toLowerCase()} a passé notre grille d'évaluation : matières, fabrication, confort animal et durabilité. Nous préférons un catalogue court et sûr à un rayon infini.`,
          "Un doute sur la taille ou la matière ? Nos guides d'experts détaillent les critères de choix, mesures à l'appui.",
        ]}
        related={[
          ...(guide
            ? [{ label: guide.title, href: `/guides/${guide.slug}` }]
            : []),
          ...siblings.slice(0, 4).map((s) => ({
            label: `${s.label} pour ${animalName}`,
            href: `/${animal}/${s.slug}`,
          })),
        ]}
      />
      <div className="pb-16" />
    </div>
  );
}
