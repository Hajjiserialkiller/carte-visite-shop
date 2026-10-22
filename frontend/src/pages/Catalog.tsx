import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, Loader2 } from "lucide-react";
import { getProducts, getCategories } from "../lib/api";
import type { Product, Category } from "../types";
import ProductCard from "../components/ProductCard";

export default function Catalog() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const category = params.get("category") ?? "all";
  const search = params.get("search") ?? "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchDraft, setSearchDraft] = useState(search);

  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void Promise.all([getProducts({ category, search }), getCategories()]).then(([p, c]) => {
      if (cancelled) return;
      setProducts(p.data);
      setCategories(c.data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [category, search]);

  const updateParams = useMemo(
    () => (next: Record<string, string>) => {
      const merged = new URLSearchParams(params);
      for (const [k, v] of Object.entries(next)) {
        if (v && v !== "all") merged.set(k, v);
        else merged.delete(k);
      }
      setParams(merged);
    },
    [params, setParams],
  );

  return (
    <div className="container-page py-12 lg:py-16">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-bold">{t("catalog.title")}</h1>
        <p className="mt-2 text-ink/60">{t("catalog.sub")}</p>
      </header>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateParams({ category: "all" })}
            className={`chip ${category === "all" ? "chip-active" : ""}`}
          >
            {t("catalog.all")}
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => updateParams({ category: c.slug })}
              className={`chip ${category === c.slug ? "chip-active" : ""}`}
            >
              {t(`catalog.categories.${c.slug}`)}
              <span className="ms-1.5 text-xs opacity-50">{c.count}</span>
            </button>
          ))}
        </div>

        <form
          className="relative lg:w-72"
          onSubmit={(e) => {
            e.preventDefault();
            updateParams({ search: searchDraft });
          }}
          role="search"
        >
          <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
          <input
            type="search"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder={t("catalog.search")}
            className="input ps-10"
            aria-label={t("catalog.search")}
          />
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-gold-dark" />
        </div>
      ) : products.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-lg font-medium">{t("catalog.empty")}</p>
          <button type="button" onClick={() => setParams({})} className="btn-outline mt-6">
            {t("catalog.all")}
          </button>
        </div>
      ) : (
        <>
          <p className="mt-8 text-xs text-ink/45">
            {products.length} {t("catalog.results")}
          </p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
