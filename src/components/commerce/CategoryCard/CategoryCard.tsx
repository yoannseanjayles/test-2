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
  /** Rayon annoncé mais pas encore ouvert — pastille volt sur le visuel. */
  soon?: boolean;
  className?: string;
};

/**
 * Bande promo du thème Azeno : visuel plein cadre, voile sombre en bas,
 * titre en capitales condensées et appel à l'action souligné. Le visuel
 * zoome légèrement au survol, le voile se renforce.
 */
export function CategoryCard({
  href,
  label,
  description,
  productCount,
  tone = "chalk",
  image,
  soon = false,
  className,
}: CategoryCardProps) {
  return (
    <Link
      href={href}
      className={cn("group relative block overflow-hidden bg-bark-900", className)}
    >
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4 / 3" }}>
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <Placeholder
            tone={tone}
            ratio="4 / 3"
            className="h-full transition-transform duration-500 ease-out group-hover:scale-105"
          />
        )}
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-bark-900/92 via-bark-900/45 to-bark-900/10 transition-colors duration-250 group-hover:from-bark-900"
        />
      </div>

      {soon && (
        <span className="text-caption absolute left-0 top-0 bg-volt px-2.5 py-1 font-heading font-medium uppercase tracking-[0.12em] text-bark-900">
          Bientôt
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-1 p-6">
        <h3 className="font-display text-h3 leading-none text-white">{label}</h3>
        {description && (
          <p className="text-body-sm line-clamp-1 text-white/75">{description}</p>
        )}
        <span className="text-label mt-2 inline-flex items-center gap-2 border-b border-volt pb-1 text-volt transition-colors duration-250 group-hover:border-white group-hover:text-white">
          Découvrir
          {productCount !== undefined && (
            <span className="text-white/70">({productCount})</span>
          )}
        </span>
      </div>
    </Link>
  );
}
