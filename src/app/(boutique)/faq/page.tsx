import type { Metadata } from "next";
import { UnderConstruction } from "@/components/layout/UnderConstruction/UnderConstruction";

export const metadata: Metadata = { title: "Questions fréquentes" };

export default function Page() {
  return (
    <UnderConstruction
      title="Questions fréquentes"
      milestone="jalon 4"
      description="La FAQ complète arrive au jalon 4."
    />
  );
}
