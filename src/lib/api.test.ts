// @vitest-environment node
import { describe, expect, it } from "vitest";
import { fetchFeatured, fetchProduct, fetchProducts, fetchSubcategories } from "./api";
import { products as mockProducts, subcategories as mockSubcategories } from "./catalog/data";
import { getFeatured } from "./catalog";

describe("bascule mock → base (6.1 jalon 1, H37)", () => {
  // 20 s : le premier accès démarre PGlite (WASM) et seede la base — ~3,5 s
  // à vide, davantage sous charge (CI).
  it("restitue le catalogue complet à l'identique", { timeout: 20_000 }, async () => {
    const fromDb = await fetchProducts();
    expect(fromDb).toHaveLength(mockProducts.length);
    const ambre = fromDb.find((p) => p.slug === "collier-cuir-ambre")!;
    const mock = mockProducts.find((p) => p.slug === "collier-cuir-ambre")!;
    expect(ambre.sizes).toEqual(mock.sizes);
    expect(ambre.reviews).toEqual(mock.reviews);
    expect(ambre.colors).toEqual(mock.colors);
    expect(ambre.price).toBe(mock.price);
  });

  it("filtre par animal et sous-catégorie", async () => {
    const colliers = await fetchProducts("chien", "colliers-harnais");
    expect(colliers).toHaveLength(6);
    expect(colliers.every((p) => p.animal === "chien")).toBe(true);
  });

  it("retrouve un produit par sa clé de route", async () => {
    const product = await fetchProduct("chat", "couchages-cocons", "cocon-feutre-alcove");
    expect(product?.name).toBe("Cocon Alcôve en feutre de laine");
    expect(await fetchProduct("chien", "jouets", "inexistant")).toBeUndefined();
  });

  it("respecte le tri « Notre sélection » (H17) comme le mock", async () => {
    const fromDb = await fetchFeatured(8);
    expect(fromDb.map((p) => p.slug)).toEqual(getFeatured(8).map((p) => p.slug));
  });

  it("expose les sous-catégories par animal (D-012)", async () => {
    expect(await fetchSubcategories("chien")).toHaveLength(
      mockSubcategories.filter((s) => s.animal === "chien").length,
    );
  });
});
