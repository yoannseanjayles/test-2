"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import {
  animalLabels,
  gabaritLabels,
  type Animal,
  type Gabarit,
  type Product,
} from "@/lib/catalog";
import {
  applyFilters,
  countActiveFilters,
  emptyFilters,
  facetCounts,
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
const GABARIT_ORDER: Gabarit[] = ["XS", "S", "M", "L", "XL"];
const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "Taille unique"];

type ListingExplorerProps = {
  products: Product[];
  /** Best-sellers affichés en secours quand un filtrage ne renvoie rien. */
  fallback: Product[];
  /** Facette Univers (variante `/nouveautes`). */
  withUniverseFacet?: boolean;
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
  withUniverseFacet = false,
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
    const gabarits = GABARIT_ORDER.filter((g) =>
      products.some((p) => p.gabarits.includes(g)),
    );
    const sizes = SIZE_ORDER.filter((s) =>
      products.some((p) => p.sizes.some((ps) => ps.name === s)),
    );
    const materials = [...new Set(products.map((p) => p.material))].sort();
    const colors = [
      ...new Map(
        products.flatMap((p) => p.colors).map((c) => [c.name, c]),
      ).values(),
    ];
    const animals = (["chien", "chat", "nac"] as Animal[]).filter((a) =>
      products.some((p) => p.animal === a),
    );
    return { gabarits, sizes, materials, colors, animals };
  }, [products]);

  const counts = {
    gabarits: facetCounts(products, filters, "gabarits", facetValues.gabarits, (p, v) =>
      p.gabarits.includes(v as Gabarit),
    ),
    sizes: facetCounts(products, filters, "sizes", facetValues.sizes, (p, v) =>
      p.sizes.some((s) => s.name === v),
    ),
    materials: facetCounts(products, filters, "materials", facetValues.materials, (p, v) => p.material === v),
    colors: facetCounts(products, filters, "colors", facetValues.colors.map((c) => c.name), (p, v) =>
      p.colors.some((c) => c.name === v),
    ),
    animals: facetCounts(products, filters, "animals", facetValues.animals, (p, v) => p.animal === v),
  };

  const toggle = (key: "gabarits" | "sizes" | "materials" | "colors" | "animals", value: string) => {
    setFilters((prev) => {
      const list = prev[key] as string[];
      return {
        ...prev,
        [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      };
    });
  };

  const chips: { label: string; onRemove: () => void }[] = [
    ...filters.gabarits.map((g) => ({
      label: `Gabarit ${g}`,
      onRemove: () => toggle("gabarits", g),
    })),
    ...filters.sizes.map((s) => ({ label: `Taille ${s}`, onRemove: () => toggle("sizes", s) })),
    ...filters.materials.map((m) => ({ label: m, onRemove: () => toggle("materials", m) })),
    ...filters.colors.map((c) => ({ label: c, onRemove: () => toggle("colors", c) })),
    ...filters.animals.map((a) => ({
      label: animalLabels[a],
      onRemove: () => toggle("animals", a),
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
      {withUniverseFacet && facetValues.animals.length > 1 && (
        <FacetGroup
          title="Univers"
          values={facetValues.animals}
          selected={filters.animals}
          counts={counts.animals}
          labelFor={(v) => animalLabels[v as Animal]}
          onToggle={(v) => toggle("animals", v)}
        />
      )}
      <FacetGroup
        title="Gabarit animal"
        values={facetValues.gabarits}
        selected={filters.gabarits}
        counts={counts.gabarits}
        labelFor={(v) => gabaritLabels[v as Gabarit]}
        onToggle={(v) => toggle("gabarits", v)}
      />
      <FacetGroup
        title="Taille produit"
        values={facetValues.sizes}
        selected={filters.sizes}
        counts={counts.sizes}
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
        <legend className="text-label mb-3 text-bark-900">Couleur</legend>
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
                    "flex min-h-11 items-center gap-2 rounded-full border px-3 py-1.5 text-body-sm transition-colors duration-150",
                    selected
                      ? "border-pine-700 bg-pine-700 text-white"
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
              className="text-label flex min-h-11 items-center gap-2 rounded-md border border-border bg-cream-50 px-4 lg:hidden"
            >
              <SlidersHorizontal aria-hidden="true" className="size-4" />
              Filtrer{activeCount > 0 && ` (${activeCount})`}
            </button>
            {chips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={chip.onRemove}
                className="text-label hidden min-h-9 items-center gap-1.5 rounded-full bg-pine-700 px-3 text-white transition-colors duration-150 hover:bg-pine-900 lg:inline-flex"
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
              className="text-label min-h-11 rounded-sm border border-border bg-cream-50 px-3 text-bark-900"
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
            <ul className="mt-4 grid grid-cols-2 gap-4 xl:grid-cols-3 xl:gap-6">
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
                <h2 className="font-heading mt-10 text-h3 font-semibold text-bark-900">
                  Nos best-sellers
                </h2>
                <ul className="mt-4 grid grid-cols-2 gap-4 xl:grid-cols-3 xl:gap-6">
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
              <h2 className="font-heading text-h3 font-semibold text-bark-900">
                Filtrer{activeCount > 0 && ` (${activeCount})`}
              </h2>
              <button
                type="button"
                aria-label="Fermer les filtres"
                onClick={() => setSheetOpen(false)}
                className="flex size-11 items-center justify-center rounded-sm text-bark-700 hover:bg-cream-300"
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
      <legend className="text-label mb-3 text-bark-900">{title}</legend>
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
                  className="size-4 accent-pine-700"
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
      <legend className="text-label mb-3 text-bark-900">Prix</legend>
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
            className="h-11 w-full rounded-sm border border-border bg-cream-50 px-3 text-body-sm text-bark-900"
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
            className="h-11 w-full rounded-sm border border-border bg-cream-50 px-3 text-body-sm text-bark-900"
          />
        </label>
        <span className="text-body-sm text-bark-700">€</span>
      </div>
    </fieldset>
  );
}
