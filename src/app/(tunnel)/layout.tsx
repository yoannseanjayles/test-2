import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Lock, RotateCcw, Truck } from "lucide-react";
import { getShippingConfig } from "@/lib/admin-settings";
import { formatPrice } from "@/lib/format";

/**
 * Layout tunnel épuré (D-032) : logo, retour boutique, réassurance —
 * pas de navigation ni de distractions pendant l'achat.
 */
export default async function TunnelLayout({ children }: { children: ReactNode }) {
  const { freeShippingCents } = await getShippingConfig();
  const reassurance = [
    { Icon: Truck, text: `Livraison offerte dès ${formatPrice(freeShippingCents)}` },
    { Icon: RotateCcw, text: "Retours offerts (30 jours)" },
    { Icon: Lock, text: "Paiement sécurisé" },
  ];
  return (
    <>
      <header className="border-b border-border bg-cream-100">
        <div className="mx-auto flex max-w-page items-center justify-between px-4 py-3 lg:px-6">
          <Link href="/" className="font-display text-2xl font-semibold text-bark-900">
            chien et chat
          </Link>
          <Link
            href="/"
            className="text-label inline-flex min-h-11 items-center gap-2 text-bark-700 transition-colors duration-150 hover:text-bark-900"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Continuer mes achats
          </Link>
        </div>
      </header>
      <main id="contenu" className="min-h-[70vh]">
        {children}
      </main>
      <footer className="border-t border-border bg-cream-300">
        <div className="mx-auto flex max-w-page flex-wrap items-center justify-center gap-x-10 gap-y-2 px-4 py-6 lg:px-6">
          {reassurance.map(({ Icon, text }) => (
            <p key={text} className="flex items-center gap-2 text-body-sm text-bark-700">
              <Icon aria-hidden="true" className="size-4 text-pine-700" strokeWidth={1.75} />
              {text}
            </p>
          ))}
        </div>
      </footer>
    </>
  );
}
