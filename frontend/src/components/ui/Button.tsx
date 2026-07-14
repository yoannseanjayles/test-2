import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

/**
 * Bouton — 4 variantes (4.1 §6), hiérarchie D-022 : un seul `primary` par écran.
 * Hauteur ≥ 44px (cibles tactiles WCAG 2.2). L'état loading conserve le label.
 */
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "tertiary" | "ghost";
  loading?: boolean;
};

const styles = {
  base: "inline-flex h-[46px] cursor-pointer items-center justify-center gap-2.5 rounded-md px-6 font-heading text-[0.9375rem] font-medium tracking-[0.01em] transition-[background-color,transform,color] duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0",
  primary:
    "bg-action text-cream-50 hover:-translate-y-px hover:bg-action-strong",
  secondary:
    "border-[1.5px] border-action bg-transparent text-action hover:bg-pine-100",
  tertiary:
    "h-auto px-0 text-action underline-offset-4 hover:text-action-strong hover:underline",
  ghost: "text-ink-soft hover:bg-raised",
} as const;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", loading = false, className, children, disabled, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(styles.base, styles[variant], className)}
        {...rest}
      >
        {loading && <Spinner className="text-current" />}
        {children}
      </button>
    );
  },
);
