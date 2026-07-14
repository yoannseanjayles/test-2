import type { Metadata } from "next";
import { UnderConstruction } from "@/components/layout/UnderConstruction/UnderConstruction";
import { media } from "@/lib/media";

export const metadata: Metadata = { title: "Notre histoire" };

export default function Page() {
  return (
    <UnderConstruction
      title="Notre histoire"
      milestone="jalon 4"
      illustration={media.brdAtelier}
      description="Les preuves de notre curation (critères explicites, exemples chiffrés — D-038) arrivent au jalon 4."
    />
  );
}
