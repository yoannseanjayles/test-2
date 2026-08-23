"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import {
  brandLabels,
  formatSize,
  genreLabels,
  type Brand,
  type Genre,
  type Product,
  uniqueSortedSizes,
} from "@/lib/catalog";
import {
  applyFilters,
  countActiveFilters,
  emptyFilters,
  facetCounts,
  facetMatchers,
  filtersFromSearchParams,
  filtersToSearchParams,
  sortLabels,
  sortProducts,
  type Filters,
  type SortKey,
} from "@/lib/catalog/filters";
import type { Guide } from "@/lib/guides";
import { Button } from "@/components/ui";
import { ProductCard } from "../ProductCard/ProductCard";
import { EditorialCard } from "../EditorialCard/EditorialCard";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 24;
const GENRE_ORDER: Genre[] = ["homme", "femme", "mixte", "enfant"];

/*
 * Correctif BL-1 : il n'y a plus ici de liste blanche de valeurs filtrables.
 * Les constantes GABARIT_ORDER et SIZE_ORDER figeaient XS vers XL, si bien
 * qu'aucune pointure n'apparaissait jamais dans la facette -- sans erreur,
 * sans test rouge et sans page cassee. Les valeurs sont desormais deduites du
 * perimetre du listing, et l'ordre des pointures vient du referentiel
 * (uniqueSortedSizes, tri numerique : 9 ne passe plus apres 41).
 */

type ListingExplorerProps = {
  products: Product[];
  /** Best-sellers affichés en secours quand un filtrage ne renvoie rien. */
  fallback: Product[];
  /** Facette Marque -- listings transverses ou l'axe n'est pas deja fixe. */
  withBrandFacet?: boolean;
  /** Carte guide insérée en position 6–8 (1 max, spec Listing S4). */
  editorialGuide?: Guide;
  defaultSort?: SortKey;
};

/**
 * Gabarit B — explorateur de listing (spec 2.1 Listing, D-027/D-028) :
 * facettes OR/AND, chips supprimables, tris, « Charger plus » (24/lot),
 * état complet restaurable depuis la query-string (canonique = catégorie nue).
 */
export function ListingExplorer({
  products,
  fallback,
  withBrandFacet = false,
  editorialGuide,
  defaultSort = "selection",
}: ListingExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initial = useMemo(
    () => filtersFromSearchParams(new URLSearchParams(searchParams.toString())),
    // Initialisation depuis l'URL partagée uniquement au montage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [filters, setFilters] = useState<Filters>(initial.filters);
  const [sort, setSort] = useState<SortKey>(
    initial.sort === "selection" ? defaultSort : initial.sort,
  );
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [sheetOpen, setSheetOpen] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const params = filtersToSearchParams(filters, sort === defaultSort ? "selection" : sort);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    setVisibleCount(PAGE_SIZE);
  }, [filters, sort, pathname, router, defaultSort]);

  useEffect(() => {
    if (!sheetOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sheetOpen]);

  const filtered = useMemo(
    () => sortProducts(applyFilters(products, filters), sort),
    [products, filters, sort],
  );
  const visible = filtered.slice(0, visibleCount);
  const activeCount = countActiveFilters(filters);

  // Valeurs de facettes présentes dans le périmètre du listing.
  const facetValues = useMemo(() => {
    const genres = GENRE_ORDER.filter((g) => products.some((p) => p.genres.includes(g)));
    // Seules les pointures reellement disponibles quelque part : la facette
    // filtre sur la disponibilite, pas sur l'existence de la variante.
    const sizes = uniqueSortedSizes(
      products.flatMap((p) => p.variants.filter((v) => v.stock > 0).map((v) => v.size)),
    );
    const materials = [...new Set(products.map((p) => p.material))].sort();
    const colors = [
      ...new Map(
        products.flatMap((p) => p.colors).map((c) => [c.name, c]),
      ).values(),
    ].sort((a, b) => a.name.localeCompare(b.name, "fr"));
    const brands = [...new Set(products.map((p) => p.brand))].sort((a, b) =>
      brandLabels[a].localeCompare(brandLabels[b], "fr"),
    );
    return { genres, sizes, materials, colors, brands };
  }, [products]);

  const counts = {
    genres: facetCounts(products, filters, "genres", facetValues.genres, facetMatchers.genres),
    sizes: facetCounts(products, filters, "sizes", facetValues.sizes, facetMatchers.sizes),
    materials: facetCounts(products, filters, "materials", facetValues.materials, facetMatchers.materials),
    colors: facetCounts(products, filters, "colors", facetValues.colors.map((c) => c.name), facetMatchers.colors),
    brands: facetCounts(products, filters, "brands", facetValues.brands, facetMatchers.brands),
  };

  const toggle = (key: "genres" | "sizes" | "materials" | "colors" | "brands", value: string) => {
    setFilters((prev) => {
      const list = prev[key] as string[];
      return {
        ...prev,
        [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      };
    });
  };

  const chips: { label: string; onRemove: () => void }[] = [
    ...filters.genres.map((g) => ({
      label: genreLabels[g],
      onRemove: () => toggle("genres", g),
    })),
    ...filters.sizes.map((s) => ({
      label: `Pointure ${formatSize(s)}`,
      onRemove: () => toggle("sizes", s),
    })),
    ...filters.materials.map((m) => ({ label: m, onRemove: () => toggle("materials", m) })),
    ...filters.colors.map((c) => ({ label: c, onRemove: () => toggle("colors", c) })),
    ...filters.brands.map((b) => ({
      label: brandLabels[b],
      onRemove: () => toggle("brands", b),
    })),
    ...(filters.priceMin !== undefined
      ? [{ label: `Dès ${filters.priceMin} €`, onRemove: () => setFilters((p) => ({ ...p, priceMin: undefined })) }]
      : []),
    ...(filters.priceMax !== undefined
      ? [{ label: `Jusqu'à ${filters.priceMax} €`, onRemove: () => setFilters((p) => ({ ...p, priceMax: undefined })) }]
      : []),
  ];

  const facetPanel = (
    <div className="flex flex-col gap-6">
      {withBrandFacet && facetValues.brands.length > 1 && (
        <FacetGroup
          title="Marque"
          values={facetValues.brands}
          selected={filters.brands}
          counts={counts.brands}
          labelFor={(v) => brandLabels[v as Brand]}
          onToggle={(v) => toggle("brands", v)}
        />
      )}
      {/*
        Une facette a valeur unique n'offre aucun choix : elle occupe de la
        place et laisse croire a un filtre. Sur le catalogue de lancement tous
        les modeles sont mixtes -- la facette Genre reste donc masquee jusqu'a
        l'entree d'un modele femme ou enfant.
      */}
      {facetValues.genres.length > 1 && (
        <FacetGroup
          title="Genre"
          values={facetValues.genres}
          selected={filters.genres}
          counts={counts.genres}
          labelFor={(v) => genreLabels[v as Genre]}
          onToggle={(v) => toggle("genres", v)}
        />
      )}
      <FacetGroup
        title="Pointure"
        values={facetValues.sizes}
        selected={filters.sizes}
        counts={counts.sizes}
        labelFor={(v) => formatSize(v)}
        onToggle={(v) => toggle("sizes", v)}
      />
      <PriceFacet
        min={filters.priceMin}
        max={filters.priceMax}
        onChange={(priceMin, priceMax) =>
          setFilters((prev) => ({ ...prev, priceMin, priceMax }))
        }
      />
      <FacetGroup
        title="Matière"
        values={facetValues.materials}
        selected={filters.materials}
        counts={counts.materials}
        onToggle={(v) => toggle("materials", v)}
      />
      <fieldset>
        <legend className="text-label mb-3 w-full border-b border-border pb-2 text-bark-900">Couleur</legend>
        <ul className="flex flex-wrap gap-2">
          {facetValues.colors.map((color) => {
            const selected = filters.colors.includes(color.name);
            const disabled = !selected && counts.colors[color.name] === 0;
            return (
              <li key={color.name}>
                <button
                  type="button"
                  aria-pressed={selected}
                  disabled={disabled}
                  onClick={() => toggle("colors", color.name)}
                  title={color.name}
                  className={cn(
                    "flex min-h-11 items-center gap-2 border px-3 py-1.5 text-body-sm transition-colors duration-250",
                    selected
                      ? "border-bark-900 bg-bark-900 text-white"
                      : "border-border bg-cream-50 text-bark-700 hover:border-bark-300",
                    disabled && "opacity-40",
                  )}
                >
                  <span
                    aria-hidden="true"
                    style={{ backgroundColor: color.hex }}
                    className="size-4 rounded-full border border-border"
                  />
                  {color.name}
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>
    </div>
  );

  const gridItems: ("guide" | Product)[] = [...visible];
  if (editorialGuide && visible.length >= 6) {
    gridItems.splice(5, 0, "guide");
  }

  return (
    <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">
      {/* Facettes desktop : colonne sticky */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
          {facetPanel}
        </div>
      </aside>

      <div>
        {/* Barre d'outils */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="text-label flex min-h-11 items-center gap-2 border border-bark-900 bg-cream-50 px-4 text-bark-900 lg:hidden"
            >
              <SlidersHorizontal aria-hidden="true" className="size-4" />
              Filtrer{activeCount > 0 && ` (${activeCount})`}
            </button>
            {chips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={chip.onRemove}
                className="text-label hidden min-h-9 items-center gap-1.5 bg-bark-900 px-3 text-white transition-colors duration-250 hover:bg-action lg:inline-flex"
              >
                {chip.label}
                <X aria-hidden="true" className="size-3.5" />
                <span className="sr-only"> — retirer ce filtre</span>
              </button>
            ))}
            {chips.length > 0 && (
              <button
                type="button"
                onClick={() => setFilters(emptyFilters)}
                className="text-label hidden min-h-9 items-center text-bark-700 underline-offset-4 hover:underline lg:inline-flex"
              >
                Tout effacer
              </button>
            )}
          </div>
          <label className="text-label flex items-center gap-2 text-bark-700">
            Trier par
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="text-label min-h-11 border border-border bg-cream-50 px-3 text-bark-900"
            >
              {Object.entries(sortLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p aria-live="polite" className="text-body-sm mt-4 text-bark-700">
          {filtered.length} produit{filtered.length > 1 ? "s" : ""}
        </p>

        {/* Grille ou état vide */}
        {filtered.length > 0 ? (
          <>
            <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-6">
              {gridItems.map((item) =>
                item === "guide" ? (
                  <li key="guide" className="col-span-2 xl:col-span-1">
                    <EditorialCard guide={editorialGuide!} className="h-full" />
                  </li>
                ) : (
                  <li key={item.slug}>
                    <ProductCard product={item} className="h-full" />
                  </li>
                ),
              )}
            </ul>
            {filtered.length > visibleCount && (
              <div className="mt-8 flex flex-col items-center gap-2">
                <p className="text-body-sm text-bark-700">
                  {visible.length} sur {filtered.length}
                </p>
                <Button
                  variant="secondary"
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                >
                  Charger plus
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="mt-8">
            <p className="text-body text-bark-900">
              Aucun produit ne correspond à cette combinaison de filtres.
            </p>
            {chips.length > 0 && (
              <button
                type="button"
                onClick={chips[chips.length - 1]!.onRemove}
                className="text-label mt-3 inline-flex min-h-11 items-center gap-2 text-action hover:text-action-hover"
              >
                Retirer le dernier filtre « {chips[chips.length - 1]!.label} »
              </button>
            )}
            {fallback.length > 0 && (
              <>
                <h2 className="font-display mt-10 text-h3 leading-tight text-bark-900">
                  Nos best-sellers
                </h2>
                <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-6">
                  {fallback.slice(0, 3).map((product) => (
                    <li key={product.slug}>
                      <ProductCard product={product} className="h-full" />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>

      {/* Panneau filtres mobile plein écran */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filtres"
            className="flex h-full flex-col bg-cream-50"
            onKeyDown={(event) => {
              if (event.key === "Escape") setSheetOpen(false);
            }}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="font-display text-h3 leading-tight text-bark-900">
                Filtrer{activeCount > 0 && ` (${activeCount})`}
              </h2>
              <button
                type="button"
                aria-label="Fermer les filtres"
                onClick={() => setSheetOpen(false)}
                className="flex size-11 items-center justify-center text-bark-700 hover:text-bark-900"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-6">{facetPanel}</div>
            <div className="flex items-center gap-3 border-t border-border px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => setFilters(emptyFilters)}
                className="text-label min-h-11 px-2 text-bark-700 underline-offset-4 hover:underline"
              >
                Réinitialiser
              </button>
              <Button className="flex-1" onClick={() => setSheetOpen(false)}>
                Voir {filtered.length} produit{filtered.length > 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FacetGroup({
  title,
  values,
  selected,
  counts,
  labelFor,
  onToggle,
}: {
  title: string;
  values: string[];
  selected: string[];
  counts: Record<string, number>;
  labelFor?: (value: string) => string;
  onToggle: (value: string) => void;
}) {
  if (values.length === 0) return null;
  return (
    <fieldset>
      <legend className="text-label mb-3 w-full border-b border-border pb-2 text-bark-900">{title}</legend>
      <ul className="flex flex-col gap-1">
        {values.map((value) => {
          const isSelected = selected.includes(value);
          const count = counts[value] ?? 0;
          const disabled = !isSelected && count === 0;
          return (
            <li key={value}>
              <label
                className={cn(
                  "flex min-h-10 cursor-pointer items-center gap-3 text-body-sm text-bark-700",
                  disabled && "cursor-not-allowed opacity-40",
                )}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={disabled}
                  onChange={() => onToggle(value)}
                  className="size-4 accent-bark-900"
                />
                <span className="flex-1">{labelFor ? labelFor(value) : value}</span>
                <span className="text-caption text-bark-500">{count}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

function PriceFacet({
  min,
  max,
  onChange,
}: {
  min?: number;
  max?: number;
  onChange: (min?: number, max?: number) => void;
}) {
  const parse = (raw: string): number | undefined => {
    if (raw === "") return undefined;
    const value = Number(raw);
    return Number.isFinite(value) && value >= 0 ? value : undefined;
  };
  return (
    <fieldset>
      <legend className="text-label mb-3 w-full border-b border-border pb-2 text-bark-900">Prix</legend>
      <div className="flex items-center gap-2">
        <label className="flex-1">
          <span className="sr-only">Prix minimum en euros</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Min"
            value={min ?? ""}
            onChange={(event) => onChange(parse(event.target.value), max)}
            className="h-11 w-full border border-border bg-cream-50 px-3 text-body-sm text-bark-900"
          />
        </label>
        <span aria-hidden="true" className="text-bark-500">
          —
        </span>
        <label className="flex-1">
          <span className="sr-only">Prix maximum en euros</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Max"
            value={max ?? ""}
            onChange={(event) => onChange(min, parse(event.target.value))}
            className="h-11 w-full border border-border bg-cream-50 px-3 text-body-sm text-bark-900"
          />
        </label>
        <span className="text-body-sm text-bark-700">€</span>
      </div>
    </fieldset>
  );
}
