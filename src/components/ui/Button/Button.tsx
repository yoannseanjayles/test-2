import { forwardRef, type ButtonHTMLAttributes } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost" | "invert";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  /** État de chargement : spinner inline, label conservé (4.1 §6). */
  loading?: boolean;
};

/*
 * Refonte Azeno : bouton rectangulaire (rayon 0), libellé en capitales
 * espacées, hauteur 48px. Le primaire est bleu et bascule au noir au survol —
 * la signature du thème. Aucun déplacement vertical au survol : le thème
 * joue sur la couleur, pas sur l'élévation.
 */
const base =
  "text-label inline-flex min-h-12 items-center justify-center gap-2 px-8 py-3 " +
  "transition-colors duration-250 ease-out select-none " +
  "disabled:pointer-events-none disabled:opacity-40";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-action text-white hover:bg-volt hover:text-bark-900",
  secondary:
    "border border-bark-900 text-bark-900 hover:bg-bark-900 hover:text-white",
  tertiary: "px-0 text-bark-900 underline underline-offset-8 hover:text-action",
  ghost: "text-bark-700 hover:bg-cream-300 hover:text-bark-900",
  /* Posé sur fond sombre (pied de page, bandeau bleu) : blanc plein. */
  invert: "bg-white text-bark-900 hover:bg-volt hover:text-bark-900",
};

/**
 * Bouton du socle UI — 4 variantes, hiérarchie D-022 :
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
