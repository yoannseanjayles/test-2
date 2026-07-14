import Link from "next/link";
import { Fragment } from "react";
import { ChevronRight } from "lucide-react";

export type Crumb = { name: string; path: string };

/** Fil d'Ariane (sitemap 1.2) — le dernier élément est la page courante. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Fil d'Ariane">
      <ol className="flex flex-wrap items-center gap-1.5 text-body-sm text-bark-700">
        <li>
          <Link href="/" className="transition-colors duration-150 hover:text-bark-900">
            Accueil
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={item.path}>
              <li aria-hidden="true">
                <ChevronRight className="size-3.5 text-bark-300" />
              </li>
              <li>
                {isLast ? (
                  <span aria-current="page" className="text-bark-900">
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.path}
                    className="transition-colors duration-150 hover:text-bark-900"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
