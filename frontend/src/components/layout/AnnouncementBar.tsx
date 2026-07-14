import { REASSURANCE_MESSAGES } from "@/lib/nav";

/**
 * Bandeau de réassurance (spec 2.1 Accueil S1).
 * Statique côté serveur : les 3 messages sont affichés en desktop,
 * le premier seul en mobile — pas de rotation animée (D-020, sobriété).
 */
export function AnnouncementBar() {
  return (
    <div className="bg-bark-900 text-cream-100">
      <p className="mx-auto flex max-w-[1360px] items-center justify-center gap-8 px-4 py-2 text-center font-heading text-xs font-medium tracking-[0.02em]">
        {REASSURANCE_MESSAGES.map((message, i) => (
          <span key={message} className={i > 0 ? "hidden md:inline" : undefined}>
            {message}
          </span>
        ))}
      </p>
    </div>
  );
}
