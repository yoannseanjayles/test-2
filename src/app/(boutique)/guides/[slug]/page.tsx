import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { Breadcrumb, ProductCard, SectionHeading } from "@/components/commerce";
import { fetchGuide, fetchGuides, fetchProducts } from "@/lib/api";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { formatMonth } from "@/lib/format";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  return (await fetchGuides()).map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = await fetchGuide(slug);
  if (!guide) return {};
  return { title: guide.title, description: guide.excerpt };
}

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-");

/** Gabarit article (spec 2.1 Guides, D-037) : E-E-A-T, sommaire, ≤ 3 produits marqués sélection. */
export default async function GuidePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const guide = await fetchGuide(slug);
  if (!guide) notFound();

  const crumbs = [
    { name: "Guides & Conseils", path: "/guides" },
    { name: guide.title, path: `/guides/${guide.slug}` },
  ];
  const relatedProducts = (
    await Promise.all(guide.relatedSubcategories.map((sub) => fetchProducts(undefined, sub)))
  )
    .flat()
    .sort((a, b) => a.curatedRank - b.curatedRank)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-page px-4 pb-16 lg:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs)) }}
      />
      <div className="py-6">
        <Breadcrumb items={crumbs} />
      </div>

      <article className="mx-auto max-w-3xl">
        <p className="text-caption text-bark-700">
          Guide {guide.pillar ? "complet" : "pratique"} · {guide.readingMinutes} min de lecture
        </p>
        <h1 className="font-display mt-2 text-h1 font-[560] text-bark-900">{guide.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-bark-700">{guide.excerpt}</p>

        {/* E-E-A-T : auteur, relecture pro (H27), date (D-037) */}
        {guide.author && (
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 border-y border-border py-3 text-caption text-bark-700">
            <span className="font-semibold text-bark-900">{guide.author.name}</span>
            <span>{guide.author.role}</span>
            <span className="inline-flex items-center gap-1 text-sage-700">
              <BadgeCheck aria-hidden="true" className="size-3.5" />
              {guide.author.reviewedBy}
            </span>
            <span>Mis à jour en {formatMonth(guide.author.updated)}</span>
          </div>
        )}

        {guide.cover && (
          <Image
            src={guide.cover}
            alt=""
            sizes="(min-width: 768px) 768px, 100vw"
            className="mt-6 h-auto w-full rounded-lg object-cover"
            priority
          />
        )}

        {guide.content ? (
          <>
            <nav aria-label="Sommaire" className="mt-8 rounded-lg bg-cream-50 p-5 shadow-card">
              <p className="text-label text-bark-900">Au sommaire</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-body-sm">
                {guide.content.map((section) => (
                  <li key={section.heading}>
                    <a href={`#${slugify(section.heading)}`} className="text-action underline-offset-4 hover:underline">
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            {guide.content.map((section) => (
              <section key={section.heading} className="mt-10">
                <h2
                  id={slugify(section.heading)}
                  className="font-heading scroll-mt-24 text-h2 font-semibold text-bark-900"
                >
                  {section.heading}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)} className="mt-4 text-[1.0625rem] leading-[1.7] text-bark-700">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </>
        ) : (
          <p className="mt-8 rounded-lg bg-cream-300 p-5 text-body-sm text-bark-700">
            Le contenu complet de ce guide est en cours de rédaction — il suivra
            le même gabarit que nos guides publiés.
          </p>
        )}
      </article>

      {/* ≤ 3 produits, explicitement marqués comme sélection (D-037) */}
      {relatedProducts.length > 0 && (
        <section aria-labelledby="selection-guide" className="mx-auto mt-14 max-w-4xl">
          <SectionHeading id="selection-guide" title="Notre sélection sur le sujet" />
          <p className="mt-1 text-caption text-bark-700">
            Sélection éditoriale chien et chat — produits testés par l'équipe, sans lien sponsorisé.
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
            {relatedProducts.map((product) => (
              <li key={product.slug}>
                <ProductCard product={product} className="h-full" />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mx-auto mt-12 max-w-3xl border-t border-border pt-6">
        <Link href="/guides" className="text-label inline-flex min-h-11 items-center gap-2 text-action hover:text-action-hover">
          ← Tous les guides
        </Link>
      </div>
    </div>
  );
}
