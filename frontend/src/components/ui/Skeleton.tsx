import { cn } from "@/lib/cn";

/** Squelette de chargement dimensionné (CLS ≈ 0, D-027/D-048). */
export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("block animate-pulse rounded-md bg-raised", className)}
    />
  );
}
