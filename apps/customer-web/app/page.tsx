"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ProFloLogo } from "./shop/components/ProFloLogo";
import { ArrowRight, Barcode, Search, ShoppingCart, Sparkles, Smartphone, LayoutDashboard, Store, ShieldCheck, MessageCircle, Mail } from "lucide-react";

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [storeName, setStoreName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [showDemoOptions, setShowDemoOptions] = useState(false);

  const whatsappUrl = "https://wa.me/918792915564?text=Hi%20ProFlo%20Team%2C%20I%20would%20like%20to%20apply%20for%20a%20retail%20store%20demo.";
  const mailtoUrl = "mailto:kiranmi1010@gmail.com?subject=ProFlo%20Store%20Demo%20Application&body=Hi%20ProFlo%20Team%2C%0A%0AI%20would%20like%20to%20apply%20for%20a%20retail%20store%20demo.%0A%0AName%3A%20%0AStore%20Name%3A%20%0APhone%3A%20";

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
    <div className="mPage">
      {/* Header Bar */}
      <header className="mHeader">
        <div className="mHeader__inner">
          <Link href="/" aria-label="ProFlo Home" className="mHeader__logo">
            <ProFloLogo size={32} showText />
          </Link>
          <nav className="mHeader__nav">
            <a href="#journey">Platform</a>
            <a href="#stats">Why ProFlo</a>
            <a href="#contact">Contact</a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mHeader__cta flex items-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4" /> Apply for Demo →
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mHero">
        <div className="mHero__inner">
          {/* Left Column: Text & CTAs */}
          <div className="mHero__left">
            <h1 className="mHero__title">
              Revolutionize Retail: The Intelligent In-Store Checkout built for Modern Success
            </h1>
            <p className="mHero__lede">
              ProFlo unifies scan-and-go, verification, and live analytics into a seamless, high-performance platform for physical retail stores.
            </p>

            <div className="mHero__actions">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mBtn mBtn--primary flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" /> Apply for Demo via WhatsApp
              </a>
              <a
                href={mailtoUrl}
                className="mBtn mBtn--outline flex items-center gap-2"
              >
                <Mail className="w-4 h-4" /> Email Us (kiranmi1010@gmail.com)
              </a>
            </div>

            {/* Direct Contact Pill */}
            <div className="mt-4 flex items-center gap-3 text-xs text-slate-600 font-semibold bg-blue-50/80 border border-blue-100 px-3.5 py-2 rounded-xl w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              Direct Support &amp; Demos: <strong className="text-slate-900">+91 87929 15564</strong>
            </div>

            {/* Background Wave Graphic */}
            <div className="mHero__wave">
              <svg width="100%" height="70" viewBox="0 0 600 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 45 C 150 10, 300 65, 600 25" stroke="#0052FF" strokeWidth="1.5" strokeOpacity="0.25" />
                <path d="M0 55 C 180 18, 320 70, 600 35" stroke="#0052FF" strokeWidth="1.2" strokeOpacity="0.18" />
              </svg>
            </div>
          </div>

          {/* Right Column: Deep Navy Container with Real Customer Shop Screenshots 2,3,4 Mockup */}
          <div className="mHero__right">
            <div className="mHero__navyShowcase">
              {/* Phone Container showcasing actual Customer Shop Screens */}
              <div className="mHero__phoneContainer">
                {/* Phone Header */}
                <div className="mHero__phoneHeader">
                  <ProFloLogo size={18} showText />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-700">Scan</span>
                    <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-700">Browse</span>
                    <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                      <ShoppingCart className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* Phone Body - Actual Screenshots 2 & 3 Content */}
                <div className="mHero__phoneBody">
                  {/* Hero Banner Card (Screenshot 2) */}
                  <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm mb-2.5">
                    <span className="text-[9px] font-extrabold text-blue-600 tracking-wider uppercase block mb-1">
                      PROFLO SCAN &amp; GO
                    </span>
                    <h4 className="font-extrabold text-xs text-slate-900 leading-tight mb-1">
                      Scan in, style out.
                    </h4>
                    <p className="text-[9.5px] text-slate-500 leading-normal mb-2">
                      Scan apparel barcodes directly from the shelf &amp; skip register queues.
                    </p>
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Store Session
                    </span>
                  </div>

                  {/* Quick Action Cards (Screenshot 2) */}
                  <div className="grid grid-cols-2 gap-2 mb-2.5">
                    <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-2 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-600">
                        <Barcode className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-extrabold text-[10px] text-slate-900">Scan Barcode</div>
                        <div className="text-[8px] text-slate-500">Point camera</div>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600">
                        <Search className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-extrabold text-[10px] text-slate-900">Browse</div>
                        <div className="text-[8px] text-slate-500">Search items</div>
                      </div>
                    </div>
                  </div>

                  {/* Trending In Store Items (Screenshot 3 & 4) */}
                  <div className="text-[10px] font-extrabold text-slate-900 mb-1.5">Trending In Store</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-sm">
                      <div className="aspect-square rounded-lg bg-slate-100 overflow-hidden mb-1.5 relative">
                        <img
                          src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=80"
                          alt="Silk Cropped Blouse"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="font-bold text-[10px] text-slate-900 truncate">Silk Cropped Blouse</div>
                      <div className="text-[8.5px] text-slate-500">Apparel · S</div>
                      <div className="font-extrabold text-[11px] text-blue-600 mt-0.5">₹3,999</div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-sm">
                      <div className="aspect-square rounded-lg bg-slate-100 overflow-hidden mb-1.5 relative">
                        <img
                          src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80"
                          alt="Knitted Turtleneck"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="font-bold text-[10px] text-slate-900 truncate">Knitted Turtleneck</div>
                      <div className="text-[8.5px] text-slate-500">Apparel · L</div>
                      <div className="font-extrabold text-[11px] text-blue-600 mt-0.5">₹3,299</div>
                    </div>
                  </div>
                </div>

                {/* Stylist Floating Pill */}
                <div className="mHero__stylistPill">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Stylist
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Seamlessly Unified Store Journey */}
      <section id="journey" className="mJourney">
        <div className="mJourney__head">
          <h2 className="mJourney__title">Seamlessly Unified Store Journey</h2>
          <p className="mJourney__sub">Refined, custom, geometric, progressive horizontal</p>
        </div>

        <div className="mJourney__grid">
          <div className="mJourneyCard">
            <div className="mJourneyCard__badge">1. Mobile Scan &amp; Go</div>
            <p className="mJourneyCard__text">Scan items directly at the shelf with mobile phone camera for instant cart sync.</p>
            <div className="mJourneyCard__iconWrapper">
              <Smartphone className="w-6 h-6 text-blue-400" />
            </div>
          </div>

          <div className="mJourneyCard">
            <div className="mJourneyCard__badge">2. Operations Command HQ</div>
            <p className="mJourneyCard__text">Centralized real-time console view for store managers, metrics &amp; inventory.</p>
            <div className="mJourneyCard__iconWrapper">
              <LayoutDashboard className="w-6 h-6 text-blue-400" />
            </div>
          </div>

          <div className="mJourneyCard">
            <div className="mJourneyCard__badge">3. Fast-Track Counter POS</div>
            <p className="mJourneyCard__text">Stylized terminal for fast-track cashier verification and exit verification.</p>
            <div className="mJourneyCard__iconWrapper">
              <Store className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Measurable Efficiency */}
      <section id="stats" className="mStats">
        <div className="mStats__card">
          <h2 className="mStats__title">Measurable Efficiency</h2>
          <div className="mStats__grid">
            <div className="mStats__item">
              <div className="mStats__value">85%</div>
              <div className="mStats__label">Faster Queues</div>
            </div>
            <div className="mStats__divider" />
            <div className="mStats__item">
              <div className="mStats__value">1.8×</div>
              <div className="mStats__label">Higher Basket Value</div>
            </div>
            <div className="mStats__divider" />
            <div className="mStats__item">
              <div className="mStats__value">&lt; 30s</div>
              <div className="mStats__label">Rapid Counter Handoff</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Contact Form */}
      <section id="contact" className="mContact">
        <div className="mContact__card">
          <div className="mContact__left">
            <h2 className="mContact__title">Connect with Our Solution Specialists</h2>
            <p className="mContact__sub">
              ProFlo unifies scan-and-go, verification, and live analytics into a seamless, high-performance platform.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold text-xs hover:bg-emerald-100 transition-colors w-fit"
              >
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                WhatsApp Direct: +91 87929 15564
              </a>
              <a
                href={mailtoUrl}
                className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 font-bold text-xs hover:bg-blue-100 transition-colors w-fit"
              >
                <Mail className="w-5 h-5 text-blue-600" />
                Email Application (Gmail / Outlook)
              </a>
            </div>
          </div>

          <div className="mContact__right">
            {status === "success" ? (
              <div className="mContact__success">
                <ShieldCheck className="w-10 h-10 text-emerald-600 mb-2" />
                <h3>Message Sent</h3>
                <p>Thank you. Our solution team will respond shortly.</p>
                <button type="button" className="mBtn mBtn--outline mt-4" onClick={() => setStatus("idle")}>
                  Send another message
                </button>
              </div>
            ) : (
              <form className="mContact__form" onSubmit={handleQuerySubmit}>
                {status === "error" && <p className="text-red-600 text-xs m-0">Failed to submit. Please try again.</p>}
                
                <div className="mContact__formRow">
                  <div className="mContact__field">
                    <label htmlFor="c-name">Name</label>
                    <input id="c-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
                  </div>
                  <div className="mContact__field">
                    <label htmlFor="c-email">Work Email</label>
                    <input id="c-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@retail.com" />
                  </div>
                </div>

                <div className="mContact__field">
                  <label htmlFor="c-store">Company / Store Name</label>
                  <input id="c-store" required value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="ProFlo Retail Co." />
                </div>

                <div className="mContact__field">
                  <label htmlFor="c-msg">Locations &amp; Details</label>
                  <textarea id="c-msg" required rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Provide your locations and product details..." />
                </div>

                <button type="submit" className="mBtn mBtn--primary mBtn--full" disabled={status === "loading"}>
                  {status === "loading" ? "Connecting..." : "Apply for Demo →"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Deep Obsidian Navy Sleek Footer */}
      <footer className="mFooterDeep">
        <div className="mFooterDeep__inner">
          <ProFloLogo size={26} showText lightText />
          <nav className="mFooterDeep__links">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Apply via WhatsApp (+91 87929 15564)</a>
            <a href={mailtoUrl}>Apply via Email</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className="mFooterDeep__copy">
            © {new Date().getFullYear()} ProFlo Retail Technologies Inc.
          </div>
        </div>
      </footer>
    </div>
  );
}
