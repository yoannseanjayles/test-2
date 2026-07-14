import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type RatingStarsProps = {
  rating: number;
  /** Nombre d'avis affiché à côté — omis sur les cartes compactes. */
  count?: number;
  className?: string;
};

/** Note en étoiles — la valeur est toujours annoncée en texte (a11y 4.1 §10). */
export function RatingStars({ rating, count, className }: RatingStarsProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span aria-hidden="true" className="inline-flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              "size-3.5",
              i <= Math.round(rating)
                ? "fill-caramel-500 text-caramel-500"
                : "fill-cream-500 text-cream-500",
            )}
          />
        ))}
      </span>
      <span className="text-caption text-bark-700">
        {rating.toLocaleString("fr-FR")} sur 5{count !== undefined && ` (${count} avis)`}
      </span>
    </span>
  );
}
