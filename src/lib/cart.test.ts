import { beforeEach, describe, expect, it } from "vitest";
import {
  cartCount,
  cartSubtotal,
  freeShippingRemaining,
  useCart,
} from "./cart";
import { shippingPrice } from "./checkout";

const ambre = { slug: "collier-cuir-ambre", size: "M", color: "Cuir caramel" };

describe("panier (D-029/D-030)", () => {
  beforeEach(() => {
    useCart.getState().clear();
  });

  it("ajoute et fusionne les lignes identiques", () => {
    useCart.getState().add(ambre);
    useCart.getState().add(ambre);
    useCart.getState().add({ ...ambre, size: "S" });
    const lines = useCart.getState().lines;
    expect(lines).toHaveLength(2);
    expect(cartCount(lines)).toBe(3);
  });

  it("calcule le sous-total TTC depuis le catalogue", () => {
    useCart.getState().add(ambre); // 5900
    useCart.getState().add(ambre); // 11800
    expect(cartSubtotal(useCart.getState().lines)).toBe(11800);
  });

  it("supprime la ligne quand la quantité tombe à zéro", () => {
    useCart.getState().add(ambre);
    useCart.getState().setQuantity(ambre, 0);
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
