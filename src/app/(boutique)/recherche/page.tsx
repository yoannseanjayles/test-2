import type { Metadata } from "next";
import { UnderConstruction } from "@/components/layout/UnderConstruction/UnderConstruction";

export const metadata: Metadata = { title: "Recherche" };

export default function Page() {
  return (
    <UnderConstruction
      title="Recherche"
      milestone="jalon 3"
      description="La recherche avec autocomplétion (produits + guides) arrive au jalon 3."
    />
  );
}
