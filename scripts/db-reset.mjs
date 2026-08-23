/**
 * Purge complète de la base Postgres, pour repartir d'un schéma neuf.
 *
 * Pourquoi ce script existe. Le pivot animalerie → baskets change la forme du
 * catalogue : l'axe devient la marque, le stock passe sur `product_variants`.
 * Or `CREATE TABLE IF NOT EXISTS` ne modifie jamais une table existante, et
 * `seedIfEmpty` sort dès que `products` contient une ligne. Sur Neon, dont la
 * base persiste entre deux déploiements, l'ancien catalogue resterait donc en
 * place indéfiniment — et la garde de schéma de `src/db/index.ts` refuse de
 * démarrer dessus.
 *
 * Ce script ne reconstruit rien : il vide le schéma `public`. C'est le
 * bootstrap déjà en place dans l'application qui rejoue le DDL puis le seed
 * au premier accès à la base — y compris pendant le build Vercel, qui lit le
 * catalogue pour `generateStaticParams`.
 *
 * Usage :
 *   node --env-file-if-exists=.env.local scripts/db-reset.mjs            (aperçu seul)
 *   node --env-file-if-exists=.env.local scripts/db-reset.mjs --confirm  (purge réelle)
 *
 * Sans `--confirm`, rien n'est écrit : le script liste ce qu'il détruirait.
 */

import { neon } from "@neondatabase/serverless";

const CONFIRM = process.argv.includes("--confirm");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error(
    "DATABASE_URL absent.\n" +
      "Posez-le dans .env.local (ignoré par git) puis relancez avec\n" +
      "  node --env-file-if-exists=.env.local scripts/db-reset.mjs",
  );
  process.exit(1);
}

/** Identité de la base, sans jamais afficher les identifiants. */
function cible(connectionString) {
  try {
    const u = new URL(connectionString);
    return `${u.hostname}${u.pathname}`;
  } catch {
    return "(URL non analysable)";
  }
}

const sql = neon(url);
const lignes = (r) => (Array.isArray(r) ? r : (r?.rows ?? []));

const tables = lignes(
  await sql.query(
    `SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name`,
  ),
).map((r) => r.table_name);

console.log(`Base   : ${cible(url)}`);
console.log(`Tables : ${tables.length}\n`);

if (tables.length === 0) {
  console.log("Schéma déjà vide — rien à purger.");
  console.log("L'application reconstruira le schéma au premier accès.");
  process.exit(0);
}

/* Compte des lignes, pour que l'aperçu montre ce qui disparaît réellement. */
for (const t of tables) {
  const [{ n }] = lignes(await sql.query(`SELECT count(*)::int AS n FROM "${t}"`));
  const legacy = t === "products"
    ? lignes(await sql.query(
        `SELECT 1 FROM information_schema.columns
          WHERE table_name = 'products' AND column_name = 'animal' LIMIT 1`,
      )).length > 0
    : false;
  console.log(
    `  ${t.padEnd(24)} ${String(n).padStart(6)} ligne(s)` +
      (legacy ? "   ← schéma animalier (products.animal)" : ""),
  );
}

if (!CONFIRM) {
  console.log(
    "\nAperçu seul — rien n'a été modifié." +
      "\nRelancez avec --confirm pour purger ces tables.",
  );
  process.exit(0);
}

/* `CASCADE` règle l'ordre des clés étrangères : reviews et product_variants
   référencent products, session/account/shoe_profiles référencent "user",
   order_lines référence orders. Une seule instruction — le driver HTTP Neon
   n'en accepte pas davantage par requête. */
const liste = tables.map((t) => `"${t}"`).join(", ");
console.log(`\nPurge de ${tables.length} table(s)…`);
await sql.query(`DROP TABLE IF EXISTS ${liste} CASCADE`);

const restantes = lignes(
  await sql.query(
    `SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`,
  ),
);

if (restantes.length > 0) {
  console.error(
    `Échec : ${restantes.length} table(s) subsistent — ` +
      restantes.map((r) => r.table_name).join(", "),
  );
  process.exit(1);
}

console.log("Schéma public vide.");
console.log(
  "\nRien d'autre à faire : au premier accès, l'application applique le DDL\n" +
    "puis seede le catalogue baskets (13 modèles, 5 marques) et les guides.\n" +
    "Un redéploiement Vercel suffit à déclencher tout ça.",
);
