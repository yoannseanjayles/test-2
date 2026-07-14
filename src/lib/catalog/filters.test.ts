import { describe, expect, it } from "vitest";
import { getProducts } from "./index";
import {
  applyFilters,
  emptyFilters,
  facetCounts,
  filtersFromSearchParams,
  filtersToSearchParams,
  sortProducts,
} from "./filters";

const colliers = getProducts("chien", "colliers-harnais");

describe("filtres de listing (spec 2.1 Listing)", () => {
  it("OR au sein d'une facette, AND entre facettes", () => {
    const cuirOuLaiton = applyFilters(colliers, {
      ...emptyFilters,
      materials: ["Cuir", "Laiton"],
    });
    expect(cuirOuLaiton.map((p) => p.slug).sort()).toEqual([
      "collier-cuir-ambre",
      "harnais-ville-faubourg",
      "medaille-laiton",
    ]);

    const cuirEtGabaritL = applyFilters(colliers, {
      ...emptyFilters,
      materials: ["Cuir"],
      gabarits: ["L"],
    });
    expect(cuirEtGabaritL.map((p) => p.slug)).toEqual(["collier-cuir-ambre"]);
  });

  it("filtre par fourchette de prix en euros", () => {
    const result = applyFilters(colliers, {
      ...emptyFilters,
      priceMin: 40,
      priceMax: 60,
    });
    expect(result.map((p) => p.slug).sort()).toEqual([
      "collier-cuir-ambre",
      "collier-tresse-olive",
    ]);
  });

  it("trie par prix, notes et sélection", () => {
    const asc = sortProducts(colliers, "prix-asc").map((p) => p.price);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));

    const selection = sortProducts(colliers, "selection");
    expect(selection[0]?.slug).toBe("collier-cuir-ambre");

    const notes = sortProducts(colliers, "notes");
    expect(notes[0]?.reviews.length).toBeGreaterThan(0);
  });

  it("compte les valeurs de facette en excluant la facette elle-même", () => {
    const filters = { ...emptyFilters, materials: ["Cuir"] };
    const counts = facetCounts(
      colliers,
      filters,
      "materials",
      ["Cuir", "Textile technique"],
      (p, value) => p.material === value,
    );
    // Le compteur « Textile technique » ignore la sélection « Cuir » en cours.
    expect(counts["Textile technique"]).toBe(2);
    expect(counts["Cuir"]).toBe(2);
  });

  it("restaure l'état complet depuis la query-string (URL partagée)", () => {
    const params = filtersToSearchParams(
      { ...emptyFilters, gabarits: ["S", "M"], materials: ["Cuir"], priceMax: 80 },
      "prix-asc",
    );
    const { filters, sort } = filtersFromSearchParams(params);
    expect(filters.gabarits).toEqual(["S", "M"]);
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
