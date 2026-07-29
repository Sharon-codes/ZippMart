"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getAdminToken, setAdminSession } from "../../lib/adminAuth";
import { ProFloLogo } from "../components/ProFloLogo";
import { apiBase } from "../../lib/api";
import { Lock, ArrowRight, ShieldCheck, BarChart3, Receipt, Package, Store } from "lucide-react";

export default function AdminLoginPage() {
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
      {/* Background Hexagon Watermark Grid */}
      <div className="opsHqPage__hexBg">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hexGrid" width="60" height="103.923" patternUnits="userSpaceOnUse">
              <path d="M30 0 L60 17.32 L60 51.96 L30 69.28 L0 51.96 L0 17.32 Z" fill="none" stroke="#0052FF" strokeWidth="0.75" strokeOpacity="0.06" />
              <path d="M30 51.96 L60 69.28 L60 103.92 L30 121.24 L0 103.92 L0 69.28 Z" fill="none" stroke="#0052FF" strokeWidth="0.75" strokeOpacity="0.06" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexGrid)" />
        </svg>
      </div>

      <div className="opsHqPage__content">
        {/* Top Brand Tagline */}
        <div className="opsHqPage__header">
          <ProFloLogo size={42} showText />
          <span className="opsHqPage__tagline">SMART CHECKOUT. SMOOTH FLOW.</span>
        </div>

        {/* Hero Section */}
        <div className="opsHqPage__hero">
          <h1 className="opsHqPage__title">Operations HQ</h1>
          <p className="opsHqPage__sub">
            Catalogue, inventory, counter tokens, receipts, and store KPIs—one console for your ProFlo deployment.
          </p>

          {/* Form Card */}
          <div className="opsHqCard">
            <form onSubmit={(e) => void onSubmit(e)} className="opsHqForm">
              <div className="opsHqForm__grid">
                <div className="opsHqField">
                  <label htmlFor="username-input">Username</label>
                  <input
                    id="username-input"
                    className="opsHqInput"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                  />
                </div>

                <div className="opsHqField">
                  <label htmlFor="password-input">Password</label>
                  <input
                    id="password-input"
                    ref={passwordRef}
                    className="opsHqInput"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
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

        {/* Glassmorphic 3D Console Showcase Preview (Reference Image) */}
        <div className="opsHqShowcase">
          <div className="opsHqShowcase__card">
            {/* Window bar */}
            <div className="opsHqShowcase__bar">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
              </div>
              <span className="text-[11px] font-bold text-slate-400 font-mono">ProFlo Ops HQ v2.5</span>
            </div>

            {/* Inner Dashboard Cards Mockup */}
            <div className="opsHqShowcase__body">
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-white/80 backdrop-blur-md rounded-xl p-3 border border-slate-200/80 shadow-sm flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold">NET REVENUE</div>
                    <div className="text-xs font-extrabold text-slate-900">₹1,269.25</div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-md rounded-xl p-3 border border-slate-200/80 shadow-sm flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold">SKU COUNT</div>
                    <div className="text-xs font-extrabold text-slate-900">7 Active SKUs</div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-md rounded-xl p-3 border border-slate-200/80 shadow-sm flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold">PAID ORDERS</div>
                    <div className="text-xs font-extrabold text-slate-900">5 Settled</div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-md rounded-xl p-3 border border-slate-200/80 shadow-sm flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold">COUNTER STATUS</div>
                    <div className="text-xs font-extrabold text-emerald-600">● Live Sync</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
