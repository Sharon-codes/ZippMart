"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setAdminSession } from "../lib/adminAuth";
import { ProFloLogo } from "./components/ProFloLogo";
import { apiBase } from "../lib/api";
import { ArrowRight, Lock, User, Eye, EyeOff, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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
      setError(`Cannot reach API at ${apiBase}. Ensure backend is running.`);
    }
    setBusy(false);
  }

  function handleQuickFill(u: string, p: string) {
    setUsername(u);
    setPassword(p);
    setError("");
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "linear-gradient(135deg, #0a0f1e, #111827, #0a0f1e)",
        color: "#f1f5f9",
        position: "relative",
        overflow: "hidden",
        fontFamily: "sans-serif",
      }}
    >
      {/* Main Glassmorphic Login Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(15,23,42,0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(100,116,139,0.3)",
          borderRadius: "24px",
          padding: "28px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
          position: "relative",
          zIndex: 10,
          margin: "auto",
        }}
      >
        {/* Brand Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "linear-gradient(to top right, #2563eb, #6366f1)",
              padding: "2px",
              boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.25)",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "#020617",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ProFloLogo size={42} showText={false} />
            </div>
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "9999px",
              background: "rgba(59, 130, 246, 0.1)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              color: "#60a5fa",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            <ShieldCheck style={{ width: "14px", height: "14px" }} />
            Operations HQ
          </div>

          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", margin: "0" }}>
            Admin Sign In
          </h1>
          <p style={{ fontSize: "14px", color: "#94a3b8", marginTop: "6px", lineHeight: 1.6, margin: "6px 0 0 0" }}>
            Manage catalogue, tokens & store analytics
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={(e) => void onSubmit(e)} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Username Field */}
          <div>
            <label
              htmlFor="admin-username-input"
              style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#cbd5e1", marginBottom: "6px" }}
            >
              Username
            </label>
            <div style={{ position: "relative" }}>
              <User style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94a3b8" }} />
              <input
                id="admin-username-input"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                style={{
                  width: "100%",
                  height: "48px",
                  paddingLeft: "40px",
                  paddingRight: "16px",
                  background: "rgba(2, 6, 23, 0.6)",
                  border: "1px solid #1e293b",
                  borderRadius: "12px",
                  fontSize: "14px",
                  color: "#ffffff",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="admin-password-input"
              style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#cbd5e1", marginBottom: "6px" }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94a3b8" }} />
              <input
                id="admin-password-input"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                style={{
                  width: "100%",
                  height: "48px",
                  paddingLeft: "40px",
                  paddingRight: "44px",
                  background: "rgba(2, 6, 23, 0.6)",
                  border: "1px solid #1e293b",
                  borderRadius: "12px",
                  fontSize: "14px",
                  color: "#ffffff",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", padding: "4px", color: "#94a3b8", background: "none", border: "none", cursor: "pointer" }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff style={{ width: "16px", height: "16px" }} /> : <Eye style={{ width: "16px", height: "16px" }} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error ? (
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "12px", borderRadius: "12px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#f87171", fontSize: "12px", fontWeight: 500 }}>
              <AlertCircle style={{ width: "16px", height: "16px", flexShrink: 0, marginTop: "2px" }} />
              <span>{error}</span>
            </div>
          ) : null}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={busy}
            style={{
              width: "100%",
              height: "48px",
              marginTop: "8px",
              background: "linear-gradient(to right, #2563eb, #4f46e5)",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "14px",
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.3)",
              cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {busy ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <svg style={{ animation: "spin 1s linear infinite", height: "16px", width: "16px", color: "#ffffff" }} viewBox="0 0 24 24" fill="none">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Authenticating...
              </span>
            ) : (
              <>
                Sign In to Operations HQ <ArrowRight style={{ width: "16px", height: "16px" }} />
              </>
            )}
          </button>
        </form>

        {/* Quick Fill Pills */}
        <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(30, 41, 59, 0.8)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8", marginBottom: "10px" }}>
            <span style={{ fontWeight: 500 }}>Quick Demo Sign In:</span>
            <Sparkles style={{ width: "14px", height: "14px", color: "#fbbf24" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <button
              type="button"
              onClick={() => handleQuickFill("admin", "admin123")}
              style={{
                padding: "8px 12px",
                background: "rgba(30, 41, 59, 0.6)",
                border: "1px solid rgba(51, 65, 85, 0.6)",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#cbd5e1",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              👑 Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("staff", "staff123")}
              style={{
                padding: "8px 12px",
                background: "rgba(30, 41, 59, 0.6)",
                border: "1px solid rgba(51, 65, 85, 0.6)",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#cbd5e1",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              🏷️ Store Staff
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ marginTop: "24px", textAlign: "center", fontSize: "12px", color: "#64748b", fontWeight: 500 }}>
        ProFlo Checkout System &bull; Operations HQ Console
      </footer>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}

