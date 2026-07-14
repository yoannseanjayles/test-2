import Link from "next/link";
import { Accordion, Badge, Button } from "@/components/ui";
import { animalCategories } from "@/lib/navigation";

/**
 * Accueil provisoire — jalon 1 : démontre le socle (tokens, typo, primitives)
 * dans le layout boutique. La page Accueil complète (spec 2.1, 10 sections)
 * est développée au jalon 2.
 */
export default function HomePage() {
  return (
    <div className="mx-auto max-w-page px-4 lg:px-6">
      <section className="py-16 lg:py-24">
        <Badge variant="new">Socle en construction — jalon 1</Badge>
        <h1 className="font-display mt-6 max-w-3xl text-display font-[560] text-bark-900">
          Le meilleur pour eux, choisi avec exigence.
        </h1>
        <p className="mt-6 max-w-xl text-body text-bark-700">
          Pelage sélectionne des accessoires durables et élégants pour chiens,
          chats et NAC. Chaque produit est testé, comparé et approuvé par nos
          experts avant d'entrer au catalogue.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button>Découvrir la sélection</Button>
          <Button variant="tertiary">Nos guides d'experts</Button>
        </div>
      </section>

      <section aria-labelledby="univers" className="pb-16 lg:pb-24">
        <h2 id="univers" className="font-heading text-h2 font-semibold text-bark-900">
          Choisir par animal
        </h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-3">
          {animalCategories.map((category) => (
            <li key={category.href}>
              <Link
                href={category.href}
                className="group flex flex-col gap-3 rounded-lg border border-border bg-cream-50 p-6 transition-shadow duration-250 hover:shadow-card"
              >
                <span className="font-heading text-h3 font-semibold text-bark-900">
                  {category.label}
                </span>
                <span className="text-body-sm text-bark-700">
                  {category.children.length} univers —{" "}
                  {category.children
                    .slice(0, 3)
                    .map((child) => child.label.toLowerCase())
                    .join(", ")}
                  …
                </span>
                <span className="text-label text-action transition-colors duration-150 group-hover:text-action-hover">
                  Explorer →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="questions" className="max-w-2xl pb-16 lg:pb-24">
        <h2 id="questions" className="font-heading text-h2 font-semibold text-bark-900">
          Questions fréquentes
        </h2>
        <Accordion
          className="mt-8"
          items={[
            {
              title: "Quand la boutique ouvre-t-elle ?",
              content:
                "Le site est en cours de construction : le socle technique et le design system sont posés, les pages arrivent jalon par jalon.",
            },
            {
              title: "Comment les produits sont-ils choisis ?",
              content:
                "Chaque référence est évaluée sur des critères explicites : matières, fabrication, confort animal et durabilité. Nous refusons plus de produits que nous n'en retenons.",
            },
            {
              title: "Quels sont les frais de livraison ?",
              content:
                "La livraison est offerte dès 79 € d'achat en France, Belgique, Suisse et Luxembourg. Le premier retour est offert.",
            },
          ]}
        />
      </section>
    </div>
  );
}
