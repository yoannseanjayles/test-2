"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import type { NavSection } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type MegaMenuProps = {
  sections: NavSection[];
};

/**
 * Méga-menu desktop (≥ lg) — refonte streetwear : chaque rayon ouvre un
 * panneau en colonnes (Chaussures / Ensembles / Accessoires, ou Usage /
 * Marque / À découvrir) avec une mise en avant à droite.
 *
 * L'intitulé reste un lien vers la page du rayon (catégorie parente
 * cliquable, D-002) ; le panneau s'ouvre au survol et, au clavier, par le
 * bouton chevron (disclosure). Fermeture par Échap (4.1 §10).
 */
export function MegaMenu({ sections }: MegaMenuProps) {
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenLabel(label);
  };

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenLabel(null), 150);
  };

  return (
    <ul
      className="flex items-center gap-1"
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpenLabel(null);
      }}
    >
      {sections.map((section) => {
        const isOpen = openLabel === section.label;
        const hasPanel = Boolean(section.columns?.length);

        return (
          <li
            key={section.label}
            onMouseEnter={() => hasPanel && open(section.label)}
            onMouseLeave={hasPanel ? scheduleClose : undefined}
          >
            <span
              className={cn(
                "flex min-h-11 items-center transition-colors duration-250",
                isOpen ? "text-action" : "text-bark-900 hover:text-action",
              )}
            >
              <Link
                href={section.href}
                className={cn(
                  "nav-underline text-label flex min-h-11 items-center text-current",
                  hasPanel ? "pl-3 pr-1" : "px-3",
                )}
              >
                {section.label}
                {section.soon && (
                  <span className="text-caption ml-2 bg-volt px-1.5 py-0.5 leading-none text-bark-900">
                    Bientôt
                  </span>
                )}
              </Link>
              {hasPanel && (
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-label={`Afficher le menu ${section.label}`}
                  onClick={() => setOpenLabel(isOpen ? null : section.label)}
                  className="flex min-h-11 items-center pl-1 pr-3 text-current"
                >
                  <ChevronDown
                    aria-hidden="true"
                    className={cn(
                      "size-4 transition-transform duration-250",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
              )}
            </span>

            {isOpen && section.columns && (
              <div
                className="absolute inset-x-0 top-full border-t border-border bg-cream-50 shadow-overlay"
                onMouseEnter={() => open(section.label)}
                onMouseLeave={scheduleClose}
              >
                <div className="mx-auto grid max-w-page grid-cols-[1fr_minmax(280px,340px)] gap-12 px-6 py-10">
                  <div className="grid grid-cols-3 gap-8">
                    {section.columns.map((column) => (
                      <div key={column.title}>
                        <p className="text-label border-b border-border pb-3 text-bark-900">
                          {column.title}
                        </p>
                        <ul className="mt-2">
                          {column.links.map((link) => (
                            <li key={`${column.title}-${link.label}`}>
                              <Link
                                href={link.href}
                                onClick={() => setOpenLabel(null)}
                                className={cn(
                                  "flex min-h-10 items-center gap-2 border-l border-transparent px-3 text-body-sm transition-all duration-250",
                                  link.soon
                                    ? "text-bark-500 hover:border-bark-300 hover:text-bark-700"
                                    : "text-bark-700 hover:border-action hover:pl-4 hover:text-bark-900",
                                )}
                              >
                                {link.label}
                                {link.soon && (
                                  <span className="text-caption uppercase tracking-[0.14em] text-bark-500">
                                    · bientôt
                                  </span>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {section.highlight && (
                    <Link
                      href={section.highlight.href}
                      onClick={() => setOpenLabel(null)}
                      className="group relative flex flex-col justify-end overflow-hidden bg-bark-900 p-7"
                    >
                      <span
                        aria-hidden="true"
                        className="font-display pointer-events-none absolute -right-3 -top-5 text-[6rem] leading-none text-volt/15"
                      >
                        {section.label}
                      </span>
                      <p className="font-display relative text-h3 leading-none text-white">
                        {section.highlight.title}
                      </p>
                      <p className="relative mt-3 text-body-sm text-white/70">
                        {section.highlight.text}
                      </p>
                      <span className="text-label relative mt-5 inline-flex w-fit items-center gap-2 border-b border-volt pb-1 text-volt">
                        {section.highlight.cta}
                        <ArrowRight aria-hidden="true" className="size-4" />
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
