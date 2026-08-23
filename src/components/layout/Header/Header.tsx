import Link from "next/link";
import { Search, User } from "lucide-react";
import { mainNav } from "@/lib/navigation";
import { MegaMenu } from "./MegaMenu";
import { MobileMenu } from "./MobileMenu";
import { CartLink } from "./CartLink";
import { company } from "@/lib/company";

const iconLinks = [
  { label: "Rechercher", href: "/recherche", Icon: Search },
  { label: "Mon compte", href: "/compte", Icon: User },
];

/**
 * Header boutique — refonte streetwear : fond blanc, logotype condensé à
 * gauche, navigation par rayon (Homme, Femme, Chaussures, Ensembles…) avec
 * méga-menu ≥ lg, icônes à droite. Filet bas fin, aucune ombre.
 */
export function Header() {
  return (
    // Pas de backdrop-blur ici : backdrop-filter ferait du header le containing block des drawers `fixed` (menu mobile).
    <header className="sticky top-0 z-40 border-b border-border bg-cream-50">
      <div className="relative mx-auto flex max-w-page items-center gap-2 px-4 py-4 lg:px-6">
        <MobileMenu />

        <Link
          href="/"
          aria-label={`${company.tradeName} — accueil`}
          className="font-display shrink-0 px-2 text-3xl leading-none tracking-[0.04em] text-bark-900 transition-colors duration-250 hover:text-action lg:text-[2rem]"
        >
          {company.tradeName}
          <span className="text-action">.</span>
        </Link>

        <nav aria-label="Navigation principale" className="ml-8 hidden lg:block">
          <MegaMenu sections={mainNav} />
        </nav>

        <div className="ml-auto flex items-center gap-1">
          {iconLinks.map(({ label, href, Icon }) => (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className="flex size-11 items-center justify-center text-bark-900 transition-colors duration-250 hover:text-action"
            >
              <Icon aria-hidden="true" className="size-5" strokeWidth={1.75} />
            </Link>
          ))}
          <CartLink />
        </div>
      </div>
    </header>
  );
}
