"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProductCard } from "./components/ProductCard";
import { ProductPreviewModal } from "./components/ProductPreviewModal";
import { ProductRail } from "./components/ProductRail";
import {
  apiBase,
  fetchCatalogSample,
  fetchHighDemand,
  useShop,
  type RecommendationProduct
} from "./context/ShopContext";
import { Barcode, Search, Sparkles } from "lucide-react";

export default function ShopHomePage() {
  const {
    sessionId,
    sessionBootstrapDone,
    loading,
    message,
    setMessage,
    createSession,
    addToCart,
    cartItemCount,
    recoverSessionByPhone,
    restoreCartFromBackup,
    cart
  } = useShop();

  const [highDemand, setHighDemand] = useState<RecommendationProduct[]>([]);
  const [catalog, setCatalog] = useState<RecommendationProduct[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogApiDown, setCatalogApiDown] = useState(false);
  const [category, setCategory] = useState("All");
  const [sizeFilter, setSizeFilter] = useState("All");
  const [preview, setPreview] = useState<RecommendationProduct | null>(null);

  const loadCatalog = useCallback(async () => {
    setCatalogLoading(true);
    setCatalogApiDown(false);
    try {
      const health = await fetch(`${apiBase}/health`);
      if (!health.ok) {
        setCatalogApiDown(true);
        setHighDemand([]);
        setCatalog([]);
        return;
      }
      const [hd, all] = await Promise.all([fetchHighDemand(), fetchCatalogSample()]);
      setHighDemand(hd);
      setCatalog(all);
      setCatalogApiDown(false);
    } catch {
      setCatalogApiDown(true);
      setHighDemand([]);
      setCatalog([]);
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const categories = useMemo(() => {
    const defaultCats = ["All", "Apparel", "Outerwear", "Dresses", "Bottomwear", "Ethnicwear", "Activewear", "Accessories", "Shoes"];
    const s = new Set<string>(defaultCats);
    for (const p of catalog) {
      if (p.category?.trim()) s.add(p.category.trim());
    }
    return Array.from(s);
  }, [catalog]);

  const filtered = useMemo(() => {
    let list = catalog;
    if (category !== "All") {
      list = list.filter((p) => (p.category ?? "").trim().toLowerCase() === category.toLowerCase());
    }
    if (sizeFilter !== "All") {
      list = list.filter((p) => {
        const sizes = p.availableSizes;
        if (sizes && sizes.length > 0) {
          return sizes.includes(sizeFilter);
        }
        return (p.size ?? "").trim() === sizeFilter;
      });
    }
    return list;
  }, [catalog, category, sizeFilter]);

  return (
    <div className="shopHome">
      {/* Session Bootstrap Status Banner */}
      {!sessionId && sessionBootstrapDone ? (
        <div className="shopSessionBanner bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 text-center">
          <p className="text-sm font-bold text-slate-800 mb-2">Start your in-store shopping session to scan &amp; add items.</p>
          <button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all shadow-sm"
            onClick={() => void createSession()}
          >
            Start Active Session
          </button>
        </div>
      ) : null}

      {/* Hero Headline Section */}
      <section className="shopHero text-center my-6">
        <h1 className="shopHero__title font-display text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
          Scan in, style out.
        </h1>
        <p className="shopHero__sub text-slate-600 text-sm md:text-base max-w-md mx-auto mb-4">
          Scan apparel directly from the shelf and skip the register queues.
        </p>

        {sessionId && (
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-3.5 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active Store Session
          </div>
        )}
      </section>

      {/* 2-Column Quick Action Cards Grid (Reference Screenshot) */}
      <section className="shopQuickGrid grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {/* SCAN BARCODE Card */}
        <Link href="/shop/scan" className="shopQuickCard shopQuickCard--scan group relative overflow-hidden rounded-2xl p-6 bg-slate-900 border border-slate-800 text-white flex flex-col justify-between h-44 shadow-lg hover:border-blue-500 transition-all">
          <div className="flex justify-center my-auto">
            <div className="w-16 h-12 border-2 border-blue-500/60 rounded-xl flex items-center justify-center bg-slate-800/80 group-hover:scale-105 transition-transform">
              <Barcode className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="text-center mt-auto">
            <div className="font-display font-extrabold text-base tracking-wider uppercase">SCAN BARCODE</div>
            <div className="text-xs text-slate-400 font-medium">Point at price tag.</div>
          </div>
        </Link>

        {/* BROWSE CATALOGUE Card */}
        <Link href="/shop/search" className="shopQuickCard shopQuickCard--browse group relative overflow-hidden rounded-2xl p-6 bg-slate-900 border border-slate-800 text-white flex flex-col justify-between h-44 shadow-lg hover:border-blue-500 transition-all">
          <img
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80"
            alt="Browse Catalogue"
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          
          <div className="relative z-10 mt-auto text-left">
            <div className="font-display font-extrabold text-lg tracking-wider uppercase">BROWSE CATALOGUE</div>
            <div className="text-xs text-slate-300 font-medium">EXPLORE NEW COLLECTIONS</div>
          </div>
        </Link>
      </section>

      {/* TRENDING IN STORE Section */}
      <section className="shopSection mb-10">
        <div className="shopSection__header mb-4">
          <h2 className="shopSection__title font-display text-xl font-extrabold text-slate-900 uppercase tracking-wide">
            TRENDING IN STORE
          </h2>
          <p className="shopSection__subtitle text-xs text-slate-500">
            Popular picks being scanned this hour
          </p>
        </div>

        {catalogLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="w-60 h-72 rounded-2xl bg-slate-100 animate-pulse flex-shrink-0" />
            ))}
          </div>
        ) : highDemand.length > 0 ? (
          <ProductRail
            products={highDemand}
            sessionId={sessionId}
            loading={loading}
            onAdd={(bc, qty) => void addToCart(bc, qty)}
            onOpen={(p) => setPreview(p)}
          />
        ) : (
          <p className="text-xs text-slate-500">No trending items loaded yet.</p>
        )}
      </section>

      {/* STORE CATALOGUE Section */}
      <section className="shopSection mb-10">
        <div className="shopSection__header mb-4">
          <h2 className="shopSection__title font-display text-xl font-extrabold text-slate-900 uppercase tracking-wide">
            STORE CATALOGUE
          </h2>
          <p className="shopSection__subtitle text-xs text-slate-500">
            Showing {filtered.length} products
          </p>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                category === c
                  ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="shopGrid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              disabled={!sessionId || loading}
              loading={loading}
              onAdd={(bc, qty) => void addToCart(bc, qty)}
              onOpen={(p) => setPreview(p)}
            />
          ))}
        </div>
      </section>

      <ProductPreviewModal
        product={preview}
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        disabled={!sessionId || loading}
        loading={loading}
        onAdd={(bc, qty) => void addToCart(bc, qty)}
      />
    </div>
  );
}
