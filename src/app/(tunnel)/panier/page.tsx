import type { Metadata } from "next";
import { CartPageContent } from "./CartPageContent";

export const metadata: Metadata = {
  title: "Votre panier",
  robots: { index: false },
};

/** Page panier (spec 2.1 Panier, D-029/D-030/D-031). */
export default function CartPage() {
  return <CartPageContent />;
}
