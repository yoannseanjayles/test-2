import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import { Placeholder, type PlaceholderTone } from "../Placeholder/Placeholder";
import { cn } from "@/lib/utils";

type CategoryCardProps = {
  href: string;
  label: string;
  description?: string;
  productCount?: number;
  tone?: PlaceholderTone;
  /** Visuel réel (inventaire 3.1) — placeholder DA sinon (H32). */
  image?: StaticImageData;
  className?: string;
};

/** Carte d'entrée univers / sous-catégorie (spec Accueil S4, Listing gabarit A). */
export function CategoryCard({
  href,
  label,
  description,
  productCount,
  tone = "cream",
  image,
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
      {image ? (
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4 / 3" }}>
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition-transform duration-250 group-hover:scale-[1.03]"
          />
        </div>
      ) : (
        <Placeholder tone={tone} ratio="4 / 3" />
      )}
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
