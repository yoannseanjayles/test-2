"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { PRIMARY_LINKS, UNIVERSES } from "@/lib/nav";

/**
 * Menu mobile (D-003 : catégories en premier niveau).
 * Panneau plein écran, focus ramené à l'ouverture, fermé par Échap,
 * lien secondaire (compte, aide) en bas de menu.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Fermeture à la navigation — reset d'état dérivé pendant le rendu
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (open) setOpen(false);
  }

  // Échap + gel du scroll d'arrière-plan
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Ouvrir le menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex size-11 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-raised"
      >
        <Menu aria-hidden className="size-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-bark-900/40" onClick={() => setOpen(false)}>
          <div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-[min(360px,88vw)] flex-col overflow-y-auto bg-surface shadow-overlay"
          >
            <div className="flex h-16 items-center justify-between border-b border-line px-4">
              <span className="font-display text-xl font-[560]">
                Pelage<span className="text-accent">.</span>
              </span>
              <button
                type="button"
                aria-label="Fermer le menu"
                onClick={() => setOpen(false)}
                className="inline-flex size-11 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-raised"
              >
                <X aria-hidden className="size-5" />
              </button>
            </div>

            <nav aria-label="Navigation principale mobile" className="flex-1 px-4 py-4">
              <ul className="flex flex-col">
                {UNIVERSES.map((universe) => (
                  <li key={universe.slug} className="border-b border-line">
                    <details className="group">
                      <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between font-heading text-[1.0625rem] font-semibold [&::-webkit-details-marker]:hidden">
                        {universe.label}
                        <ChevronDown
                          aria-hidden
                          className="size-5 text-ink-faint transition-transform duration-250 group-open:rotate-180"
                        />
                      </summary>
                      <ul className="pb-3 pl-2">
                        <li>
                          <Link
                            href={`/${universe.slug}`}
                            className="block py-2 font-heading text-[0.9375rem] font-medium text-action"
                          >
                            Tout voir — {universe.label}
                          </Link>
                        </li>
                        {universe.subCategories.map((subCategory) => (
                          <li key={subCategory.slug}>
                            <Link
                              href={`/${universe.slug}/${subCategory.slug}`}
                              className="block py-2 text-[0.9375rem] text-ink-soft"
                            >
                              {subCategory.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </li>
                ))}
                {PRIMARY_LINKS.map((link) => (
                  <li key={link.href} className="border-b border-line">
                    <Link
                      href={link.href}
                      className="flex min-h-[52px] items-center font-heading text-[1.0625rem] font-semibold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="border-t border-line px-4 py-4">
              <ul className="flex flex-col gap-1 text-[0.9375rem] text-ink-soft">
                <li>
                  <Link href="/compte" className="block py-2">
                    Mon compte
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="block py-2">
                    Aide & FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="block py-2">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
