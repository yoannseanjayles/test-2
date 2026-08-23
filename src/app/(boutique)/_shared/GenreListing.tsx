import { Suspense } from "react";
import { ListingExplorer } from "@/components/commerce";
import { PageHero } from "@/components/layout/PageHero/PageHero";
import { fetchFeatured, fetchProducts } from "@/lib/api";
import type { Genre } from "@/lib/catalog";
import { breadcrumbJsonLd, itemListJsonLd, jsonLdScript } from "@/lib/jsonld";
import type { StaticImageData } from "next/image";

/**
 * Gabarit partagé des rayons Homme et Femme.
 *
 * Un modèle marqué `mixte` appartient aux deux rayons : c'est l'état normal
 * d'un catalogue de sneakers, pas un fourre-tout (D-056). Les deux pages
 * affichent donc aujourd'hui le même nombre de modèles, et le disent en
 * toutes lettres plutôt que de laisser croire à deux assortiments distincts.
 *
 * Leur canonique pointe vers `/chaussures` : trois URLs pour un même
 * assortiment, c'est un contenu dupliqué que Google arbitrerait à notre
 * place. Le rayon existe pour le visiteur, la page de référence reste le
 * listing complet.
 */
export async function GenreListing({
  genre,
  title,
  intro,
  image,
}: {
  genre: Genre;
  title: string;
  intro: string;
  image?: StaticImageData;
}) {
  const [all, fallback] = await Promise.all([fetchProducts(), fetchFeatured(3)]);
  const prods = all.filter(
    (p) => p.genres.includes(genre) || p.genres.includes("mixte"),
  );
  const crumbs = [{ name: title, path: `/${genre}` }];

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

      <PageHero kicker="Rayon" title={title} intro={intro} crumbs={crumbs} image={image} />

      <div className="mx-auto max-w-page px-4 pt-10 lg:px-6 lg:pt-12">
        <p className="mb-8 border-l-2 border-volt bg-cream-300 p-4 text-body-sm text-bark-700">
          Les treize modèles du catalogue sont <strong>unisexes</strong> : ils
          apparaissent dans les deux rayons, avec la même grille de tailles. Les
          pointures disponibles, elles, diffèrent d'un modèle à l'autre — la
          facette « Pointure » filtre sur le stock réel.
        </p>

        <Suspense>
          <ListingExplorer products={prods} fallback={fallback} withBrandFacet />
        </Suspense>
        <div className="pb-16" />
      </div>
    </>
  );
}
