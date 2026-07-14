import Link from "next/link";
import {
  averageRating,
  isOutOfStock,
  productPath,
  type Product,
} from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui";
import { Placeholder } from "../Placeholder/Placeholder";
import { RatingStars } from "../RatingStars/RatingStars";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: Product;
  className?: string;
};

/**
 * Carte produit partagée (validée 2.1 Accueil, réutilisée listings/cross-sell) :
 * photo, nom, prix, note, pastilles couleurs, badge. Toute la carte est
 * cliquable avec focus englobant (4.1 §6).
 */
export function ProductCard({ product, className }: ProductCardProps) {
  const rating = averageRating(product);
  const outOfStock = isOutOfStock(product);

  return (
    <Link
      href={productPath(product)}
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border border-border bg-cream-50",
        "transition-shadow duration-250 hover:shadow-card",
        outOfStock && "opacity-70",
        className,
      )}
    >
      <div className="relative">
        <Placeholder tone={product.tone} ratio="1 / 1" />
        {product.isNew && !outOfStock && (
          <Badge variant="new" className="absolute left-3 top-3">
            Nouveau
          </Badge>
        )}
        {outOfStock && (
          <Badge variant="stock" className="absolute left-3 top-3">
            Bientôt de retour
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-caption text-bark-700">{product.brand}</p>
        <h3 className="font-heading text-body font-semibold text-bark-900 transition-colors duration-150 group-hover:text-action">
          {product.name}
        </h3>
        {rating !== null && (
          <RatingStars rating={rating} count={product.reviews.length} />
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-price text-bark-900">
            {formatPrice(product.price)}
          </span>
          <span aria-hidden="true" className="inline-flex gap-1">
            {product.colors.slice(0, 4).map((color) => (
              <span
                key={color.name}
                title={color.name}
                style={{ backgroundColor: color.hex }}
                className="size-3.5 rounded-full border border-border"
              />
            ))}
          </span>
        </div>
      </div>
    </Link>
  );
}
