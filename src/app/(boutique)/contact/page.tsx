import type { Metadata } from "next";
import { UnderConstruction } from "@/components/layout/UnderConstruction/UnderConstruction";

export const metadata: Metadata = { title: "Contact" };

export default function Page() {
  return (
    <UnderConstruction
      title="Contact"
      milestone="jalon 4"
      description="Le formulaire de contact arrive au jalon 4."
    />
  );
}
