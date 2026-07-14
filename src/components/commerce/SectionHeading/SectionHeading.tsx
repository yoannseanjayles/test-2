import Link from "next/link";
import { ArrowRight } from "lucide-react";

type SectionHeadingProps = {
  id: string;
  title: string;
  link?: { label: string; href: string };
};

/** Titre de section + lien « voir tout » optionnel (registre 2.1 Accueil). */
export function SectionHeading({ id, title, link }: SectionHeadingProps) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-4">
      <h2 id={id} className="font-heading text-h2 font-semibold text-bark-900">
        {title}
      </h2>
      {link && (
        <Link
          href={link.href}
          className="text-label inline-flex items-center gap-2 text-action transition-colors duration-150 hover:text-action-hover"
        >
          {link.label}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      )}
    </div>
  );
}
