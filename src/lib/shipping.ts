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

export function shippingPrice(methodId: ShippingMethodId, subtotal: number): number {
  const method = shippingMethods.find((m) => m.id === methodId)!;
  if (method.freeAboveThreshold && subtotal >= FREE_SHIPPING_CENTS) return 0;
  return method.price;
}
