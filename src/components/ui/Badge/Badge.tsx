import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "new" | "stock" | "neutral";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variants: Record<BadgeVariant, string> = {
  new: "bg-sage-100 text-sage-700",
  stock: "bg-cream-300 text-bark-700",
  neutral: "bg-cream-100 text-bark-700",
};

/** Badge produit — `Nouveau` sauge, rupture crème (4.1 §6). Jamais porteur de sens par la couleur seule. */
export function Badge({ variant = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "text-label inline-flex items-center rounded-full px-3 py-1",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
