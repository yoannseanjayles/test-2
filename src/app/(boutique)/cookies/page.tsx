import type { Metadata } from "next";
import { UnderConstruction } from "@/components/layout/UnderConstruction/UnderConstruction";

export const metadata: Metadata = { title: "Cookies" };

export default function Page() {
  return (
    <UnderConstruction
      title="Cookies"
      milestone="jalon 4"
      description="La politique cookies et la CMP interne (D-041) arrivent au jalon 4."
    />
  );
}
