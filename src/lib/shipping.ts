/**
 * Configuration unique livraison/retours (D-039) — consommée par le
 * checkout, le panier, les rappels inline et la page dédiée.
 */

/** Seuil de livraison offerte (H12). */
export const FREE_SHIPPING_CENTS = 7900;

/** 3 modes de livraison (H21). Le seuil s'applique à domicile et relais. */
export const shippingMethods = [
  { id: "domicile", label: "À domicile", detail: "2–3 jours ouvrés", price: 490, freeAboveThreshold: true },
  { id: "relais", label: "En point relais", detail: "3–4 jours ouvrés", price: 390, freeAboveThreshold: true },
  { id: "express", label: "Express", detail: "24 h ouvrées", price: 990, freeAboveThreshold: false },
] as const;

export type ShippingMethodId = (typeof shippingMethods)[number]["id"];

/**
 * Tarifs ajustables depuis le back-office (7.1 jalon 4) — les valeurs
 * ci-dessus restent la configuration par défaut (et le repli hors ligne) ;
 * la base (table settings, clé « shipping ») prime quand un réglage existe.
 */
export type ShippingConfig = {
  freeShippingCents: number;
  prices: Record<ShippingMethodId, number>;
};

export const defaultShippingConfig: ShippingConfig = {
  freeShippingCents: FREE_SHIPPING_CENTS,
  prices: Object.fromEntries(shippingMethods.map((m) => [m.id, m.price])) as Record<ShippingMethodId, number>,
};

export function shippingPrice(
  methodId: ShippingMethodId,
  subtotal: number,
  config: ShippingConfig = defaultShippingConfig,
): number {
  const method = shippingMethods.find((m) => m.id === methodId)!;
  if (method.freeAboveThreshold && subtotal >= config.freeShippingCents) return 0;
  return config.prices[methodId] ?? method.price;
}
