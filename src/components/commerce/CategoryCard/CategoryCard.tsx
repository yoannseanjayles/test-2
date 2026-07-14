import Link from "next/link";
import { Placeholder, type PlaceholderTone } from "../Placeholder/Placeholder";
import { cn } from "@/lib/utils";

type CategoryCardProps = {
  href: string;
  label: string;
  description?: string;
  productCount?: number;
  tone?: PlaceholderTone;
  className?: string;
};

/** Carte d'entrée univers / sous-catégorie (spec Accueil S4, Listing gabarit A). */
export function CategoryCard({
  href,
  label,
  description,
  productCount,
  tone = "cream",
  className,
}: CategoryCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border border-border bg-cream-50",
        "transition-shadow duration-250 hover:shadow-card",
        className,
      )}
    >
      <Placeholder tone={tone} ratio="4 / 3" />
      <div className="flex items-baseline justify-between gap-2 p-4">
        <div>
          <h3 className="font-heading text-h3 font-semibold text-bark-900 transition-colors duration-150 group-hover:text-action">
            {label}
          </h3>
          {description && (
            <p className="mt-1 text-body-sm text-bark-700">{description}</p>
          )}
        </div>
        {productCount !== undefined && (
          <span className="text-caption shrink-0 text-bark-700">
            {productCount} produit{productCount > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </Link>
  );
}
