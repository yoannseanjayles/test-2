"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import {
  bootstrapAdmin,
  getAdminUser,
  importAliexpressFiles,
  listAdminProducts,
  listDrafts,
  publishDraft,
  updateAdminProduct,
  type AdminProduct,
  type AdminUser,
  type DraftDto,
  type ImportReport,
} from "@/lib/admin";
import { subcategories } from "@/lib/catalog/data";
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
      <ImportSection />
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

/** Import AliExpress (D-052/H41) : drag & drop de pages téléchargées, analyse hors ligne. */
function ImportSection() {
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reports, setReports] = useState<ImportReport[]>([]);
  const [drafts, setDrafts] = useState<DraftDto[]>([]);
  const refresh = () => listDrafts().then(setDrafts).catch(() => setDrafts([]));
  useEffect(() => { refresh(); }, []);

  const handleFiles = async (files: FileList | File[]) => {
    const formData = new FormData();
    [...files].forEach((f) => formData.append("files", f));
    setBusy(true);
    setReports(await importAliexpressFiles(formData));
    setBusy(false);
    refresh();
  };

  return (
    <section className="mt-14">
      <h2 className="font-heading text-h2 font-semibold text-bark-900">
        Importer depuis AliExpress
      </h2>
      <p className="mt-2 max-w-2xl text-body-sm text-bark-700">
        Enregistrez les pages produit depuis votre navigateur (« Enregistrer
        sous » → page complète, .html ou .mhtml) puis déposez-les ici. Chaque
        page devient un brouillon à compléter — rien n'est publié sans
        réécriture ni note de curation.
      </p>
      <label
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length) void handleFiles(e.dataTransfer.files); }}
        className={`mt-5 flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors duration-150 ${dragging ? "border-pine-700 bg-pine-50" : "border-bark-300 bg-cream-50"}`}
      >
        <span className="text-body text-bark-900">
          {busy ? "Analyse en cours…" : "Glissez-déposez vos pages produit ici"}
        </span>
        <span className="text-caption text-bark-700">.html / .mhtml — plusieurs fichiers acceptés · ou cliquez pour choisir</span>
        <input
          type="file"
          multiple
          accept=".html,.htm,.mhtml,.mht"
          className="sr-only"
          onChange={(e) => { if (e.target.files?.length) void handleFiles(e.target.files); e.target.value = ""; }}
        />
      </label>

      {reports.length > 0 && (
        <ul aria-live="polite" className="mt-4 space-y-1 text-body-sm">
          {reports.map((r) => (
            <li key={r.fileName} className={r.ok ? "text-success" : "text-error"}>
              {r.ok ? "✓" : "✗"} {r.fileName} — {r.ok ? `« ${r.title?.slice(0, 70)}… »` : r.error}
            </li>
          ))}
        </ul>
      )}

      {drafts.length > 0 && (
        <div className="mt-8 flex flex-col gap-4">
          <h3 className="font-heading text-h3 font-semibold text-bark-900">
            Brouillons à compléter ({drafts.length})
          </h3>
          {drafts.map((d) => (
            <DraftCard key={d.id} draft={d} onPublished={refresh} />
          ))}
        </div>
      )}
    </section>
  );
}

function DraftCard({ draft, onPublished }: { draft: DraftDto; onPublished: () => void }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const suggestedSlug = draft.title.toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 50);

  return (
    <div className="rounded-lg bg-cream-50 p-5 shadow-card">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-heading max-w-2xl text-body font-semibold text-bark-900">{draft.title}</p>
        <Badge variant="stock">Brouillon</Badge>
      </div>
      <p className="text-caption mt-1 text-bark-700">
        {draft.fileName}
        {draft.supplierPrice !== null && <> · prix fournisseur : {formatPrice(draft.supplierPrice)}</>}
        {draft.images.length > 0 && <> · {draft.images.length} image(s) fournisseur (à remplacer, D-042)</>}
      </p>
      {!open ? (
        <Button variant="secondary" className="mt-3" onClick={() => setOpen(true)}>
          Compléter et publier
        </Button>
      ) : (
        <form
          className="mt-4 border-t border-border pt-4"
          onSubmit={async (event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            setSaving(true);
            const result = await publishDraft({
              draftId: draft.id,
              name: String(data.get("name")),
              slug: String(data.get("slug")),
              animal: data.get("animal") as "chien" | "chat" | "nac",
              subcategory: String(data.get("subcategory")),
              price: Math.round(Number(data.get("price")) * 100),
              shortDescription: String(data.get("description")),
              curatorNote: String(data.get("note")),
            });
            setSaving(false);
            if (!result.ok) { setError(result.error ?? "Erreur."); return; }
            onPublished();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Nom (réécrit en français)" name="name" defaultValue={draft.title.slice(0, 80)} required />
            <FormField label="Slug" name="slug" defaultValue={suggestedSlug} required />
            <label className="flex flex-col gap-1.5">
              <span className="text-label text-bark-900">Sous-catégorie</span>
              <select name="subcategory" required
                onChange={(e) => {
                  const animal = e.target.selectedOptions[0]?.dataset.animal ?? "chien";
                  (e.target.form!.elements.namedItem("animal") as HTMLInputElement).value = animal;
                }}
                className="h-12 rounded-sm border border-border bg-cream-50 px-4 text-body text-bark-900">
                {subcategories.map((s) => (
                  <option key={`${s.animal}-${s.slug}`} value={s.slug} data-animal={s.animal}>
                    {s.animal} — {s.label}
                  </option>
                ))}
              </select>
              <input type="hidden" name="animal" defaultValue="chien" />
            </label>
            <FormField label="Prix de vente TTC (€)" name="price" type="number" step="0.01" min="1"
              defaultValue={draft.supplierPrice !== null ? ((draft.supplierPrice * 2.5) / 100).toFixed(2) : ""}
              help="Pré-rempli à ×2,5 du prix fournisseur." required />
          </div>
          <label className="mt-4 flex flex-col gap-1.5">
            <span className="text-label text-bark-900">Accroche (2–3 phrases, réécrites)</span>
            <textarea name="description" rows={2} required
              className="rounded-sm border border-border bg-cream-50 p-4 text-body text-bark-900 focus:border-pine-500" />
          </label>
          <label className="mt-4 flex flex-col gap-1.5">
            <span className="text-label text-bark-900">Note de curation (obligatoire, D-025)</span>
            <textarea name="note" rows={2} required
              placeholder="Pourquoi ce produit passe notre sélection…"
              className="rounded-sm border border-border bg-cream-50 p-4 text-body text-bark-900 focus:border-pine-500" />
          </label>
          <div className="mt-4 flex gap-3">
            <Button type="submit" loading={saving}>Publier la fiche</Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
          </div>
          <p aria-live="assertive" className="mt-2 text-body-sm text-error">{error}</p>
        </form>
      )}
    </div>
  );
}
