import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Lock, LogOut, Package, ClipboardList, Plus, Pencil, Trash2, X, Upload } from "lucide-react";
import {
  adminListProducts,
  adminListOrders,
  adminCreateProduct,
  adminUpdateProduct,
  adminUpdateOrderStatus,
  adminDeleteProduct,
  adminUploadImage,
  adminLogin,
  getAdminToken,
  clearAdminToken,
  ADMIN_CATEGORIES,
  ADMIN_IMAGE_PRESETS,
  type AdminProductInput,
  type AdminOrder,
} from "../lib/adminApi";
import type { Product } from "../types";
import { formatPrice } from "../lib/format";
import { ApiError } from "../lib/api";

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await adminLogin(token.trim());
      onSuccess();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto mt-24 w-full max-w-sm rounded-2xl bg-white p-8 shadow-card">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-ink">
        <Lock className="h-5 w-5 text-gold-light" />
      </div>
      <h1 className="mt-4 text-center font-display text-2xl font-bold">Cartelier Admin</h1>
      <p className="mt-1 text-center text-xs text-ink/50">Enter the admin token from your backend .env</p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input
          type="password"
          autoComplete="current-password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="ADMIN_TOKEN"
          className="input font-mono"
          required
        />
        {error && <p className="text-xs font-medium text-clay">{error}</p>}
        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />} Sign in
        </button>
      </form>
    </div>
  );
}

function TierEditor({
  tiers,
  onChange,
}: {
  tiers: { quantity: number; pricePer100: number }[];
  onChange: (tiers: { quantity: number; pricePer100: number }[]) => void;
}) {
  return (
    <div>
      <label className="label">Pricing tiers (per 100 cards)</label>
      <div className="space-y-2">
        {tiers.map((tier, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="number"
              min={10}
              value={tier.quantity}
              onChange={(e) =>
                onChange(tiers.map((x, j) => (j === i ? { ...x, quantity: Number(e.target.value) } : x)))
              }
              className="input w-28"
              aria-label={`Tier ${i + 1} quantity`}
            />
            <span className="text-xs text-ink/50">cards ·</span>
            <input
              type="number"
              min={100}
              step={100}
              value={tier.pricePer100}
              onChange={(e) =>
                onChange(tiers.map((x, j) => (j === i ? { ...x, pricePer100: Number(e.target.value) } : x)))
              }
              className="input w-36"
              aria-label={`Tier ${i + 1} price per 100`}
            />
            <span className="text-xs text-ink/50">cents</span>
            <button
              type="button"
              onClick={() => onChange(tiers.filter((_, j) => j !== i))}
              className="rounded p-1.5 text-ink/40 hover:text-clay"
              aria-label="Remove tier"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...tiers, { quantity: 500, pricePer100: 1000 }])}
        className="mt-2 text-xs font-semibold text-gold-dark hover:underline"
      >
        + Add tier
      </button>
    </div>
  );
}

const EMPTY_FORM: AdminProductInput = {
  name: "",
  slug: "",
  description: "",
  category: "classic",
  material: "",
  finish: "",
  imageUrl: ADMIN_IMAGE_PRESETS[0]!,
  featured: false,
  active: true,
  tiers: [
    { quantity: 50, pricePer100: 2000 },
    { quantity: 100, pricePer100: 1500 },
  ],
};

function ProductFormModal({
  product,
  onClose,
  onSaved,
}: {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<AdminProductInput>(
    product
      ? {
          name: product.name,
          slug: product.slug,
          description: product.description,
          category: product.category,
          material: product.material,
          finish: product.finish,
          imageUrl: product.imageUrl,
          featured: product.featured,
          active: product.active,
          tiers: product.tiers.map((x) => ({ quantity: x.quantity, pricePer100: x.pricePer100 })),
        }
      : EMPTY_FORM,
  );
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await adminUploadImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function set<K extends keyof AdminProductInput>(key: K, value: AdminProductInput[K]) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "name" && !f.slug) {
        next.slug = value
          .toString()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 60);
      }
      return next;
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    if (!/^[a-z0-9-]+$/.test(form.slug)) {
      setError("Slug must be lowercase letters, numbers and dashes");
      setBusy(false);
      return;
    }
    try {
      if (product) await adminUpdateProduct(product.id, form);
      else await adminCreateProduct(form);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/50 p-4 py-10" role="dialog" aria-modal="true">
      <form onSubmit={save} className="w-full max-w-2xl rounded-2xl bg-ivory p-6 shadow-lift">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">{product ? "Edit product" : "New product"}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-ink/5" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="pf-name">Name *</label>
            <input id="pf-name" required value={form.name} onChange={(e) => set("name", e.target.value)} className="input" />
          </div>
<div>
              <label className="label" htmlFor="pf-slug">Slug *</label>
              <input id="pf-slug" required dir="ltr" value={form.slug} onChange={(e) => set("slug", e.target.value)} className="input font-mono" />
            </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="pf-desc">Description *</label>
            <textarea id="pf-desc" required rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="pf-cat">Category *</label>
            <select id="pf-cat" value={form.category} onChange={(e) => set("category", e.target.value)} className="input">
              {ADMIN_CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.slug}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="pf-material">Material *</label>
            <input id="pf-material" required value={form.material} onChange={(e) => set("material", e.target.value)} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="pf-finish">Finish *</label>
            <input id="pf-finish" required value={form.finish} onChange={(e) => set("finish", e.target.value)} className="input" />
          </div>
          <div className="sm:col-span-2">
            <span className="label">Image</span>
            <div className="flex items-center gap-4">
              <img
                src={form.imageUrl}
                alt="Product preview"
                className="h-20 w-20 shrink-0 rounded-xl border border-ink/10 bg-ink/5 object-cover"
              />
              <div className="flex-1 space-y-2">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    className="hidden"
                    disabled={uploading}
                    onChange={onPickFile}
                  />
                  <span className="btn-outline">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {uploading ? "Uploading…" : "Upload image"}
                  </span>
                </label>
                <label className="flex items-center gap-2 text-xs text-ink/60">
                  or pick a preset
                  <select
                    value={ADMIN_IMAGE_PRESETS.includes(form.imageUrl) ? form.imageUrl : ""}
                    onChange={(e) => e.target.value && set("imageUrl", e.target.value)}
                    className="input !w-auto !py-1 text-xs"
                  >
                    <option value="">— preset mockups —</option>
                    {ADMIN_IMAGE_PRESETS.map((url) => (
                      <option key={url} value={url}>{url.split("/").pop()}</option>
                    ))}
                  </select>
                </label>
                <p className="text-xs text-ink/45">JPEG, PNG, WebP, GIF or AVIF — max 2 MB</p>
              </div>
            </div>
          </div>
          <div className="flex items-end gap-4 pb-1">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="h-4 w-4 accent-gold-dark" />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 accent-gold-dark" />
              Featured
            </label>
          </div>
          <div className="sm:col-span-2">
            <TierEditor tiers={form.tiers} onChange={(tiers) => set("tiers", tiers)} />
          </div>
        </div>

        {error && <p className="mt-3 text-sm font-medium text-clay">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          <button type="submit" disabled={busy} className="btn-primary">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} {product ? "Save changes" : "Create product"}
          </button>
        </div>
      </form>
    </div>
  );
}

function formatCents(cents: number, locale: string) {
  return formatPrice(cents, locale);
}

function OrdersTab() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "en";
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    void adminListOrders()
      .then((r) => setOrders(r.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load orders"))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function changeStatus(order: AdminOrder, status: AdminOrder["status"]) {
    try {
      await adminUpdateOrderStatus(order.id, status as "PENDING" | "CONFIRMED" | "CANCELLED");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed");
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-gold-dark" /></div>;
  if (error) return <p className="py-8 text-sm font-medium text-clay">{error}</p>;

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-ink/10 text-start text-xs uppercase tracking-wider text-ink/45">
            <th className="px-4 py-3 text-start">Reference</th>
            <th className="px-4 py-3 text-start">Customer</th>
            <th className="px-4 py-3 text-start">Items</th>
            <th className="px-4 py-3 text-start">Total</th>
            <th className="px-4 py-3 text-start">Date</th>
            <th className="px-4 py-3 text-start">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/5">
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-ivory/60">
              <td className="px-4 py-3 font-mono text-xs" dir="ltr">{o.reference}</td>
              <td className="px-4 py-3">
                <p className="font-medium">{o.fullName}</p>
                <p className="text-xs text-ink/50" dir="ltr">{o.email}</p>
              </td>
              <td className="px-4 py-3">{o.items.length}</td>
              <td className="px-4 py-3 font-semibold">{formatCents(o.total, locale)}</td>
              <td className="px-4 py-3 text-xs text-ink/50">{new Date(o.createdAt).toLocaleDateString()}</td>
              <td className="px-4 py-3">
                <select
                  value={o.status}
                  onChange={(e) => changeStatus(o, e.target.value as AdminOrder["status"])}
                  className={`input !w-32 !py-1.5 text-xs font-semibold ${
                    o.status === "CONFIRMED" ? "!text-gold-dark" : o.status === "CANCELLED" ? "!text-clay" : ""
                  }`}
                  aria-label="Order status"
                >
                  <option value="PENDING">{t("order.statusPending")}</option>
                  <option value="CONFIRMED">{t("order.statusConfirmed")}</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && <p className="px-4 py-10 text-center text-ink/50">No orders yet</p>}
    </div>
  );
}

function ProductsTab({ onNeedRefresh }: { onNeedRefresh: () => void }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "en";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  function load() {
    setLoading(true);
    void adminListProducts()
      .then((r) => setProducts(r.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function remove(p: Product) {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    await adminDeleteProduct(p.id);
    load();
    onNeedRefresh();
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-gold-dark" /></div>;

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => setCreating(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> New product
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-xs uppercase tracking-wider text-ink/45">
              <th className="px-4 py-3 text-start">Product</th>
              <th className="px-4 py-3 text-start">Category</th>
              <th className="px-4 py-3 text-start">Finish</th>
              <th className="px-4 py-3 text-start">From</th>
              <th className="px-4 py-3 text-start">Flags</th>
              <th className="px-4 py-3 text-end">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {products.map((p) => {
              const minTier = [...p.tiers].sort((a, b) => a.quantity - b.quantity)[0];
              return (
                <tr key={p.id} className="hover:bg-ivory/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.imageUrl} alt="" className="h-10 w-10 rounded-lg bg-ink/5 object-cover" />
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="font-mono text-xs text-ink/45" dir="ltr">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{t(`catalog.categories.${p.category}`)}</td>
                  <td className="px-4 py-3">{p.finish}</td>
                  <td className="px-4 py-3 font-semibold">{minTier ? formatCents(minTier.pricePer100, locale) : "—"}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className={`me-1 rounded-full px-2 py-0.5 font-semibold ${p.active ? "bg-gold/15 text-gold-dark" : "bg-ink/10 text-ink/50"}`}>
                      {p.active ? "live" : "hidden"}
                    </span>
                    {p.featured && <span className="rounded-full bg-ink px-2 py-0.5 font-semibold text-ivory">★</span>}
                  </td>
                  <td className="px-4 py-3 text-end">
                    <button type="button" onClick={() => setEditing(p)} className="rounded p-2 text-ink/50 hover:bg-ink/5 hover:text-ink" aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => void remove(p)} className="rounded p-2 text-ink/50 hover:text-clay" aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 && <p className="px-4 py-10 text-center text-ink/50">No products</p>}
      </div>

      {(creating || editing) && (
        <ProductFormModal
          product={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            load();
            onNeedRefresh();
          }}
        />
      )}
    </>
  );
}

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(() => Boolean(getAdminToken()));
  const [tab, setTab] = useState<"products" | "orders">("products");

  if (!authed) return <LoginForm onSuccess={() => setAuthed(true)} />;

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold">Cartelier Admin</h1>
        <button
          type="button"
          onClick={() => {
            clearAdminToken();
            setAuthed(false);
          }}
          className="btn-outline !px-4 !py-2 text-sm"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("products")}
          className={`chip ${tab === "products" ? "chip-active" : ""}`}
        >
          <Package className="h-4 w-4" /> Products
        </button>
        <button type="button" onClick={() => setTab("orders")} className={`chip ${tab === "orders" ? "chip-active" : ""}`}>
          <ClipboardList className="h-4 w-4" /> Orders
        </button>
      </div>

      <div className="mt-6">
        {tab === "products" ? <ProductsTab onNeedRefresh={() => undefined} /> : <OrdersTab />}
      </div>
    </div>
  );
}
