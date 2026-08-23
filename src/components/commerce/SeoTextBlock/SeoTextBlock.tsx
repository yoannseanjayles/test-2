import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { NavLink } from "@/lib/navigation";

type SeoTextBlockProps = {
  title: string;
  paragraphs: string[];
  related: NavLink[];
};

/** Bloc SEO dépliable en bas de listing (spec Listing S5) — natif, sans JS. */
export function SeoTextBlock({ title, paragraphs, related }: SeoTextBlockProps) {
  return (
    <details className="group mt-16 border-t border-border pt-8">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-display text-h3 leading-tight text-bark-900 [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown
          aria-hidden="true"
          className="size-5 text-bark-700 transition-transform duration-250 group-open:rotate-180"
        />
      </summary>
      <div className="max-w-3xl pb-4 pt-4">
        {paragraphs.map((paragraph, index) => (
          // Clé par position : deux paragraphes peuvent partager leurs premiers
          // caractères (même accroche de marque), et la liste est statique.
          <p key={index} className="mt-3 text-body-sm text-bark-700 first:mt-0">
            {paragraph}
          </p>
        ))}
        {related.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
            {related.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-label border-b border-bark-900 pb-1 text-bark-900 transition-colors duration-250 hover:border-action hover:text-action"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}
