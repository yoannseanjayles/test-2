import Link from "next/link";
import { FOOTER_COLUMNS } from "@/lib/nav";
import { NewsletterForm } from "./NewsletterForm";

/** Footer 4 colonnes (sitemap 1.2 §3) : boutique, aide, marque, newsletter. */
export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-cream-300/60 pb-24 lg:pb-0">
      <div className="mx-auto grid max-w-[1360px] gap-10 px-4 py-12 md:grid-cols-2 md:px-6 lg:grid-cols-4 lg:py-16">
        {FOOTER_COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="mb-4 font-heading text-[0.8125rem] font-semibold tracking-[0.08em] text-ink-faint uppercase">
              {column.title}
            </h2>
            <ul className="flex flex-col gap-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.9375rem] text-ink-soft underline-offset-4 hover:text-ink hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h2 className="mb-4 font-heading text-[0.8125rem] font-semibold tracking-[0.08em] text-ink-faint uppercase">
            Newsletter
          </h2>
          <p className="mb-4 text-[0.9375rem] text-ink-soft">
            Conseils d&apos;experts et nouveautés, une fois par mois. Pas de spam.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-3 px-4 py-5 text-[0.8125rem] text-ink-faint md:px-6">
          <span>
            {`© ${new Date().getFullYear()} Pelage — accessoires d'exception`}
          </span>
          <nav aria-label="Liens légaux" className="flex gap-5">
            <Link href="/mentions-legales" className="hover:text-ink-soft">
              Mentions légales
            </Link>
            <Link href="/cookies" className="hover:text-ink-soft">
              Cookies
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
