import { describe, expect, it } from "vitest";
import { getProducts } from "./index";
import type { Product, Review } from "./types";
import {
  applyFilters,
  emptyFilters,
  facetCounts,
  facetMatchers,
  filtersFromSearchParams,
  filtersToSearchParams,
  sortProducts,
} from "./filters";

const nike = getProducts("nike", "lifestyle");
const catalogue = getProducts();

describe("filtres de listing (spec 2.1 Listing)", () => {
  it("OR au sein d'une facette, AND entre facettes", () => {
    const cuir = applyFilters(nike, {
      ...emptyFilters,
      materials: ["Cuir", "Cuir & mesh"],
    });
    expect(cuir.map((p) => p.slug).sort()).toEqual([
      "air-force-1-07",
      "air-max-90",
    ]);

    const cuirEtNike = applyFilters(catalogue, {
      ...emptyFilters,
      materials: ["Cuir"],
      brands: ["nike"],
    });
    expect(cuirEtNike.map((p) => p.slug)).toEqual(["air-force-1-07"]);

    // La marque est bien une facette et non seulement un axe de route (ST-2).
    const asics = applyFilters(catalogue, { ...emptyFilters, brands: ["asics"] });
    expect(asics.map((p) => p.slug).sort()).toEqual([
      "gel-kayano-14",
      "gel-kayano-20",
    ]);
  });

  it("filtre par fourchette de prix en euros", () => {
    const result = applyFilters(catalogue, {
      ...emptyFilters,
      priceMin: 55,
      priceMax: 65,
    });
    expect(result.map((p) => p.slug).sort()).toEqual([
      "gel-kayano-14",
      "gel-kayano-20",
      // Rayon Ensembles : la facette Prix est transverse aux deux rayons.
      "polaire-legere-zippee",
      "progrid-omni-9",
      "progrid-ride-1",
    ]);
  });

  /**
   * La facette pointure porte sur la **disponibilité**, pas sur l'existence de
   * la variante. Vérifié sur des produits construits pour l'occasion : le jeu
   * de données réel ne doit pas décider du résultat d'un test de logique.
   */
  it("ne retient une pointure que si elle est réellement disponible", () => {
    const base = catalogue[0]!;
    const enStock: Product = {
      ...base,
      slug: "en-stock-42",
      variants: [{ color: "Noir", size: "42", stock: 3 }],
    };
    const rupture: Product = {
      ...base,
      slug: "rupture-42",
      variants: [{ color: "Noir", size: "42", stock: 0 }],
    };
    const autreTaille: Product = {
      ...base,
      slug: "seulement-41",
      variants: [{ color: "Noir", size: "41", stock: 5 }],
    };
    const result = applyFilters([enStock, rupture, autreTaille], {
      ...emptyFilters,
      sizes: ["42"],
    });
    expect(result.map((p) => p.slug)).toEqual(["en-stock-42"]);
  });

  it("trie par prix, notes et sélection", () => {
    const asc = sortProducts(catalogue, "prix-asc").map((p) => p.price);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));

    const selection = sortProducts(catalogue, "selection");
    expect(selection[0]?.slug).toBe("air-force-1-07");

    // Aucun avis réel n'existe au catalogue (MO-7) : le tri par note se
    // vérifie sur des avis injectés, ce qui teste la fonction plutôt que le
    // jeu de données.
    const review = (rating: Review["rating"]) => ({
      author: "Testeur", rating, title: "Titre", text: "Texte",
      context: "Contexte", date: "2026-01-01", verified: false,
    });
    const notes = sortProducts(
      [
        { ...catalogue[0]!, slug: "note-basse", reviews: [review(3)] },
        { ...catalogue[1]!, slug: "note-haute", reviews: [review(5)] },
        { ...catalogue[2]!, slug: "sans-avis", reviews: [] },
      ],
      "notes",
    );
    expect(notes.map((p) => p.slug)).toEqual(["note-haute", "note-basse", "sans-avis"]);
  });

  it("compte les valeurs de facette en excluant la facette elle-même", () => {
    const filters = { ...emptyFilters, materials: ["Cuir"] };
    const counts = facetCounts(
      nike,
      filters,
      "materials",
      ["Cuir", "Synthétique"],
      facetMatchers.materials,
    );
    // Le compteur « Synthétique » ignore la sélection « Cuir » en cours.
    expect(counts["Synthétique"]).toBe(1);
    expect(counts["Cuir"]).toBe(1);
  });

  it("restaure l'état complet depuis la query-string (URL partagée)", () => {
    const params = filtersToSearchParams(
      {
        ...emptyFilters,
        brands: ["nike", "asics"],
        genres: ["mixte"],
        sizes: ["42", "42.5"],
        materials: ["Cuir"],
        priceMax: 80,
      },
      "prix-asc",
    );
    expect(params.get("marque")).toBe("nike,asics");
    const { filters, sort } = filtersFromSearchParams(params);
    expect(filters.brands).toEqual(["nike", "asics"]);
    expect(filters.genres).toEqual(["mixte"]);
    expect(filters.sizes).toEqual(["42", "42.5"]);
    expect(filters.materials).toEqual(["Cuir"]);
    expect(filters.priceMax).toBe(80);
    expect(sort).toBe("prix-asc");
  });

  it("ignore un tri inconnu et des prix invalides dans l'URL", () => {
    const params = new URLSearchParams("tri=hack&prix-min=abc&prix-max=-5");
    const { filters, sort } = filtersFromSearchParams(params);
    expect(sort).toBe("selection");
    expect(filters.priceMin).toBeUndefined();
    expect(filters.priceMax).toBeUndefined();
  });
});
