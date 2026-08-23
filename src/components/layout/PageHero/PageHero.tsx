import Image, { type StaticImageData } from "next/image";
import { Breadcrumb, type Crumb } from "@/components/commerce";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  title: string;
  /** Surtitre court en capitales (nom de rubrique, marque…). */
  kicker?: string;
  intro?: string;
  /** Fil d'Ariane rendu dans le bandeau — dernier élément = page courante. */
  crumbs?: Crumb[];
  /** Visuel de fond ; à défaut le bandeau est encre ou gris clair. */
  image?: StaticImageData;
  tone?: "ink" | "light";
  align?: "left" | "center";
  className?: string;
  /** Contenu additionnel (compteur, actions) posé sous l'accroche. */
  children?: React.ReactNode;
};

/**
 * En-tête de page du thème Azeno : bandeau pleine largeur, fil d'Ariane fin,
 * titre en capitales condensées. C'est lui qui donne au site son rythme —
 * chaque page s'ouvre sur le même bloc, seule la teinte change.
 */
export function PageHero({
  title,
  kicker,
  intro,
  crumbs,
  image,
  tone = "ink",
  align = "left",
  className,
  children,
}: PageHeroProps) {
  const dark = tone === "ink" || Boolean(image);

  return (
    <section
      className={cn(
        "relative overflow-hidden",
        dark ? "bg-bark-900 text-white" : "border-b border-border bg-cream-300 text-bark-900",
        className,
      )}
    >
      {image && (
        <>
          <Image
            src={image}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_60%]"
          />
          <span aria-hidden="true" className="absolute inset-0 bg-bark-900/65" />
        </>
      )}

      <div
        className={cn(
          "relative mx-auto max-w-page px-4 py-10 lg:px-6 lg:py-16",
          align === "center" && "text-center",
        )}
      >
        {crumbs && (
          <div className={cn("mb-6", dark && "[&_a]:text-white/60 [&_a:hover]:text-white [&_span]:text-white [&_svg]:text-white/40")}>
            <Breadcrumb items={crumbs} />
          </div>
        )}
        {kicker && (
          <p className={cn("text-label", dark ? "text-volt" : "text-bark-700")}>
            {kicker}
          </p>
        )}
        <h1
          className={cn(
            "font-display mt-3 text-h1 leading-none",
            dark ? "text-white" : "text-bark-900",
          )}
        >
          {title}
        </h1>
        {intro && (
          <p
            className={cn(
              "mt-5 max-w-2xl text-body",
              align === "center" && "mx-auto",
              dark ? "text-white/70" : "text-bark-700",
            )}
          >
            {intro}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
