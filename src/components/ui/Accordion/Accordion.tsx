"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type AccordionItem = {
  title: string;
  content: ReactNode;
};

export type AccordionProps = {
  items: AccordionItem[];
  /** Index de l'item ouvert au chargement (ex. « Caractéristiques » sur la PDP, D-024). */
  defaultOpen?: number;
  className?: string;
};

/**
 * Accordéon du socle — utilisé pour les caractéristiques produit (D-024),
 * la FAQ et le checkout. Bouton 44px min, chevron animé 250ms (4.1 §8).
 */
export function Accordion({ items, defaultOpen, className }: AccordionProps) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(
    defaultOpen ?? null,
  );

  return (
    <div className={cn("divide-y divide-border border-y border-border", className)}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const headerId = `${baseId}-header-${index}`;
        const panelId = `${baseId}-panel-${index}`;
        return (
          <div key={item.title}>
            <h3 className="m-0">
              <button
                type="button"
                id={headerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className={cn(
                  "flex min-h-11 w-full items-center justify-between gap-4 py-4 text-left",
                  "font-heading text-h3 font-semibold text-bark-900",
                  "transition-colors duration-150 hover:text-action",
                )}
              >
                {item.title}
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    "size-5 shrink-0 text-bark-700 transition-transform duration-250",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              hidden={!isOpen}
              className="pb-5 text-body text-bark-700"
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
