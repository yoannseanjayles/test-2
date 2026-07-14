import { cn } from "@/lib/cn";

/** Prix TTC (H18/D-031) — chiffres tabulaires, format FR. */
export function PriceTag({
  amount,
  compareAt,
  className,
}: {
  /** Montant en centimes d'euro. */
  amount: number;
  /** Prix barré éventuel (opération ponctuelle, D-013), en centimes. */
  compareAt?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span className="font-heading text-lg font-semibold tabular-nums">
        {formatEuro(amount)}
      </span>
      {compareAt !== undefined && compareAt > amount && (
        <s className="text-sm text-ink-faint tabular-nums">
          {formatEuro(compareAt)}
        </s>
      )}
    </span>
  );
}

export function formatEuro(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
