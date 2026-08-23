import Link from "next/link";
import Image from "next/image";
import type { Guide } from "@/lib/guides";
import { Placeholder } from "../Placeholder/Placeholder";
import { cn } from "@/lib/utils";

type EditorialCardProps = {
  guide: Guide;
  /** Format « phare » : visuel large et accroche (spec Accueil S7). */
  featured?: boolean;
  className?: string;
};

/** Carte guide — refonte Azeno : visuel plein cadre, titre condensé, filet bas. */
export function EditorialCard({ guide, featured = false, className }: EditorialCardProps) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className={cn("group flex flex-col", featured && "sm:flex-row sm:items-stretch", className)}
    >
      <div
        className={cn("relative overflow-hidden bg-cream-300", featured && "sm:w-1/2 sm:shrink-0")}
        style={{ aspectRatio: featured ? "4 / 3" : "16 / 9" }}
      >
        {guide.cover ? (
          <Image
            src={guide.cover}
            alt=""
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <Placeholder
            tone="chalk"
            ratio={featured ? "4 / 3" : "16 / 9"}
            className="h-full"
          />
        )}
      </div>
      <div
        className={cn(
          "flex flex-col gap-2 pt-4",
          featured && "justify-center sm:px-8 sm:pt-0",
        )}
      >
        <p className="text-caption uppercase tracking-[0.14em] text-bark-500">
          Guide · {guide.readingMinutes} min de lecture
        </p>
        <h3
          className={cn(
            "font-display leading-none text-bark-900 transition-colors duration-150 group-hover:text-action",
            featured ? "text-h2" : "text-h3",
          )}
        >
          {guide.title}
        </h3>
        <p className="text-body-sm text-bark-700">{guide.excerpt}</p>
        <span className="text-label mt-2 inline-flex w-fit items-center gap-2 border-b border-bark-900 pb-1 text-bark-900 transition-colors duration-250 group-hover:border-action group-hover:text-action">
          Lire le guide
        </span>
      </div>
    </Link>
  );
}
