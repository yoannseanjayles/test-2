import type { Metadata } from "next";
import { UnderConstruction } from "@/components/layout/UnderConstruction/UnderConstruction";
import { illustrations } from "@/lib/media";

export const metadata: Metadata = { title: "Votre panier" };

export default function Page() {
  return (
    <UnderConstruction
      title="Votre panier"
      milestone="jalon 3"
      illustration={illustrations.panier}
      description="Le panier (drawer et page, seuil de livraison offerte) arrive au jalon 3."
    />
  );
}
