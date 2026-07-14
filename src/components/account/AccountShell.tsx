"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/account";
import { Button, FormField } from "@/components/ui";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Tableau de bord", href: "/compte" },
  { label: "Mes commandes", href: "/compte/commandes" },
  { label: "Mes animaux", href: "/compte/animaux" },
  { label: "Mes adresses", href: "/compte/adresses" },
  { label: "Mes informations", href: "/compte/informations" },
];

/**
 * Coquille de l'espace client (spec 2.1 Compte, D-035) : connexion démo si
 * déconnecté, sinon navigation latérale + contenu. Auth réelle en Phase 6.
 */
export function AccountShell({ title, children }: { title: string; children: ReactNode }) {
  const pathname = usePathname();
  const { user, signIn, signOut } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  if (!hydrated) {
    return <div className="mx-auto max-w-page px-4 py-16 lg:px-6" aria-busy="true" />;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 lg:py-16">
        <h1 className="font-display text-h1 font-[560] text-bark-900">Connexion</h1>
        <p className="mt-3 text-body-sm text-bark-700">
          Espace de démonstration : entrez un e-mail et un prénom pour explorer
          l'espace client. L'authentification réelle arrive en Phase 6.
        </p>
        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            signIn({
              email: String(data.get("email") ?? ""),
              firstName: String(data.get("firstName") ?? ""),
            });
          }}
        >
          <FormField label="Adresse e-mail" name="email" type="email" required autoComplete="email" />
          <FormField label="Prénom" name="firstName" required autoComplete="given-name" />
          <FormField label="Mot de passe" name="password" type="password" required autoComplete="current-password" help="Démo : non vérifié." />
          <Button type="submit">Se connecter</Button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-page px-4 py-10 lg:px-6">
      <h1 className="font-display text-h1 font-[560] text-bark-900">{title}</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[240px_1fr] lg:items-start">
        <nav aria-label="Espace client" className="rounded-lg bg-cream-50 p-3 shadow-card">
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={cn(
                    "text-label flex min-h-11 items-center rounded-md px-4 transition-colors duration-150",
                    pathname === item.href
                      ? "bg-pine-700 text-white"
                      : "text-bark-700 hover:bg-cream-300 hover:text-bark-900",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 border-t border-border pt-2">
              <button
                type="button"
                onClick={signOut}
                className="text-label flex min-h-11 w-full items-center rounded-md px-4 text-bark-500 hover:bg-cream-300 hover:text-error"
              >
                Se déconnecter
              </button>
            </li>
          </ul>
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
