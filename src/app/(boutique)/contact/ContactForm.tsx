"use client";

import { useState } from "react";
import { submitContactMessage } from "@/lib/engagement";
import { Button, FormField } from "@/components/ui";

/** Formulaire de contact — envoi réel via l'action serveur (Resend). */
export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  return (
    <form
      className="mt-8 flex flex-col gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        setStatus("sending");
        setError("");
        const result = await submitContactMessage({
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          orderNumber: String(data.get("orderNumber") ?? "") || undefined,
          message: String(data.get("message") ?? ""),
        });
        if (!result.ok) {
          setStatus("idle");
          setError(result.error ?? "Envoi impossible — réessayez.");
          return;
        }
        setStatus("sent");
        form.reset();
      }}
    >
      <FormField label="Votre nom" name="name" required autoComplete="name" />
      <FormField label="Votre adresse e-mail" name="email" type="email" required autoComplete="email" />
      <FormField label="Numéro de commande (optionnel)" name="orderNumber" placeholder="CC-0000000000" />
      <label className="flex flex-col gap-1.5">
        <span className="text-label text-bark-900">Votre message</span>
        <textarea
          name="message"
          required
          rows={6}
          className="rounded-sm border border-border bg-cream-50 p-4 text-body text-bark-900 focus:border-pine-500"
        />
      </label>
      <Button type="submit" className="self-start" loading={status === "sending"}>
        Envoyer
      </Button>
      <p aria-live="polite" className="text-body-sm text-success">
        {status === "sent" ? "Message envoyé — nous vous répondons sous 24 h ouvrées." : ""}
      </p>
      <p aria-live="assertive" className="text-body-sm text-error">{error}</p>
    </form>
  );
}
