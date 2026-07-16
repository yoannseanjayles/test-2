import type { Metadata } from "next";
import type { ReactNode } from "react";
import { fraunces, nunitoSans, workSans } from "@/styles/fonts";
import { CookieBanner } from "@/components/layout/CookieBanner/CookieBanner";
import { getShippingConfig } from "@/lib/admin-settings";
import { formatPrice } from "@/lib/format";
import "@/styles/theme.css";

/** Seuil de livraison offerte lu en base (audit M-9) — jamais en dur. */
export async function generateMetadata(): Promise<Metadata> {
  const { freeShippingCents } = await getShippingConfig();
  return {
    title: {
      default: "chien et chat — accessoires d'exception pour chiens, chats et NAC",
      template: "%s — chien et chat",
    },
    description: `Accessoires choisis avec exigence pour chiens, chats et NAC : matières nobles, conseils d'experts, livraison offerte dès ${formatPrice(freeShippingCents)}.`,
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${workSans.variable} ${nunitoSans.variable}`}
    >
      <body>
        <a
          href="#contenu"
          className="text-label sr-only z-50 rounded-md bg-cream-50 px-4 py-3 text-action focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Aller au contenu
        </a>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
