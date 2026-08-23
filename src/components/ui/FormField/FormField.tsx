"use client";

import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export type FormFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id" | "aria-describedby" | "aria-invalid"
> & {
  label: string;
  /** Texte d'aide affiché sous le champ. */
  help?: string;
  /** Message d'erreur : icône + couleur error + liaison aria-describedby (4.1 §6, D-033). */
  error?: string;
  /** Champ posé sur fond sombre (pied de page, bandeaux encre). */
  tone?: "light" | "dark";
};

/**
 * Champ de formulaire du socle — refonte Azeno : bordure fine à angles vifs,
 * libellé en capitales espacées, hauteur 48px, focus bleu de marque.
 */
export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  function FormField({ label, help, error, tone = "light", className, ...props }, ref) {
    const id = useId();
    const helpId = `${id}-help`;
    const errorId = `${id}-error`;
    const describedBy =
      [error ? errorId : null, help ? helpId : null]
        .filter(Boolean)
        .join(" ") || undefined;
    const dark = tone === "dark";

    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <label
          htmlFor={id}
          className={cn("text-label", dark ? "text-white/80" : "text-bark-900")}
        >
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-12 border px-4 text-body transition-colors duration-250",
            "focus:outline-none focus-visible:outline-2",
            dark
              ? "border-white/25 bg-transparent text-white placeholder:text-white/45 focus:border-white"
              : "border-border bg-cream-50 text-bark-900 placeholder:text-bark-500 focus:border-bark-900",
            error && (dark ? "border-terracotta-300" : "border-error"),
          )}
          {...props}
        />
        {error && (
          <p
            id={errorId}
            role="alert"
            className={cn(
              "flex items-center gap-1.5 text-body-sm",
              dark ? "text-terracotta-300" : "text-error",
            )}
          >
            <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
            {error}
          </p>
        )}
        {help && (
          <p
            id={helpId}
            className={cn("text-body-sm", dark ? "text-white/60" : "text-bark-700")}
          >
            {help}
          </p>
        )}
      </div>
    );
  },
);
