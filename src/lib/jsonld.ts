import { averageRating, isOutOfStock, productPath, type Product } from "@/lib/catalog";

/**
 * Données structurées centralisées (5.0 §4). L'URL de production est fictive
 * tant que le domaine n'est pas choisi (Phase 6).
 */

const SITE_URL = "https://www.chienetchat.example";
const SITE_NAME = "chien et chat";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    slogan: "Accessoires d'exception pour chiens, chats et NAC",
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
  const rating = averageRating(product);
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
    ...(rating !== null && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: rating,
        reviewCount: product.reviews.length,
      },
    }),
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
