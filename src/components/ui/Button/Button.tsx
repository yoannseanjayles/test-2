import { forwardRef, type ButtonHTMLAttributes } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  /** État de chargement : spinner inline, label conservé (4.1 §6). */
  loading?: boolean;
};

const base =
  "text-label inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-6 py-3 " +
  "transition duration-150 ease-out select-none " +
  "disabled:pointer-events-none disabled:opacity-45 " +
  "hover:-translate-y-px active:translate-y-0";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-action text-white hover:bg-action-hover",
  secondary:
    "border-[1.5px] border-action text-action hover:bg-pine-50",
  tertiary: "text-action px-2 hover:text-action-hover",
  ghost: "text-bark-700 hover:bg-cream-300",
};

/**
 * Bouton du socle UI — 4 variantes (4.1 §6), hiérarchie D-022 :
 * 1 seul `primary` par écran.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", loading = false, className, children, disabled, ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && (
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
        )}
        {children}
        {variant === "tertiary" && !loading && (
          <ArrowRight aria-hidden="true" className="size-4" />
        )}
      </button>
    );
  },
);
