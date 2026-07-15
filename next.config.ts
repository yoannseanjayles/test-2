import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // PGlite embarque son moteur WASM : il doit rester hors bundling serveur.
  serverExternalPackages: ["@electric-sql/pglite"],
  images: {
    // Photos fournisseur des produits importés (7.1, D-052) — CDN AliExpress.
    remotePatterns: [
      { protocol: "https", hostname: "**.alicdn.com" },
      { protocol: "https", hostname: "**.aliexpress-media.com" },
    ],
  },
};

export default nextConfig;
