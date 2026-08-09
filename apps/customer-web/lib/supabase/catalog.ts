import type { RecommendationProduct } from "../../app/shop/lib/shopConfig";
import { apiBase } from "../../lib/apiBase";
import { pickProductImageUrl, resolveProductImageUrl } from "../../lib/productImage";
import { getSupabaseBrowser } from "./browser";

const DEFAULT_TABLE = "products";

export type CatalogRow = {
  id: string;
  name: string;
  barcode: string | null;
  unit_price: number | string | null;
  category: string | null;
  size: string | null;
  color: string | null;
  style_code: string | null;
  brand: string | null;
  season: string | null;
  gender: string | null;
  image_url: string | null;
};

function tableName(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_TABLE ?? DEFAULT_TABLE).trim() || DEFAULT_TABLE;
}

function mapRow(row: CatalogRow): RecommendationProduct {
  const price = row.unit_price != null ? Number(row.unit_price) : 0;
  return {
    id: String(row.id),
    barcode: row.barcode ?? undefined,
    name: String(row.name ?? ""),
    unitPrice: Number.isFinite(price) ? price : 0,
    category: row.category ?? undefined,
    styleCode: row.style_code ?? undefined,
    size: row.size ?? undefined,
    color: row.color ?? undefined,
    brand: row.brand ?? undefined,
    season: row.season ?? undefined,
    gender: row.gender ?? undefined,
    imageUrl: row.image_url?.trim() ? resolveProductImageUrl(row.image_url.trim()) : undefined
  };
}

function getStyleGroupKey(product: RecommendationProduct): string {
  const style = product.styleCode?.trim();
  if (style) return style.toUpperCase();
  return product.name.trim().toLowerCase();
}

export function groupProductsByStyle(products: RecommendationProduct[]): RecommendationProduct[] {
  const groups = new Map<string, RecommendationProduct>();

  for (const product of products) {
    const key = getStyleGroupKey(product);
    const variantSizes = product.size?.trim() ? [product.size.trim()] : [];
    const variantColors = product.color?.trim() ? [product.color.trim()] : [];
    const base = groups.get(key);

    if (!base) {
      groups.set(key, {
        ...product,
        availableSizes: variantSizes,
        availableColors: variantColors,
        minPrice: product.unitPrice,
        maxPrice: product.unitPrice
      });
      continue;
    }

    const combinedSizes = new Set([...(base.availableSizes ?? []), ...variantSizes]);
    const combinedColors = new Set([...(base.availableColors ?? []), ...variantColors]);
    const minPrice = Math.min(base.minPrice ?? base.unitPrice, product.unitPrice);
    const maxPrice = Math.max(base.maxPrice ?? base.unitPrice, product.unitPrice);
    const inStock = (base.inStock ?? 0) + (product.inStock ?? 0);
    const imageUrl = pickProductImageUrl(base.imageUrl, product.imageUrl) ?? base.imageUrl ?? product.imageUrl;

    groups.set(key, {
      ...base,
      barcode: base.barcode || product.barcode,
      sku: base.sku || product.sku,
      unitPrice: minPrice,
      listPrice: base.listPrice ?? product.listPrice,
      discountPercent: base.discountPercent ?? product.discountPercent,
      availableSizes: Array.from(combinedSizes),
      availableColors: Array.from(combinedColors),
      minPrice,
      maxPrice,
      inStock,
      imageUrl
    });
  }

  return Array.from(groups.values());
}

function escapeIlike(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")
    .replace(/,/g, " ");
}

export async function fetchCatalogFromSupabase(
  search?: string,
  rowLimit = 200
): Promise<RecommendationProduct[]> {
  const sb = getSupabaseBrowser();
  if (!sb) return [];

  const table = tableName();
  const term = search != null ? search.trim() : "";
  const wild = term ? `%${escapeIlike(term)}%` : null;

  let q = sb
    .from(table)
    .select("id,name,barcode,unit_price,category,size,color,style_code,brand,season,gender,image_url")
    .order("name", { ascending: true })
    .limit(Math.min(Math.max(rowLimit, 1), 500));

  if (wild) {
    q = q.or(`name.ilike.${wild},barcode.ilike.${wild},category.ilike.${wild}`);
  }

  const { data, error } = await q;
  if (error) {
    console.warn("[catalog] Supabase:", error.message);
    return [];
  }
  return ((data ?? []) as CatalogRow[]).map(mapRow).filter((p) => p.name);
}

export async function fetchCatalogFromApi(q?: string): Promise<RecommendationProduct[]> {
  try {
    const url = q?.trim()
      ? `${apiBase}/v1/customer/products?q=${encodeURIComponent(q.trim())}`
      : `${apiBase}/v1/customer/products`;
    const resp = await fetch(url);
    if (!resp.ok) return [];
    const data = (await resp.json()) as Array<{
      id: string;
      barcode?: string;
      name: string;
      unitPrice: number;
      listPrice?: number;
      discountPercent?: number;
      category?: string;
      styleCode?: string;
      size?: string;
      color?: string;
      brand?: string;
      season?: string;
      gender?: string;
      taxPercent?: number;
      inStock?: number;
      demandScore?: number;
      imageUrl?: string;
    }>;
    return data.map((p) => ({
      id: p.id,
      barcode: p.barcode,
      name: p.name,
      unitPrice: p.unitPrice,
      listPrice: p.listPrice,
      discountPercent: p.discountPercent,
      category: p.category,
      styleCode: p.styleCode,
      size: p.size,
      color: p.color,
      brand: p.brand,
      season: p.season,
      gender: p.gender,
      taxPercent: p.taxPercent,
      inStock: p.inStock,
      demandScore: p.demandScore,
      imageUrl: p.imageUrl?.trim() ? resolveProductImageUrl(p.imageUrl.trim()) : undefined
    }));
  } catch {
    return [];
  }
}

function mergeApiWithSupabase(
  apiRows: RecommendationProduct[],
  dbRows: RecommendationProduct[]
): RecommendationProduct[] {
  const byBarcode = new Map<string, RecommendationProduct>();
  for (const p of dbRows) {
    const b = p.barcode?.trim();
    if (b) byBarcode.set(b, p);
  }
  return apiRows.map((row) => {
    const b = row.barcode?.trim();
    if (!b) return row;
    const extra = byBarcode.get(b);
    if (!extra) return row;
    return {
      ...row,
      imageUrl: pickProductImageUrl(row.imageUrl, extra.imageUrl)
        ? resolveProductImageUrl(pickProductImageUrl(row.imageUrl, extra.imageUrl))
        : undefined,
      category: extra.category ?? row.category
    };
  });
}

export async function fetchCatalogUnified(search?: string): Promise<RecommendationProduct[]> {
  const apiRows = await fetchCatalogFromApi(search);
  const sb = getSupabaseBrowser();
  if (!sb) {
    return groupProductsByStyle(apiRows);
  }
  const fromDb = await fetchCatalogFromSupabase(search, 200);
  if (apiRows.length === 0) {
    return groupProductsByStyle(fromDb);
  }
  if (fromDb.length === 0) {
    return groupProductsByStyle(apiRows);
  }
  return groupProductsByStyle(mergeApiWithSupabase(apiRows, fromDb));
}

/** Typeahead: API first; Supabase only if API returns nothing. */
export async function fetchBrowseSuggestions(query: string, limit = 12): Promise<RecommendationProduct[]> {
  const t = query.trim();
  if (!t) return [];

  const cap = Math.min(Math.max(limit, 1), 40);
  const apiRows = await fetchCatalogFromApi(t);
  if (apiRows.length > 0) {
    return groupProductsByStyle(apiRows).slice(0, cap);
  }

  const sb = getSupabaseBrowser();
  if (!sb) return [];
  return groupProductsByStyle((await fetchCatalogFromSupabase(t, cap))).slice(0, cap);
}



/** Top products by demand score (shown on search idle state). */
export async function fetchPopularProducts(limit = 5): Promise<RecommendationProduct[]> {
  try {
    const resp = await fetch(`${apiBase}/v1/customer/recommendations`);
    if (!resp.ok) return [];
    const data = (await resp.json()) as { highDemand?: RecommendationProduct[] };
    return groupProductsByStyle((data.highDemand ?? []).slice(0, limit).map((p) => ({
      ...p,
      imageUrl: p.imageUrl?.trim() ? resolveProductImageUrl(p.imageUrl.trim()) : undefined
    })));
  } catch {
    return [];
  }
}
