import { isOutOfStock, productPath, type Product } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";
import { company } from "@/lib/company";

/** Données structurées centralisées (5.0 §4) — URL canonique de lib/site.ts. */

const SITE_NAME = company.tradeName;

/**
 * Sérialisation sûre pour `<script type="application/ld+json">` (audit
 * 2026-08, EL-3).
 *
 * `JSON.stringify` n'échappe pas `<` : un nom de produit contenant
 * `</script>` referme le bloc et tout ce qui suit s'exécute. Ces champs sont
 * pré-remplis par le parseur AliExpress depuis une page fournisseur
 * arbitraire (`og:title`) et ne sont filtrés qu'en longueur — le contenu
 * n'est pas de confiance. À utiliser partout où un objet JSON-LD part dans
 * `dangerouslySetInnerHTML`, jamais `JSON.stringify` nu.
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    slogan: "Baskets On, Nike, Saucony, ASICS et Salomon",
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/recherche?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function productJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: { "@type": "Brand", name: product.brand },
    description: product.shortDescription,
    material: product.material,
    url: `${SITE_URL}${productPath(product)}`,
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: (product.price / 100).toFixed(2),
      availability: isOutOfStock(product)
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
    // Pas d'aggregateRating tant que les avis ne proviennent pas de vrais
    // clients (audit C-5) — exposer une note issue d'avis de démonstration
    // serait une pratique trompeuse.
  };
}

export function itemListJsonLd(prods: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: prods.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}${productPath(product)}`,
    })),
  };
}
