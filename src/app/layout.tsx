import type { Metadata } from "next";
import type { ReactNode } from "react";
import { fraunces, nunitoSans, workSans } from "@/styles/fonts";
import "@/styles/theme.css";

export const metadata: Metadata = {
  title: {
    default: "Pelage — accessoires d'exception pour chiens, chats et NAC",
    template: "%s — Pelage",
  },
  description:
    "Accessoires choisis avec exigence pour chiens, chats et NAC : matières nobles, conseils d'experts, livraison offerte dès 79 €.",
};

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
      </body>
    </html>
  );
}
