// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { productVariants } from "@/db/schema";
import { releaseStock, reserveStock } from "./stock";

/**
 * Réservation de stock (audit C-2), rejouée sur la clé de variante (D-054).
 *
 * Le mécanisme n'a pas changé — décrément conditionnel, jamais sous zéro,
 * restitution en cas d'échec — mais la **clé** oui : elle inclut désormais le
 * coloris. C'est le point que ces tests doivent verrouiller, parce que c'est
 * exactement là que le stock fuyait : deux coloris puisaient dans le même
 * compteur.
 */

const SLUG = "air-force-1-07";

async function stockOf(slug: string, color: string, size: string): Promise<number> {
  const db = await getDb();
  const [row] = await db.select().from(productVariants).where(and(
    eq(productVariants.productSlug, slug),
    eq(productVariants.color, color),
    eq(productVariants.size, size),
  ));
  return row?.stock ?? -1;
}

/**
 * Le stock de démonstration est déterministe mais arbitraire : on repère les
 * variantes utiles en base plutôt que d'inscrire des valeurs en dur, qui
 * casseraient au moindre ajustement du catalogue.
 */
let inStock: { color: string; size: string };
let outOfStock: { color: string; size: string };
let sameSizeOtherColor: { color: string; size: string };

describe("réservation de stock à la commande (audit C-2, clé de variante D-054)", () => {
  beforeAll(async () => {
    const db = await getDb(); // premier accès : démarrage PGlite + seed
    const rows = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productSlug, SLUG));
    const supplied = rows.find((r) => r.stock >= 3);
    const empty = rows.find((r) => r.stock === 0);
    const twin = rows.find(
      (r) => supplied && r.size === supplied.size && r.color !== supplied.color,
    );
    if (!supplied || !empty || !twin) {
      throw new Error("Jeu de variantes insuffisant pour les tests de stock.");
    }
    inStock = { color: supplied.color, size: supplied.size };
    outOfStock = { color: empty.color, size: empty.size };
    sameSizeOtherColor = { color: twin.color, size: twin.size };
  }, 30_000);

  it("décrémente puis restitue", async () => {
    const before = await stockOf(SLUG, inStock.color, inStock.size);
    const result = await reserveStock([{ slug: SLUG, ...inStock, quantity: 2 }]);
    expect(result.ok).toBe(true);
    expect(await stockOf(SLUG, inStock.color, inStock.size)).toBe(before - 2);
    await releaseStock([{ slug: SLUG, ...inStock, quantity: 2 }]);
    expect(await stockOf(SLUG, inStock.color, inStock.size)).toBe(before);
  });

  it("refuse une variante en rupture sans toucher au stock", async () => {
    expect(await stockOf(SLUG, outOfStock.color, outOfStock.size)).toBe(0);
    const result = await reserveStock([{ slug: SLUG, ...outOfStock, quantity: 1 }]);
    expect(result.ok).toBe(false);
    expect(await stockOf(SLUG, outOfStock.color, outOfStock.size)).toBe(0);
  });

  it("refuse une variante inexistante", async () => {
    const result = await reserveStock([
      { slug: SLUG, color: inStock.color, size: "99", quantity: 1 },
    ]);
    expect(result.ok).toBe(false);
    // Coloris inconnu, pointure valide : rejeté aussi.
    const wrongColor = await reserveStock([
      { slug: SLUG, color: "Coloris inventé", size: inStock.size, quantity: 1 },
    ]);
    expect(wrongColor.ok).toBe(false);
  });

  it("restitue les lignes déjà décrémentées quand une ligne échoue", async () => {
    const before = await stockOf(SLUG, inStock.color, inStock.size);
    const result = await reserveStock([
      { slug: SLUG, ...inStock, quantity: 1 },
      { slug: SLUG, ...outOfStock, quantity: 1 }, // rupture → échec global
    ]);
    expect(result.ok).toBe(false);
    expect(await stockOf(SLUG, inStock.color, inStock.size)).toBe(before);
  });

  it("agrège les quantités par variante", async () => {
    const before = await stockOf(SLUG, inStock.color, inStock.size);
    const result = await reserveStock([
      { slug: SLUG, ...inStock, quantity: 1 },
      { slug: SLUG, ...inStock, quantity: 1 },
    ]);
    expect(result.ok).toBe(true);
    expect(await stockOf(SLUG, inStock.color, inStock.size)).toBe(before - 2);
    await releaseStock([{ slug: SLUG, ...inStock, quantity: 2 }]);
  });

  /**
   * Le test qui donne son sens à D-054 : avant, deux coloris de la même
   * pointure partageaient un compteur unique, et réserver l'un diminuait
   * l'autre. On vendait donc deux fois la même paire.
   */
  it("n'entame pas le stock d'un autre coloris de la même pointure", async () => {
    const twinBefore = await stockOf(
      SLUG,
      sameSizeOtherColor.color,
      sameSizeOtherColor.size,
    );
    const result = await reserveStock([{ slug: SLUG, ...inStock, quantity: 1 }]);
    expect(result.ok).toBe(true);
    expect(
      await stockOf(SLUG, sameSizeOtherColor.color, sameSizeOtherColor.size),
    ).toBe(twinBefore);
    await releaseStock([{ slug: SLUG, ...inStock, quantity: 1 }]);
  });
});
