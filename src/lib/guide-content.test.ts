import { describe, expect, it } from "vitest";
import { parseGuideContent, serializeGuideContent } from "./guide-content";
import { defaultShippingConfig, shippingPrice } from "./shipping";

describe("contenu des guides (jalon 4)", () => {
  const sections = [
    { heading: "Coupe en Y ou en H", paragraphs: ["Premier paragraphe.", "Deuxième paragraphe."] },
    { heading: "Les mesures", paragraphs: ["Un seul paragraphe."] },
  ];

  it("sérialise puis re-parse à l'identique (aller-retour admin)", () => {
    expect(parseGuideContent(serializeGuideContent(sections))).toEqual(sections);
  });

  it("rattache le texte sans titre à une section « Introduction »", () => {
    expect(parseGuideContent("Du texte brut.")).toEqual([
      { heading: "Introduction", paragraphs: ["Du texte brut."] },
    ]);
  });

  it("renvoie null pour un contenu vide (guide sans corps)", () => {
    expect(parseGuideContent("   ")).toBeNull();
    expect(serializeGuideContent(null)).toBe("");
  });
});

describe("config livraison (D-039, réglages jalon 4)", () => {
  it("applique les tarifs par défaut sans réglage", () => {
    expect(shippingPrice("domicile", 5000)).toBe(490);
    expect(shippingPrice("domicile", 7900)).toBe(0);
    expect(shippingPrice("express", 20000)).toBe(990);
  });

  it("suit les réglages de la base (seuil et prix modifiés)", () => {
    const config = { freeShippingCents: 5000, prices: { ...defaultShippingConfig.prices, domicile: 700 } };
    expect(shippingPrice("domicile", 4999, config)).toBe(700);
    expect(shippingPrice("domicile", 5000, config)).toBe(0);
    expect(shippingPrice("express", 20000, config)).toBe(990);
  });
});
