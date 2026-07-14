import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Note produit — étoiles + valeur textuelle (jamais la couleur/forme seule, 4.1 §10).
 */
export function RatingStars({
  rating,
  count,
  className,
}: {
  rating: number;
  count?: number;
  className?: string;
}) {
  const label =
    count !== undefined
      ? `Note : ${rating.toFixed(1)} sur 5 (${count} avis)`
      : `Note : ${rating.toFixed(1)} sur 5`;

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-xs text-ink-faint", className)}
      aria-label={label}
      role="img"
    >
      <span aria-hidden className="inline-flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={cn(
              "size-3.5",
              i < Math.round(rating)
                ? "fill-caramel-500 text-caramel-500"
                : "fill-cream-500 text-cream-500",
            )}
          />
        ))}
      </span>
      <b aria-hidden className="font-heading font-semibold text-caramel-700">
        {rating.toFixed(1).replace(".", ",")}
      </b>
      {count !== undefined && <span aria-hidden>· {count} avis</span>}
    </span>
  );
}
