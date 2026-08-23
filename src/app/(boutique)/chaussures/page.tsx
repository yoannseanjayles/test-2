import type { Metadata } from "next";
import { Suspense } from "react";
import { ListingExplorer, SeoTextBlock } from "@/components/commerce";
import { PageHero } from "@/components/layout/PageHero/PageHero";
import { fetchFeatured, fetchShoes } from "@/lib/api";
import { media } from "@/lib/media";
import { breadcrumbJsonLd, itemListJsonLd, jsonLdScript } from "@/lib/jsonld";
import { usageLinks, brandLinks } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Chaussures — le rayon complet",
  description:
    "Les treize modèles du catalogue, toutes marques confondues : On, Nike, Saucony, ASICS et Salomon. Filtrables par marque, pointure disponible, matière et prix.",
  alternates: { canonical: "/chaussures" },
};

/**
 * Rayon « Chaussures » — porte d'entrée de la navigation streetwear.
 *
 * C'est le seul listing transverse à tout le catalogue : les pages marque et
 * marque/usage restent les pages de référence pour le référencement (D-055),
 * celle-ci est la vitrine du rayon, avec toutes les facettes.
 */
export default async function ChaussuresPage() {
  // Rayon Chaussures : le textile a le sien, il n'a rien a faire ici.
  const [prods, fallback] = await Promise.all([fetchShoes(), fetchFeatured(3)]);
  const crumbs = [{ name: "Chaussures", path: "/chaussures" }];

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
        kicker="Rayon"
        title="Chaussures"
        intro={`Les ${prods.length} modèles du catalogue, toutes marques confondues. Chaque fiche donne la grille de tailles de sa marque et le chaussant du modèle.`}
        crumbs={crumbs}
        image={media.bandeauNouveautes}
      />

      <div className="mx-auto max-w-page px-4 pt-10 lg:px-6 lg:pt-12">
        <Suspense>
          <ListingExplorer products={prods} fallback={fallback} withBrandFacet />
        </Suspense>

        <SeoTextBlock
          title="Choisir une paire dans un catalogue court"
          paragraphs={[
            "Treize modèles, cinq marques, 88 coloris : le catalogue tient sur une page parce qu'il est choisi, pas agrégé. Chaque entrée a une raison d'être là — une silhouette d'archive rééditée, un daily trainer, une chaussure de trail passée en ville.",
            "La pointure est le premier motif de retour sur une chaussure. La facette « Pointure » filtre sur la disponibilité réelle, pas sur l'existence de la variante : cocher 42 montre les paires achetables en 42 aujourd'hui.",
            "Les grilles de tailles affichées viennent des marques quand elles les publient, de revendeurs sinon — et la fiche le dit à chaque fois plutôt que de laisser croire à une source unique.",
          ]}
          related={[
            { label: "Bien choisir sa pointure", href: "/guides/bien-choisir-sa-pointure" },
            ...usageLinks.slice(0, 3),
            ...brandLinks.slice(0, 2),
          ]}
        />
        <div className="pb-16" />
      </div>
    </>
  );
}
