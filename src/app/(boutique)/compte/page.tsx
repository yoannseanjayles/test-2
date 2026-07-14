import type { Metadata } from "next";
import { UnderConstruction } from "@/components/layout/UnderConstruction/UnderConstruction";

export const metadata: Metadata = { title: "Mon compte" };

export default function Page() {
  return (
    <UnderConstruction
      title="Mon compte"
      milestone="jalon 4"
      description="L'espace client (commandes, retours, Mes animaux) arrive au jalon 4."
    />
  );
}
