// @vitest-environment node
import { describe, expect, it } from "vitest";
import { fetchFeatured, fetchProduct, fetchProducts, fetchSubcategories } from "./api";
import { products as mockProducts, subcategories as mockSubcategories } from "./catalog/data";
import { getFeatured } from "./catalog";

/**
 * Ces assertions ne sont pas décoratives : elles garantissent que la lecture
 * en base restitue exactement ce que le catalogue statique décrit (H37). Le
 * pivot les a portées sur le catalogue baskets — il ne les a pas retirées.
 * Une suite qui redevient verte parce qu'on a supprimé les assertions perd la
 * garantie sans que rien ne le signale.
 */
describe("bascule mock → base (6.1 jalon 1, H37)", () => {
  // 20 s : le premier accès démarre PGlite (WASM) et seede la base — ~3,5 s
  // à vide, davantage sous charge (CI).
  it("restitue le catalogue complet à l'identique", { timeout: 30_000 }, async () => {
    const fromDb = await fetchProducts();
    expect(fromDb).toHaveLength(mockProducts.length);
    const af1 = fromDb.find((p) => p.slug === "air-force-1-07")!;
    const mock = mockProducts.find((p) => p.slug === "air-force-1-07")!;
    // Le stock est porté par la variante (coloris, pointure) depuis D-054 :
    // c'est cette table-là qui doit revenir intacte de la base.
    const byKey = (list: typeof mock.variants) =>
      [...list].sort((a, b) => `${a.color}|${a.size}`.localeCompare(`${b.color}|${b.size}`));
    expect(byKey(af1.variants)).toEqual(byKey(mock.variants));
    expect(af1.reviews).toEqual(mock.reviews);
    expect(af1.colors).toEqual(mock.colors);
    expect(af1.price).toBe(mock.price);
    expect(af1.genres).toEqual(mock.genres);
  });

  it("filtre par marque et usage", async () => {
    const lifestyle = await fetchProducts("nike", "lifestyle");
    expect(lifestyle).toHaveLength(4);
    expect(lifestyle.every((p) => p.brand === "nike")).toBe(true);
  });

  it("retrouve un produit par sa clé de route", async () => {
    const product = await fetchProduct("salomon", "sportstyle", "xt-6");
    expect(product?.name).toBe("Salomon XT-6");
    expect(await fetchProduct("nike", "lifestyle", "inexistant")).toBeUndefined();
    // La clé de route est bien composite : le bon slug sous la mauvaise
    // marque ne doit rien renvoyer.
    expect(await fetchProduct("nike", "lifestyle", "xt-6")).toBeUndefined();
  });

  it("respecte le tri « Notre sélection » (H17) comme le mock", async () => {
    const fromDb = await fetchFeatured(8);
    expect(fromDb.map((p) => p.slug)).toEqual(getFeatured(8).map((p) => p.slug));
  });

  it("expose les usages par marque (D-012)", async () => {
    expect(await fetchSubcategories("on")).toHaveLength(
      mockSubcategories.filter((s) => s.brand === "on").length,
    );
  });
});
