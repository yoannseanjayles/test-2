"use client";

import { X } from "lucide-react";

/** Chip de filtre appliqué, supprimable individuellement (D-027). */
export function Chip({
  label,
  onRemove,
}: {
  label: string;
  onRemove?: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-action py-1.5 pr-2 pl-3.5 font-heading text-[0.8125rem] font-medium text-cream-50">
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Retirer le filtre ${label}`}
          className="inline-flex size-[18px] cursor-pointer items-center justify-center rounded-full bg-cream-50/20 transition-colors duration-150 hover:bg-cream-50/35"
        >
          <X aria-hidden className="size-3" />
        </button>
      )}
    </span>
  );
}
