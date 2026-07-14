import { cn } from "@/lib/cn";

/** Indicateur de chargement inline (boutons, zones en attente). */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Chargement"
      className={cn(
        "inline-block size-[15px] animate-spin rounded-full border-2 border-current border-t-transparent opacity-80",
        className,
      )}
    />
  );
}
