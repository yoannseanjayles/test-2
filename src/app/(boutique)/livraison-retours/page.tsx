import type { Metadata } from "next";
import { UnderConstruction } from "@/components/layout/UnderConstruction/UnderConstruction";

export const metadata: Metadata = { title: "Livraison & retours" };

export default function Page() {
  return (
    <UnderConstruction
      title="Livraison & retours"
      milestone="jalon 4"
      description="Livraison offerte dès 79 €, premier retour offert, 30 jours pour changer d'avis. Le détail complet arrive au jalon 4."
    />
  );
}
