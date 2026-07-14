"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import {
  animalCategories,
  mobileSecondaryLinks,
  primaryLinks,
} from "@/lib/navigation";
import { cn } from "@/lib/utils";

/**
 * Menu mobile (< lg) — drawer plein écran ouvert par le hamburger.
 * Premier niveau = catégories d'abord (D-003), liens secondaires en bas
 * (sitemap 1.2). Focus ramené au drawer, fermeture Échap (4.1 §6).
 */
export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    drawerRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    setExpanded(null);
  };

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label="Ouvrir le menu"
        onClick={() => setIsOpen(true)}
        className="flex size-11 items-center justify-center rounded-sm text-bark-900 transition-colors duration-150 hover:bg-cream-300"
      >
        <Menu aria-hidden="true" className="size-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={close}
            className="absolute inset-0 bg-scrim"
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navigation"
            tabIndex={-1}
            onKeyDown={(event) => {
              if (event.key === "Escape") close();
            }}
            className="absolute inset-y-0 left-0 flex w-full max-w-sm flex-col overflow-y-auto rounded-r-lg bg-cream-50 shadow-overlay"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="font-display text-h3 text-bark-900">Pelage</span>
              <button
                type="button"
                aria-label="Fermer le menu"
                onClick={close}
                className="flex size-11 items-center justify-center rounded-sm text-bark-700 transition-colors duration-150 hover:bg-cream-300"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>

            <nav aria-label="Catégories" className="flex-1 px-4 py-2">
              <ul>
                {animalCategories.map((category) => {
                  const isExpanded = expanded === category.label;
                  return (
                    <li key={category.label} className="border-b border-border">
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        onClick={() =>
                          setExpanded(isExpanded ? null : category.label)
                        }
                        className="flex min-h-12 w-full items-center justify-between font-heading font-semibold text-bark-900"
                      >
                        {category.label}
                        <ChevronDown
                          aria-hidden="true"
                          className={cn(
                            "size-5 text-bark-700 transition-transform duration-150",
                            isExpanded && "rotate-180",
                          )}
                        />
                      </button>
                      {isExpanded && (
                        <ul className="pb-2">
                          <li>
                            <Link
                              href={category.href}
                              onClick={close}
                              className="text-label flex min-h-11 items-center px-3 text-action"
                            >
                              Tout voir {category.label}
                            </Link>
                          </li>
                          {category.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                onClick={close}
                                className="flex min-h-11 items-center px-3 text-body text-bark-700"
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
                {primaryLinks.map((link) => (
                  <li key={link.href} className="border-b border-border">
                    <Link
                      href={link.href}
                      onClick={close}
                      className="flex min-h-12 items-center font-heading font-semibold text-bark-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav
              aria-label="Liens secondaires"
              className="bg-cream-100 px-4 py-4"
            >
              <ul>
                {mobileSecondaryLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={close}
                      className="flex min-h-11 items-center text-body-sm text-bark-700"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
