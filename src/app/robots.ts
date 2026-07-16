import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** robots.txt (audit S-5) — tunnel, compte et admin hors index. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/compte", "/checkout", "/panier", "/recherche", "/suivi-commande", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
