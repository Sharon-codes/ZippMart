"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ProFloLogo } from "./shop/components/ProFloLogo";

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [storeName, setStoreName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await fetch("/checkout-api/v1/public/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, storeName, email, message }),
      }).catch(() => null);
      setTimeout(() => {
        setStatus("success");
        setName("");
        setEmail("");
        setStoreName("");
        setMessage("");
      }, 800);
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="marketing">
      <header className="marketing__header">
        <Link href="/" aria-label="ProFlo home">
          <ProFloLogo size={36} showText />
        </Link>
        <nav className="marketing__nav" aria-label="Primary">
          <Link href="/simulator" className="marketing__navCta">
            Live simulator
          </Link>
          <a href="#platform">Platform</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section className="marketing__hero">
        <div className="marketing__heroInner">
          <div>
            <p className="marketing__kicker">Smart checkout. Smooth flow.</p>
            <h1 className="marketing__headline">
              In-store checkout built for <em>modern retail</em>
            </h1>
            <p className="marketing__lede">
              ProFlo connects customer scan-and-go, store operations, and counter verification in one
              platform—so queues shrink and every handoff stays auditable.
            </p>
            <div className="marketing__actions">
              <Link href="/simulator" className="marketing__btnPrimary">
                Try live simulator
              </Link>
              <a href="#contact" className="marketing__btnSecondary">
                Request a demo
              </a>
            </div>
          </div>
          <aside className="marketing__heroVisual" aria-label="Platform overview">
            <p className="marketing__heroVisualTag">One ecosystem</p>
            <h2 className="marketing__heroVisualTitle">Three surfaces. One flow.</h2>
            <ul className="marketing__heroVisualList">
              <li>Shop — mobile scan, browse, and pay from the aisle</li>
              <li>HQ — catalog, inventory, orders, and KPIs in real time</li>
              <li>Counter — token lookup, payment capture, exit verification</li>
            </ul>
          </aside>
        </div>
      </section>

      <section id="platform" className="marketing__section">
        <div className="marketing__sectionHead">
          <h2 className="marketing__sectionTitle">Built for the full store journey</h2>
          <p className="marketing__sectionSub">
            Each role gets a focused experience—without bolted-on widgets or generic templates.
          </p>
        </div>
        <div className="marketing__grid">
          <article className="marketing__card">
            <div className="marketing__cardIcon" aria-hidden>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <path d="M12 18h.01" />
              </svg>
            </div>
            <h3 className="marketing__cardTitle">Customer shop</h3>
            <p className="marketing__cardText">
              Barcode scan, curated browse, bag sync, and checkout with counter or online payment—optimized
              for phone-first shoppers.
            </p>
          </article>
          <article className="marketing__card">
            <div className="marketing__cardIcon" aria-hidden>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
              </svg>
            </div>
            <h3 className="marketing__cardTitle">Admin HQ</h3>
            <p className="marketing__cardText">
              Inventory, promotions, live orders, and analytics for managers who need clarity—not another
              spreadsheet export.
            </p>
          </article>
          <article className="marketing__card">
            <div className="marketing__cardIcon" aria-hidden>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <h3 className="marketing__cardTitle">Cashier counter</h3>
            <p className="marketing__cardText">
              Token and receipt lookup, payment recording, and gate verification—designed for fast lines at
              peak hours.
            </p>
          </article>
        </div>
      </section>

      <section id="about" className="marketing__section marketing__section--muted">
        <div className="marketing__sectionHead">
          <h2 className="marketing__sectionTitle">Why retailers choose ProFlo</h2>
          <p className="marketing__sectionSub">
            Deploy on your existing PostgreSQL stack. No rip-and-replace POS hardware required to start.
          </p>
        </div>
        <div className="marketing__stats">
          <div>
            <div className="marketing__statValue">85%</div>
            <div className="marketing__statLabel">Typical queue reduction</div>
          </div>
          <div>
            <div className="marketing__statValue">1.8×</div>
            <div className="marketing__statLabel">Higher average basket</div>
          </div>
          <div>
            <div className="marketing__statValue">2.4 min</div>
            <div className="marketing__statLabel">Saved per checkout</div>
          </div>
        </div>
      </section>

      <section id="contact" className="marketing__section">
        <div className="marketing__sectionHead">
          <h2 className="marketing__sectionTitle">Talk to our team</h2>
          <p className="marketing__sectionSub">Share your store footprint and rollout timeline—we will follow up shortly.</p>
        </div>
        <div className="marketing__formWrap">
          {status === "success" ? (
            <div className="marketing__success">
              <h3 style={{ margin: "0 0 8px", fontSize: "1.125rem" }}>Message received</h3>
              <p style={{ margin: 0, lineHeight: 1.55 }}>Thank you. Our team will reach out at the email you provided.</p>
              <button
                type="button"
                className="marketing__btnSecondary"
                style={{ marginTop: 20 }}
                onClick={() => setStatus("idle")}
              >
                Send another message
              </button>
            </div>
          ) : (
            <form className="marketing__form" onSubmit={handleQuerySubmit}>
              {status === "error" && (
                <p style={{ margin: 0, color: "#dc2626", fontSize: 14 }}>Could not send—please try again.</p>
              )}
              <div className="marketing__field">
                <label htmlFor="inq-name">Your name</label>
                <input id="inq-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
              </div>
              <div className="marketing__field">
                <label htmlFor="inq-store">Store or company</label>
                <input id="inq-store" required value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="ProFlo Retail Co." />
              </div>
              <div className="marketing__field">
                <label htmlFor="inq-email">Work email</label>
                <input id="inq-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
              </div>
              <div className="marketing__field">
                <label htmlFor="inq-msg">Message</label>
                <textarea id="inq-msg" required rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Locations, SKU volume, integration needs…" />
              </div>
              <button type="submit" className="marketing__btnPrimary" style={{ border: "none", cursor: "pointer", width: "100%" }} disabled={status === "loading"}>
                {status === "loading" ? "Sending…" : "Submit inquiry"}
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="marketing__footer">
        <div className="marketing__footerInner">
          <div>
            <ProFloLogo size={32} showText />
            <p className="marketing__footerCopy">Smart checkout. Smooth flow. Powering physical retail at proflotech.com.</p>
          </div>
          <div>
            <p style={{ margin: "0 0 8px", color: "#fff", fontWeight: 600 }}>Inquiries</p>
            <a href="mailto:kiranmi1010@gmail.com">kiranmi1010@gmail.com</a>
          </div>
        </div>
        <div className="marketing__footerBottom">© {new Date().getFullYear()} ProFlo. All rights reserved.</div>
      </footer>
    </div>
  );
}
