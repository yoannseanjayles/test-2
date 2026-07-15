"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Check, RotateCcw, ShieldCheck, Truck, X } from "lucide-react";
import {
  averageRating,
  type Product,
  type ProductColor,
  type ProductSize,
} from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { useCart, useCartDrawer } from "@/lib/cart";
import { productImages } from "@/lib/media";
import { subscribeRestock } from "@/lib/engagement";
import { Badge, Button, FormField } from "@/components/ui";
import { Placeholder } from "../Placeholder/Placeholder";
import { RatingStars } from "../RatingStars/RatingStars";
import { cn } from "@/lib/utils";

const GALLERY_VIEWS = [
  "Packshot",
  "Détail matière",
  "Porté à l'échelle",
  "Autre angle",
  "Dimensions",
];

const reassurance = [
  { Icon: Truck, text: "Livraison estimée : 2–3 j ouvrés" },
  { Icon: RotateCcw, text: "Premier retour offert — 30 jours" },
  { Icon: ShieldCheck, text: "Paiement sécurisé" },
];

/**
 * Fiche produit — galerie (S2) + bloc achat (S3) + overlay guide des tailles
 * (S3b) + barre d'achat sticky mobile (spec 2.1 PDP). La galerie suit la
 * couleur sélectionnée ; l'ajout panier est annoncé en aria-live.
 */
export function ProductView({ product }: { product: Product }) {
  const [color, setColor] = useState<ProductColor>(product.colors[0]!);
  const [size, setSize] = useState<ProductSize | null>(
    product.sizes.length === 1 ? product.sizes[0]! : null,
  );
  const [view, setView] = useState(0);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const guideRef = useRef<HTMLDivElement>(null);
  const addCartLine = useCart((state) => state.add);
  const openDrawer = useCartDrawer((state) => state.openDrawer);

  // Photos studio statiques d'abord (H32) ; sinon photos fournisseur
  // distantes des produits importés (7.1) ; sinon placeholders DA.
  const staticImages = productImages[product.slug];
  const remoteImages = product.imageUrls?.length
    ? product.imageUrls.map((src, i) => ({ src, label: `Photo ${i + 1}` }))
    : undefined;
  const realImages = staticImages ?? remoteImages;
  const rating = averageRating(product);
  const singleSize = product.sizes.length === 1;
  const isUniqueSize = singleSize && product.sizes[0]!.name === "Taille unique";
  const outOfStock = product.sizes.every((s) => s.stock === 0);
  const selectedOutOfStock = size !== null && size.stock === 0;

  useEffect(() => {
    if (!guideOpen) return;
    guideRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [guideOpen]);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1500);
    return () => clearTimeout(timer);
  }, [added]);

  const addToCart = () => {
    if (size === null) {
      setSizeError(true);
      return;
    }
    if (size.stock === 0) return;
    addCartLine({ slug: product.slug, size: size.name, color: color.name });
    setAdded(true);
    // Ouverture du mini-panier à chaque ajout (D-029), après la micro-confirmation.
    setTimeout(openDrawer, 600);
  };

  const buyButton = outOfStock ? (
    <Button variant="secondary" className="w-full" disabled>
      Bientôt de retour
    </Button>
  ) : (
    <Button className="w-full" onClick={addToCart} disabled={selectedOutOfStock}>
      {added ? (
        <>
          <Check aria-hidden="true" className="size-4" /> Ajouté
        </>
      ) : (
        "Ajouter au panier"
      )}
    </Button>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[55fr_45fr] lg:gap-12">
      {/* S2 — Galerie : vraies photos (M-PDP-*) quand livrées, placeholders DA sinon (H32). */}
      <div className="flex flex-col-reverse gap-3 lg:flex-row">
        <ul className="flex gap-2 lg:flex-col" role="tablist" aria-label="Vues du produit">
          {(realImages ?? GALLERY_VIEWS).map((item, index) => {
            const label = typeof item === "string" ? item : item.label;
            return (
              <li key={label}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={view === index}
                  aria-label={label}
                  onClick={() => setView(index)}
                  className={cn(
                    "block w-14 overflow-hidden rounded-md border transition-colors duration-150",
                    view === index ? "border-pine-700" : "border-border hover:border-bark-300",
                  )}
                >
                  {typeof item === "string" ? (
                    <Placeholder tone={product.tone} ratio="1 / 1" />
                  ) : (
                    <Image
                      src={item.src}
                      alt=""
                      className="aspect-square h-auto w-full object-cover"
                      sizes="56px"
                      // Les URLs distantes (import) n'ont pas de dimensions intrinsèques.
                      {...(typeof item.src === "string" ? { width: 960, height: 960 } : {})}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        <figure className="relative flex-1 overflow-hidden rounded-lg">
          {realImages ? (
            <Image
              src={realImages[Math.min(view, realImages.length - 1)]!.src}
              alt={`${product.name} — ${realImages[Math.min(view, realImages.length - 1)]!.label}`}
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="aspect-square h-auto w-full object-cover"
              priority
              {...(typeof realImages[Math.min(view, realImages.length - 1)]!.src === "string"
                ? { width: 960, height: 960 }
                : {})}
            />
          ) : (
            <Placeholder tone={product.tone} ratio="1 / 1" label={`${GALLERY_VIEWS[view]} — ${color.name}`} />
          )}
          {product.isNew && (
            <Badge variant="new" className="absolute left-4 top-4">
              Nouveau
            </Badge>
          )}
          <figcaption className="sr-only">
            {product.name} — vue {view + 1}, coloris {color.name}
          </figcaption>
        </figure>
      </div>

      {/* S3 — Bloc achat */}
      <div>
        <p className="text-caption text-bark-700">{product.brand}</p>
        <h1 className="font-display mt-1 text-h1 font-[560] text-bark-900">
          {product.name}
        </h1>
        {rating !== null ? (
          <a href="#avis" className="mt-2 inline-block">
            <RatingStars rating={rating} count={product.reviews.length} />
          </a>
        ) : (
          <p className="text-caption mt-2 text-bark-700">Aucun avis pour l'instant</p>
        )}

        <p className="text-price mt-4 text-2xl text-bark-900">
          {formatPrice(product.price)}
        </p>
        <p className="mt-4 text-body text-bark-700">{product.shortDescription}</p>

        {/* Sélecteur couleur */}
        {product.colors.length > 1 && (
          <fieldset className="mt-6">
            <legend className="text-label text-bark-900">
              Coloris : <span className="font-normal text-bark-700">{color.name}</span>
            </legend>
            <div className="mt-2 flex gap-2">
              {product.colors.map((c) => (
                <label key={c.name} className="cursor-pointer">
                  <input
                    type="radio"
                    name="couleur"
                    value={c.name}
                    checked={color.name === c.name}
                    onChange={() => setColor(c)}
                    className="peer sr-only"
                  />
                  <span
                    style={{ backgroundColor: c.hex }}
                    className="block size-9 rounded-full border-2 border-border transition-shadow duration-150 peer-checked:border-pine-700 peer-checked:ring-2 peer-checked:ring-pine-300 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-pine-500"
                  />
                  <span className="sr-only">{c.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {/* Sélecteur taille (D-024 : boutons avec stock visible) */}
        {!singleSize && (
          <fieldset className="mt-6">
            <legend className="text-label flex w-full items-baseline justify-between gap-4 text-bark-900">
              Taille
              <button
                type="button"
                onClick={() => setGuideOpen(true)}
                className="font-normal text-action underline-offset-4 hover:underline"
              >
                Guide des tailles
              </button>
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <label key={s.name} className="cursor-pointer">
                  <input
                    type="radio"
                    name="taille"
                    value={s.name}
                    checked={size?.name === s.name}
                    onChange={() => {
                      setSize(s);
                      setSizeError(false);
                    }}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      "text-label flex min-h-11 min-w-14 items-center justify-center rounded-md border px-4 transition-colors duration-150",
                      "peer-checked:border-pine-700 peer-checked:bg-pine-700 peer-checked:text-white",
                      "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-pine-500",
                      s.stock === 0
                        ? "border-border bg-cream-300 text-bark-500 line-through"
                        : "border-border bg-cream-50 text-bark-900 hover:border-bark-300",
                    )}
                  >
                    {s.name}
                  </span>
                  <span className="sr-only">
                    {s.stock === 0 ? " — bientôt de retour" : ""}
                  </span>
                </label>
              ))}
            </div>
            {sizeError && (
              <p role="alert" className="mt-2 text-body-sm text-error">
                Choisissez une taille pour ajouter au panier.
              </p>
            )}
          </fieldset>
        )}
        {isUniqueSize && (
          <p className="mt-6 text-body-sm text-bark-700">
            Taille unique — convient à tous les gabarits.
          </p>
        )}

        {/* Rupture de la taille sélectionnée : alerte restock (H15) */}
        {selectedOutOfStock && !outOfStock && (
          <RestockAlert sizeName={size.name} productSlug={product.slug} />
        )}

        <div className="mt-6">{buyButton}</div>
        <p aria-live="polite" className="sr-only">
          {added ? `${product.name} ajouté au panier` : ""}
        </p>
        {outOfStock && <RestockAlert sizeName="ce produit" productSlug={product.slug} />}

        {/* Réassurance adjacente */}
        <ul className="mt-6 flex flex-col gap-2 border-t border-border pt-5">
          {reassurance.map(({ Icon, text }) => (
            <li key={text} className="flex items-center gap-2.5 text-body-sm text-bark-700">
              <Icon aria-hidden="true" className="size-4 text-pine-700" strokeWidth={1.75} />
              {text}
            </li>
          ))}
        </ul>
      </div>

      {/* Barre d'achat sticky mobile (au-dessus de la barre de navigation basse) */}
      <div className="fixed inset-x-0 bottom-14 z-30 border-t border-border bg-cream-50 px-4 py-2.5 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-price truncate text-bark-900">{formatPrice(product.price)}</p>
            <p className="text-caption truncate text-bark-700">
              {size ? `Taille ${size.name}` : singleSize ? product.sizes[0]!.name : "Choisir une taille"}
              {" · "}
              {color.name}
            </p>
          </div>
          <div className="shrink-0">{buyButton}</div>
        </div>
      </div>

      {/* S3b — Overlay guide des tailles */}
      {guideOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Fermer le guide des tailles"
            onClick={() => setGuideOpen(false)}
            className="absolute inset-0 bg-scrim"
          />
          <div
            ref={guideRef}
            role="dialog"
            aria-modal="true"
            aria-label="Guide des tailles"
            tabIndex={-1}
            onKeyDown={(event) => {
              if (event.key === "Escape") setGuideOpen(false);
            }}
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto rounded-l-lg bg-cream-50 shadow-overlay"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="font-heading text-h3 font-semibold text-bark-900">
                Guide des tailles
              </h2>
              <button
                type="button"
                aria-label="Fermer"
                onClick={() => setGuideOpen(false)}
                className="flex size-11 items-center justify-center rounded-sm text-bark-700 hover:bg-cream-300"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            <div className="px-6 py-6">
              <p className="text-body-sm text-bark-700">
                Mesurez votre animal au repos, sans serrer, et ajoutez deux
                doigts d'aisance. Entre deux tailles, prenez la plus grande.
              </p>
              <table className="mt-5 w-full border-collapse text-body-sm">
                <caption className="sr-only">
                  Correspondance des tailles selon le gabarit
                </caption>
                <thead>
                  <tr className="border-b border-border text-left">
                    <th scope="col" className="py-2 pr-4 font-heading font-semibold text-bark-900">Taille</th>
                    <th scope="col" className="py-2 pr-4 font-heading font-semibold text-bark-900">Gabarit</th>
                    <th scope="col" className="py-2 font-heading font-semibold text-bark-900">Poids</th>
                  </tr>
                </thead>
                <tbody className="text-bark-700">
                  {[
                    ["XS", "Très petit", "moins de 5 kg"],
                    ["S", "Petit", "5 à 10 kg"],
                    ["M", "Moyen", "10 à 20 kg"],
                    ["L", "Grand", "20 à 40 kg"],
                    ["XL", "Très grand", "plus de 40 kg"],
                  ].map(([taille, gabarit, poids]) => (
                    <tr key={taille} className="border-b border-border">
                      <td className="py-2 pr-4 font-semibold text-bark-900">{taille}</td>
                      <td className="py-2 pr-4">{gabarit}</td>
                      <td className="py-2">{poids}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-5 text-body-sm text-bark-700">
                Besoin d'aide pour mesurer ?{" "}
                <Link
                  href="/guides/comment-mesurer-votre-animal"
                  className="text-action underline-offset-4 hover:underline"
                >
                  Lire « Comment mesurer votre animal »
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Capture e-mail de restock (H15) — persistée en base (6.1 jalon 4). */
function RestockAlert({ sizeName, productSlug }: { sizeName: string; productSlug?: string }) {
  const [subscribed, setSubscribed] = useState(false);
  return (
    <form
      className="mt-4 rounded-md bg-cream-300 p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const email = String(new FormData(event.currentTarget).get("email") ?? "");
        const result = await subscribeRestock({
          productSlug: productSlug ?? "",
          size: sizeName,
          email,
        });
        if (result.ok) setSubscribed(true);
      }}
    >
      <p className="text-body-sm text-bark-900">
        {sizeName === "ce produit"
          ? "Ce produit revient bientôt."
          : `La taille ${sizeName} revient bientôt.`}{" "}
        Recevez un e-mail dès son retour en stock.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
        <FormField
          label="Votre e-mail"
          name="email"
          type="email"
          required
          placeholder="prenom@exemple.fr"
          className="flex-1"
        />
        <Button type="submit" variant="secondary" className="shrink-0">
          Me prévenir
        </Button>
      </div>
      <p aria-live="polite" className="mt-2 text-body-sm text-success">
        {subscribed ? "C'est noté — nous vous prévenons dès le retour en stock." : ""}
      </p>
    </form>
  );
}
