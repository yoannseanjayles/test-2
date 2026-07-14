import type { Metadata } from "next";
import { Accordion } from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { PriceTag } from "@/components/ui/PriceTag";
import { RatingStars } from "@/components/ui/RatingStars";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Skeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = {
  title: "Design System (interne)",
  robots: { index: false },
};

/**
 * Styleguide vivant — vitrine des primitives réellement utilisées en production.
 * Complète la doc Storybook (H38) ; route non indexée, réservée à l'équipe.
 */
export default function DesignSystemPage() {
  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-14 px-4 py-14 md:px-6">
      <header>
        <h1 className="font-display text-4xl font-[560]">Design System</h1>
        <p className="mt-2 max-w-[60ch] text-ink-soft">
          Primitives UI du socle (jalon 1) — rendues avec les tokens de
          production. Réf. docs/phase-4-design-system/4.1-design-guidelines.md.
        </p>
      </header>

      <section>
        <SectionHeading title="Boutons" />
        <div className="flex flex-wrap items-center gap-4">
          <Button>Ajouter au panier</Button>
          <Button variant="secondary">Voir les best-sellers</Button>
          <Button variant="tertiary">Notre histoire →</Button>
          <Button variant="ghost">Filtrer</Button>
          <Button disabled>Indisponible</Button>
          <Button loading>Paiement…</Button>
        </div>
      </section>

      <section>
        <SectionHeading title="Formulaire" />
        <div className="grid max-w-[720px] gap-6 md:grid-cols-2">
          <FormField
            label="Adresse e-mail"
            type="email"
            placeholder="claire@exemple.fr"
            help="Uniquement pour le suivi de votre commande."
          />
          <FormField
            label="Code postal"
            defaultValue="7500"
            error="Le code postal doit comporter 5 chiffres."
          />
        </div>
      </section>

      <section>
        <SectionHeading title="Badges, note, prix" />
        <div className="flex flex-wrap items-center gap-5">
          <Badge tone="new">Nouveau</Badge>
          <Badge tone="out">Bientôt de retour</Badge>
          <RatingStars rating={4.8} count={26} />
          <PriceTag amount={4900} />
          <PriceTag amount={3900} compareAt={4900} />
        </div>
      </section>

      <section>
        <SectionHeading title="Accordéon (caractéristiques, FAQ)" />
        <div className="max-w-[720px]">
          <Accordion title="Matières & entretien" defaultOpen>
            Cuir pleine fleur tanné végétal. Nettoyage au chiffon doux
            légèrement humide, nourrir au baume incolore deux fois par an.
          </Accordion>
          <Accordion title="Dimensions & tailles">
            Taille M : tour de cou 32–40 cm, largeur 2,5 cm. Consultez le guide
            des tailles pour mesurer votre animal.
          </Accordion>
        </div>
      </section>

      <section>
        <SectionHeading title="Squelettes de chargement" />
        <div className="grid max-w-[720px] grid-cols-2 gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Skeleton className="aspect-square" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="aspect-square" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      </section>
    </div>
  );
}
