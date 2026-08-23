import Image from "next/image";
import Link from "next/link";
import {
  averageRating,
  isFieldVisible,
  isOutOfStock,
  productPath,
  type Product,
} from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui";
import { Placeholder } from "../Placeholder/Placeholder";
import { RatingStars } from "../RatingStars/RatingStars";
import { cn } from "@/lib/utils";
import { brandLabels } from "@/lib/catalog";

type ProductCardProps = {
  product: Product;
  className?: string;
};

/**
 * Carte produit — refonte Azeno : la photo repose sur une tuile gris clair
 * sans bordure ni ombre, le second visuel apparaît en fondu au survol, le
 * texte est aligné à gauche sous la tuile. Toute la carte est cliquable
 * avec focus englobant (4.1 §6).
 */
export function ProductCard({ product, className }: ProductCardProps) {
  const rating = averageRating(product);
  const outOfStock = isOutOfStock(product);
  /*
   * Carte Azeno : la marque est toujours en surtitre, jamais répétée dans le
   * nom du modèle. Les deux restent dans le même lien — les lecteurs d'écran
   * annoncent donc « Nike, Air Max 90 » sans perte d'information.
   */
  const eyebrow = brandLabels[product.brand];
  const modelName = product.name
    .replace(new RegExp(`^${eyebrow}\\s+`, "i"), "")
    .trim() || product.name;
  const showImages = isFieldVisible(product, "images");
  const gallery = showImages
    ? product.colors[0]?.images ?? product.imageUrls ?? []
    : [];
  const cover = gallery[0];
  const hoverShot = gallery[1];

  return (
    <Link
      href={productPath(product)}
      className={cn("group flex flex-col", outOfStock && "opacity-70", className)}
    >
      <div className="relative overflow-hidden bg-cream-300">
        {cover ? (
          <>
            <Image
              src={cover}
              alt=""
              width={640}
              height={640}
              sizes="(min-width: 1024px) 25vw, 50vw"
              className={cn(
                "aspect-square h-auto w-full object-cover transition-all duration-500 ease-out",
                hoverShot
                  ? "group-hover:opacity-0"
                  : "group-hover:scale-105",
              )}
            />
            {hoverShot && (
              <Image
                src={hoverShot}
                alt=""
                width={640}
                height={640}
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="absolute inset-0 aspect-square h-full w-full object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <Placeholder tone={product.tone} ratio="1 / 1" />
        )}

        <span className="absolute left-0 top-0 flex flex-col items-start gap-1">
          {product.isNew && !outOfStock && <Badge variant="new">Nouveau</Badge>}
          {outOfStock && <Badge variant="stock">Bientôt de retour</Badge>}
        </span>

        {/* Bandeau d'appel au survol — desktop uniquement, purement décoratif. */}
        <span
          aria-hidden="true"
          className="text-label pointer-events-none absolute inset-x-0 bottom-0 hidden translate-y-full bg-volt py-3 text-center text-bark-900 transition-transform duration-250 ease-out group-hover:translate-y-0 lg:block"
        >
          Voir le modèle
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-caption uppercase tracking-[0.14em] text-bark-500">
                {eyebrow}
              </p>
            )}
            <h3 className="mt-1 font-heading text-body-sm font-medium text-bark-900 transition-colors duration-150 group-hover:text-action">
              {modelName}
            </h3>
          </div>
          {rating !== null && (
            <RatingStars rating={rating} compact className="shrink-0 pt-0.5" />
          )}
        </div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="text-price text-bark-900">
            {formatPrice(product.price)}
          </span>
          <span aria-hidden="true" className="inline-flex gap-1.5">
            {product.colors.slice(0, 4).map((color) => (
              <span
                key={color.name}
                title={color.name}
                style={{ backgroundColor: color.hex }}
                className="size-3 rounded-full ring-1 ring-cream-500 ring-offset-1"
              />
            ))}
          </span>
        </div>
      </div>
    </Link>
  );
}
