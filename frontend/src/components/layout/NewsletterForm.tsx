"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

/**
 * Capture e-mail en pied de page — jamais en pop-up (D-021).
 * Consentement explicite RGPD ; branchement API au jalon 4.
 */
export function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <p role="status" className="text-[0.9375rem] font-medium text-success">
        Merci ! À très vite dans votre boîte mail.
      </p>
    );
  }

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Votre adresse e-mail
      </label>
      <div className="flex gap-2">
        <input
          id="newsletter-email"
          type="email"
          required
          placeholder="votre@email.fr"
          autoComplete="email"
          className="h-12 min-w-0 flex-1 rounded-sm border border-line bg-surface px-3.5 text-[0.9375rem] placeholder:text-ink-faint focus:border-pine-500 focus:shadow-[0_0_0_3px_var(--pine-100)] focus:outline-none"
        />
        <Button type="submit" variant="secondary" className="shrink-0">
          S&apos;inscrire
        </Button>
      </div>
      <p className="text-xs text-ink-faint">
        En vous inscrivant, vous acceptez de recevoir notre newsletter.
        Désinscription en un clic, à tout moment.
      </p>
    </form>
  );
}
