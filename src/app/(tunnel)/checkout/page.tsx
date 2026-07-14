import type { Metadata } from "next";
import { CheckoutFlow } from "./CheckoutFlow";

export const metadata: Metadata = {
  title: "Commande",
  robots: { index: false },
};

/** Checkout 3 étapes sur une URL (spec 2.1 Checkout, D-032/D-033). */
export default function CheckoutPage() {
  return <CheckoutFlow />;
}
