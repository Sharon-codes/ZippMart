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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
      {/* Background Hexagon Pattern */}
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
                    placeholder="Enter username"
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
                    placeholder="Enter password"
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
      </div>
    </main>
  );
}

