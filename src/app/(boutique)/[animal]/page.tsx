import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CategoryCard,
  EditorialCard,
  ProductCard,
  SectionHeading,
  Breadcrumb,
} from "@/components/commerce";
import {
  animalLabels,
  getFeatured,
  getProducts,
  getSubcategories,
  isAnimal,
  type Animal,
} from "@/lib/catalog";
import { getGuidesFor } from "@/lib/guides";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import type { PlaceholderTone } from "@/components/commerce";

type Params = { animal: string };

const intros: Record<Animal, string> = {
  chien:
    "Colliers, couchages, jouets : chaque accessoire de cet univers a été porté, mordillé et testé par de vrais chiens avant d'être retenu. Le superflu n'a pas passé la sélection.",
  chat: "Cocons, griffoirs, jeux : une sélection pensée avec des comportementalistes félins, pour des objets que votre chat adopte et que votre salon assume.",
  nac: "Lapins, rongeurs, furets : des matériaux sans risque à ronger et des habitats bien conçus, choisis avec la même exigence que pour les chiens et les chats.",
};

const tones: Record<Animal, PlaceholderTone[]> = {
  chien: ["caramel", "sage", "cream", "terracotta"],
  chat: ["sage", "cream", "terracotta", "caramel"],
  nac: ["terracotta", "cream", "sage", "caramel"],
};

export function generateStaticParams(): Params[] {
  return [{ animal: "chien" }, { animal: "chat" }, { animal: "nac" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { animal } = await params;
  if (!isAnimal(animal)) return {};
  return {
    title: `Accessoires premium pour ${animal === "nac" ? "NAC" : animal}`,
    description: intros[animal],
  };
}

/** Gabarit A — page animal (spec Listing) : router vers la bonne sous-catégorie. */
export default async function AnimalPage({ params }: { params: Promise<Params> }) {
  const { animal } = await params;
  if (!isAnimal(animal)) notFound();

  const label = animalLabels[animal];
  const subcats = getSubcategories(animal);
  const bestSellers = getFeatured(4, animal);
  const animalGuides = getGuidesFor(animal, 3);

  return (
    <div className="mx-auto max-w-page px-4 lg:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([{ name: label, path: `/${animal}` }]),
          ),
        }}
      />

      <div className="pt-6">
        <Breadcrumb items={[{ name: label, path: `/${animal}` }]} />
      </div>

      {/* 1. En-tête d'univers */}
      <header className="max-w-3xl py-8 lg:py-12">
        <h1 className="font-display text-h1 font-[560] text-bark-900">
          Accessoires pour {animal === "nac" ? "NAC" : animal}
        </h1>
        <p className="mt-4 text-body text-bark-700">{intros[animal]}</p>
      </header>

      {/* 2. Grille de sous-catégories (D-012) */}
      <section aria-labelledby="sous-categories" className="pb-12 lg:pb-16">
        <h2 id="sous-categories" className="sr-only">
          Sous-catégories
        </h2>
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {subcats.map((subcat, index) => (
            <li key={subcat.slug}>
              <CategoryCard
                href={`/${animal}/${subcat.slug}`}
                label={subcat.label}
                productCount={getProducts(animal, subcat.slug).length}
                tone={tones[animal][index % tones[animal].length]}
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
            title={`Les indispensables ${label.toLowerCase() === "nac" ? "NAC" : label.toLowerCase()}`}
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

      {/* 4. Guides de l'univers */}
      {animalGuides.length > 0 && (
        <section aria-labelledby="guides-univers" className="pb-16 lg:pb-24">
          <SectionHeading
            id="guides-univers"
            title="Nos conseils pour bien choisir"
            link={{ label: "Tous nos guides", href: "/guides" }}
          />
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {animalGuides.map((guide) => (
              <li key={guide.slug}>
                <EditorialCard guide={guide} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
