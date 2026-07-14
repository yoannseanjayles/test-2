import { Scale } from "lucide-react";

type LegalPageProps = {
  title: string;
  updated: string;
  sections: { heading: string; body: string }[];
};

/**
 * Gabarit des pages juridiques — structure définitive, textes de travail :
 * la version finale sera validée par un juriste avant le lancement (H30).
 */
export function LegalPage({ title, updated, sections }: LegalPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-6">
      <h1 className="font-display text-h1 font-[560] text-bark-900">{title}</h1>
      <p className="text-caption mt-2 text-bark-700">Dernière mise à jour : {updated}</p>
      <p className="mt-5 flex items-start gap-2 rounded-md bg-caramel-100 p-4 text-body-sm text-bark-700">
        <Scale aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-caramel-700" strokeWidth={1.75} />
        Texte de travail : la version définitive sera validée par un juriste
        avant l'ouverture de la boutique (H30).
      </p>
      {sections.map((section, index) => (
        <section key={section.heading} className="mt-8">
          <h2 className="font-heading text-h3 font-semibold text-bark-900">
            {index + 1}. {section.heading}
          </h2>
          <p className="mt-2 text-body-sm leading-relaxed text-bark-700">{section.body}</p>
        </section>
      ))}
    </div>
  );
}
