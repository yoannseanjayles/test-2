import type { Metadata } from "next";
import { UnderConstruction } from "@/components/layout/UnderConstruction/UnderConstruction";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function Page() {
  return (
    <UnderConstruction
      title="Politique de confidentialité"
      milestone="jalon 4"
      description="Les textes juridiques, validés par un juriste (H30), arrivent au jalon 4."
    />
  );
}
