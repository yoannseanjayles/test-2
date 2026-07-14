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

/** Carte guide (partagée Accueil / pages animal / hub guides). */
export function EditorialCard({ guide, featured = false, className }: EditorialCardProps) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border border-border bg-cream-50 transition-shadow duration-250 hover:shadow-card",
        featured && "sm:flex-row",
        className,
      )}
    >
      {guide.cover ? (
        <div
          className={cn("relative overflow-hidden", featured && "sm:w-1/2 sm:shrink-0")}
          style={{ aspectRatio: featured ? "4 / 3" : "16 / 9" }}
        >
          <Image
            src={guide.cover}
            alt=""
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-250 group-hover:scale-[1.03]"
          />
        </div>
      ) : (
        <Placeholder
          tone="sage"
          ratio={featured ? "4 / 3" : "16 / 9"}
          className={featured ? "sm:w-1/2 sm:shrink-0" : undefined}
        />
      )}
      <div className={cn("flex flex-col gap-2 p-5", featured && "justify-center sm:p-8")}>
        <p className="text-caption text-bark-700">
          Guide · {guide.readingMinutes} min de lecture
        </p>
        <h3
          className={cn(
            "font-heading font-semibold text-bark-900 transition-colors duration-150 group-hover:text-action",
            featured ? "text-h2" : "text-h3",
          )}
        >
          {guide.title}
        </h3>
        <p className="text-body-sm text-bark-700">{guide.excerpt}</p>
        <span className="text-label mt-1 text-action">Lire le guide →</span>
      </div>
    </Link>
  );
}
