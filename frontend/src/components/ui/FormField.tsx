import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * FormField — socle de tous les formulaires (D-032/D-033).
 * Label au-dessus, aide/erreur liées par aria-describedby, hauteur 48px.
 * La validation est déclenchée à la sortie du champ par le parent (RHF).
 */
export type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  help?: string;
  error?: string;
};

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  function FormField({ label, help, error, className, id, ...rest }, ref) {
    const autoId = useId();
    const fieldId = id ?? autoId;
    const describedBy = error
      ? `${fieldId}-error`
      : help
        ? `${fieldId}-help`
        : undefined;

    return (
      <div className={className}>
        <label
          htmlFor={fieldId}
          className="mb-1.5 block font-heading text-[0.8125rem] font-medium tracking-[0.02em]"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-12 w-full rounded-sm border bg-surface px-3.5 text-ink transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-ink-faint focus:outline-none",
            error
              ? "border-error"
              : "border-line focus:border-pine-500 focus:shadow-[0_0_0_3px_var(--pine-100)]",
          )}
          {...rest}
        />
        {error ? (
          <p
            id={`${fieldId}-error`}
            className="mt-1.5 flex items-center gap-1.5 text-[0.8125rem] text-error"
          >
            <span aria-hidden>⚠</span>
            {error}
          </p>
        ) : help ? (
          <p id={`${fieldId}-help`} className="mt-1.5 text-[0.8125rem] text-ink-soft">
            {help}
          </p>
        ) : null}
      </div>
    );
  },
);
