import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Accordéon accessible basé sur <details>/<summary> natifs (spec 2.1 PDP S5, FAQ).
 * Zéro JS client : état géré par le navigateur, indexable par les moteurs.
 */
export function Accordion({
  title,
  children,
  defaultOpen = false,
  className,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  return (
    <details
      open={defaultOpen}
      className={cn("group border-b border-line", className)}
    >
      <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-4 py-3.5 font-heading text-[1.0625rem] font-semibold [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown
          aria-hidden
          className="size-5 shrink-0 text-ink-faint transition-transform duration-250 ease-out group-open:rotate-180"
        />
      </summary>
      <div className="pb-5 text-ink-soft">{children}</div>
    </details>
  );
}
