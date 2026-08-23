import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type RatingStarsProps = {
  rating: number;
  /** Nombre d'avis affiché à côté — omis sur les cartes compactes. */
  count?: number;
  /** Version carte : étoiles seules, la valeur reste lue par les lecteurs d'écran. */
  compact?: boolean;
  className?: string;
};

/** Note en étoiles — la valeur est toujours annoncée en texte (a11y 4.1 §10). */
export function RatingStars({ rating, count, compact = false, className }: RatingStarsProps) {
  const value = (
    <>
      {rating.toLocaleString("fr-FR")} sur 5
      {count !== undefined && ` (${count} avis)`}
    </>
  );

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span aria-hidden="true" className="inline-flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              "size-3",
              i <= Math.round(rating)
                ? "fill-bark-900 text-bark-900"
                : "fill-cream-500 text-cream-500",
            )}
          />
        ))}
      </span>
      <span className={cn("text-caption text-bark-700", compact && "sr-only")}>
        {value}
      </span>
    </span>
  );
}
