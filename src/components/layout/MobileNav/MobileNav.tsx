import Link from "next/link";
import { House, Search, ShoppingBag, User } from "lucide-react";

const items = [
  { label: "Accueil", href: "/", Icon: House },
  { label: "Recherche", href: "/recherche", Icon: Search },
  { label: "Compte", href: "/compte", Icon: User },
  { label: "Panier", href: "/panier", Icon: ShoppingBag },
];

/**
 * Barre de navigation fixe basse, mobile uniquement (sitemap 1.2, D-003).
 * Icônes 24px + libellé (jamais d'icône seule, 4.1 §5), cibles ≥ 44px.
 */
export function MobileNav() {
  return (
    <nav
      aria-label="Navigation rapide"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-cream-50 pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="flex">
        {items.map(({ label, href, Icon }) => (
          <li key={href} className="flex-1">
            <Link
              href={href}
              className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-bark-700 transition-colors duration-150 hover:text-action"
            >
              <Icon aria-hidden="true" className="size-6" strokeWidth={1.75} />
              <span className="text-caption">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
