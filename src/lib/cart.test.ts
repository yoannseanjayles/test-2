import { beforeEach, describe, expect, it } from "vitest";
import {
  cartCount,
  cartSubtotal,
  freeShippingRemaining,
  useCart,
} from "./cart";
import { shippingPrice } from "./checkout";

// Une ligne de panier référence une variante (D-054) : slug, pointure et
// coloris. Le prix est relu depuis le catalogue, jamais envoyé par le client.
const af1 = { slug: "air-force-1-07", size: "42", color: "Blanc / Swoosh noir" };

describe("panier (D-029/D-030)", () => {
  beforeEach(() => {
    useCart.getState().clear();
  });

  it("ajoute et fusionne les lignes identiques", () => {
    useCart.getState().add(af1);
    useCart.getState().add(af1);
    useCart.getState().add({ ...af1, size: "41" });
    const lines = useCart.getState().lines;
    expect(lines).toHaveLength(2);
    expect(cartCount(lines)).toBe(3);
  });

  it("calcule le sous-total TTC depuis le catalogue", () => {
    useCart.getState().add(af1); // 4999
    useCart.getState().add(af1); // 9998
    expect(cartSubtotal(useCart.getState().lines)).toBe(9998);
  });

  it("supprime la ligne quand la quantité tombe à zéro", () => {
    useCart.getState().add(af1);
    useCart.getState().setQuantity(af1, 0);
    expect(useCart.getState().lines).toHaveLength(0);
  });

  it("suit le seuil de livraison offerte (H12)", () => {
    expect(freeShippingRemaining(5900)).toBe(2000);
    expect(freeShippingRemaining(7900)).toBe(0);
    expect(freeShippingRemaining(12000)).toBe(0);
  });
});

describe("frais de livraison (H21)", () => {
  it("offre domicile et relais au-dessus du seuil, jamais l'express", () => {
    expect(shippingPrice("domicile", 5000)).toBe(490);
    expect(shippingPrice("domicile", 8000)).toBe(0);
    expect(shippingPrice("relais", 8000)).toBe(0);
    expect(shippingPrice("express", 8000)).toBe(990);
  });
});
