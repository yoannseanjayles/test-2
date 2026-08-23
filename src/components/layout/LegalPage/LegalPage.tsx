import { Scale } from "lucide-react";
import type { ReactNode } from "react";
import { PageHero } from "../PageHero/PageHero";

type LegalPageProps = {
  title: string;
  updated: string;
  sections: { heading: string; body: string }[];
  /** Bloc libre rendu après les sections numérotées — formulaire type de
   *  rétractation, tableaux, annexes (audit 2026-08, MO-6). */
  appendix?: ReactNode;
};

/**
 * Gabarit des pages juridiques — structure définitive, textes de travail :
 * la version finale sera validée par un juriste avant le lancement (H30).
 */
export function LegalPage({ title, updated, sections, appendix }: LegalPageProps) {
  return (
    <>
      <PageHero
        kicker="Informations légales"
        title={title}
        intro={`Dernière mise à jour : ${updated}`}
        tone="light"
      />
      <div className="mx-auto max-w-3xl px-4 py-12 lg:px-6">
      <p className="flex items-start gap-2 border-l-2 border-caramel-500 bg-caramel-50 p-4 text-body-sm text-bark-700">
        <Scale aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-caramel-700" strokeWidth={1.75} />
        Texte de travail : la version définitive sera validée par un juriste
        avant l'ouverture de la boutique (H30).
      </p>
      {sections.map((section, index) => (
        <section key={section.heading} className="mt-8">
          <h2 className="font-display text-h3 leading-tight text-bark-900">
            {index + 1}. {section.heading}
          </h2>
          <p className="mt-2 text-body-sm leading-relaxed text-bark-700">{section.body}</p>
        </section>
      ))}
      {appendix}
      </div>
    </>
  );
}
