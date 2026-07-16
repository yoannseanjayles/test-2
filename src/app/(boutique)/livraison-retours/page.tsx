import type { Metadata } from "next";
import { RotateCcw, Truck } from "lucide-react";
import { Accordion } from "@/components/ui";
import { shippingMethods } from "@/lib/shipping";
import { getShippingConfig } from "@/lib/admin-settings";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Livraison & retours",
  description:
    "Livraison France, Belgique, Suisse et Luxembourg — offerte dès 79 €. Retours offerts — 30 jours pour changer d'avis.",
};

/**
 * Page dédiée alimentée par la même configuration que le checkout et les
 * rappels inline (D-039 : zéro incohérence de délais/tarifs entre pages).
 * Politique retours : D-040.
 */
export default async function ShippingReturnsPage() {
  const config = await getShippingConfig();
  return (
    <div className="mx-auto max-w-page px-4 py-12 lg:px-6">
      <h1 className="font-display text-h1 font-[560] text-bark-900">Livraison & retours</h1>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="livraison" className="rounded-lg bg-cream-50 p-6 shadow-card lg:p-8">
          <h2 id="livraison" className="font-heading flex items-center gap-2 text-h2 font-semibold text-bark-900">
            <Truck aria-hidden="true" className="size-6 text-pine-700" strokeWidth={1.75} />
            Livraison
          </h2>
          <p className="mt-3 text-body text-bark-700">
            Nous expédions sous 24 h ouvrées vers la France, la Belgique, la
            Suisse et le Luxembourg.{" "}
            <strong>Livraison offerte dès {formatPrice(config.freeShippingCents)}</strong>{" "}
            (domicile et point relais).
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse text-body-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="font-heading py-2 pr-4 font-semibold text-bark-900">Mode</th>
                  <th className="font-heading py-2 pr-4 font-semibold text-bark-900">Délai</th>
                  <th className="font-heading py-2 font-semibold text-bark-900">Tarif</th>
                </tr>
              </thead>
              <tbody className="text-bark-700">
                {shippingMethods.map((m) => (
                  <tr key={m.id} className="border-b border-border last:border-0">
                    <td className="py-2.5 pr-4 font-semibold text-bark-900">{m.label}</td>
                    <td className="py-2.5 pr-4">{m.detail}</td>
                    <td className="py-2.5">
                      {formatPrice(config.prices[m.id])}
                      {m.freeAboveThreshold && (
                        <span className="text-caption block text-pine-700">
                          Offerte dès {formatPrice(config.freeShippingCents)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="retours" className="rounded-lg bg-cream-50 p-6 shadow-card lg:p-8">
          <h2 id="retours" className="font-heading flex items-center gap-2 text-h2 font-semibold text-bark-900">
            <RotateCcw aria-hidden="true" className="size-6 text-pine-700" strokeWidth={1.75} />
            Retours
          </h2>
          <ul className="mt-3 space-y-3 text-body text-bark-700">
            <li>
              <strong className="text-bark-900">Retours offerts</strong> — étiquette
              prépayée envoyée par e-mail, dépôt en point relais.
            </li>
            <li>
              <strong className="text-bark-900">30 jours pour changer d'avis</strong> —
              notre garantie commerciale prolonge le droit de rétractation
              légal de 14 jours.
            </li>
            <li>
              Remboursement sous 5 jours ouvrés après réception, sur le moyen
              de paiement d'origine.
            </li>
            <li>
              Les articles doivent être non utilisés, dans leur emballage
              d'origine — l'hygiène de nos compagnons avant tout.
            </li>
          </ul>
        </section>
      </div>

      <section aria-labelledby="questions-livraison" className="mx-auto mt-12 max-w-3xl">
        <h2 id="questions-livraison" className="font-heading text-h2 font-semibold text-bark-900">
          Questions fréquentes
        </h2>
        <Accordion
          className="mt-6"
          items={[
            { title: "Comment suivre ma commande ?", content: "Un lien de suivi vous est envoyé à l'expédition. Vous pouvez aussi utiliser la page Suivi de commande avec votre numéro et votre e-mail, sans compte." },
            { title: "Puis-je échanger une taille ?", content: "Faites un retour (offert la première fois) et commandez la bonne taille. Notre guide des tailles et le schéma de mesure vous évitent l'aller-retour." },
            { title: "Livrez-vous en dehors de ces 4 pays ?", content: "Pas pour l'instant : nous préférons une logistique irréprochable sur une zone maîtrisée. L'extension est prévue après le lancement." },
          ]}
        />
      </section>
    </div>
  );
}
