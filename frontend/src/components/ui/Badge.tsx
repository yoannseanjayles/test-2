import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Badge de statut produit (4.1 §6) : nouveauté, rupture, neutre. */
export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "new" | "out" | "neutral";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 font-heading text-[0.6875rem] font-semibold tracking-[0.04em]",
        tone === "new" && "bg-sage-100 text-sage-700",
        tone === "out" && "bg-raised text-ink-soft",
        tone === "neutral" && "bg-cream-300 text-ink-soft",
      )}
    >
      {children}
    </span>
  );
}
