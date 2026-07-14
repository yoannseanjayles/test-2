"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { signIn, signOut, signUp, useSession } from "@/lib/auth-client";
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
 * Coquille de l'espace client (D-035) — authentification réelle Better Auth
 * (6.1 jalon 2) : inscription/connexion e-mail, session en base, déconnexion.
 */
export function AccountShell({ title, children }: { title: string; children: ReactNode }) {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div className="mx-auto max-w-page px-4 py-16 lg:px-6" aria-busy="true" />;
  }

  if (!session) return <AuthForm />;

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
                onClick={() => signOut()}
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

function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");
    const result =
      mode === "signup"
        ? await signUp.email({ email, password, name: String(data.get("firstName") ?? "") })
        : await signIn.email({ email, password });
    setLoading(false);
    if (result.error) {
      setError(
        result.error.status === 401 || result.error.status === 403
          ? "E-mail ou mot de passe incorrect."
          : (result.error.message ?? "Une erreur est survenue — réessayez."),
      );
      return;
    }
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12 lg:py-16">
      <h1 className="font-display text-h1 font-[560] text-bark-900">
        {mode === "signin" ? "Connexion" : "Créer un compte"}
      </h1>
      <p className="mt-3 text-body-sm text-bark-700">
        Suivi de commande, retours en un clic et profil animal — le compte
        reste optionnel pour commander.
      </p>
      <form className="mt-6 flex flex-col gap-4" onSubmit={submit}>
        {mode === "signup" && (
          <FormField label="Prénom" name="firstName" required autoComplete="given-name" />
        )}
        <FormField label="Adresse e-mail" name="email" type="email" required autoComplete="email" />
        <FormField
          label="Mot de passe"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          help={mode === "signup" ? "8 caractères minimum." : undefined}
        />
        <Button type="submit" loading={loading}>
          {mode === "signin" ? "Se connecter" : "Créer mon compte"}
        </Button>
        <p aria-live="assertive" className="text-body-sm text-error">{error}</p>
      </form>
      <button
        type="button"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="text-label mt-2 min-h-11 text-action underline-offset-4 hover:underline"
      >
        {mode === "signin" ? "Pas encore de compte ? Créez-le ici." : "Déjà un compte ? Connectez-vous."}
      </button>
    </div>
  );
}
