"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { mainNav, mobileSecondaryLinks } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { company } from "@/lib/company";

/**
 * Menu mobile (< lg) — drawer plein écran ouvert par le hamburger.
 * Premier niveau = les rayons (D-003), colonnes du méga-menu dépliées en
 * accordéon, liens secondaires en bas sur fond encre. Focus ramené au
 * drawer, fermeture Échap (4.1 §6).
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
        className="flex size-11 items-center justify-center text-bark-900 transition-colors duration-250 hover:text-action"
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
            className="absolute inset-y-0 left-0 flex w-full max-w-sm flex-col overflow-y-auto bg-cream-50 shadow-overlay"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="font-display text-h3 leading-none text-bark-900">
                {company.tradeName}
                <span className="text-action">.</span>
              </span>
              <button
                type="button"
                aria-label="Fermer le menu"
                onClick={close}
                className="flex size-11 items-center justify-center text-bark-700 transition-colors duration-250 hover:text-bark-900"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>

            <nav aria-label="Rayons" className="flex-1 px-4 py-2">
              <ul>
                {mainNav.map((section) => {
                  const isExpanded = expanded === section.label;
                  const hasPanel = Boolean(section.columns?.length);

                  if (!hasPanel) {
                    return (
                      <li key={section.label} className="border-b border-border">
                        <Link
                          href={section.href}
                          onClick={close}
                          className="text-label flex min-h-14 items-center gap-2 text-bark-900"
                        >
                          {section.label}
                          {section.soon && (
                            <span className="text-caption bg-volt px-1.5 py-0.5 leading-none text-bark-900">
                              Bientôt
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  }

                  return (
                    <li key={section.label} className="border-b border-border">
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        onClick={() => setExpanded(isExpanded ? null : section.label)}
                        className="text-label flex min-h-14 w-full items-center justify-between text-bark-900"
                      >
                        {section.label}
                        <ChevronDown
                          aria-hidden="true"
                          className={cn(
                            "size-5 text-bark-700 transition-transform duration-250",
                            isExpanded && "rotate-180",
                          )}
                        />
                      </button>
                      {isExpanded && (
                        <div className="pb-3">
                          <Link
                            href={section.href}
                            onClick={close}
                            className="text-label flex min-h-11 items-center px-3 text-action"
                          >
                            Tout voir {section.label}
                          </Link>
                          {section.columns?.map((column) => (
                            <div key={column.title} className="mt-2">
                              <p className="text-caption px-3 uppercase tracking-[0.14em] text-bark-500">
                                {column.title}
                              </p>
                              <ul>
                                {column.links.map((link) => (
                                  <li key={`${column.title}-${link.label}`}>
                                    <Link
                                      href={link.href}
                                      onClick={close}
                                      className={cn(
                                        "flex min-h-11 items-center gap-2 px-3 text-body-sm",
                                        link.soon ? "text-bark-500" : "text-bark-700",
                                      )}
                                    >
                                      {link.label}
                                      {link.soon && (
                                        <span className="text-caption uppercase tracking-[0.14em]">
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
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <nav aria-label="Liens secondaires" className="bg-bark-900 px-4 py-4">
              <ul>
                {mobileSecondaryLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={close}
                      className="flex min-h-11 items-center text-body-sm text-white/75 transition-colors duration-250 hover:text-white"
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
