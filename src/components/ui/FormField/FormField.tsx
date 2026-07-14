"use client";

import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export type FormFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id" | "aria-describedby" | "aria-invalid"
> & {
  label: string;
  /** Texte d'aide affiché sous le champ (body-small, bark-700). */
  help?: string;
  /** Message d'erreur : icône + couleur error + liaison aria-describedby (4.1 §6, D-033). */
  error?: string;
};

/**
 * Champ de formulaire du socle — label au-dessus, aide en dessous,
 * erreur annoncée aux lecteurs d'écran. Hauteur 48px, focus pine (4.1 §6).
 */
export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  function FormField({ label, help, error, className, ...props }, ref) {
    const id = useId();
    const helpId = `${id}-help`;
    const errorId = `${id}-error`;
    const describedBy =
      [error ? errorId : null, help ? helpId : null]
        .filter(Boolean)
        .join(" ") || undefined;

    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        <label htmlFor={id} className="text-label text-bark-900">
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-12 rounded-sm border bg-cream-50 px-4 text-body text-bark-900",
            "placeholder:text-bark-500 transition-colors duration-150",
            "focus:border-pine-500 focus:outline-none focus-visible:outline-2",
            error ? "border-error" : "border-border",
          )}
          {...props}
        />
        {error && (
          <p
            id={errorId}
            role="alert"
            className="flex items-center gap-1.5 text-body-sm text-error"
          >
            <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
            {error}
          </p>
        )}
        {help && (
          <p id={helpId} className="text-body-sm text-bark-700">
            {help}
          </p>
        )}
      </div>
    );
  },
);
