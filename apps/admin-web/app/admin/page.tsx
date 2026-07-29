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
      </div>
    </main>
  );
}

