"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useShop } from "../context/ShopContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Trash2, ArrowRight, Minus, Plus, ShieldCheck, Tag } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { hydrated, sessionId, cart, refreshCart, message, loading, setLineQuantity } = useShop();

  useEffect(() => {
    if (!hydrated) return;
    if (!sessionId) {
      router.replace("/shop");
      return;
    }
    void refreshCart();
  }, [hydrated, sessionId, router, refreshCart]);

  const items = cart.items;
  const hasItems = items.length > 0;

  if (!hydrated || !sessionId) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-slate-500">Loading your shopping bag...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 px-2">
      {/* Header Info */}
      <div className="text-center mb-6">
        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 mb-2 font-bold px-3 py-1">
          YOUR VISIT BAG ({items.length})
        </Badge>
        <h1 className="text-2xl font-extrabold font-display text-slate-900 mb-1">
          Review &amp; Checkout
        </h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Review quantities before checkout. Changes save instantly to your active store visit.
        </p>
      </div>

      {hasItems ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Item List (2 Columns) */}
          <div className="md:col-span-2 space-y-3">
            {items.map((line) => {
              const pid = line.productId;
              const canEdit = Boolean(pid);
              return (
                <Card key={pid ?? `${line.name}-${line.qty}`} className="border-slate-200 shadow-sm overflow-hidden">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-lg">
                      🛍️
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 truncate mb-0.5">{line.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {line.unitPrice != null ? `₹${line.unitPrice} each` : ""}
                        {line.taxPercent != null ? ` · ${line.taxPercent}% tax` : ""}
                      </p>
                      <p className="text-[11px] text-blue-600 font-bold mt-1">₹{line.lineTotal.toFixed(2)}</p>
                    </div>

                    {/* Stepper & Actions */}
                    {canEdit ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
                          <button
                            type="button"
                            className="w-7 h-7 flex items-center justify-center rounded text-slate-700 hover:bg-white disabled:opacity-30 border-none cursor-pointer"
                            disabled={loading || line.qty <= 1}
                            onClick={() => void setLineQuantity(pid!, line.qty - 1)}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center font-bold text-xs text-slate-900">{line.qty}</span>
                          <button
                            type="button"
                            className="w-7 h-7 flex items-center justify-center rounded text-slate-700 hover:bg-white disabled:opacity-30 border-none cursor-pointer"
                            disabled={loading || line.qty >= 99}
                            onClick={() => void setLineQuantity(pid!, line.qty + 1)}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors border-none bg-transparent cursor-pointer"
                          disabled={loading}
                          onClick={() => void setLineQuantity(pid!, 0)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-700">Qty {line.qty}</span>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {cart.loyaltyDiscount && cart.loyaltyDiscount > 0 ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-800 font-semibold">
                <Tag className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Loyalty Circle Discount Applied ({cart.loyaltyDiscountPercent}% deducted pre-tax)</span>
              </div>
            ) : null}
          </div>

          {/* Order Summary (1 Column) */}
          <div className="md:col-span-1">
            <Card className="border-slate-200 shadow-md sticky top-20">
              <CardContent className="p-5 space-y-4">
                <h3 className="font-display font-extrabold text-base text-slate-900 pb-2 border-b border-slate-100">
                  Order Summary
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900">₹{cart.subtotal.toFixed(2)}</span>
                  </div>

                  {cart.loyaltyDiscount && cart.loyaltyDiscount > 0 ? (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Loyalty Discount</span>
                      <span>−₹{cart.loyaltyDiscount.toFixed(2)}</span>
                    </div>
                  ) : null}

                  <div className="flex justify-between text-slate-600">
                    <span>Tax</span>
                    <span className="font-semibold text-slate-900">₹{cart.taxTotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                    <span>Total Amount</span>
                    <span className="text-blue-600">₹{cart.grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-11 shadow-sm mt-4"
                  onClick={() => router.push("/shop/checkout")}
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="border-slate-200 shadow-sm text-center py-16 px-6">
          <CardContent className="p-0 max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4 text-blue-600">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="font-display font-extrabold text-lg text-slate-900 mb-1">Your bag is empty</h3>
            <p className="text-xs text-slate-500 mb-6">Scan a barcode at the shelf or browse our catalogue to add items.</p>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10" onClick={() => router.push("/shop/scan")}>
                Start Scanning Barcodes
              </Button>
              <Button variant="outline" className="flex-1 font-bold text-xs h-10 border-slate-300" onClick={() => router.push("/shop")}>
                Browse Catalogue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {message && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-full shadow-2xl z-50">
          {message}
        </div>
      )}
    </div>
  );
}
