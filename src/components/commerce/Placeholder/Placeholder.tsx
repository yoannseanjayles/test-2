import { PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";

export type PlaceholderTone = "cream" | "sage" | "caramel" | "terracotta";

const tones: Record<PlaceholderTone, string> = {
  cream: "bg-cream-300 text-cream-900",
  sage: "bg-sage-100 text-sage-700",
  caramel: "bg-caramel-100 text-caramel-700",
  terracotta: "bg-terracotta-100 text-terracotta-700",
};

type PlaceholderProps = {
  tone?: PlaceholderTone;
  /** Ratio réservé en CSS — zéro layout shift (4.1 §7, CLS D-009). */
  ratio?: string;
  label?: string;
  className?: string;
};

/**
 * Placeholder visuel DA (H32) : occupe l'emplacement exact des futurs médias
 * de la Media Library (Phase 3) avec les teintes de la palette D-044.
 */
export function Placeholder({
  tone = "cream",
  ratio = "1 / 1",
  label,
  className,
}: PlaceholderProps) {
  return (
    <div
      aria-hidden="true"
      style={{ aspectRatio: ratio }}
      className={cn(
        "flex w-full items-center justify-center overflow-hidden",
        tones[tone],
        className,
      )}
    >
      <div className="flex flex-col items-center gap-2 opacity-50">
        <PawPrint className="size-8" strokeWidth={1.75} />
        {label && <span className="text-caption">{label}</span>}
      </div>
    </div>
  );
}
