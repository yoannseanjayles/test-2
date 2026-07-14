"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { AnimalCategory } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type MegaMenuProps = {
  categories: AnimalCategory[];
};

/**
 * Méga-menu desktop (≥ lg) — sitemap 1.2 : sous-catégories en colonnes,
 * mise en avant, lien « Tout voir ». L'intitulé est un lien vers la page
 * animal (catégorie parente cliquable, D-002) ; le panneau s'ouvre au survol,
 * et au clavier via le bouton chevron (disclosure). Fermeture Échap (4.1 §10).
 */
export function MegaMenu({ categories }: MegaMenuProps) {
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
      {categories.map((category) => {
        const isOpen = openLabel === category.label;
        return (
          <li
            key={category.label}
            onMouseEnter={() => open(category.label)}
            onMouseLeave={scheduleClose}
          >
            <span
              className={cn(
                "flex min-h-11 items-center rounded-sm transition-colors duration-150 hover:bg-cream-300",
                isOpen && "bg-cream-300",
              )}
            >
              <Link
                href={category.href}
                className="text-label flex min-h-11 items-center pl-3 pr-1 text-bark-900"
              >
                {category.label}
              </Link>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-label={`Afficher les sous-catégories ${category.label}`}
                onClick={() => setOpenLabel(isOpen ? null : category.label)}
                className="flex min-h-11 items-center pr-3 pl-1 text-bark-700"
              >
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    "size-4 transition-transform duration-150",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
            </span>

            {isOpen && (
              <div
                className="absolute inset-x-0 top-full border-t border-border bg-cream-50 shadow-overlay"
                onMouseEnter={() => open(category.label)}
                onMouseLeave={scheduleClose}
              >
                <div className="mx-auto grid max-w-page grid-cols-[1fr_minmax(280px,360px)] gap-12 px-6 py-8">
                  <div>
                    <ul className="grid grid-cols-2 gap-x-12 gap-y-1 xl:grid-cols-3">
                      {category.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={() => setOpenLabel(null)}
                            className="flex min-h-11 items-center rounded-sm px-2 text-body text-bark-700 transition-colors duration-150 hover:bg-cream-100 hover:text-bark-900"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={category.href}
                      onClick={() => setOpenLabel(null)}
                      className="text-label mt-4 inline-flex min-h-11 items-center gap-2 px-2 text-action transition-colors duration-150 hover:text-action-hover"
                    >
                      Tout voir {category.label}
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                  {/* Visuel de mise en avant (M-NAV) : placeholder DA en attendant les médias Phase 3 (H32). */}
                  <div className="flex flex-col justify-end rounded-lg bg-cream-300 p-6">
                    <p className="font-display text-h3 text-bark-900">
                      {category.highlight}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
