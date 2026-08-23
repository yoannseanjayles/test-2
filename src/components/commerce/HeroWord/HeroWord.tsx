import { cn } from "@/lib/utils";

/*
 * Mot contouré des panneaux hero (« HOMME » / « FEMME »).
 *
 * La forme ne change pas — capitales Bebas en contour, intérieur ouvert sur
 * la photo. C'est la couleur du trait qui change : au lieu d'un blanc uni,
 * une couleur pleine par panneau, ce qui distingue les deux rayons d'un coup
 * d'œil sans concurrencer la photo.
 *
 * La couleur est passée par le panneau, pas relevée sur son image : un trait
 * qui échantillonne la photo derrière lui perd sa lisibilité dès que le
 * panneau est sombre — le hero femme est violet profond, le mot y disparaît.
 *
 * Le SVG est nécessaire : `-webkit-text-stroke` ne prend qu'une couleur unie
 * mais ne sait pas la faire varier, et `background-clip: text` remplit la
 * lettre au lieu de la creuser. Le `<text>` SVG reste du vrai texte pour les
 * lecteurs d'écran.
 */

/* Repère de tracé. Le mot est étiré sur `WORD_W` quelle que soit la fonte
   chargée : les deux panneaux ont donc exactement la même largeur de mot, et
   un échec de chargement de Bebas ne décale rien. */
const BOX_W = 440;
const BOX_H = 200;
const WORD_W = 400;
const BASELINE = 162;

type HeroWordProps = {
  /** Le mot, écrit tel qu'il doit être lu (rendu en capitales par la fonte). */
  word: string;
  /** Couleur du trait — n'importe quelle couleur CSS, `var(--…)` compris. */
  color?: string;
  /** Épaisseur du trait, en pixels écran (non mise à l'échelle par le SVG). */
  stroke?: number;
  className?: string;
};

/** Mot contouré, une couleur par panneau. */
export function HeroWord({
  word,
  color = "#fff",
  stroke = 3,
  className,
}: HeroWordProps) {
  const commun = {
    x: BOX_W / 2,
    y: BASELINE,
    textAnchor: "middle" as const,
    textLength: WORD_W,
    lengthAdjust: "spacingAndGlyphs" as const,
    fontSize: 200,
    fill: "none",
    vectorEffect: "non-scaling-stroke" as const,
  };

  return (
    <svg
      viewBox={`0 0 ${BOX_W} ${BOX_H}`}
      className={cn("h-auto w-[clamp(9rem,22vw,17rem)]", className)}
      role="img"
      aria-label={word}
    >
      {/* Halo : décolle le mot des zones chargées de la photo. */}
      <text
        {...commun}
        strokeWidth={stroke + 3}
        aria-hidden="true"
        style={{
          fontFamily: "var(--font-display)",
          stroke: "#fff",
          strokeOpacity: 0.2,
        }}
      >
        {word}
      </text>
      {/* `stroke` en style et non en attribut : un attribut SVG n'accepte pas
          `var(--…)`, et les couleurs viennent du thème. */}
      <text
        {...commun}
        strokeWidth={stroke}
        style={{ fontFamily: "var(--font-display)", stroke: color }}
      >
        {word}
      </text>
    </svg>
  );
}
