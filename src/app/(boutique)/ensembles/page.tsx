import type { Metadata } from "next";
import { Suspense } from "react";
import { ListingExplorer, SeoTextBlock } from "@/components/commerce";
import { PageHero } from "@/components/layout/PageHero/PageHero";
import { UnderConstruction } from "@/components/layout/UnderConstruction/UnderConstruction";
import { fetchFeatured, fetchTextile } from "@/lib/api";
import { media } from "@/lib/media";
import { breadcrumbJsonLd, itemListJsonLd, jsonLdScript } from "@/lib/jsonld";
import { brandLinks } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Ensembles de sport, sweats et joggings",
  description:
    "Le rayon textile : ensembles molleton, sweats à capuche, joggings, coupe-vent et polaires. Du XS au XXL, filtrables par marque, taille, couleur et prix.",
  alternates: { canonical: "/ensembles" },
};

/**
 * Rayon Ensembles — listing textile.
 *
 * La page était un « bientôt » : elle annonçait le rayon dans la navigation
 * sans rien derrière. Elle sert désormais le même gabarit que Chaussures,
 * colonne de facettes comprise — la seule différence tient à l'échelle de
 * tailles, vêtement plutôt que pointures, résolue dans le référentiel.
 *
 * Le garde-fou reste : si l'assortiment revient vide (base non seedée, tout
 * archivé), on retombe sur le bandeau d'attente plutôt que sur une grille
 * vide, qui laisserait croire à une boutique cassée.
 */
export default async function EnsemblesPage() {
  const [prods, fallback] = await Promise.all([fetchTextile(), fetchFeatured(3)]);
  const crumbs = [{ name: "Ensembles", path: "/ensembles" }];

  if (prods.length === 0) {
    return (
      <>
        <PageHero
          kicker="Rayon"
          title="Ensembles de sport"
          intro="Le textile ouvre après les chaussures."
          crumbs={crumbs}
          image={media.bandeauEnsembles}
        />
        <UnderConstruction
          title="Le rayon textile arrive"
          milestone="prochain jalon catalogue"
          description="Ensembles de sport, sweats à capuche, joggings : le rayon est déjà dans la navigation parce qu'il est décidé, pas parce qu'il est prêt. Nous préférons annoncer la couleur plutôt que d'ouvrir une grille vide. En attendant, les chaussures, elles, sont en stock."
        />
      </>
    );
  }

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
        title="Ensembles de sport"
        intro={`${prods.length} pièces à porter avant, après ou pendant l'effort — la fiche dit laquelle est faite pour quoi. Du XS au XXL.`}
        crumbs={crumbs}
        image={media.bandeauEnsembles}
      />

      <div className="mx-auto max-w-page px-4 pt-10 lg:px-6 lg:pt-12">
        <Suspense>
          <ListingExplorer products={prods} fallback={fallback} withBrandFacet />
        </Suspense>

        <SeoTextBlock
          title="Molleton ou maille technique : deux vêtements différents"
          paragraphs={[
            "Le rayon tient en deux familles, et les confondre est le meilleur moyen d'être déçu. Le molleton — ensembles et sweats — est chaud et confortable, mais il retient l'humidité : c'est un vêtement d'avant et d'après séance. La maille technique évacue et sèche vite : c'est celui qu'on porte pendant.",
            "Entre les deux, les pièces d'extérieur. Le coupe-vent arrête le vent et une averse courte ; il est déperlant, pas imperméable, et la fiche le dit plutôt que de laisser croire le contraire. La polaire légère est une seconde couche : seule, elle ne coupe pas le vent.",
            "Les tailles vont du XS au XXL, en échelle commune. Aucune marque du rayon n'a publié de table de mesures pour ces pièces : nous n'en inventons pas, et les conseils de taille parlent de coupe — ample, droite, près du corps — plutôt que de centimètres qui n'existent pas.",
          ]}
          related={[
            { label: "Bien choisir sa pointure", href: "/guides/bien-choisir-sa-pointure" },
            { label: "Le rayon chaussures", href: "/chaussures" },
            ...brandLinks.slice(0, 3),
          ]}
        />
        <div className="pb-16" />
      </div>
    </>
  );
}
