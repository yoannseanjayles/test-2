/**
 * URL canonique du site — un seul endroit pour le JSON-LD, le sitemap, les
 * e-mails et robots.txt. Poser NEXT_PUBLIC_SITE_URL (domaine définitif) en
 * production ; repli sur l'URL d'auth puis le domaine Vercel du projet.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.BETTER_AUTH_URL ??
  "https://comptoir-store.vercel.app"
).replace(/\/$/, "");
