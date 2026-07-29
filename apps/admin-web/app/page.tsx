"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getAdminToken, setAdminSession } from "../lib/adminAuth";
import { ProFloLogo } from "./components/ProFloLogo";
import { apiBase } from "../lib/api";
import { ArrowRight, BarChart3, Receipt, Package, Store, ShieldCheck, Zap, Layers, Activity } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (getAdminToken()) {
      router.replace("/admin/dashboard");
    }
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const resp = await fetch(`${apiBase}/v1/admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data.message ?? "Sign-in failed");
        setBusy(false);
        return;
      }
      const token = data.token as string;
      const role = String((data as { role?: string }).role ?? "staff");
      setAdminSession(token, role);
      router.push("/admin/dashboard");
    } catch {
      setError(`Cannot reach API at ${apiBase}. Run npm run dev from the project root.`);
    }
    setBusy(false);
  }

  return (
    <main className="opsHqPage">
      {/* Background Hexagon Pattern & Blur Ambient Gradients */}
      <div className="opsHqPage__hexBg">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hexGridRoot" width="60" height="103.923" patternUnits="userSpaceOnUse">
              <path d="M30 0 L60 17.32 L60 51.96 L30 69.28 L0 51.96 L0 17.32 Z" fill="none" stroke="#0052FF" strokeWidth="0.8" strokeOpacity="0.08" />
              <path d="M30 51.96 L60 69.28 L60 103.92 L30 121.24 L0 103.92 L0 69.28 Z" fill="none" stroke="#0052FF" strokeWidth="0.8" strokeOpacity="0.08" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexGridRoot)" />
        </svg>
      </div>

      {/* Decorative Retail Background Glow Accents */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="opsHqPage__content">
        {/* Top Brand Tagline */}
        <div className="opsHqPage__header">
          <ProFloLogo size={46} showText />
          <span className="opsHqPage__tagline">SMART CHECKOUT. SMOOTH FLOW.</span>
        </div>

        {/* Hero Headline Section */}
        <div className="opsHqPage__hero">
          <h1 className="opsHqPage__title">Operations HQ</h1>
          <p className="opsHqPage__sub">
            Catalogue, inventory, counter tokens, receipts, and store KPIs—one unified command console for your retail deployment.
          </p>

          {/* Quick Sign-In Form Box */}
          <div className="opsHqCard">
            <form onSubmit={(e) => void onSubmit(e)} className="opsHqForm">
              <div className="opsHqForm__grid">
                <div className="opsHqField">
                  <label htmlFor="user-in">Username</label>
                  <input
                    id="user-in"
                    className="opsHqInput"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                  />
                </div>

                <div className="opsHqField">
                  <label htmlFor="pass-in">Password</label>
                  <input
                    id="pass-in"
                    ref={passwordRef}
                    className="opsHqInput"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error ? <p className="opsHqError">{error}</p> : null}

              <button type="submit" className="opsHqSubmitBtn" disabled={busy}>
                {busy ? "Authenticating…" : "Sign in to admin"} <ArrowRight className="w-4 h-4 inline ml-1.5" />
              </button>
            </form>
          </div>
        </div>

        {/* 3D Glassmorphic Console Preview Showcase (Matching Reference Image) */}
        <div className="opsHqShowcase mb-12">
          <div className="opsHqShowcase__card">
            {/* Window bar */}
            <div className="opsHqShowcase__bar">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 font-mono">ProFlo Operations HQ Console v2.5</span>
            </div>

            {/* Showcase Dashboard Mockup */}
            <div className="opsHqShowcase__body">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <div className="bg-white/90 backdrop-blur-md rounded-xl p-3.5 border border-slate-200/80 shadow-sm flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">NET REVENUE</div>
                    <div className="text-sm font-extrabold text-slate-900">₹1,269.25</div>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-md rounded-xl p-3.5 border border-slate-200/80 shadow-sm flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">INVENTORY SKUS</div>
                    <div className="text-sm font-extrabold text-slate-900">7 Active Items</div>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-md rounded-xl p-3.5 border border-slate-200/80 shadow-sm flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold flex-shrink-0">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">PAID ORDERS</div>
                    <div className="text-sm font-extrabold text-slate-900">5 Settled</div>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-md rounded-xl p-3.5 border border-slate-200/80 shadow-sm flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold flex-shrink-0">
                    <Store className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">STORE COMMAND</div>
                    <div className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Sync
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Space Filling Operational Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto mt-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-display font-extrabold text-sm text-slate-900 mb-1">Instant Store Sync</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every shelf barcode scan across mobile apps and counter POS terminals updates in real-time.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-display font-extrabold text-sm text-slate-900 mb-1">Catalogue &amp; Barcode HQ</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Create product variants, generate high-resolution print barcodes, and manage shelf pricing.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-display font-extrabold text-sm text-slate-900 mb-1">Audit &amp; Exit Security</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Monitor fast-track counter tokens, cashier verification logs, and anti-loss audit trails.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
