import Link from "next/link";
import { footerColumns } from "@/lib/navigation";
import { NewsletterForm } from "./NewsletterForm";

const legalLinks = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Cookies", href: "/cookies" },
];

/**
 * Footer 4 colonnes (sitemap 1.2 §3) : Boutique, Aide, La marque,
 * Newsletter + paiements. Capture e-mail en pied de page (D-021).
 */
export function Footer() {
  return (
    <footer className="border-t border-border bg-cream-300 pb-20 lg:pb-0">
      <div className="mx-auto max-w-page px-4 py-12 lg:px-6 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {footerColumns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="font-heading text-h3 font-semibold text-bark-900">
                {column.title}
              </h2>
              <ul className="mt-4 space-y-1">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-9 items-center text-body-sm text-bark-700 transition-colors duration-150 hover:text-bark-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="font-heading text-h3 font-semibold text-bark-900">
              Newsletter
            </h2>
            <p className="mt-4 text-body-sm text-bark-700">
              Conseils d'experts et nouveautés choisies, une fois par mois.
            </p>
            <NewsletterForm />
            <p className="mt-6 text-caption text-bark-700">
              Paiement sécurisé — CB, Visa, Mastercard, PayPal
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-cream-500 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-body text-bark-900">
            chien et chat <span className="text-bark-700">— accessoires d'exception</span>
          </p>
          <ul className="flex gap-6">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-caption text-bark-700 transition-colors duration-150 hover:text-bark-900"
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
