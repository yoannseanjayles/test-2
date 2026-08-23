import type { Metadata } from "next";
import { EditorialCard } from "@/components/commerce";
import { fetchGuides } from "@/lib/api";
import { PageHero } from "@/components/layout/PageHero/PageHero";

export const metadata: Metadata = {
  title: "Guides & Conseils",
  description:
    "Chaussant, pointures, entretien, technologies d'amorti : les guides d'achat du catalogue, sourcés sur les consignes officielles des marques.",
};

/** Hub éditorial (D-037) — guides lus en base (7.1 jalon 4), éditables dans l'admin. */
export default async function GuidesPage() {
  const guides = await fetchGuides();
  return (
    <>
      <PageHero
        kicker="Éditorial"
        title="Guides & Conseils"
        intro="Le conseil avant la vente. Chaque guide s'appuie sur les fiches et les consignes officielles des marques ; quand une donnée n'est pas publiée par le fabricant, c'est écrit."
        crumbs={[{ name: "Guides & Conseils", path: "/guides" }]}
      />
      <div className="mx-auto max-w-page px-4 py-12 lg:px-6 lg:py-16">
      <ul className="grid grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide) => (
          <li key={guide.slug}>
            <EditorialCard guide={guide} className="h-full" />
          </li>
        ))}
      </ul>
      </div>
    </>
  );
}
