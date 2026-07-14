import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { UNIVERSES } from "@/lib/nav";

const UNIVERSE_IMAGES: Record<string, string> = {
  chien: "/media/M-HOME-03.jpg",
  chat: "/media/M-HOME-04.jpg",
  nac: "/media/M-HOME-05.jpg",
};

/**
 * Accueil — jalon 1 : hero (M-HOME-01) + cartes univers (M-HOME-03/04/05)
 * avec les médias validés en Phase 3. Les sections S5→S9 (sélection curée,
 * marque, guide phare, avis, newsletter) arrivent au jalon 2 avec le catalogue.
 */
export default function HomePage() {
  return (
    <>
      {/* Hero (spec 2.1 Accueil S3) — texte sur colonne, image LCP prioritaire */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-[1360px] items-center gap-10 px-4 py-14 md:px-6 lg:grid-cols-[5fr_7fr] lg:py-20">
          <div>
            <h1 className="max-w-[16ch] font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.08] font-[560] tracking-[-0.01em] text-balance">
              Des accessoires d&apos;exception pour ceux qui comptent le plus.
            </h1>
            <p className="mt-5 max-w-[48ch] text-lg text-ink-soft">
              Une sélection exigeante de colliers, couchages et jouets —
              choisis pour leur qualité, dessinés pour durer.
            </p>
            <Link
              href="#univers"
              className="mt-8 inline-flex h-[46px] items-center gap-2.5 rounded-md bg-action px-6 font-heading text-[0.9375rem] font-medium text-cream-50 transition-[background-color,transform] duration-150 ease-out hover:-translate-y-px hover:bg-action-strong"
            >
              Découvrir la sélection
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
            <Image
              src="/media/M-HOME-01.jpg"
              alt="Un golden retriever installé sur un couchage matelassé vert sauge, dans un salon baigné de lumière naturelle."
              fill
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Entrées univers (spec S4) */}
      <section id="univers" className="mx-auto max-w-[1360px] px-4 py-16 md:px-6">
        <h2 className="sr-only">Nos univers</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {UNIVERSES.map((universe) => (
            <Link
              key={universe.slug}
              href={`/${universe.slug}`}
              className="group overflow-hidden rounded-lg border border-line bg-surface transition-[box-shadow,transform] duration-250 ease-out hover:-translate-y-0.5 hover:shadow-card"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={UNIVERSE_IMAGES[universe.slug]}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-[400ms] ease-[var(--ease-soft)] group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-6">
                <span className="font-heading text-xl font-semibold">
                  {universe.label}
                </span>
                <p className="mt-1 text-[0.9375rem] text-ink-soft">
                  {universe.tagline}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 font-heading text-sm font-medium text-action">
                  Explorer
                  <ArrowRight
                    aria-hidden
                    className="size-4 transition-transform duration-150 group-hover:translate-x-0.5"
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
