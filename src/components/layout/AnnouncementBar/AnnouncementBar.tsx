import { announcementMessages } from "@/lib/navigation";
import { getShippingConfig } from "@/lib/admin-settings";
import { formatPrice } from "@/lib/format";

/**
 * Bandeau fin de réassurance au-dessus du header (sitemap 1.2).
 * Statique — pas de rotation automatique (esprit D-020) : 1 message mobile,
 * 3 messages séparés desktop. Jamais injecté après coup (CLS, 5.0 §3).
 * Seuil de livraison offerte lu depuis les réglages boutique (jalon 4).
 */
export async function AnnouncementBar() {
  const { freeShippingCents } = await getShippingConfig();
  const messages = [`Livraison offerte dès ${formatPrice(freeShippingCents)}`, ...announcementMessages];
  return (
    <div className="bg-pine-700 text-cream-50">
      <p className="text-label mx-auto flex max-w-page items-center justify-center gap-8 px-4 py-2 text-center">
        {messages.map((message, index) => (
          <span key={message} className={index > 0 ? "hidden lg:inline" : undefined}>
            {message}
          </span>
        ))}
      </p>
    </div>
  );
}
