import type { MetadataRoute } from "next";
import { fetchGuides, fetchProducts, fetchSubcategories } from "@/lib/api";
import { productPath } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";

/** Sitemap (audit S-5) — pages boutique indexables, produits et guides depuis la base. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "",
    "/nouveautes",
    "/guides",
    "/livraison-retours",
    "/faq",
    "/contact",
    "/cgv",
    "/mentions-legales",
    "/confidentialite",
    "/cookies",
  ];
  const animals = ["chien", "chat", "nac"] as const;
  const [products, guides, ...subcats] = await Promise.all([
    fetchProducts(),
    fetchGuides(),
    ...animals.map((a) => fetchSubcategories(a)),
  ]);

  return [
    ...staticPaths.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...animals.map((a) => ({ url: `${SITE_URL}/${a}` })),
    ...subcats.flat().map((s) => ({ url: `${SITE_URL}/${s.animal}/${s.slug}` })),
    ...products.map((p) => ({ url: `${SITE_URL}${productPath(p)}` })),
    ...guides.map((g) => ({ url: `${SITE_URL}/guides/${g.slug}` })),
  ];
}
