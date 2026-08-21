import { describe, expect, it } from "vitest";
import { jsonLdScript } from "./jsonld";

/**
 * Échappement du JSON-LD (audit 2026-08, EL-3) — les fiches produit sont
 * pré-remplies depuis des pages fournisseur arbitraires : un nom contenant
 * `</script>` refermait le bloc et exécutait ce qui suivait.
 */
describe("jsonLdScript", () => {
  it("neutralise une tentative de sortie du bloc <script>", () => {
    const payload = { name: "Collier</script><script>alert(1)</script>" };
    const out = jsonLdScript(payload);
    expect(out).not.toContain("</script>");
    expect(out).not.toContain("<script>");
    expect(out).toContain("\\u003c");
  });

  it("échappe aussi > et & (entités et commentaires HTML)", () => {
    const out = jsonLdScript({ name: "Chien & Chat <b>", note: "a > b" });
    expect(out).not.toMatch(/[<>&]/);
  });

  it("reste du JSON valide et fidèle après échappement", () => {
    const payload = {
      name: "Collier</script>",
      brand: { "@type": "Brand", name: "Chien & Chat" },
      price: "49.90",
    };
    expect(JSON.parse(jsonLdScript(payload))).toEqual(payload);
  });

  it("laisse intact un contenu sans caractère dangereux", () => {
    const payload = { name: "Collier cuir ambre", price: "49.90" };
    expect(jsonLdScript(payload)).toBe(JSON.stringify(payload));
  });
});
