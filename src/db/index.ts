import "server-only";
import { sql as rawSql } from "drizzle-orm";
import * as schema from "./schema";
import * as authSchema from "./auth-schema";
import { seedIfEmpty } from "./seed";
import { isServingProduction } from "@/lib/runtime-env";

/**
 * Client base de données (6.0/H38) :
 * - `DATABASE_URL` présent → Neon Postgres serverless (production/staging) ;
 * - absent → PGlite embarqué (dev, CI, build statique) : mêmes requêtes.
 * Dans les deux cas le schéma est appliqué au premier accès (bootstrap
 * idempotent ci-dessous) et le catalogue démo (H33) est seedé si la base
 * est vide. Le front consomme `lib/api` — il ignore le driver (H37).
 */

/**
 * Schéma en instructions individuelles : le driver HTTP Neon n'accepte
 * qu'une instruction par requête. `CREATE TABLE IF NOT EXISTS` ne modifie
 * jamais une table existante — les évolutions de schéma (Neon conserve sa
 * base entre déploiements) passent par les `ALTER … IF NOT EXISTS` en fin
 * de liste.
 */
const DDL = [
  `CREATE TABLE IF NOT EXISTS categories (
    brand text NOT NULL, slug text NOT NULL, label text NOT NULL,
    description text NOT NULL, PRIMARY KEY (brand, slug))`,
  `CREATE TABLE IF NOT EXISTS products (
    slug text PRIMARY KEY, name text NOT NULL, brand text NOT NULL,
    subcategory text NOT NULL, price integer NOT NULL,
    short_description text NOT NULL, curator_note text NOT NULL,
    material text NOT NULL, details jsonb NOT NULL, colors jsonb NOT NULL,
    genres jsonb NOT NULL, size_advice text, is_new boolean NOT NULL DEFAULT false,
    curated_rank integer NOT NULL, pairs_with jsonb NOT NULL, tone text NOT NULL,
    image_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
    supplier_ref text, source_url text,
    features jsonb NOT NULL DEFAULT '[]'::jsonb,
    specifications jsonb NOT NULL DEFAULT '[]'::jsonb,
    field_visibility jsonb NOT NULL DEFAULT '{}'::jsonb,
    archived boolean NOT NULL DEFAULT false)`,
  `CREATE TABLE IF NOT EXISTS guides (
    slug text PRIMARY KEY, title text NOT NULL, excerpt text NOT NULL,
    brand text NOT NULL, pillar boolean NOT NULL DEFAULT false,
    reading_minutes integer NOT NULL DEFAULT 5,
    related_subcategories jsonb NOT NULL DEFAULT '[]'::jsonb,
    author jsonb, content jsonb)`,
  `CREATE TABLE IF NOT EXISTS settings (
    key text PRIMARY KEY, value jsonb NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS product_variants (
    product_slug text NOT NULL REFERENCES products(slug),
    color text NOT NULL, size text NOT NULL,
    stock integer NOT NULL DEFAULT 0,
    PRIMARY KEY (product_slug, color, size))`,
  `CREATE TABLE IF NOT EXISTS reviews (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_slug text NOT NULL REFERENCES products(slug), author text NOT NULL,
    rating integer NOT NULL, title text NOT NULL, text text NOT NULL,
    context text NOT NULL, date text NOT NULL,
    verified boolean NOT NULL DEFAULT true,
    created_at timestamp NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS "user" (
    id text PRIMARY KEY, name text NOT NULL, email text NOT NULL UNIQUE,
    email_verified boolean NOT NULL DEFAULT false, image text, role text,
    created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS "session" (
    id text PRIMARY KEY, expires_at timestamp NOT NULL, token text NOT NULL UNIQUE,
    created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now(),
    ip_address text, user_agent text,
    user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS "account" (
    id text PRIMARY KEY, account_id text NOT NULL, provider_id text NOT NULL,
    user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    access_token text, refresh_token text, id_token text,
    access_token_expires_at timestamp, refresh_token_expires_at timestamp,
    scope text, password text,
    created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS "verification" (
    id text PRIMARY KEY, identifier text NOT NULL, value text NOT NULL,
    expires_at timestamp NOT NULL,
    created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS shoe_profiles (
    id text PRIMARY KEY,
    user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    name text NOT NULL, genre text NOT NULL, size text NOT NULL,
    created_at timestamp NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS orders (
    id text PRIMARY KEY, number text NOT NULL UNIQUE,
    user_id text REFERENCES "user"(id) ON DELETE SET NULL,
    email text NOT NULL, status text NOT NULL DEFAULT 'Payée',
    address text NOT NULL, shipping_method text NOT NULL,
    subtotal integer NOT NULL, shipping integer NOT NULL, total integer NOT NULL,
    payment_intent_id text, return_reason text,
    cgv_accepted_at timestamp, cgv_version text,
    created_at timestamp NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS order_lines (
    id text PRIMARY KEY,
    order_id text NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_slug text NOT NULL, product_name text NOT NULL,
    size text NOT NULL, color text NOT NULL,
    quantity integer NOT NULL, unit_price integer NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS restock_alerts (
    id text PRIMARY KEY, product_slug text NOT NULL,
    color text NOT NULL DEFAULT '', size text NOT NULL,
    email text NOT NULL, created_at timestamp NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS rate_limit_hits (
    id text PRIMARY KEY, bucket text NOT NULL,
    hit_at timestamp NOT NULL DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS idx_rate_limit_bucket
    ON rate_limit_hits (bucket, hit_at)`,
  `CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    email text PRIMARY KEY, created_at timestamp NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS import_drafts (
    id text PRIMARY KEY, file_name text NOT NULL, title text NOT NULL,
    supplier_price integer, images jsonb NOT NULL, source_url text,
    supplier_ref text, description text, brand text,
    specifications jsonb NOT NULL DEFAULT '[]'::jsonb,
    variant_names jsonb NOT NULL DEFAULT '[]'::jsonb,
    supplier_rating text,
    status text NOT NULL DEFAULT 'draft', created_at timestamp NOT NULL DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS idx_products_brand_subcategory
    ON products (brand, subcategory)`,
  // Migrations additives (bases créées avant la Phase 7) :
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS image_urls jsonb NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_ref text`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS source_url text`,
  `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS role text`,
  `ALTER TABLE import_drafts ADD COLUMN IF NOT EXISTS supplier_ref text`,
  `ALTER TABLE import_drafts ADD COLUMN IF NOT EXISTS description text`,
  `ALTER TABLE import_drafts ADD COLUMN IF NOT EXISTS brand text`,
  `ALTER TABLE import_drafts ADD COLUMN IF NOT EXISTS specifications jsonb NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE import_drafts ADD COLUMN IF NOT EXISTS variant_names jsonb NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE import_drafts ADD COLUMN IF NOT EXISTS supplier_rating text`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS features jsonb NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications jsonb NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS field_visibility jsonb NOT NULL DEFAULT '{}'::jsonb`,
  `ALTER TABLE orders ADD COLUMN IF NOT EXISTS return_reason text`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false`,
  // Preuve d'acceptation des CGV (audit 2026-08, EL-7).
  `ALTER TABLE orders ADD COLUMN IF NOT EXISTS cgv_accepted_at timestamp`,
  `ALTER TABLE orders ADD COLUMN IF NOT EXISTS cgv_version text`,
  // Pivot baskets (D-054) : l'alerte de restock porte sur la variante.
  `ALTER TABLE restock_alerts ADD COLUMN IF NOT EXISTS color text NOT NULL DEFAULT ''`,
];

type Database = Awaited<ReturnType<typeof createDb>>;

async function applySchema(db: { execute: (query: ReturnType<typeof rawSql.raw>) => Promise<unknown> }) {
  await assertNotLegacySchema(db);
  for (const statement of DDL) {
    await db.execute(rawSql.raw(statement));
  }
}

/**
 * Garde de pivot (audit pivot, OU-2). `CREATE TABLE IF NOT EXISTS` ne modifie
 * jamais une table existante : branchée sur la base animalière, l'application
 * démarrerait sans erreur, garderait `products.animal` et son catalogue de
 * colliers, et échouerait plus tard à l'écriture — en production, sur une
 * base que rien ne purge entre deux déploiements.
 *
 * On échoue donc au démarrage, en nommant le remède. Le remède n'est **pas**
 * de purger la base de production à la main : c'est de créer une branche Neon
 * neuve et d'y pointer `DATABASE_URL`.
 */
async function assertNotLegacySchema(
  db: { execute: (query: ReturnType<typeof rawSql.raw>) => Promise<unknown> },
) {
  const result = (await db.execute(
    rawSql.raw(
      `SELECT 1 AS legacy FROM information_schema.columns
       WHERE table_name = 'products' AND column_name = 'animal' LIMIT 1`,
    ),
  )) as { rows?: unknown[] } | unknown[];
  const rows = Array.isArray(result) ? result : (result.rows ?? []);
  if (rows.length > 0) {
    throw new Error(
      "[db] Schéma animalier détecté (products.animal existe encore). " +
        "Le pivot baskets (D-053) change la forme du catalogue : l'axe est la " +
        "marque et le stock est porté par product_variants. Créez une branche " +
        "Neon neuve et pointez-y DATABASE_URL — ne purgez pas la base " +
        "existante à la main.",
    );
  }
}

async function createDb() {
  if (process.env.DATABASE_URL) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    const db = drizzle(neon(process.env.DATABASE_URL), { schema: { ...schema, ...authSchema } });
    await applySchema(db);
    await seedIfEmpty(db);
    return db;
  }
  // Garde de production (audit 2026-08, EL-4) : sans ce contrôle, une
  // production dépourvue de DATABASE_URL bascule SILENCIEUSEMENT sur la base
  // en mémoire — commandes, comptes et sessions effacés à chaque démarrage à
  // froid, catalogue de démonstration réinjecté, et la course à l'amorçage
  // admin (CR-2) rejouée indéfiniment. La phase de compilation reste
  // autorisée : la CI et les clones frais buildent sans base.
  if (isServingProduction()) {
    throw new Error(
      "[db] DATABASE_URL absent en production — démarrage refusé. " +
        "Le repli PGlite est une base en mémoire, effacée à chaque démarrage " +
        "à froid : les commandes et les comptes seraient perdus. Posez la " +
        "chaîne de connexion Neon sur Vercel.",
    );
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const client = new PGlite(); // en mémoire : reconstruit à chaque build/boot
  const db = drizzle(client, { schema: { ...schema, ...authSchema } });
  await applySchema(db);
  await seedIfEmpty(db);
  return db;
}

/**
 * Singleton par processus via globalThis : les bundles Next (routes API,
 * server actions, pages) chargent chacun leur copie du module — sans ce
 * partage, chaque copie ouvrirait sa propre PGlite en mémoire.
 */
const globalStore = globalThis as unknown as { __chienEtChatDb?: Promise<Database> };

/**
 * Un échec d'initialisation (Neon momentanément injoignable au démarrage…)
 * ne doit pas rester mis en cache : sinon toute l'instance serverless reste
 * cassée jusqu'au prochain redémarrage à froid — la requête suivante retente.
 */
export function getDb(): Promise<Database> {
  if (!globalStore.__chienEtChatDb) {
    globalStore.__chienEtChatDb = createDb().catch((error) => {
      globalStore.__chienEtChatDb = undefined;
      throw error;
    });
  }
  return globalStore.__chienEtChatDb;
}
