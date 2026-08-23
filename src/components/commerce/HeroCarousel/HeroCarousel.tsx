"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

import { HeroWord } from "../HeroWord/HeroWord";
import { Placeholder, type PlaceholderTone } from "../Placeholder/Placeholder";
import { cn } from "@/lib/utils";

/*
 * Panneau du hero d'accueil, en carousel.
 *
 * Trois partis pris, tous liés à la même contrainte : c'est le premier écran,
 * il porte le LCP et il doit rester utilisable sans souris.
 *
 * 1. **Aucune dépendance.** Un carousel de deux ou trois vues plein cadre ne
 *    justifie pas d'embarquer une bibliothèque de défilement dans le bundle du
 *    premier écran. Le défilement se réduit ici à un index et une opacité.
 * 2. **Seule la première vue est prioritaire.** Charger toutes les vues en
 *    `priority` reviendrait à télécharger trois images plein écran avant le
 *    premier rendu — le LCP se dégraderait au lieu de s'améliorer.
 * 3. **L'automatisme cède devant l'utilisateur.** Il s'arrête au survol, au
 *    focus clavier, quand l'onglet passe en arrière-plan, et il ne démarre
 *    jamais si le système demande à réduire les animations.
 *
 * Les puces de pagination sont **hors du lien** dans le DOM, et posées
 * par-dessus : un bouton imbriqué dans un lien est invalide et casse la
 * navigation au clavier. Elles restent cliquables grâce à leur plan supérieur.
 */

const DELAI_MS = 6000;

export type HeroPanelSlide = {
  image?: StaticImageData;
  /** Description de la vue — sert de repère aux puces de pagination. */
  label: string;
};

type HeroCarouselProps = {
  /** Le mot contouré, posé au centre. */
  word: string;
  href: string;
  kicker: string;
  text: string;
  cta: string;
  /** Couleur du trait du mot — une par rayon. */
  accent?: string;
  slides: HeroPanelSlide[];
  /** Repli quand une vue n'a pas encore son visuel. */
  tone?: PlaceholderTone;
  /** Vrai pour le premier panneau rendu — porte le LCP. */
  priority?: boolean;
};

export function HeroCarousel({
  word,
  href,
  kicker,
  text,
  cta,
  accent,
  slides,
  tone = "graphite",
  priority = false,
}: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [enPause, setEnPause] = useState(false);
  const vues = slides.length;
  const anime = vues > 1;
  const region = useRef<HTMLDivElement>(null);

  /* Défilement automatique. `matchMedia` est relu à chaque montage plutôt que
     mémorisé : le réglage système peut changer en cours de session. */
  useEffect(() => {
    if (!anime || enPause) return;
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduit.matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % vues), DELAI_MS);
    return () => clearInterval(id);
  }, [anime, enPause, vues]);

  /* Un onglet en arrière-plan continuerait de faire tourner le carousel et de
     décoder des images pour personne. */
  useEffect(() => {
    if (!anime) return;
    const onVisibilite = () => setEnPause(document.hidden);
    document.addEventListener("visibilitychange", onVisibilite);
    return () => document.removeEventListener("visibilitychange", onVisibilite);
  }, [anime]);

  const aller = (n: number) => setIndex((n + vues) % vues);

  return (
    <div
      ref={region}
      role={anime ? "group" : undefined}
      aria-roledescription={anime ? "carrousel" : undefined}
      aria-label={anime ? `Rayon ${word}` : undefined}
      onMouseEnter={() => setEnPause(true)}
      onMouseLeave={() => setEnPause(false)}
      onFocusCapture={() => setEnPause(true)}
      onBlurCapture={() => setEnPause(false)}
      onKeyDown={(event) => {
        if (!anime) return;
        if (event.key === "ArrowRight") aller(index + 1);
        if (event.key === "ArrowLeft") aller(index - 1);
      }}
      className="group relative flex min-h-[58vh] items-center justify-center overflow-hidden lg:min-h-[76vh]"
    >
      {slides.map((slide, i) => (
        <div
          key={slide.label}
          aria-hidden={i !== index}
          className={cn(
            "absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none",
            i === index ? "opacity-100" : "opacity-0",
          )}
        >
          {slide.image ? (
            <Image
              src={slide.image}
              alt=""
              fill
              /* Seule la première vue du premier panneau est prioritaire. Les
                 suivantes se chargent quand le carousel les atteint. */
              priority={priority && i === 0}
              loading={priority && i === 0 ? undefined : "lazy"}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
            />
          ) : (
            <Placeholder
              tone={tone}
              ratio="4 / 5"
              className="absolute inset-0 h-full"
            />
          )}
        </div>
      ))}

      <span
        aria-hidden="true"
        className="absolute inset-0 bg-bark-900/30 bg-gradient-to-t from-bark-900/80 via-bark-900/20 to-bark-900/45"
      />

      {/* Le lien couvre tout le panneau : le hero se clique n'importe où. */}
      <Link
        href={href}
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
      >
        <p className="text-label text-white/80">{kicker}</p>
        <HeroWord word={word} color={accent} className="mt-3" />
        <p className="mt-4 max-w-xs text-body-sm text-white/80">{text}</p>
        <span className="text-label mt-7 inline-flex items-center gap-3 border border-white/70 px-8 py-3.5 text-white transition-colors duration-250 group-hover:border-white group-hover:bg-white group-hover:text-bark-900">
          {cta}
          <ArrowRight aria-hidden="true" className="size-4" />
        </span>
      </Link>

      {anime && (
        <>
          {/* Annonce du changement de vue, sans déplacer le focus. */}
          <p className="sr-only" aria-live="polite">
            Vue {index + 1} sur {vues} — {slides[index]?.label}
          </p>
          <ul className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
            {slides.map((slide, i) => (
              <li key={slide.label}>
                <button
                  type="button"
                  aria-label={`Voir ${slide.label}`}
                  aria-current={i === index ? "true" : undefined}
                  onClick={() => aller(i)}
                  className={cn(
                    "flex h-11 w-8 items-center justify-center",
                    "before:block before:h-1 before:w-full before:transition-colors before:duration-250",
                    i === index ? "before:bg-white" : "before:bg-white/40 hover:before:bg-white/70",
                  )}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
