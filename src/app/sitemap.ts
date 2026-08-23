import type { MetadataRoute } from "next";
import { fetchGuides, fetchProducts, fetchSubcategories } from "@/lib/api";
import { brands, productPath } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";

/** Sitemap (audit S-5) — pages boutique indexables, produits et guides depuis la base. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "",
    "/chaussures",
    "/homme",
    "/femme",
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
  const brandSlugs = brands.map((b) => b.slug);
  const [products, guides, ...subcats] = await Promise.all([
    fetchProducts(),
    fetchGuides(),
    ...brandSlugs.map((b) => fetchSubcategories(b)),
  ]);

  return [
    ...staticPaths.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...brandSlugs.map((b) => ({ url: `${SITE_URL}/${b}` })),
    ...subcats.flat().map((s) => ({ url: `${SITE_URL}/${s.brand}/${s.slug}` })),
    ...products.map((p) => ({ url: `${SITE_URL}${productPath(p)}` })),
    ...guides.map((g) => ({ url: `${SITE_URL}/guides/${g.slug}` })),
  ];
}
