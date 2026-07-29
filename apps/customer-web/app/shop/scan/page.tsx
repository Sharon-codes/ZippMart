"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BarcodeCameraScanner } from "../components/BarcodeCameraScanner";
import { useShop } from "../context/ShopContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Barcode, Camera, Plus, Minus, ShoppingBag, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ScanPage() {
  const router = useRouter();
  const { hydrated, sessionId, loading, message, setMessage, addToCart } = useShop();
  const [code, setCode] = useState("");
  const [cameraOn, setCameraOn] = useState(false);
  const [qty, setQty] = useState(1);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const submitLock = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!sessionId) router.replace("/shop");
  }, [hydrated, sessionId, router]);

  useEffect(() => {
    if (hydrated && sessionId) setCameraOn(true);
  }, [hydrated, sessionId]);

  if (!hydrated || !sessionId) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-slate-500">Initializing scanner session...</p>
      </div>
    );
  }

  async function submit(text?: string) {
    if (submitLock.current) return;
    const trimmed = (text ?? code).trim();
    if (!trimmed) {
      setMessage("Enter or scan a barcode");
      return;
    }
    submitLock.current = true;
    setCameraOn(false);
    try {
      const ok = await addToCart(trimmed, qty);
      if (ok) {
        setLastAdded(trimmed);
        setCode("");
        setQty(1);
      } else if (text) {
        setCode(trimmed);
      }
    } finally {
      submitLock.current = false;
    }
  }

  return (
    <div className="max-w-xl mx-auto py-4 px-2">
      {/* Header Info */}
      <div className="text-center mb-6">
        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 mb-2 font-bold px-3 py-1">
          IN-AISLE SCANNER
        </Badge>
        <h1 className="text-2xl font-extrabold font-display text-slate-900 mb-1">
          Point &amp; Scan Price Tag
        </h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Hold your mobile camera over any shelf price tag to instantly add items to your live visit bag.
        </p>
      </div>

      {/* Camera Viewfinder Card */}
      <Card className="overflow-hidden border-slate-200 shadow-md mb-6">
        <CardContent className="p-0 bg-slate-950 min-h-[260px] relative flex flex-col items-center justify-center text-white">
          {cameraOn ? (
            <BarcodeCameraScanner
              active={cameraOn}
              onClose={() => setCameraOn(false)}
              onDecoded={(text) => {
                setCode(text);
                void submit(text);
              }}
            />
          ) : (
            <div className="py-12 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-4 text-blue-400">
                <Camera className="w-8 h-8" />
              </div>
              {lastAdded ? (
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded-full mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Item Added to Bag
                  </span>
                  <p className="text-xs text-slate-400 font-mono">Barcode: {lastAdded}</p>
                </div>
              ) : null}
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-lg"
                disabled={loading}
                onClick={() => setCameraOn(true)}
              >
                {lastAdded ? "Scan Another Item" : "Open Camera Scanner"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Entry Form */}
      <Card className="border-slate-200 shadow-sm mb-6">
        <CardContent className="p-5">
          <label className="block text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider" htmlFor="barcode-input">
            Or Enter Barcode Digits
          </label>

          <div className="flex gap-2 mb-4">
            <Input
              id="barcode-input"
              className="font-mono text-sm h-11 bg-slate-50 border-slate-200"
              placeholder="e.g. 8901234567890"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void submit()}
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Stepper */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
              <button
                type="button"
                className="w-8 h-8 flex items-center justify-center rounded text-slate-700 hover:bg-white disabled:opacity-30 border-none cursor-pointer"
                disabled={qty <= 1}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold text-xs text-slate-900">{qty}</span>
              <button
                type="button"
                className="w-8 h-8 flex items-center justify-center rounded text-slate-700 hover:bg-white disabled:opacity-30 border-none cursor-pointer"
                disabled={qty >= 99}
                onClick={() => setQty((q) => Math.min(99, q + 1))}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 shadow-sm"
              disabled={loading}
              onClick={() => void submit()}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              {loading ? "Adding…" : "Add to Bag"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Format badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
        <span>Supports:</span>
        <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600">EAN-13</Badge>
        <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600">UPC-A</Badge>
        <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600">Code 128</Badge>
        <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600">QR Code</Badge>
      </div>

      {message && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-full shadow-2xl z-50">
          {message}
        </div>
      )}
    </div>
  );
}
