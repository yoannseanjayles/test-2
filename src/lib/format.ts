const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

/** Prix TTC (H18) formaté depuis des centimes : 5900 → « 59,00 € ». */
export function formatPrice(cents: number): string {
  return priceFormatter.format(cents / 100);
}

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  year: "numeric",
  month: "long",
});

export function formatMonth(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}
