import type { NextConfig } from "next";

/**
 * En-têtes de sécurité (audit 2026-08, EL-2) — le site était servi sans
 * aucune directive : la page de paiement était iframable (clickjacking sur
 * le tunnel de commande) et rien ne contraignait l'origine des scripts.
 *
 * Volontairement posés ici et NON dans un `middleware.ts` : un middleware
 * Next intercepte toutes les routes, `/api/webhooks/stripe` comprise, qui
 * n'envoie aucun cookie de session — Stripe recevrait des 401 et les
 * paiements ne seraient jamais confirmés (piège du Check 11 du référentiel).
 */
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

/**
 * CSP posée en Report-Only : les violations apparaissent dans la console du
 * navigateur sans rien casser. Relever les pages du tunnel de commande et du
 * back-office pendant quelques jours, puis renommer la clé en
 * `Content-Security-Policy` pour passer en application.
 *
 * `'unsafe-inline'` sur script-src est le prix à payer tant qu'il n'y a pas
 * de nonce — et un nonce impose un middleware, donc le piège ci-dessus.
 * Même ainsi, la directive bloque déjà tout script d'origine externe.
 * Les polices sont auto-hébergées (@fontsource) : aucun hôte tiers requis.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://js.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.alicdn.com https://*.aliexpress-media.com",
  "font-src 'self' data:",
  "connect-src 'self' https://api.stripe.com",
  "frame-src https://js.stripe.com https://hooks.stripe.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Ne pas annoncer la pile technique.
  poweredByHeader: false,
  // PGlite embarque son moteur WASM : il doit rester hors bundling serveur.
  serverExternalPackages: ["@electric-sql/pglite"],
  images: {
    // Photos fournisseur des produits importés (7.1, D-052) — CDN AliExpress.
    remotePatterns: [
      { protocol: "https", hostname: "**.alicdn.com" },
      { protocol: "https", hostname: "**.aliexpress-media.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          ...securityHeaders,
          { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy },
        ],
      },
    ];
  },
};

export default nextConfig;
