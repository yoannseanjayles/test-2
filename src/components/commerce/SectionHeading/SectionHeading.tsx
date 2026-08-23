import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  id: string;
  title: string;
  link?: { label: string; href: string };
  /** Accroche courte sous le titre (sections centrées de l'accueil). */
  intro?: string;
  /** Composition : centrée façon « TRENDING. », ou titre + lien alignés. */
  align?: "center" | "between";
  className?: string;
};

/**
 * Titre de section — refonte Azeno : Bebas Neue en capitales, point final
 * bleu sur la version centrée, lien « voir tout » souligné à droite.
 */
export function SectionHeading({
  id,
  title,
  link,
  intro,
  align = "between",
  className,
}: SectionHeadingProps) {
  if (align === "center") {
    return (
      <div className={cn("text-center", className)}>
        <h2
          id={id}
          className="font-display section-title text-h2 leading-none text-bark-900"
        >
          {title}
        </h2>
        {intro && (
          <p className="mx-auto mt-3 max-w-2xl text-body text-bark-700">{intro}</p>
        )}
        {link && (
          <Link
            href={link.href}
            className="text-label mt-5 inline-flex items-center gap-2 border-b border-bark-900 pb-1 text-bark-900 transition-colors duration-250 hover:border-action hover:text-action"
          >
            {link.label}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4",
        className,
      )}
    >
      <div>
        <h2 id={id} className="font-display text-h2 leading-none text-bark-900">
          {title}
        </h2>
        {intro && <p className="mt-2 max-w-2xl text-body text-bark-700">{intro}</p>}
      </div>
      {link && (
        <Link
          href={link.href}
          className="text-label inline-flex items-center gap-2 text-bark-900 transition-colors duration-250 hover:text-action"
        >
          {link.label}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      )}
    </div>
  );
}
