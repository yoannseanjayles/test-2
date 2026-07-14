import type { Metadata } from "next";
import { UnderConstruction } from "@/components/layout/UnderConstruction/UnderConstruction";

export const metadata: Metadata = { title: "Suivi de commande" };

export default function Page() {
  return (
    <UnderConstruction
      title="Suivi de commande"
      milestone="jalon 4"
      description="Le suivi de commande invité arrive au jalon 4."
    />
  );
}
