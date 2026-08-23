import Link from "next/link";
import { CreditCard, Instagram, ShieldCheck, Truck } from "lucide-react";
import { footerColumns } from "@/lib/navigation";
import { company } from "@/lib/company";
import { NewsletterForm } from "./NewsletterForm";

const legalLinks = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Cookies", href: "/cookies" },
  { label: "CGV", href: "/cgv" },
];

const reassurance = [
  { Icon: Truck, label: "Expédié sous 24 h", text: "Colissimo suivi, France et Europe" },
  { Icon: ShieldCheck, label: "Premier retour offert", text: "30 jours pour changer d'avis" },
  { Icon: CreditCard, label: "Paiement sécurisé", text: "CB, Visa, Mastercard, PayPal" },
];

/**
 * Pied de page — refonte Azeno : bandeau de réassurance en trois colonnes,
 * bloc encre, colonnes de liens en capitales, newsletter à droite, barre
 * légale fine en bas. Capture e-mail en pied de page (D-021).
 */
export function Footer() {
  return (
    <footer className="bg-bark-900 pb-20 text-white lg:pb-0">
      <div className="border-b border-white/10">
        <ul className="mx-auto grid max-w-page gap-6 px-4 py-8 sm:grid-cols-3 lg:px-6">
          {reassurance.map(({ Icon, label, text }) => (
            <li key={label} className="flex items-start gap-3">
              <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-volt" strokeWidth={1.75} />
              <div>
                <p className="text-label text-white">{label}</p>
                <p className="text-body-sm text-white/60">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto max-w-page px-4 py-12 lg:px-6 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))_1.4fr]">
          {footerColumns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-label text-white">{column.title}</h2>
              <ul className="mt-5 space-y-1">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-9 items-center gap-2 text-body-sm text-white/65 transition-colors duration-250 hover:text-white"
                    >
                      {link.label}
                      {link.soon && (
                        <span className="text-caption uppercase tracking-[0.14em] text-volt">
                          bientôt
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="text-label text-white">Newsletter</h2>
            <p className="mt-5 text-body-sm text-white/65">
              Les nouveaux coloris et les rééditions, une fois par mois. Rien d'autre.
            </p>
            <NewsletterForm />
            <div className="mt-8 flex items-center gap-4">
              <a
                href="https://www.instagram.com/"
                aria-label="Instagram"
                rel="noreferrer noopener"
                target="_blank"
                className="flex size-11 items-center justify-center border border-white/20 text-white/70 transition-colors duration-250 hover:border-white hover:text-white"
              >
                <Instagram aria-hidden="true" className="size-5" strokeWidth={1.75} />
              </a>
              <p className="text-caption uppercase tracking-[0.14em] text-white/50">
                Paiement sécurisé — CB · Visa · Mastercard · PayPal
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-h3 leading-none text-white">
            {company.tradeName}
            <span className="text-volt">.</span>
          </p>
          <ul className="flex flex-wrap gap-6">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-caption uppercase tracking-[0.14em] text-white/55 transition-colors duration-250 hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
