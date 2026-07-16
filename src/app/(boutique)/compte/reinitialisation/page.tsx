import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe",
  robots: { index: false },
};

/** Cible du lien de réinitialisation (audit M-6) — token en query-string. */
export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
