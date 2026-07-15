"use client";

import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import {
  bootstrapAdmin,
  deleteAdminProduct,
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
import { listAdminOrders, setOrderStatus, type AdminOrderDto } from "@/lib/admin-orders";
import { orderTransitions } from "@/lib/account";
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

  const canOps = admin.role === "Admin" || admin.role === "Ops";
  const canCatalogue = admin.role === "Admin" || admin.role === "Catalogue";
  return (
    <Shell role={admin.role}>
      {canOps && <OrdersSection />}
      {canCatalogue && <Catalogue />}
      {canCatalogue && <ImportSection />}
      {!canOps && !canCatalogue && (
        <p className="text-body text-bark-700">
          Les outils éditoriaux arrivent au jalon 4 — rien à afficher pour
          votre rôle pour l'instant.
        </p>
      )}
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

/**
 * Commandes & Ops (jalon 3) — transitions D-016 gardées serveur, retour
 * client visible avec son motif, remboursement Stripe sur Annulée/Remboursée.
 */
function OrdersSection() {
  const [ordersList, setOrdersList] = useState<AdminOrderDto[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = () => listAdminOrders().then(setOrdersList).catch(() => setOrdersList([]));
  useEffect(() => { refresh(); }, []);

  if (ordersList === null) {
    return <p aria-busy="true" className="text-body-sm text-bark-700">Chargement des commandes…</p>;
  }

  const transition = async (number: string, next: string) => {
    setBusy(true);
    setFeedback("");
    const result = await setOrderStatus(number, next);
    setBusy(false);
    setFeedback(result.ok ? `${number} → ${next}. ${result.info ?? ""}` : (result.error ?? "Erreur."));
    if (result.ok) refresh();
  };

  return (
    <section className="mb-10 flex flex-col gap-4">
      <h2 className="font-heading text-h2 font-semibold text-bark-900">
        Commandes ({ordersList.length})
      </h2>
      <p aria-live="polite" className={`text-body-sm ${/refusé|Erreur|non autorisée|introuvable/.test(feedback) ? "text-error" : "text-success"}`}>
        {feedback}
      </p>
      {ordersList.length === 0 ? (
        <p className="rounded-lg bg-cream-50 p-6 text-body-sm text-bark-700 shadow-card">
          Aucune commande pour l'instant.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-cream-50 shadow-card">
          <table className="w-full border-collapse text-body-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {["N°", "Date", "Client", "Total", "Statut", ""].map((h) => (
                  <th key={h} className="font-heading px-4 py-3 font-semibold text-bark-900">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-bark-700">
              {ordersList.map((order) => {
                const nextStatuses = orderTransitions[order.status] ?? [];
                const isOpen = open === order.number;
                const closed = order.status === "Annulée" || order.status === "Remboursée";
                return (
                  <Fragment key={order.number}>
                    <tr className="border-b border-border last:border-0">
                      <td className="px-4 py-2.5 font-semibold text-bark-900">{order.number}</td>
                      <td className="px-4 py-2.5">{new Date(order.createdAt).toLocaleDateString("fr-FR")}</td>
                      <td className="px-4 py-2.5">{order.email}</td>
                      <td className="text-price px-4 py-2.5">{formatPrice(order.total)}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant={closed ? "stock" : order.status === "Retour en cours" ? "neutral" : "new"}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          type="button"
                          onClick={() => setOpen(isOpen ? null : order.number)}
                          aria-expanded={isOpen}
                          className="text-label min-h-9 text-action underline-offset-4 hover:underline"
                        >
                          {isOpen ? "Fermer" : "Détails"}
                        </button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="border-b border-border bg-cream-100/60 last:border-0">
                        <td colSpan={6} className="px-4 py-4">
                          <div className="flex flex-col gap-3">
                            <p className="text-body-sm">
                              <span className="font-semibold text-bark-900">Livraison :</span> {order.address} · {order.shippingMethod}
                              {order.hasPaymentIntent ? " · paiement Stripe" : " · paiement démonstration"}
                            </p>
                            {order.returnReason && (
                              <p className="text-body-sm">
                                <span className="font-semibold text-bark-900">Motif du retour client :</span> {order.returnReason}
                              </p>
                            )}
                            <ul className="divide-y divide-border border-y border-border">
                              {order.lines.map((line, i) => (
                                <li key={i} className="flex justify-between gap-3 py-2 text-body-sm">
                                  <span>{line.quantity} × {line.productName} — {line.size} · {line.color}</span>
                                  <span className="text-price shrink-0">{formatPrice(line.unitPrice * line.quantity)}</span>
                                </li>
                              ))}
                            </ul>
                            {nextStatuses.length > 0 ? (
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-label text-bark-900">Passer à :</span>
                                {nextStatuses.map((next) => (
                                  <Button
                                    key={next}
                                    variant={next === "Annulée" || next === "Remboursée" ? "ghost" : "secondary"}
                                    disabled={busy}
                                    onClick={() => {
                                      if (
                                        (next === "Annulée" || next === "Remboursée") &&
                                        !window.confirm(`Confirmer « ${next} » pour ${order.number} ? Le paiement sera remboursé intégralement.`)
                                      ) return;
                                      transition(order.number, next);
                                    }}
                                  >
                                    {next}
                                  </Button>
                                ))}
                              </div>
                            ) : (
                              <p className="text-body-sm text-bark-500">Statut terminal — aucune transition (D-016).</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
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
  const [deleting, setDeleting] = useState(false);

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
      {product.supplierRef && (
        <p className="text-caption mt-1 text-bark-700">
          Produit importé — réf. AliExpress {product.supplierRef}
          {product.sourceUrl && (
            <>
              {" · "}
              <a href={product.sourceUrl} target="_blank" rel="noreferrer noopener" className="text-action underline-offset-4 hover:underline">
                page d'origine ↗
              </a>
            </>
          )}
        </p>
      )}
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
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button type="submit" loading={saving}>Enregistrer</Button>
        <Button type="button" variant="ghost" onClick={onDone}>Annuler</Button>
        <button
          type="button"
          disabled={deleting}
          onClick={async () => {
            const message =
              `Supprimer définitivement « ${product.name} » ?\n\n` +
              "Ses avis, stocks et alertes de retour en stock seront supprimés. " +
              "Les commandes déjà passées conservent leur historique.";
            if (!window.confirm(message)) return;
            setDeleting(true);
            const result = await deleteAdminProduct(product.slug);
            setDeleting(false);
            if (!result.ok) { setError(result.error ?? "Erreur."); return; }
            onDone();
          }}
          className="text-label ml-auto min-h-11 rounded-md px-4 text-error transition-colors duration-150 hover:bg-error/10 disabled:opacity-50"
        >
          {deleting ? "Suppression…" : "Supprimer ce produit"}
        </button>
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
        {draft.supplierRef && <> · réf. AliExpress {draft.supplierRef}</>}
        {draft.supplierPrice !== null && <> · prix fournisseur : {formatPrice(draft.supplierPrice)}</>}
        {draft.images.length > 0 && <> · {draft.images.length} image(s) fournisseur (à remplacer, D-042)</>}
        {draft.sourceUrl && (
          <>
            {" · "}
            <a href={draft.sourceUrl} target="_blank" rel="noreferrer noopener" className="text-action underline-offset-4 hover:underline">
              page d'origine ↗
            </a>
          </>
        )}
      </p>
      {draft.images.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {draft.images.map((src) => (
            <li key={src}>
              {/* Vignettes fournisseur brutes — <img> volontaire (aperçu admin, hors optimiseur). */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-16 w-16 rounded-sm border border-border object-cover" loading="lazy" />
            </li>
          ))}
        </ul>
      )}
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
              defaultValue={draft.description ?? ""}
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
