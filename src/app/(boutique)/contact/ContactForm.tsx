"use client";

import { useState } from "react";
import { Button, FormField } from "@/components/ui";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  return (
    <form
      className="mt-8 flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
    >
      <FormField label="Votre nom" required autoComplete="name" />
      <FormField label="Votre adresse e-mail" type="email" required autoComplete="email" />
      <FormField label="Numéro de commande (optionnel)" placeholder="CC-000000" />
      <label className="flex flex-col gap-1.5">
        <span className="text-label text-bark-900">Votre message</span>
        <textarea
          required
          rows={6}
          className="rounded-sm border border-border bg-cream-50 p-4 text-body text-bark-900 focus:border-pine-500"
        />
      </label>
      <Button type="submit" className="self-start">Envoyer</Button>
      <p aria-live="polite" className="text-body-sm text-success">
        {sent ? "Message envoyé (démonstration) — l'acheminement réel arrive avec la Phase 6." : ""}
      </p>
    </form>
  );
}
