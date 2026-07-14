"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button, FormField } from "@/components/ui";

export function SearchForm({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  return (
    <form
      className="mt-6 flex max-w-xl items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const q = String(new FormData(event.currentTarget).get("q") ?? "").trim();
        router.push(q ? `/recherche?q=${encodeURIComponent(q)}` : "/recherche");
      }}
    >
      <FormField
        label="Que cherchez-vous ?"
        name="q"
        defaultValue={initialQuery}
        placeholder="collier cuir, couchage, harnais…"
        className="flex-1"
      />
      <Button type="submit" className="shrink-0">
        <Search aria-hidden="true" className="size-4" /> Rechercher
      </Button>
    </form>
  );
}
