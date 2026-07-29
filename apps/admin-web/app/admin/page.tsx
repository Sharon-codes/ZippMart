"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getAdminToken, setAdminSession } from "../../lib/adminAuth";
import { ProFloLogo } from "../components/ProFloLogo";
import { apiBase } from "../../lib/api";
import { Lock, ArrowRight, ShieldCheck, BarChart3, Receipt, Package, Store } from "lucide-react";

export default function AdminLoginPage() {
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
      {/* Left Pane: Decorative Brand & Illustration Area */}
      <div className="opsHqPage__brandPane">
        {/* Background Hexagon Pattern */}
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

        <div className="opsHqPage__brandContent">
          <ProFloLogo size={80} showText />
          <span className="opsHqPage__brandTagline">SMART CHECKOUT. SMOOTH FLOW.</span>
          <h2 className="opsHqPage__brandTitle">Operations HQ</h2>
          <p className="opsHqPage__brandSub">
            Catalogue, inventory, counter tokens, receipts, and store KPIs—one console for your ProFlo deployment.
          </p>

          <div className="opsHqPage__artWrapper">
            {/* Elegant light vector graphic representing checkout flow */}
            <svg viewBox="0 0 400 200" className="w-full max-w-[340px] opacity-90 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="20" y="40" width="100" height="120" rx="12" fill="white" stroke="#E2E8F0" strokeWidth="2" />
              <rect x="280" y="40" width="100" height="120" rx="12" fill="white" stroke="#E2E8F0" strokeWidth="2" />
              <path d="M130 100 H270" stroke="#0052FF" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 6" />
              <circle cx="120" cy="100" r="10" fill="#0052FF" />
              <circle cx="280" cy="100" r="10" fill="#10B981" />
              <rect x="40" y="65" width="60" height="6" rx="3" fill="#F1F5F9" />
              <rect x="40" y="80" width="40" height="6" rx="3" fill="#F1F5F9" />
              <rect x="300" y="65" width="60" height="6" rx="3" fill="#F1F5F9" />
              <rect x="300" y="80" width="40" height="6" rx="3" fill="#F1F5F9" />
            </svg>
          </div>
        </div>
      </div>

      {/* Right Pane: Login Form Area */}
      <div className="opsHqPage__formPane">
        <div className="opsHqPage__formWrapper">
          <div className="opsHqPage__formHeader">
            <h3 className="opsHqPage__formTitle">Welcome Back</h3>
            <p className="opsHqPage__formSub">Please sign in to your administrator account.</p>
          </div>

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
                  placeholder="Enter username"
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
    </main>
  );
}

