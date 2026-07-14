import Link from "next/link";
import { Hammer } from "lucide-react";

type UnderConstructionProps = {
  title: string;
  /** Jalon 5.1 auquel la page est planifiée (roadmap). */
  milestone: string;
  description?: string;
};

/** Page provisoire : la route existe (zéro lien mort), le contenu arrive au jalon indiqué. */
export function UnderConstruction({ title, milestone, description }: UnderConstructionProps) {
  return (
    <div className="mx-auto flex max-w-page flex-col items-start px-4 py-16 lg:px-6 lg:py-24">
      <Hammer aria-hidden="true" className="size-8 text-caramel-700 opacity-60" strokeWidth={1.75} />
      <h1 className="font-display mt-6 text-h1 font-[560] text-bark-900">{title}</h1>
      <p className="mt-4 max-w-xl text-body text-bark-700">
        {description ??
          "Cette page est en cours de construction : elle arrive au " +
            milestone +
            " du développement front-end."}
      </p>
      <Link
        href="/"
        className="text-label mt-8 inline-flex min-h-11 items-center gap-2 text-action transition-colors duration-150 hover:text-action-hover"
      >
        Retour à l'accueil <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
