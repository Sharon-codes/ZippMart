"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchBrowseSuggestions, fetchPopularProducts } from "../../../lib/supabase/catalog";
import { ProductPreviewModal } from "../components/ProductPreviewModal";
import { ProductCard } from "../components/ProductCard";
import { useShop, type RecommendationProduct } from "../context/ShopContext";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X, Sparkles } from "lucide-react";

const SUGGEST_DEBOUNCE_MS = 240;

export default function SearchPage() {
  const router = useRouter();
  const { hydrated, sessionId, loading, message, setMessage, addToCart } = useShop();
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState<RecommendationProduct[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [preview, setPreview] = useState<RecommendationProduct | null>(null);
  const [popular, setPopular] = useState<RecommendationProduct[]>([]);
  const [popularLoading, setPopularLoading] = useState(true);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!sessionId) router.replace("/shop");
  }, [hydrated, sessionId, router]);

  useEffect(() => {
    if (!hydrated || !sessionId) return;
    let cancelled = false;
    void (async () => {
      setPopularLoading(true);
      const items = await fetchPopularProducts(8);
      if (!cancelled) {
        setPopular(items);
        setPopularLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated, sessionId]);

  useEffect(() => {
    if (!hydrated || !sessionId) return;
    const term = q.trim();
    if (!term) {
      setSuggestions([]);
      setSuggestLoading(false);
      return;
    }

    let cancelled = false;
    setSuggestLoading(true);
    const t = window.setTimeout(() => {
      void (async () => {
        const data = await fetchBrowseSuggestions(term, 12);
        if (!cancelled) {
          setSuggestions(data);
          setSuggestLoading(false);
        }
      })();
    }, SUGGEST_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [q, hydrated, sessionId]);

  if (!hydrated || !sessionId) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-slate-500">Loading catalogue search...</p>
      </div>
    );
  }

  const trimmed = q.trim();

  return (
    <div className="max-w-5xl mx-auto py-4 px-2">
      {/* Header Info */}
      <div className="text-center mb-6">
        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 mb-2 font-bold px-3 py-1">
          CATALOGUE BROWSER
        </Badge>
        <h1 className="text-2xl font-extrabold font-display text-slate-900 mb-1">
          Search Apparel &amp; Collections
        </h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Type any product name, category, or barcode to view live shelf availability.
        </p>
      </div>

      {/* Hero Integrated Search Bar */}
      <div className="relative max-w-xl mx-auto mb-8" ref={wrapRef}>
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <Input
            ref={inputRef}
            className="pl-10 pr-10 h-12 text-sm bg-white border-slate-300 rounded-full shadow-sm focus-visible:ring-blue-600"
            placeholder="Search by product name, category, or barcode..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSuggestOpen(true);
            }}
          />
          {q && (
            <button
              type="button"
              className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 rounded-full"
              onClick={() => {
                setQ("");
                setSuggestions([]);
              }}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Results or Popular Items */}
      {trimmed.length > 0 ? (
        <section className="mb-10">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4">
            Search Results ({suggestions.length})
          </h2>
          {suggestLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : suggestions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {suggestions.map((p) => (
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
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <p className="text-sm font-bold text-slate-800 mb-1">No products found matching &quot;{q}&quot;</p>
              <p className="text-xs text-slate-500">Try searching for &quot;Blouse&quot;, &quot;Sweater&quot;, or &quot;Jacket&quot;.</p>
            </div>
          )}
        </section>
      ) : (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Popular Right Now
            </h2>
          </div>

          {popularLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {popular.map((p) => (
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
          )}
        </section>
      )}

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
