import { cn } from "@/lib/utils";

export type PlaceholderTone = "chalk" | "graphite" | "sand" | "signal";

/*
 * Refonte Azeno : les quatre teintes deviennent quatre fonds du thème —
 * gris tuile, encre, gris moyen, bleu de marque. Le motif diagonal discret
 * signale un emplacement dont le visuel reste à produire, sans casser la
 * mise en page (ratio réservé, zéro CLS).
 */
const tones: Record<PlaceholderTone, string> = {
  chalk: "bg-cream-300 text-bark-500",
  graphite: "bg-bark-900 text-white/70",
  sand: "bg-cream-500 text-bark-700",
  signal: "bg-pine-700 text-white/80",
};

const stripes =
  "repeating-linear-gradient(135deg, currentColor 0 1px, transparent 1px 14px)";

type PlaceholderProps = {
  tone?: PlaceholderTone;
  /** Ratio réservé en CSS — zéro layout shift (4.1 §7, CLS D-009). */
  ratio?: string;
  label?: string;
  className?: string;
};

/**
 * Placeholder visuel (H32) : occupe l'emplacement exact du média manquant.
 * Le catalogue a ses vraies photos — il ne sert plus que pour les
 * emplacements éditoriaux (hero, bandes promo) listés dans
 * `docs/phase-3-medias/3.3-prompts-visuels-azeno.md`.
 */
export function Placeholder({
  tone = "chalk",
  ratio = "1 / 1",
  label,
  className,
}: PlaceholderProps) {
  return (
    <div
      aria-hidden="true"
      style={{ aspectRatio: ratio }}
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden",
        tones[tone],
        className,
      )}
    >
      <span
        style={{ backgroundImage: stripes }}
        className="absolute inset-0 opacity-15"
      />
      {label && (
        <span className="text-label relative z-10 px-4 text-center opacity-80">
          {label}
        </span>
      )}
    </div>
  );
}
