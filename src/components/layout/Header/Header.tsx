import Link from "next/link";
import { Search, User } from "lucide-react";
import { animalCategories, primaryLinks } from "@/lib/navigation";
import { MegaMenu } from "./MegaMenu";
import { MobileMenu } from "./MobileMenu";
import { CartLink } from "./CartLink";

const iconLinks = [
  { label: "Rechercher", href: "/recherche", Icon: Search },
  { label: "Mon compte", href: "/compte", Icon: User },
];

/**
 * Header boutique (sitemap 1.2 §3) — logotype Fraunces (D-047),
 * navigation par animal avec méga-menu ≥ lg, hamburger < lg.
 */
export function Header() {
  return (
    // Pas de backdrop-blur ici : backdrop-filter ferait du header le containing block des drawers `fixed` (menu mobile).
    <header className="sticky top-0 z-40 border-b border-border bg-cream-100">
      <div className="relative mx-auto flex max-w-page items-center gap-2 px-4 py-3 lg:px-6">
        <MobileMenu />

        <Link
          href="/"
          className="font-display px-2 text-2xl font-semibold text-bark-900 lg:text-[1.75rem]"
        >
          chien et chat
        </Link>

        <nav aria-label="Navigation principale" className="ml-6 hidden lg:block">
          <div className="flex items-center gap-1">
            <MegaMenu categories={animalCategories} />
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-label flex min-h-11 items-center rounded-sm px-3 text-bark-900 transition-colors duration-150 hover:bg-cream-300"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          {iconLinks.map(({ label, href, Icon }) => (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className="flex size-11 items-center justify-center rounded-sm text-bark-900 transition-colors duration-150 hover:bg-cream-300"
            >
              <Icon aria-hidden="true" className="size-5" />
            </Link>
          ))}
          <CartLink />
        </div>
      </div>
    </header>
  );
}
