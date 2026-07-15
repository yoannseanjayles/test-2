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
  const [googleLoading, setGoogleLoading] = useState(false);

  const googleSignIn = async () => {
    setError("");
    setGoogleLoading(true);
    // Redirection vers Google si le fournisseur est configuré côté serveur.
    const result = await signIn.social({ provider: "google", callbackURL: "/compte" });
    if (result.error) {
      setGoogleLoading(false);
      setError(
        "Connexion Google indisponible — le site n'a pas encore ses identifiants Google (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET).",
      );
    }
  };

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
      <button
        type="button"
        onClick={googleSignIn}
        disabled={googleLoading}
        className="mt-6 flex min-h-12 w-full items-center justify-center gap-3 rounded-sm border border-border bg-cream-50 px-4 text-body font-medium text-bark-900 transition-colors duration-150 hover:border-bark-300 disabled:opacity-60"
      >
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.1 3.57-5.17 3.57-8.8Z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3.01c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24Z" />
          <path fill="#FBBC05" d="M5.29 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.28a12 12 0 0 0 0 10.76l4.01-3.1Z" />
          <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44A11.98 11.98 0 0 0 1.28 6.62l4.01 3.1C6.23 6.88 8.88 4.77 12 4.77Z" />
        </svg>
        {googleLoading ? "Redirection vers Google…" : "Continuer avec Google"}
      </button>
      <div aria-hidden="true" className="mt-5 flex items-center gap-3 text-caption text-bark-500">
        <span className="h-px flex-1 bg-border" />
        ou par e-mail
        <span className="h-px flex-1 bg-border" />
      </div>
      <form className="mt-5 flex flex-col gap-4" onSubmit={submit}>
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
