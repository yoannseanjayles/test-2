"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Check, RotateCcw, ShieldCheck, Truck, X } from "lucide-react";
import {
  averageRating,
  formatSize,
  getBrand,
  isColorOutOfStock,
  isFieldVisible,
  type Product,
  type ProductColor,
  sizesForColor,
  stockFor,
} from "@/lib/catalog";
import { brandLabels } from "@/lib/catalog";
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
  // La pointure est une chaîne, pas un objet : le stock dépend du couple
  // (coloris, pointure) depuis D-054, et se lit donc à la demande.
  const [size, setSize] = useState<string | null>(null);
  const [view, setView] = useState(0);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const guideRef = useRef<HTMLDivElement>(null);
  const addCartLine = useCart((state) => state.add);
  const openDrawer = useCartDrawer((state) => state.openDrawer);

  // Photos studio statiques d'abord (H32) ; sinon photos fournisseur
  // distantes des produits importés (7.1), si le champ est visible ;
  // sinon placeholders DA.
  const staticImages = productImages[product.slug];
  // Photos du coloris sélectionné (jalon 3) : ce sont les vraies images du
  // catalogue, une série par coloris — la galerie suit donc la pastille.
  const colorImages =
    color.images?.length && isFieldVisible(product, "images")
      ? color.images.map((src, i) => ({ src, label: `${color.name} — vue ${i + 1}` }))
      : undefined;
  const remoteImages =
    product.imageUrls?.length && isFieldVisible(product, "images")
      ? product.imageUrls.map((src, i) => ({ src, label: `Photo ${i + 1}` }))
      : undefined;
  const realImages = colorImages ?? staticImages ?? remoteImages;
  const rating = averageRating(product);
  const colorSizes = sizesForColor(product, color.name);
  const colorOutOfStock = isColorOutOfStock(product, color.name);
  const selectedOutOfStock = size !== null && stockFor(product, color.name, size) === 0;
  const sizeChart = getBrand(product.brand);

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
    if (stockFor(product, color.name, size) === 0) return;
    addCartLine({ slug: product.slug, size, color: color.name });
    setAdded(true);
    // Ouverture du mini-panier à chaque ajout (D-029), après la micro-confirmation.
    setTimeout(openDrawer, 600);
  };

  const buyButton = colorOutOfStock ? (
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
              <li key={label} role="presentation">
                <button
                  type="button"
                  role="tab"
                  aria-selected={view === index}
                  aria-label={label}
                  onClick={() => setView(index)}
                  className={cn(
                    "block w-14 overflow-hidden border transition-colors duration-150",
                    view === index ? "border-bark-900" : "border-border hover:border-bark-900",
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
        <figure className="relative flex-1 overflow-hidden bg-cream-300">
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
        <p className="text-label text-bark-500">{brandLabels[product.brand]}</p>
        <h1 className="font-display mt-1 text-h1 text-bark-900">
          {product.name}
        </h1>
        {rating !== null ? (
          <a href="#avis" className="mt-2 inline-block">
            <RatingStars rating={rating} count={product.reviews.length} />
          </a>
        ) : (
          <p className="text-caption mt-2 text-bark-700">Aucun avis pour l'instant</p>
        )}

        <p className="text-price mt-5 text-2xl text-bark-900">
          {formatPrice(product.price)}
        </p>
        <p className="mt-4 text-body text-bark-700">{product.shortDescription}</p>

        {/* Points clés (import enrichi) — masquables champ par champ dans l'admin. */}
        {(product.features?.length ?? 0) > 0 && isFieldVisible(product, "features") && (
          <ul className="mt-4 list-disc space-y-1.5 pl-5 text-body-sm text-bark-700">
            {product.features!.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        )}

        {/* Sélecteur couleur */}
        {product.colors.length > 1 && (
          <fieldset className="mt-6">
            <legend className="text-label text-bark-900">
              Coloris : <span className="font-normal text-bark-700">{color.name}</span>
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <label key={c.name} className="cursor-pointer">
                  <input
                    type="radio"
                    name="couleur"
                    value={c.name}
                    checked={color.name === c.name}
                    onChange={() => {
                      setColor(c);
                      setView(0);
                      // Une pointure indisponible dans le nouveau coloris ne
                      // peut pas rester sélectionnée : elle serait ajoutée au
                      // panier sans stock correspondant.
                      setSize((current) =>
                        current !== null && sizesForColor(product, c.name).includes(current)
                          ? current
                          : null,
                      );
                    }}
                    className="peer sr-only"
                  />
                  <span
                    style={{ backgroundColor: c.hex }}
                    className="block size-10 border border-border transition-all duration-250 peer-checked:border-bark-900 peer-checked:ring-1 peer-checked:ring-bark-900 peer-checked:ring-offset-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-pine-700"
                  />
                  <span className="sr-only">{c.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {/* Sélecteur pointure (D-024 : boutons avec stock visible) */}
        {colorSizes.length > 0 && (
          <fieldset className="mt-6">
            <legend className="text-label flex w-full items-baseline justify-between gap-4 text-bark-900">
              Pointure
              <button
                type="button"
                onClick={() => setGuideOpen(true)}
                className="text-label border-b border-bark-900 pb-0.5 text-bark-900 transition-colors duration-250 hover:border-action hover:text-action"
              >
                Guide des tailles
              </button>
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {colorSizes.map((value) => {
                const stock = stockFor(product, color.name, value);
                return (
                <label key={value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="pointure"
                    value={value}
                    checked={size === value}
                    onChange={() => {
                      setSize(value);
                      setSizeError(false);
                    }}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      "text-label flex min-h-12 min-w-14 items-center justify-center border px-4 transition-colors duration-250",
                      "peer-checked:border-bark-900 peer-checked:bg-bark-900 peer-checked:text-white",
                      "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-pine-700",
                      stock === 0
                        ? "border-border bg-cream-300 text-bark-500 line-through"
                        : "border-border bg-cream-50 text-bark-900 hover:border-bark-900",
                    )}
                  >
                    {formatSize(value)}
                  </span>
                  <span className="sr-only">
                    {stock === 0 ? " — bientôt de retour" : ""}
                  </span>
                </label>
                );
              })}
            </div>
            {product.sizeAdvice && (
              <p className="mt-3 text-body-sm text-bark-700">{product.sizeAdvice}</p>
            )}
            {sizeError && (
              <p role="alert" className="mt-2 text-body-sm text-error">
                Choisissez une pointure pour ajouter au panier.
              </p>
            )}
          </fieldset>
        )}

        {/* Rupture de la taille sélectionnée : alerte restock (H15) */}
        {selectedOutOfStock && !colorOutOfStock && (
          <RestockAlert
            sizeName={formatSize(size)}
            colorName={color.name}
            productSlug={product.slug}
          />
        )}

        <div className="mt-6">{buyButton}</div>
        <p aria-live="polite" className="sr-only">
          {added ? `${product.name} ajouté au panier` : ""}
        </p>
        {colorOutOfStock && (
          <RestockAlert sizeName="ce produit" colorName={color.name} productSlug={product.slug} />
        )}

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
              {size ? `Pointure ${formatSize(size)}` : "Choisir une pointure"}
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
              <h2 className="font-display text-h3 leading-tight text-bark-900">
                Guide des tailles
              </h2>
              <button
                type="button"
                aria-label="Fermer"
                onClick={() => setGuideOpen(false)}
                className="flex size-11 items-center justify-center text-bark-700 hover:bg-cream-300"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            <div className="px-6 py-6">
              <p className="text-body-sm text-bark-700">
                Mesurez la longueur de votre pied en centimètres, debout, en
                fin de journée, et comparez-la à la colonne « {sizeChart.lengthLabel} ».
                C'est plus fiable que de reporter votre pointure habituelle :
                les marques ne découpent pas les pointures de la même façon.
              </p>
              {/*
                ST-3 : la grille affichée est celle de la marque du produit.
                Sa provenance est dite, pas masquée — une seule des cinq
                grilles du catalogue vient directement du fabricant, et une
                correspondance inventée se paie en retours.
              */}
              <p className="mt-3 bg-cream-300 p-3 text-body-sm text-bark-700">
                {sizeChart.sizeChartVerified
                  ? `Grille officielle ${sizeChart.label}. `
                  : `Grille ${sizeChart.label} redistribuée par revendeur, non confirmée par la marque. `}
                {sizeChart.sizeChartNote}
              </p>
              <table className="mt-5 w-full border-collapse text-body-sm">
                <caption className="sr-only">
                  Correspondance des pointures {sizeChart.label} — EU, UK, US et longueur
                </caption>
                <thead>
                  <tr className="border-b border-border text-left">
                    <th scope="col" className="py-2 pr-4 font-heading font-semibold text-bark-900">EU</th>
                    <th scope="col" className="py-2 pr-4 font-heading font-semibold text-bark-900">UK</th>
                    <th scope="col" className="py-2 pr-4 font-heading font-semibold text-bark-900">US H</th>
                    <th scope="col" className="py-2 pr-4 font-heading font-semibold text-bark-900">US F</th>
                    <th scope="col" className="py-2 font-heading font-semibold text-bark-900">
                      {sizeChart.lengthLabel}
                    </th>
                  </tr>
                </thead>
                <tbody className="text-bark-700">
                  {sizeChart.sizeChart.map((row) => (
                    <tr key={row.eu} className="border-b border-border">
                      <td className="py-2 pr-4 font-semibold text-bark-900">{formatSize(row.eu)}</td>
                      <td className="py-2 pr-4">{row.uk ?? "—"}</td>
                      <td className="py-2 pr-4">{row.usMen ?? "—"}</td>
                      <td className="py-2 pr-4">{row.usWomen ?? "—"}</td>
                      <td className="py-2">{row.length ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {product.sizeAdvice && (
                <>
                  <h3 className="mt-6 font-heading text-body font-semibold text-bark-900">
                    Chaussant de ce modèle
                  </h3>
                  <p className="mt-2 text-body-sm text-bark-700">{product.sizeAdvice}</p>
                </>
              )}
              <p className="mt-5 text-body-sm text-bark-700">
                Un doute sur une pointure limite ?{" "}
                <Link
                  href="/guides/bien-choisir-sa-pointure"
                  className="text-action underline-offset-4 hover:underline"
                >
                  Lire « Bien choisir sa pointure »
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Capture e-mail de restock (H15) — persistée en base, par variante (D-054). */
function RestockAlert({
  sizeName,
  colorName,
  productSlug,
}: {
  sizeName: string;
  colorName: string;
  productSlug?: string;
}) {
  const [subscribed, setSubscribed] = useState(false);
  return (
    <form
      className="mt-4 bg-cream-300 p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const email = String(new FormData(event.currentTarget).get("email") ?? "");
        const result = await subscribeRestock({
          productSlug: productSlug ?? "",
          color: colorName,
          size: sizeName,
          email,
        });
        if (result.ok) setSubscribed(true);
      }}
    >
      <p className="text-body-sm text-bark-900">
        {sizeName === "ce produit"
          ? `Ce coloris (${colorName}) revient bientôt.`
          : `La pointure ${sizeName} en ${colorName} revient bientôt.`}{" "}
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
