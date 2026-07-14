import Link from "next/link";
import { Search, ShoppingBag, User } from "lucide-react";
import { PRIMARY_LINKS, UNIVERSES } from "@/lib/nav";
import { MobileNav } from "./MobileNav";

/**
 * Header global (sitemap 1.2 §3) : logo, nav univers avec méga-menu,
 * recherche, compte, panier. Sticky. Le méga-menu desktop fonctionne
 * au survol ET au focus clavier (focus-within) — zéro JS.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-page/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center gap-2 px-4 md:px-6">
        <MobileNav />

        <Link
          href="/"
          className="mr-2 font-display text-[1.625rem] leading-none font-[560] tracking-tight"
        >
          Pelage<span className="text-accent">.</span>
        </Link>

        <nav aria-label="Navigation principale" className="hidden flex-1 lg:block">
          <ul className="flex items-center gap-1">
            {UNIVERSES.map((universe) => (
              <li key={universe.slug} className="group relative">
                <Link
                  href={`/${universe.slug}`}
                  className="inline-flex h-16 items-center px-4 font-heading text-[0.9375rem] font-medium text-ink-soft transition-colors duration-150 hover:text-ink"
                >
                  {universe.label}
                </Link>
                {/* Méga-menu : catégorie parente cliquable + sous-catégories (D-002) */}
                <div className="invisible absolute top-full left-0 w-[440px] rounded-b-lg border border-t-0 border-line bg-surface opacity-0 shadow-overlay transition-[opacity,visibility] duration-150 ease-out group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <div className="p-6">
                    <p className="mb-4 text-[0.8125rem] text-ink-faint">
                      {universe.tagline}
                    </p>
                    <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                      {universe.subCategories.map((subCategory) => (
                        <li key={subCategory.slug}>
                          <Link
                            href={`/${universe.slug}/${subCategory.slug}`}
                            className="text-[0.9375rem] text-ink-soft underline-offset-4 hover:text-action hover:underline"
                          >
                            {subCategory.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/${universe.slug}`}
                      className="mt-5 inline-block font-heading text-sm font-medium text-action underline-offset-4 hover:underline"
                    >
                      Tout voir — {universe.label} →
                    </Link>
                  </div>
                </div>
              </li>
            ))}
            {PRIMARY_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex h-16 items-center px-4 font-heading text-[0.9375rem] font-medium text-ink-soft transition-colors duration-150 hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/recherche"
            aria-label="Rechercher"
            className="inline-flex size-11 items-center justify-center rounded-md text-ink-soft transition-colors duration-150 hover:bg-raised"
          >
            <Search aria-hidden className="size-5" />
          </Link>
          <Link
            href="/compte"
            aria-label="Mon compte"
            className="hidden size-11 items-center justify-center rounded-md text-ink-soft transition-colors duration-150 hover:bg-raised md:inline-flex"
          >
            <User aria-hidden className="size-5" />
          </Link>
          <Link
            href="/panier"
            aria-label="Panier"
            className="relative inline-flex size-11 items-center justify-center rounded-md text-ink-soft transition-colors duration-150 hover:bg-raised"
          >
            <ShoppingBag aria-hidden className="size-5" />
            {/* Compteur branché sur l'état panier au jalon 3 */}
          </Link>
        </div>
      </div>
    </header>
  );
}
