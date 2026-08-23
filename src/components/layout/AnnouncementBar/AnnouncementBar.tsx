import Link from "next/link";
import { Mail, Truck } from "lucide-react";
import { announcementMessages } from "@/lib/navigation";
import { getShippingConfig } from "@/lib/admin-settings";
import { formatPrice } from "@/lib/format";

/**
 * Haut de page du thème Azeno, en deux étages :
 * 1. bandeau bleu de marque, message principal centré ;
 * 2. barre utilitaire noire (≥ lg) : réassurance à gauche, liens de service
 *    à droite.
 *
 * Statique — pas de rotation automatique (esprit D-020), jamais injecté après
 * coup (CLS, 5.0 §3). Le seuil de livraison offerte vient des réglages
 * boutique (jalon 4).
 */
export async function AnnouncementBar() {
  const { freeShippingCents } = await getShippingConfig();
  const [secondary, tertiary] = announcementMessages;

  return (
    <div>
      <div className="bg-pine-700 text-white">
        <p className="text-label mx-auto flex max-w-page items-center justify-center gap-2 px-4 py-2.5 text-center">
          <Truck aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
          Livraison offerte dès {formatPrice(freeShippingCents)}
        </p>
      </div>

      <div className="hidden bg-bark-900 text-white/70 lg:block">
        <div className="text-caption mx-auto flex max-w-page items-center justify-between gap-6 px-4 py-2 uppercase tracking-[0.14em] lg:px-6">
          <p>{secondary}</p>
          <div className="flex items-center gap-6">
            {tertiary && <p className="hidden xl:block">{tertiary}</p>}
            <Link
              href="/suivi-commande"
              className="transition-colors duration-250 hover:text-white"
            >
              Suivi de commande
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 transition-colors duration-250 hover:text-white"
            >
              <Mail aria-hidden="true" className="size-3.5" strokeWidth={1.75} />
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
