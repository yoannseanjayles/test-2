"use client";

import Link from "next/link";
import { Fragment, useEffect, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  BookOpen,
  ClipboardList,
  FileDown,
  LayoutDashboard,
  PackageOpen,
  Settings2,
  Tags,
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import {
  bootstrapAdmin,
  deleteAdminProduct,
  getAdminSummary,
  getAdminUser,
  importAliexpressFiles,
  listAdminProducts,
  listDrafts,
  publishDraft,
  updateAdminProduct,
  type AdminProduct,
  type AdminSummary,
  type AdminUser,
  type DraftDto,
  type ImportReport,
} from "@/lib/admin";
import { listAdminOrders, setOrderStatus, type AdminOrderDto } from "@/lib/admin-orders";
import {
  countNewsletterSubscribers,
  deleteGuide,
  exportNewsletterCsv,
  listAdminGuides,
  saveGuide,
  type AdminGuideDto,
} from "@/lib/admin-editorial";
import { getShippingConfig, saveShippingConfig } from "@/lib/admin-settings";
import { parseLines, parseSpecs, serializeSpecs } from "@/lib/import-fields";
import { shippingMethods, type ShippingConfig } from "@/lib/shipping";
import { orderTransitions } from "@/lib/account";
import { subcategories } from "@/lib/catalog/data";
import { formatPrice } from "@/lib/format";
import { Badge, Button, FormField } from "@/components/ui";

/** Sections du back-office — visibles selon le rôle (D-017/H42). */
type SectionId = "dashboard" | "orders" | "catalogue" | "import" | "editorial" | "settings";

const SECTIONS: {
  id: SectionId;
  label: string;
  Icon: typeof LayoutDashboard;
  roles: ("Admin" | "Ops" | "Catalogue" | "Éditorial")[];
}[] = [
  { id: "dashboard", label: "Vue d'ensemble", Icon: LayoutDashboard, roles: ["Admin", "Ops", "Catalogue", "Éditorial"] },
  { id: "orders", label: "Commandes", Icon: ClipboardList, roles: ["Admin", "Ops"] },
  { id: "catalogue", label: "Catalogue", Icon: Tags, roles: ["Admin", "Catalogue"] },
  { id: "import", label: "Import AliExpress", Icon: FileDown, roles: ["Admin", "Catalogue"] },
  { id: "editorial", label: "Éditorial", Icon: BookOpen, roles: ["Admin", "Éditorial"] },
  { id: "settings", label: "Réglages", Icon: Settings2, roles: ["Admin"] },
];

/**
 * Back-office (D-052) — garde par rôle (serveur), navigation par sections :
 * vue d'ensemble chiffrée, commandes, catalogue, import, éditorial, réglages.
 */
export default function AdminPage() {
  const { data: session, isPending } = useSession();
  const [admin, setAdmin] = useState<AdminUser | null | undefined>(undefined);
  const [message, setMessage] = useState("");
  const [section, setSection] = useState<SectionId>("dashboard");

  const refresh = () => getAdminUser().then(setAdmin);
  useEffect(() => {
    if (session) refresh();
    else if (!isPending) setAdmin(null);
  }, [session, isPending]);

  if (isPending || admin === undefined) {
    return <Gate><p aria-busy="true" className="text-body-sm text-bark-700">Chargement…</p></Gate>;
  }

  if (!session) {
    return (
      <Gate>
        <p className="text-body text-bark-700">
          Espace réservé à l'équipe.{" "}
          <Link href="/compte" className="text-action underline-offset-4 hover:underline">
            Connectez-vous
          </Link>{" "}
          puis revenez ici.
        </p>
      </Gate>
    );
  }

  if (!admin) {
    return (
      <Gate>
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
      </Gate>
    );
  }

  const allowed = SECTIONS.filter((s) => s.roles.includes(admin.role));
  const active = allowed.some((s) => s.id === section) ? section : "dashboard";

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Barre d'en-tête admin */}
      <header className="border-b border-border bg-cream-50">
        <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-3 px-4 py-4 lg:px-6">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-xl font-semibold text-bark-900">chien et chat</span>
            <span className="text-caption rounded-full bg-pine-700 px-2.5 py-0.5 text-cream-50">Back-office</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-caption hidden text-bark-700 sm:inline">
              {admin.email} · rôle {admin.role}
            </span>
            <Link
              href="/"
              className="text-label inline-flex min-h-9 items-center gap-1 text-action underline-offset-4 hover:underline"
            >
              Voir la boutique <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => signOut()}
              className="text-label min-h-9 text-bark-500 hover:text-error"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-page px-4 py-6 lg:grid lg:grid-cols-[230px_1fr] lg:gap-8 lg:px-6 lg:py-8">
        {/* Navigation — verticale desktop, ruban défilant mobile */}
        <nav aria-label="Sections du back-office" className="lg:sticky lg:top-6 lg:self-start">
          <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-3 lg:mx-0 lg:flex-col lg:px-0 lg:pb-0">
            {allowed.map(({ id, label, Icon }) => (
              <li key={id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setSection(id)}
                  aria-current={active === id ? "page" : undefined}
                  className={
                    active === id
                      ? "text-label flex min-h-11 w-full items-center gap-2.5 rounded-md bg-pine-700 px-4 text-white"
                      : "text-label flex min-h-11 w-full items-center gap-2.5 rounded-md px-4 text-bark-700 transition-colors duration-150 hover:bg-cream-300 hover:text-bark-900"
                  }
                >
                  <Icon aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 pt-4 lg:pt-0">
          {active === "dashboard" && <Dashboard admin={admin} go={setSection} />}
          {active === "orders" && <OrdersSection />}
          {active === "catalogue" && <Catalogue />}
          {active === "import" && <ImportSection />}
          {active === "editorial" && <EditorialSection />}
          {active === "settings" && <SettingsSection />}
        </main>
      </div>
    </div>
  );
}

/** Écran d'accès (connexion / amorçage) — avant l'entrée dans le shell. */
function Gate({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-page px-4 py-10 lg:px-6">
      <h1 className="font-display text-h1 font-[560] text-bark-900">Back-office</h1>
      <div className="mt-8 max-w-xl rounded-lg bg-cream-50 p-6 shadow-card">{children}</div>
    </div>
  );
}

/** En-tête commun des sections — titre, description, action à droite. */
function SectionHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-h2 font-[560] text-bark-900">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-body-sm text-bark-700">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** Pastille de statut de commande — teinte par famille d'états. */
function StatusPill({ status }: { status: string }) {
  const tone =
    status === "Annulée" || status === "Échec de paiement"
      ? "bg-terracotta-100 text-terracotta-900"
      : status === "Remboursée"
        ? "bg-cream-300 text-bark-700"
        : status === "Retour en cours"
          ? "bg-caramel-100 text-caramel-900"
          : status === "Expédiée" || status === "Livrée" || status === "Clôturée"
            ? "bg-sage-100 text-pine-900"
            : "bg-pine-100 text-pine-900";
  return (
    <span className={`text-caption inline-flex min-h-6 items-center whitespace-nowrap rounded-full px-2.5 font-semibold ${tone}`}>
      {status}
    </span>
  );
}

/** Vue d'ensemble — indicateurs par rôle, raccourcis vers les sections. */
function Dashboard({ admin, go }: { admin: AdminUser; go: (s: SectionId) => void }) {
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  useEffect(() => {
    getAdminSummary().then(setSummary).catch(() => {});
  }, []);

  if (summary === null) {
    return <p aria-busy="true" className="text-body-sm text-bark-700">Chargement de la vue d'ensemble…</p>;
  }

  const canOps = admin.role === "Admin" || admin.role === "Ops";
  const canCatalogue = admin.role === "Admin" || admin.role === "Catalogue";
  const canEditorial = admin.role === "Admin" || admin.role === "Éditorial";

  const cards: { label: string; value: number; hint?: string; alert?: boolean; section: SectionId; show: boolean }[] = [
    { label: "Commandes à traiter", value: summary.pendingOrders, hint: "payées ou en préparation", section: "orders", show: canOps },
    { label: "Retours en cours", value: summary.returnsInProgress, alert: summary.returnsInProgress > 0, hint: "à rembourser après réception", section: "orders", show: canOps },
    { label: "Produits au catalogue", value: summary.products, section: "catalogue", show: canCatalogue },
    { label: "Ruptures de stock", value: summary.outOfStock, alert: summary.outOfStock > 0, hint: `${summary.lowStock} produit(s) en stock faible`, section: "catalogue", show: canCatalogue },
    { label: "Brouillons d'import", value: summary.drafts, hint: "à compléter et publier", section: "import", show: canCatalogue },
    { label: "Guides publiés", value: summary.guides, section: "editorial", show: canEditorial },
    { label: "Inscrits newsletter", value: summary.subscribers, hint: "export CSV dans Éditorial", section: "editorial", show: canEditorial },
  ];

  return (
    <section>
      <SectionHeader
        title={`Bonjour ${admin.name || admin.email}`}
        description="L'essentiel de la boutique en un coup d'œil — cliquez sur une carte pour ouvrir la section."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.filter((c) => c.show).map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={() => go(card.section)}
            className="group rounded-lg bg-cream-50 p-5 text-left shadow-card transition-shadow duration-150 hover:shadow-lg focus-visible:outline-2"
          >
            <p className="text-label flex items-center justify-between text-bark-700">
              {card.label}
              <ArrowUpRight aria-hidden="true" className="size-4 text-bark-300 transition-colors duration-150 group-hover:text-action" />
            </p>
            <p className={`font-display mt-2 text-4xl font-[560] ${card.alert ? "text-terracotta-700" : "text-bark-900"}`}>
              {card.value}
            </p>
            {card.hint && <p className="text-caption mt-1 text-bark-500">{card.hint}</p>}
          </button>
        ))}
      </div>
    </section>
  );
}

/**
 * Éditorial (jalon 4) — guides en base : édition du contenu (sections « ## »),
 * création, suppression ; export CSV des inscrits newsletter.
 */
function EditorialSection() {
  const [guides, setGuides] = useState<AdminGuideDto[] | null>(null);
  const [editing, setEditing] = useState<AdminGuideDto | null>(null);
  const [creating, setCreating] = useState(false);
  const [subscribers, setSubscribers] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");

  const refresh = () => {
    listAdminGuides().then(setGuides).catch(() => setGuides([]));
    countNewsletterSubscribers().then(setSubscribers).catch(() => {});
  };
  useEffect(() => { refresh(); }, []);

  if (guides === null) {
    return <p aria-busy="true" className="text-body-sm text-bark-700">Chargement de l'éditorial…</p>;
  }

  const emptyGuide: AdminGuideDto = {
    slug: "", title: "", excerpt: "", animal: "tous", pillar: false,
    readingMinutes: 5, relatedSubcategories: [], contentText: "",
  };

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Éditorial"
        description={`${guides.length} guides en ligne — contenu par sections « ## », mis à jour sur la boutique en moins d'une minute.`}
        action={!editing && !creating
          ? <Button variant="secondary" onClick={() => setCreating(true)}>Nouveau guide</Button>
          : undefined}
      />
      {editing || creating ? (
        <GuideForm
          guide={editing ?? emptyGuide}
          isNew={creating}
          onDone={() => { setEditing(null); setCreating(false); refresh(); }}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg bg-cream-50 shadow-card">
          <table className="w-full border-collapse text-body-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {["Guide", "Univers", "Type", "Lecture", ""].map((h) => (
                  <th key={h} className="font-heading px-4 py-3 font-semibold text-bark-900">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-bark-700">
              {guides.map((g) => (
                <tr key={g.slug} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 font-semibold text-bark-900">{g.title}</td>
                  <td className="px-4 py-2.5">{g.animal}</td>
                  <td className="px-4 py-2.5">{g.pillar ? "Pilier" : "Satellite"}</td>
                  <td className="px-4 py-2.5">{g.readingMinutes} min</td>
                  <td className="px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() => setEditing(g)}
                      className="text-label min-h-9 text-action underline-offset-4 hover:underline"
                    >
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="rounded-lg bg-cream-50 p-5 shadow-card">
        <h3 className="font-heading text-h3 font-semibold text-bark-900">Newsletter</h3>
        <p className="mt-1 text-body-sm text-bark-700">
          {subscribers === null ? "…" : `${subscribers} inscrit${subscribers > 1 ? "s" : ""}`} —
          consentements horodatés (RGPD).
        </p>
        <Button
          variant="secondary"
          className="mt-3"
          onClick={async () => {
            const { csv, total } = await exportNewsletterCsv();
            const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
            const a = document.createElement("a");
            a.href = url;
            a.download = "newsletter-chien-et-chat.csv";
            a.click();
            URL.revokeObjectURL(url);
            setFeedback(`Export téléchargé (${total} inscrit${total > 1 ? "s" : ""}).`);
          }}
        >
          Exporter en CSV
        </Button>
        <p aria-live="polite" className="mt-2 text-body-sm text-success">{feedback}</p>
      </div>
    </section>
  );
}

function GuideForm({ guide, isNew, onDone }: { guide: AdminGuideDto; isNew: boolean; onDone: () => void }) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <form
      className="rounded-lg bg-cream-50 p-6 shadow-card"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSaving(true);
        const result = await saveGuide({
          slug: isNew ? String(data.get("slug")) : guide.slug,
          title: String(data.get("title")),
          excerpt: String(data.get("excerpt")),
          animal: data.get("animal") as AdminGuideDto["animal"],
          pillar: data.get("pillar") === "on",
          readingMinutes: Number(data.get("readingMinutes")),
          contentText: String(data.get("content")),
          isNew,
        });
        setSaving(false);
        if (!result.ok) { setError(result.error ?? "Erreur."); return; }
        onDone();
      }}
    >
      <h3 className="font-heading text-h3 font-semibold text-bark-900">
        {isNew ? "Nouveau guide" : guide.title}
      </h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <FormField label="Titre" name="title" defaultValue={guide.title} required />
        {isNew ? (
          <FormField label="Slug" name="slug" placeholder="mon-guide" required />
        ) : (
          <FormField label="Slug (fixe — URL publiée)" name="slug-disabled" defaultValue={guide.slug} disabled />
        )}
        <label className="flex flex-col gap-1.5">
          <span className="text-label text-bark-900">Univers</span>
          <select name="animal" defaultValue={guide.animal}
            className="h-12 rounded-sm border border-border bg-cream-50 px-4 text-body text-bark-900">
            {["tous", "chien", "chat", "nac"].map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
        <FormField label="Temps de lecture (min)" name="readingMinutes" type="number" min="1" max="60"
          defaultValue={String(guide.readingMinutes)} required />
      </div>
      <label className="mt-4 flex items-center gap-3 text-body-sm text-bark-900">
        <input type="checkbox" name="pillar" defaultChecked={guide.pillar} className="size-4 accent-pine-700" />
        Guide pilier (mis en avant sur l'Accueil, D-037)
      </label>
      <label className="mt-4 flex flex-col gap-1.5">
        <span className="text-label text-bark-900">Accroche</span>
        <textarea name="excerpt" rows={2} defaultValue={guide.excerpt} required
          className="rounded-sm border border-border bg-cream-50 p-4 text-body text-bark-900 focus:border-pine-500" />
      </label>
      <label className="mt-4 flex flex-col gap-1.5">
        <span className="text-label text-bark-900">
          Contenu — un titre de section par ligne « ## », paragraphes séparés par une ligne vide
        </span>
        <textarea name="content" rows={14} defaultValue={guide.contentText}
          className="rounded-sm border border-border bg-cream-50 p-4 font-mono text-body-sm text-bark-900 focus:border-pine-500" />
      </label>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button type="submit" loading={saving}>{isNew ? "Créer le guide" : "Enregistrer"}</Button>
        <Button type="button" variant="ghost" onClick={onDone}>Annuler</Button>
        {!isNew && (
          <button
            type="button"
            disabled={deleting}
            onClick={async () => {
              if (!window.confirm(`Supprimer définitivement le guide « ${guide.title} » ?`)) return;
              setDeleting(true);
              const result = await deleteGuide(guide.slug);
              setDeleting(false);
              if (!result.ok) { setError(result.error ?? "Erreur."); return; }
              onDone();
            }}
            className="text-label ml-auto min-h-11 rounded-md px-4 text-error transition-colors duration-150 hover:bg-error/10 disabled:opacity-50"
          >
            {deleting ? "Suppression…" : "Supprimer ce guide"}
          </button>
        )}
      </div>
      <p aria-live="assertive" className="mt-2 text-body-sm text-error">{error}</p>
    </form>
  );
}

/** Réglages boutique (jalon 4) — config livraison D-039 en base (rôle Admin). */
function SettingsSection() {
  const [config, setConfig] = useState<ShippingConfig | null>(null);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getShippingConfig().then(setConfig).catch(() => {});
  }, []);

  if (config === null) {
    return <p aria-busy="true" className="text-body-sm text-bark-700">Chargement des réglages…</p>;
  }

  return (
    <section>
      <SectionHeader
        title="Réglages"
        description="Config livraison (D-039) : seuil de livraison offerte et tarifs des 3 modes — appliqués au tunnel, au panier, au bandeau et aux pages légales."
      />
      <form
        className="mt-4 max-w-2xl rounded-lg bg-cream-50 p-6 shadow-card"
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const toCents = (name: string) => Math.round(Number(data.get(name)) * 100);
          setSaving(true);
          setFeedback("");
          const result = await saveShippingConfig({
            freeShippingCents: toCents("threshold"),
            prices: {
              domicile: toCents("domicile"),
              relais: toCents("relais"),
              express: toCents("express"),
            },
          });
          setSaving(false);
          setFeedback(result.ok
            ? "Réglages enregistrés — tunnel, panier et page Livraison à jour."
            : (result.error ?? "Erreur."));
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Livraison offerte dès (€)" name="threshold" type="number" step="0.01" min="0"
            defaultValue={(config.freeShippingCents / 100).toFixed(2)} required />
          {shippingMethods.map((m) => (
            <FormField key={m.id} label={`${m.label} (€)`} name={m.id} type="number" step="0.01" min="0"
              defaultValue={((config.prices[m.id] ?? m.price) / 100).toFixed(2)} required />
          ))}
        </div>
        <Button type="submit" className="mt-5" loading={saving}>Enregistrer les réglages</Button>
        <p aria-live="polite" className={`mt-2 text-body-sm ${/Erreur|invalides/.test(feedback) ? "text-error" : "text-success"}`}>
          {feedback}
        </p>
      </form>
    </section>
  );
}

/**
 * Commandes & Ops (jalon 3) — transitions D-016 gardées serveur, retour
 * client visible avec son motif, remboursement Stripe sur Annulée/Remboursée.
 */
/** Familles de statuts pour le filtre des commandes. */
const ORDER_FILTERS = [
  { id: "all", label: "Toutes", match: () => true },
  { id: "todo", label: "À traiter", match: (s: string) => s.startsWith("Payée") || s === "En préparation" },
  { id: "shipped", label: "Expédiées", match: (s: string) => ["Expédiée", "Livrée", "Clôturée"].includes(s) },
  { id: "returns", label: "Retours", match: (s: string) => s === "Retour en cours" || s === "Remboursée" },
  { id: "issues", label: "Annulées / échecs", match: (s: string) => s === "Annulée" || s === "Échec de paiement" || s === "En attente de paiement" },
] as const;

function OrdersSection() {
  const [ordersList, setOrdersList] = useState<AdminOrderDto[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<(typeof ORDER_FILTERS)[number]["id"]>("all");

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

  const activeFilter = ORDER_FILTERS.find((f) => f.id === filter)!;
  const visible = ordersList.filter((o) => activeFilter.match(o.status));

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Commandes"
        description="Transitions de statuts D-016 — le client est notifié par e-mail à chaque étape ; Annulée et Remboursée déclenchent le remboursement Stripe."
      />
      {/* Filtres par famille de statuts */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer les commandes">
        {ORDER_FILTERS.map((f) => {
          const count = ordersList.filter((o) => f.match(o.status)).length;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={
                filter === f.id
                  ? "text-label min-h-9 rounded-full bg-pine-700 px-4 text-white"
                  : "text-label min-h-9 rounded-full border border-border bg-cream-50 px-4 text-bark-700 transition-colors duration-150 hover:border-bark-300"
              }
            >
              {f.label} ({count})
            </button>
          );
        })}
      </div>
      <p aria-live="polite" className={`text-body-sm ${/refusé|Erreur|non autorisée|introuvable/.test(feedback) ? "text-error" : "text-success"}`}>
        {feedback}
      </p>
      {visible.length === 0 ? (
        <div className="rounded-lg bg-cream-50 p-8 text-center shadow-card">
          <PackageOpen aria-hidden="true" className="mx-auto size-8 text-bark-300" strokeWidth={1.5} />
          <p className="mt-3 text-body-sm text-bark-700">
            {ordersList.length === 0 ? "Aucune commande pour l'instant." : "Aucune commande dans ce filtre."}
          </p>
        </div>
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
              {visible.map((order) => {
                const nextStatuses = orderTransitions[order.status] ?? [];
                const isOpen = open === order.number;
                return (
                  <Fragment key={order.number}>
                    <tr className="border-b border-border transition-colors duration-150 last:border-0 hover:bg-cream-100/70">
                      <td className="px-4 py-2.5 font-semibold text-bark-900">{order.number}</td>
                      <td className="px-4 py-2.5">{new Date(order.createdAt).toLocaleDateString("fr-FR")}</td>
                      <td className="px-4 py-2.5">{order.email}</td>
                      <td className="text-price px-4 py-2.5">{formatPrice(order.total)}</td>
                      <td className="px-4 py-2.5">
                        <StatusPill status={order.status} />
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

const STOCK_FILTERS = [
  { id: "all", label: "Tous", match: () => true },
  { id: "low", label: "Stock faible", match: (stock: number) => stock > 0 && stock <= 5 },
  { id: "out", label: "Rupture", match: (stock: number) => stock === 0 },
] as const;

function Catalogue() {
  const [items, setItems] = useState<AdminProduct[] | null>(null);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [query, setQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<(typeof STOCK_FILTERS)[number]["id"]>("all");
  const refresh = () => listAdminProducts().then(setItems).catch(() => setItems([]));
  useEffect(() => { refresh(); }, []);

  if (items === null) return <p aria-busy="true" className="text-body-sm text-bark-700">Chargement…</p>;

  if (editing) {
    return (
      <div className="flex flex-col gap-6">
        <SectionHeader title="Modifier un produit" description={editing.name} />
        <EditForm product={editing} onDone={() => { setEditing(null); refresh(); }} />
      </div>
    );
  }

  const activeStock = STOCK_FILTERS.find((f) => f.id === stockFilter)!;
  const q = query.trim().toLowerCase();
  const visible = items.filter((p) => {
    const stock = p.sizes.reduce((a, s) => a + s.stock, 0);
    if (!activeStock.match(stock)) return false;
    if (!q) return true;
    return `${p.name} ${p.brand} ${p.animal} ${p.subcategory} ${p.supplierRef ?? ""}`.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader
        title="Catalogue"
        description={`${items.length} produits — prix, stocks, rang de sélection (H17) et note de curation (D-025).`}
      />
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher (nom, marque, univers, réf.)…"
          aria-label="Rechercher un produit"
          className="h-11 w-full max-w-sm rounded-sm border border-border bg-cream-50 px-4 text-body-sm text-bark-900 placeholder:text-bark-500 focus:border-pine-500 focus:outline-none"
        />
        <div className="flex gap-2" role="group" aria-label="Filtrer par stock">
          {STOCK_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStockFilter(f.id)}
              aria-pressed={stockFilter === f.id}
              className={
                stockFilter === f.id
                  ? "text-label min-h-9 rounded-full bg-pine-700 px-4 text-white"
                  : "text-label min-h-9 rounded-full border border-border bg-cream-50 px-4 text-bark-700 transition-colors duration-150 hover:border-bark-300"
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      {visible.length === 0 ? (
        <div className="rounded-lg bg-cream-50 p-8 text-center shadow-card">
          <Tags aria-hidden="true" className="mx-auto size-8 text-bark-300" strokeWidth={1.5} />
          <p className="mt-3 text-body-sm text-bark-700">Aucun produit ne correspond à cette recherche.</p>
        </div>
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
              {visible.map((p) => {
                const stock = p.sizes.reduce((a, s) => a + s.stock, 0);
                return (
                  <tr key={p.slug} className="border-b border-border transition-colors duration-150 last:border-0 hover:bg-cream-100/70">
                    <td className="px-4 py-2.5">
                      <span className="font-semibold text-bark-900">{p.name}</span>
                      {p.supplierRef && <span className="text-caption block text-bark-500">import · réf. {p.supplierRef}</span>}
                    </td>
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
          name: String(data.get("name")),
          brand: String(data.get("brand")),
          shortDescription: String(data.get("description")),
          features: parseLines(String(data.get("features"))),
          specifications: parseSpecs(String(data.get("specs"))),
          fieldVisibility: {
            images: data.get("show-images") === "on",
            features: data.get("show-features") === "on",
            specifications: data.get("show-specs") === "on",
          },
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
        <FormField label="Nom" name="name" defaultValue={product.name} required />
        <FormField label="Marque" name="brand" defaultValue={product.brand} required />
        <FormField label="Prix TTC (€)" name="price" type="number" step="0.01" min="1" defaultValue={(product.price / 100).toFixed(2)} required />
        <FormField label="Rang « Notre sélection » (H17)" name="rank" type="number" min="1" defaultValue={String(product.curatedRank)} required />
      </div>
      <label className="mt-4 flex flex-col gap-1.5">
        <span className="text-label text-bark-900">Accroche</span>
        <textarea name="description" rows={2} defaultValue={product.shortDescription} required
          className="rounded-sm border border-border bg-cream-50 p-4 text-body text-bark-900 focus:border-pine-500" />
      </label>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-label text-bark-900">Points clés (un par ligne)</span>
          <textarea name="features" rows={4} defaultValue={product.features.join("\n")}
            className="rounded-sm border border-border bg-cream-50 p-4 text-body-sm text-bark-900 focus:border-pine-500" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-label text-bark-900">Caractéristiques (« libellé : valeur »)</span>
          <textarea name="specs" rows={4} defaultValue={serializeSpecs(product.specifications)}
            className="rounded-sm border border-border bg-cream-50 p-4 text-body-sm text-bark-900 focus:border-pine-500" />
        </label>
      </div>
      <fieldset className="mt-4">
        <legend className="text-label text-bark-900">Champs affichés sur la fiche publique</legend>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-body-sm text-bark-900">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="show-images" defaultChecked={product.fieldVisibility.images !== false} className="size-4 accent-pine-700" />
            Photos fournisseur ({product.imageCount})
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="show-features" defaultChecked={product.fieldVisibility.features !== false} className="size-4 accent-pine-700" />
            Points clés
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="show-specs" defaultChecked={product.fieldVisibility.specifications !== false} className="size-4 accent-pine-700" />
            Caractéristiques
          </label>
        </div>
      </fieldset>
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
    <section>
      <SectionHeader
        title="Import AliExpress"
        description="Enregistrez les pages produit depuis votre navigateur (« Enregistrer sous », .html ou .mhtml) puis déposez-les ici. Chaque page devient un brouillon à compléter — rien n'est publié sans réécriture ni note de curation (D-042)."
      />
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
        {draft.brand && <> · boutique : {draft.brand}</>}
        {draft.supplierPrice !== null && <> · prix fournisseur : {formatPrice(draft.supplierPrice)}</>}
        {draft.supplierRating && <> · note fournisseur : {draft.supplierRating} (interne, jamais publiée)</>}
        {draft.specifications.length > 0 && <> · {draft.specifications.length} caractéristique(s)</>}
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
              brand: String(data.get("brand")),
              colorNames: parseLines(String(data.get("colors"))),
              features: parseLines(String(data.get("features"))),
              specifications: parseSpecs(String(data.get("specs"))),
              visibility: {
                images: data.get("show-images") === "on",
                features: data.get("show-features") === "on",
                specifications: data.get("show-specs") === "on",
              },
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
            <FormField label="Marque affichée" name="brand"
              defaultValue={draft.brand ?? "Sélection import"}
              help="Pré-remplie avec la boutique fournisseur." />
          </div>
          <label className="mt-4 flex flex-col gap-1.5">
            <span className="text-label text-bark-900">Accroche (2–3 phrases, réécrites)</span>
            <textarea name="description" rows={2} required
              defaultValue={draft.description ?? ""}
              className="rounded-sm border border-border bg-cream-50 p-4 text-body text-bark-900 focus:border-pine-500" />
          </label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-label text-bark-900">Coloris (un par ligne)</span>
              <textarea name="colors" rows={3}
                defaultValue={draft.variantNames.join("\n")}
                placeholder={"Bleu nuit\nSable"}
                className="rounded-sm border border-border bg-cream-50 p-4 text-body-sm text-bark-900 focus:border-pine-500" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-label text-bark-900">Points clés (un par ligne)</span>
              <textarea name="features" rows={3}
                placeholder={"Réservoir 1,2 L\nPompe silencieuse < 30 dB"}
                className="rounded-sm border border-border bg-cream-50 p-4 text-body-sm text-bark-900 focus:border-pine-500" />
            </label>
          </div>
          <label className="mt-4 flex flex-col gap-1.5">
            <span className="text-label text-bark-900">Caractéristiques (« libellé : valeur », une par ligne)</span>
            <textarea name="specs" rows={4}
              defaultValue={serializeSpecs(draft.specifications)}
              placeholder={"Matière : ABS sans BPA\nCapacité : 1200 ml"}
              className="rounded-sm border border-border bg-cream-50 p-4 text-body-sm text-bark-900 focus:border-pine-500" />
          </label>
          <fieldset className="mt-4">
            <legend className="text-label text-bark-900">Champs affichés sur la fiche publique</legend>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-body-sm text-bark-900">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="show-images" defaultChecked className="size-4 accent-pine-700" />
                Photos fournisseur ({draft.images.length})
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="show-features" defaultChecked className="size-4 accent-pine-700" />
                Points clés
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="show-specs" defaultChecked className="size-4 accent-pine-700" />
                Caractéristiques
              </label>
            </div>
          </fieldset>
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
