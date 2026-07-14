import "server-only";
import * as schema from "./schema";
import { seedIfEmpty } from "./seed";

/**
 * Client base de données (6.0/H38) :
 * - `DATABASE_URL` présent → Neon Postgres serverless (production/staging) ;
 * - absent → PGlite embarqué (dev, CI, build statique) : mêmes requêtes,
 *   schéma appliqué et seed du catalogue démo (H33) au premier accès.
 * Le front consomme `lib/api` — il ignore le driver (H37).
 */

type Database = Awaited<ReturnType<typeof createDb>>;

async function createDb() {
  if (process.env.DATABASE_URL) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    return drizzle(neon(process.env.DATABASE_URL), { schema });
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const client = new PGlite(); // en mémoire : reconstruit à chaque build/boot
  const db = drizzle(client, { schema });
  await applySchema(client);
  await seedIfEmpty(db);
  return db;
}

async function applySchema(client: { exec: (sql: string) => Promise<unknown> }) {
  await client.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      animal text NOT NULL, slug text NOT NULL, label text NOT NULL,
      description text NOT NULL, PRIMARY KEY (animal, slug));
    CREATE TABLE IF NOT EXISTS products (
      slug text PRIMARY KEY, name text NOT NULL, brand text NOT NULL,
      animal text NOT NULL, subcategory text NOT NULL, price integer NOT NULL,
      short_description text NOT NULL, curator_note text NOT NULL,
      material text NOT NULL, details jsonb NOT NULL, colors jsonb NOT NULL,
      gabarits jsonb NOT NULL, is_new boolean NOT NULL DEFAULT false,
      curated_rank integer NOT NULL, pairs_with jsonb NOT NULL, tone text NOT NULL);
    CREATE TABLE IF NOT EXISTS product_sizes (
      product_slug text NOT NULL REFERENCES products(slug), name text NOT NULL,
      stock integer NOT NULL DEFAULT 0, PRIMARY KEY (product_slug, name));
    CREATE TABLE IF NOT EXISTS reviews (
      id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      product_slug text NOT NULL REFERENCES products(slug), author text NOT NULL,
      rating integer NOT NULL, title text NOT NULL, text text NOT NULL,
      context text NOT NULL, date text NOT NULL,
      verified boolean NOT NULL DEFAULT true,
      created_at timestamp NOT NULL DEFAULT now());
    CREATE INDEX IF NOT EXISTS idx_products_animal_subcategory
      ON products (animal, subcategory);
  `);
}

let dbPromise: Promise<Database> | null = null;

/** Singleton par processus (réutilisé entre requêtes RSC). */
export function getDb(): Promise<Database> {
  dbPromise ??= createDb();
  return dbPromise;
}
