import { BadgeCheck } from "lucide-react";
import type { Review } from "@/lib/catalog";
import { formatMonth } from "@/lib/format";
import { RatingStars } from "../RatingStars/RatingStars";

/** Carte avis avec contexte animal (D-025) — partagée Accueil S8 / PDP S8. */
export function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="flex flex-col gap-3 rounded-lg bg-cream-50 p-6 shadow-card">
      <RatingStars rating={review.rating} />
      <h3 className="font-heading text-body font-semibold text-bark-900">
        {review.title}
      </h3>
      <p className="text-body-sm text-bark-700">{review.text}</p>
      <footer className="mt-auto flex flex-col gap-1 border-t border-border pt-3">
        <p className="text-body-sm font-semibold text-bark-900">
          {review.author}
          {review.verified && (
            <span className="ml-2 inline-flex items-center gap-1 text-caption font-normal text-sage-700">
              <BadgeCheck aria-hidden="true" className="size-3.5" />
              Achat vérifié
            </span>
          )}
        </p>
        <p className="text-caption text-bark-700">
          {review.context} · {formatMonth(review.date)}
        </p>
      </footer>
    </article>
  );
}
