import type { Metadata } from "next";
import { ConfirmationContent } from "./ConfirmationContent";

export const metadata: Metadata = {
  title: "Merci pour votre commande",
  robots: { index: false },
};

/** Confirmation (spec Checkout) : récap + création de compte post-achat (D-014). */
export default function ConfirmationPage() {
  return <ConfirmationContent />;
}
