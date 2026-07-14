import type { Metadata } from "next";
import { EditorialCard } from "@/components/commerce";
import { guides } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guides & Conseils",
  description:
    "Guides d'achat et conseils d'experts pour bien choisir les accessoires de votre chien, chat ou NAC.",
};

/** Hub éditorial — version jalon 2 : cartes des guides. Filtres et pages piliers complètes au jalon 4 (D-037). */
export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-page px-4 py-12 lg:px-6 lg:py-16">
      <header className="max-w-3xl">
        <h1 className="font-display text-h1 font-[560] text-bark-900">Guides & Conseils</h1>
        <p className="mt-4 text-body text-bark-700">
          Le conseil avant la vente : nos guides sont relus par des vétérinaires
          et éducateurs, et maillés vers les produits qu'ils recommandent.
        </p>
      </header>
      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide) => (
          <li key={guide.slug}>
            <EditorialCard guide={guide} className="h-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}
