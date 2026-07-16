// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { productSizes } from "@/db/schema";
import { releaseStock, reserveStock } from "./stock";

/** Stock d'une taille du catalogue seedé. */
async function stockOf(slug: string, size: string): Promise<number> {
  const db = await getDb();
  const [row] = await db.select().from(productSizes)
    .where(and(eq(productSizes.productSlug, slug), eq(productSizes.name, size)));
  return row?.stock ?? -1;
}

// Le seed donne au collier Ambre : S=8, M=12, L=0.
const SLUG = "collier-cuir-ambre";

describe("réservation de stock à la commande (audit C-2)", () => {
  beforeAll(async () => {
    await getDb(); // premier accès : démarrage PGlite + seed (~3,5 s)
  }, 20_000);

  it("décrémente puis restitue", async () => {
    const before = await stockOf(SLUG, "S");
    expect(before).toBeGreaterThan(1);
    const result = await reserveStock([{ slug: SLUG, size: "S", quantity: 2 }]);
    expect(result.ok).toBe(true);
    expect(await stockOf(SLUG, "S")).toBe(before - 2);
    await releaseStock([{ slug: SLUG, size: "S", quantity: 2 }]);
    expect(await stockOf(SLUG, "S")).toBe(before);
  });

  it("refuse une taille en rupture sans toucher au stock", async () => {
    expect(await stockOf(SLUG, "L")).toBe(0);
    const result = await reserveStock([{ slug: SLUG, size: "L", quantity: 1 }]);
    expect(result.ok).toBe(false);
    expect(await stockOf(SLUG, "L")).toBe(0);
  });

  it("refuse une taille inexistante", async () => {
    const result = await reserveStock([{ slug: SLUG, size: "XXL", quantity: 1 }]);
    expect(result.ok).toBe(false);
  });

  it("restitue les lignes déjà décrémentées quand une ligne échoue", async () => {
    const before = await stockOf(SLUG, "M");
    const result = await reserveStock([
      { slug: SLUG, size: "M", quantity: 1 },
      { slug: SLUG, size: "L", quantity: 1 }, // rupture → échec global
    ]);
    expect(result.ok).toBe(false);
    expect(await stockOf(SLUG, "M")).toBe(before);
  });

  it("agrège les quantités par taille (deux coloris, même stock)", async () => {
    const before = await stockOf(SLUG, "M");
    const result = await reserveStock([
      { slug: SLUG, size: "M", quantity: 1 },
      { slug: SLUG, size: "M", quantity: 1 },
    ]);
    expect(result.ok).toBe(true);
    expect(await stockOf(SLUG, "M")).toBe(before - 2);
    await releaseStock([{ slug: SLUG, size: "M", quantity: 2 }]);
  });
});
