import type { Metadata } from "next";
import { UnderConstruction } from "@/components/layout/UnderConstruction/UnderConstruction";
import { illustrations } from "@/lib/media";

export const metadata: Metadata = { title: "Recherche" };

export default function Page() {
  return (
    <UnderConstruction
      title="Recherche"
      milestone="jalon 3"
      illustration={illustrations.recherche}
      description="La recherche avec autocomplétion (produits + guides) arrive au jalon 3."
    />
  );
}
