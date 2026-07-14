import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Titre de section + lien « voir tout » optionnel (spec 2.1 Accueil). */
export function SectionHeading({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
      <h2 className="font-heading text-2xl font-semibold text-balance md:text-[1.75rem]">
        {title}
      </h2>
      {href && linkLabel && (
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 font-heading text-sm font-medium text-action underline-offset-4 hover:text-action-strong hover:underline"
        >
          {linkLabel}
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      )}
    </div>
  );
}
