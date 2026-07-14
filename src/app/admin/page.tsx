"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import {
  bootstrapAdmin,
  getAdminUser,
  listAdminProducts,
  updateAdminProduct,
  type AdminProduct,
  type AdminUser,
} from "@/lib/admin";
import { formatPrice } from "@/lib/format";
import { Badge, Button, FormField } from "@/components/ui";

/**
 * Back-office — jalon 1 (D-052) : garde par rôle (serveur), catalogue
 * éditable (prix, stocks, rang H17, note de curation D-025), ISR < 60 s.
 */
export default function AdminPage() {
  const { data: session, isPending } = useSession();
  const [admin, setAdmin] = useState<AdminUser | null | undefined>(undefined);
  const [message, setMessage] = useState("");

  const refresh = () => getAdminUser().then(setAdmin);
  useEffect(() => {
    if (session) refresh();
    else if (!isPending) setAdmin(null);
  }, [session, isPending]);

  if (isPending || admin === undefined) {
    return <Shell><p aria-busy="true" className="text-body-sm text-bark-700">Chargement…</p></Shell>;
  }

  if (!session) {
    return (
      <Shell>
        <p className="text-body text-bark-700">
          Espace réservé à l'équipe.{" "}
          <Link href="/compte" className="text-action underline-offset-4 hover:underline">
            Connectez-vous
          </Link>{" "}
          puis revenez ici.
        </p>
      </Shell>
    );
  }

  if (!admin) {
    return (
      <Shell>
        <p className="text-body text-bark-700">
          Votre compte n'a pas de rôle back-office (H42 : les rôles sont
          attribués en base).
        </p>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={async () => {
            const result = await bootstrapAdmin();
            setMessage(result.error ?? "");
            if (result.ok) refresh();
          }}
        >
          Devenir administrateur (amorçage démo — 1ᵉʳ admin uniquement)
        </Button>
        <p aria-live="polite" className="mt-2 text-body-sm text-error">{message}</p>
      </Shell>
    );
  }

  return (
    <Shell role={admin.role}>
      <Catalogue />
    </Shell>
  );
}

function Shell({ children, role }: { children: React.ReactNode; role?: string }) {
  return (
    <div className="mx-auto max-w-page px-4 py-10 lg:px-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-h1 font-[560] text-bark-900">Back-office</h1>
        {role && <Badge variant="new">Rôle : {role}</Badge>}
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}

function Catalogue() {
  const [items, setItems] = useState<AdminProduct[] | null>(null);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const refresh = () => listAdminProducts().then(setItems).catch(() => setItems([]));
  useEffect(() => { refresh(); }, []);

  if (items === null) return <p aria-busy="true" className="text-body-sm text-bark-700">Chargement…</p>;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-heading text-h2 font-semibold text-bark-900">
        Catalogue ({items.length} produits)
      </h2>
      {editing ? (
        <EditForm product={editing} onDone={() => { setEditing(null); refresh(); }} />
      ) : (
        <div className="overflow-x-auto rounded-lg bg-cream-50 shadow-card">
          <table className="w-full border-collapse text-body-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {["Produit", "Univers", "Prix TTC", "Rang", "Stock total", ""].map((h) => (
                  <th key={h} className="font-heading px-4 py-3 font-semibold text-bark-900">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-bark-700">
              {items.map((p) => {
                const stock = p.sizes.reduce((a, s) => a + s.stock, 0);
                return (
                  <tr key={p.slug} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5 font-semibold text-bark-900">{p.name}</td>
                    <td className="px-4 py-2.5">{p.animal} / {p.subcategory}</td>
                    <td className="text-price px-4 py-2.5">{formatPrice(p.price)}</td>
                    <td className="px-4 py-2.5">{p.curatedRank}</td>
                    <td className={`px-4 py-2.5 ${stock === 0 ? "font-semibold text-error" : stock <= 5 ? "text-warning" : ""}`}>
                      {stock === 0 ? "Rupture" : stock}
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        type="button"
                        onClick={() => setEditing(p)}
                        className="text-label min-h-9 text-action underline-offset-4 hover:underline"
                      >
                        Modifier
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EditForm({ product, onDone }: { product: AdminProduct; onDone: () => void }) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  return (
    <form
      className="max-w-2xl rounded-lg bg-cream-50 p-6 shadow-card"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSaving(true);
        const result = await updateAdminProduct({
          slug: product.slug,
          price: Math.round(Number(data.get("price")) * 100),
          curatedRank: Number(data.get("rank")),
          isNew: data.get("isNew") === "on",
          curatorNote: String(data.get("note") ?? ""),
          stocks: product.sizes.map((s) => ({ name: s.name, stock: Number(data.get(`stock-${s.name}`)) })),
        });
        setSaving(false);
        if (!result.ok) { setError(result.error ?? "Erreur."); return; }
        onDone();
      }}
    >
      <h3 className="font-heading text-h3 font-semibold text-bark-900">{product.name}</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <FormField label="Prix TTC (€)" name="price" type="number" step="0.01" min="1" defaultValue={(product.price / 100).toFixed(2)} required />
        <FormField label="Rang « Notre sélection » (H17)" name="rank" type="number" min="1" defaultValue={String(product.curatedRank)} required />
      </div>
      <fieldset className="mt-4">
        <legend className="text-label text-bark-900">Stocks par taille</legend>
        <div className="mt-2 grid gap-4 sm:grid-cols-3">
          {product.sizes.map((s) => (
            <FormField key={s.name} label={s.name} name={`stock-${s.name}`} type="number" min="0" defaultValue={String(s.stock)} required />
          ))}
        </div>
      </fieldset>
      <label className="mt-4 flex items-center gap-3 text-body-sm text-bark-900">
        <input type="checkbox" name="isNew" defaultChecked={product.isNew} className="size-4 accent-pine-700" />
        Badge « Nouveau »
      </label>
      <label className="mt-4 flex flex-col gap-1.5">
        <span className="text-label text-bark-900">Note de curation (obligatoire, D-025)</span>
        <textarea
          name="note"
          rows={3}
          defaultValue={product.curatorNote}
          required
          className="rounded-sm border border-border bg-cream-50 p-4 text-body text-bark-900 focus:border-pine-500"
        />
      </label>
      <div className="mt-5 flex gap-3">
        <Button type="submit" loading={saving}>Enregistrer</Button>
        <Button type="button" variant="ghost" onClick={onDone}>Annuler</Button>
      </div>
      <p aria-live="assertive" className="mt-2 text-body-sm text-error">{error}</p>
    </form>
  );
}
