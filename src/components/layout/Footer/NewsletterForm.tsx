"use client";

import { useState, type FormEvent } from "react";
import { Button, FormField } from "@/components/ui";

/**
 * Capture e-mail en pied de page (D-021 : jamais de pop-up à l'arrivée).
 * Branchée sur l'API réelle en Phase 6 (H37) — confirmation locale en attendant.
 */
export function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4" noValidate={false}>
      <div className="flex flex-col gap-3">
        <FormField
          label="Votre adresse e-mail"
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="prenom@exemple.fr"
        />
        <Button type="submit" variant="secondary" className="self-start">
          S'inscrire
        </Button>
      </div>
      <p aria-live="polite" className="mt-2 text-body-sm text-success">
        {submitted ? "Merci ! Vous êtes bien inscrit·e." : ""}
      </p>
    </form>
  );
}
