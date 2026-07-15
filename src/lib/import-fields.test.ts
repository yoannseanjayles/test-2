import { describe, expect, it } from "vitest";
import { parseLines, parseSpecs, serializeSpecs } from "./import-fields";

describe("champs riches des formulaires admin (import enrichi)", () => {
  it("parseLines : une entrée par ligne, vides ignorées", () => {
    expect(parseLines("Réservoir 1,2 L\n\n  Pompe silencieuse  \n")).toEqual([
      "Réservoir 1,2 L",
      "Pompe silencieuse",
    ]);
  });

  it("parseSpecs : « libellé : valeur », lignes invalides ignorées", () => {
    expect(parseSpecs("Matière : ABS sans BPA\nCapacité: 1200 ml\nsans deux-points\n: valeur orpheline")).toEqual([
      { label: "Matière", value: "ABS sans BPA" },
      { label: "Capacité", value: "1200 ml" },
    ]);
  });

  it("aller-retour sérialisation ↔ parsing", () => {
    const specs = [
      { label: "Matière", value: "ABS sans BPA" },
      { label: "Débit", value: "2 L/min : réglable" },
    ];
    expect(parseSpecs(serializeSpecs(specs))).toEqual(specs);
  });
});
