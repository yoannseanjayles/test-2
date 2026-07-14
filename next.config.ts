import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // PGlite embarque son moteur WASM : il doit rester hors bundling serveur.
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
