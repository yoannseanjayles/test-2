import type { Metadata } from "next";
import { UnderConstruction } from "@/components/layout/UnderConstruction/UnderConstruction";

export const metadata: Metadata = { title: "Conditions générales de vente" };

export default function Page() {
  return (
    <UnderConstruction
      title="Conditions générales de vente"
      milestone="jalon 4"
      description="Les textes juridiques, validés par un juriste (H30), arrivent au jalon 4."
    />
  );
}
