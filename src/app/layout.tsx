import type { Metadata } from "next";
import type { ReactNode } from "react";
import { bebasNeue, jost } from "@/styles/fonts";
import { CookieBanner } from "@/components/layout/CookieBanner/CookieBanner";
import { getShippingConfig } from "@/lib/admin-settings";
import { company } from "@/lib/company";
import { formatPrice } from "@/lib/format";
import "@/styles/theme.css";

/** Seuil de livraison offerte lu en base (audit M-9) — jamais en dur. */
export async function generateMetadata(): Promise<Metadata> {
  const { freeShippingCents } = await getShippingConfig();
  return {
    title: {
      default: `${company.tradeName} — baskets On, Nike, Saucony, ASICS et Salomon`,
      template: `%s — ${company.tradeName}`,
    },
    description: `Treize modèles, cinq marques, 88 coloris. Grille de tailles par marque et conseil de chaussant sur chaque fiche. Livraison offerte dès ${formatPrice(freeShippingCents)}.`,
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${bebasNeue.variable} ${jost.variable}`}
    >
      <body>
        <a
          href="#contenu"
          className="text-label sr-only z-50 bg-bark-900 px-4 py-3 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Aller au contenu
        </a>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
