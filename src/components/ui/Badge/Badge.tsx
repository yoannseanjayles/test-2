import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "new" | "stock" | "neutral" | "sale";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

/*
 * Refonte Azeno : pastille rectangulaire posée sur le visuel, en capitales.
 * Volt pour la nouveauté (l'accent de la boutique, texte encre dessus, 17:1),
 * rouge pour la promotion, gris pour la rupture — jamais porteuse de sens par
 * la seule couleur, le libellé suffit.
 */
const variants: Record<BadgeVariant, string> = {
  new: "bg-volt text-bark-900",
  sale: "bg-terracotta-700 text-white",
  stock: "bg-cream-300 text-bark-900",
  neutral: "border border-bark-900 text-bark-900",
};

/** Badge produit — 4.1 §6. */
export function Badge({ variant = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "text-caption inline-flex items-center px-2.5 py-1 font-heading font-medium uppercase tracking-[0.12em]",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
