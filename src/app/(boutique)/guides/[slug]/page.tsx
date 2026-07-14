import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/commerce";
import { UnderConstruction } from "@/components/layout/UnderConstruction/UnderConstruction";
import { guides } from "@/lib/guides";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = guides.find((g) => g.slug === slug);
  if (!guide) return {};
  return { title: guide.title, description: guide.excerpt };
}

/** Article — provisoire jalon 2 : le gabarit article complet arrive au jalon 4. */
export default async function GuidePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const guide = guides.find((g) => g.slug === slug);
  if (!guide) notFound();

  return (
    <div>
      <div className="mx-auto max-w-page px-4 pt-6 lg:px-6">
        <Breadcrumb
          items={[
            { name: "Guides & Conseils", path: "/guides" },
            { name: guide.title, path: `/guides/${guide.slug}` },
          ]}
        />
      </div>
      <UnderConstruction
        title={guide.title}
        milestone="jalon 4"
        description={`${guide.excerpt} — Le contenu complet de ce guide (gabarit article, sommaire, produits recommandés) arrive au jalon 4.`}
      />
    </div>
  );
}
