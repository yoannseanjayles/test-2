"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button, FormField } from "@/components/ui";

/** Choix du nouveau mot de passe — token du lien e-mail (Better Auth). */
export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token || searchParams.get("error")) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center lg:py-16">
        <h1 className="font-display text-h1 font-[560] text-bark-900">Lien invalide ou expiré</h1>
        <p className="mt-3 text-body-sm text-bark-700">
          Ce lien de réinitialisation n'est plus valable. Refaites une demande
          depuis l'écran de connexion.
        </p>
        <Link
          href="/compte"
          className="text-label mt-6 inline-flex min-h-11 items-center rounded-md bg-action px-6 py-3 text-white"
        >
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 lg:py-16">
      <h1 className="font-display text-h1 font-[560] text-bark-900">Nouveau mot de passe</h1>
      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const newPassword = String(data.get("password") ?? "");
          if (newPassword !== String(data.get("confirm") ?? "")) {
            setError("Les deux mots de passe ne correspondent pas.");
            return;
          }
          setError("");
          setLoading(true);
          const result = await authClient.resetPassword({ newPassword, token });
          setLoading(false);
          if (result.error) {
            setError(result.error.message ?? "Lien expiré — refaites une demande de réinitialisation.");
            return;
          }
          router.push("/compte");
        }}
      >
        <FormField
          label="Nouveau mot de passe"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          help="8 caractères minimum."
        />
        <FormField
          label="Confirmez le mot de passe"
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <Button type="submit" loading={loading}>Enregistrer et me connecter</Button>
        <p aria-live="assertive" className="text-body-sm text-error">{error}</p>
      </form>
    </div>
  );
}
