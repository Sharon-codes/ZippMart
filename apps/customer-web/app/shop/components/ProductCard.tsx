"use client";

import { useEffect, useState } from "react";
import type { RecommendationProduct } from "../lib/shopConfig";
import { productPlaceholderDataUri } from "../lib/productPlaceholder";
import { resolveProductImageUrl } from "../../../lib/productImage";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ShoppingBag } from "lucide-react";

export function ProductCard({
  product,
  disabled,
  loading,
  onAdd,
  onOpen
}: {
  product: RecommendationProduct;
  disabled: boolean;
  loading: boolean;
  onAdd: (barcode: string, qty: number) => void;
  onOpen?: (p: RecommendationProduct) => void;
}) {
  const [qty, setQty] = useState(1);
  const barcode = product.barcode?.trim();
  const outOfStock = product.inStock != null && product.inStock <= 0;
  const canAct = Boolean(barcode) && !disabled && !outOfStock;
  const d = product.discountPercent ?? 0;
  const onSale = d > 0;
  const list = product.listPrice ?? product.unitPrice;
  const imageSrc = resolveProductImageUrl(product.imageUrl);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [imageSrc]);

  const showPlaceholder = !imageSrc || imgFailed;

  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-blue-500/30 flex flex-col h-full bg-white border-slate-200">
      {onSale && (
        <Badge className="absolute top-3 left-3 z-10 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-2.5 py-0.5 shadow-sm">
          −{d}% OFF
        </Badge>
      )}
      {outOfStock && (
        <Badge variant="secondary" className="absolute top-3 left-3 z-10 bg-slate-800 text-slate-200 font-semibold text-xs px-2.5 py-0.5">
          Out of Stock
        </Badge>
      )}

      {/* Image Container */}
      <button
        type="button"
        className="w-full text-left p-0 border-none bg-transparent cursor-pointer overflow-hidden aspect-[4/3] bg-slate-100 relative"
        onClick={() => onOpen?.(product)}
      >
        <img
          src={showPlaceholder ? productPlaceholderDataUri(product) : imageSrc}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgFailed(true)}
        />
      </button>

      {/* Content */}
      <CardContent className="p-4 flex flex-col flex-1">
        <button
          type="button"
          className="text-left font-bold text-slate-900 hover:text-blue-600 transition-colors text-base line-clamp-1 border-none bg-transparent p-0 mb-1 cursor-pointer font-sans"
          onClick={() => onOpen?.(product)}
        >
          {product.name}
        </button>

        {product.category && (
          <p className="text-xs text-slate-500 font-medium mb-1">{product.category}</p>
        )}

        {(product.size || product.color) && (
          <p className="text-xs text-slate-400 mb-3">
            {[product.size, product.color].filter(Boolean).join(" · ")}
          </p>
        )}

        {/* Pricing */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-lg font-extrabold text-blue-600 font-display">
            ₹{product.unitPrice}
          </span>
          {onSale && (
            <span className="text-xs text-slate-400 line-through font-medium">
              ₹{list}
            </span>
          )}
        </div>

        {/* Quantity & Action */}
        <div className="mt-auto flex items-center gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
            <button
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded text-slate-700 hover:bg-white disabled:opacity-30 border-none cursor-pointer"
              disabled={!canAct || qty <= 1}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-7 text-center font-bold text-xs text-slate-900">{qty}</span>
            <button
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded text-slate-700 hover:bg-white disabled:opacity-30 border-none cursor-pointer"
              disabled={!canAct || qty >= 99}
              onClick={() => setQty((q) => Math.min(99, q + 1))}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <Button
            className="flex-1 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 font-bold text-xs h-9 transition-all"
            disabled={!canAct || loading}
            onClick={() => barcode && onAdd(barcode, qty)}
          >
            <ShoppingBag className="w-3.5 h-3.5 mr-1.5" /> Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
