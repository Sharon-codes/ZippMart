"use client";

import Link from "next/link";
import { ProFloLogo } from "./ProFloLogo";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useShop, apiBase, type RecommendationProduct } from "../context/ShopContext";
import { ShoppingBag, Home, Scan, Compass, User, Sparkles, X, Camera } from "lucide-react";

const TITLES: Record<string, string> = {
  "/shop/scan": "Scan",
  "/shop/search": "Browse",
  "/shop/cart": "Your bag",
  "/shop/checkout": "Checkout"
};

function backHref(pathname: string): string {
  if (pathname === "/shop/checkout") return "/shop/cart";
  return "/shop";
}

export function ShopShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/shop";
  const { cartItemCount } = useShop();
  const isHome = pathname === "/shop";
  const title = TITLES[pathname];
  const [helpOpen, setHelpOpen] = useState(false);
  const helpCloseRef = useRef<HTMLButtonElement>(null);

  // Chatbot State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "assistant"; text: string }>>([
    { sender: "assistant", text: "Hi! I'm your ProFlo AI Fashion Assistant. Ask me for styling advice, trend updates, or outfit matches." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  return (
    <div className="shopApp bg-slate-50 min-h-screen flex flex-col justify-between">
      <div>
        {/* Header Bar */}
        <header className="siteHeader sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 h-16 flex items-center px-4 md:px-8">
          <div className="siteHeader__inner max-w-6xl w-full mx-auto flex items-center justify-between">
            <Link href="/shop" className="siteHeader__brand flex items-center gap-2">
              <ProFloLogo size={28} showText />
            </Link>

            <nav className="flex items-center gap-2">
              <Link
                href="/shop/scan"
                className="px-4 py-1.5 rounded-full text-xs font-bold bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition-all"
              >
                Scan
              </Link>
              <Link
                href="/shop/search"
                className="px-4 py-1.5 rounded-full text-xs font-bold bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 transition-all"
              >
                Browse
              </Link>
            </nav>

            <Link href="/shop/cart" className="relative p-2 text-slate-700 hover:text-blue-600 transition-colors">
              <ShoppingBag className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 bg-blue-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* Main Content Canvas */}
        <main className="shopShell max-w-6xl mx-auto px-4 md:px-8 pt-6 pb-6">
          {children}
        </main>
      </div>

      {/* Bottom Status Footer (Short & Clean) */}
      <footer className="siteFooter border-t border-slate-200/80 py-4 text-center text-xs text-slate-500 bg-white">
        <p>Your visit is active. Sync in real-time. · <button type="button" className="text-blue-600 font-bold hover:underline" onClick={() => setHelpOpen(true)}>Help</button></p>
        <p className="mt-0.5 text-[11px] text-slate-400">© {new Date().getFullYear()} ProFlo · Fashion at the speed of scan</p>
      </footer>

      {/* Floating AI Stylist Hanger Button */}
      <div className="fixed bottom-16 right-4 z-50">
        <button
          type="button"
          className="bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs px-4 py-3 rounded-full shadow-xl flex items-center gap-2 transition-all border border-slate-800"
          onClick={() => setChatOpen((prev) => !prev)}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          {chatOpen ? "Close" : "Stylist"}
        </button>

        {chatOpen && (
          <div className="absolute bottom-14 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-96">
            <div className="bg-slate-900 text-white p-3 font-bold text-xs flex justify-between items-center">
              <span>ProFlo AI Stylist</span>
              <button type="button" onClick={() => setChatOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
              {chatMessages.map((m, i) => (
                <div key={i} className={`p-2.5 rounded-xl ${m.sender === "user" ? "bg-blue-600 text-white ml-auto max-w-[80%]" : "bg-slate-100 text-slate-800 mr-auto max-w-[85%]"}`}>
                  {m.text}
                </div>
              ))}
            </div>
            <div className="p-2 border-t border-slate-200 flex gap-1">
              <input
                type="text"
                className="flex-1 text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-600"
                placeholder="Ask about outfits..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && chatInput.trim()) {
                    setChatMessages((prev) => [...prev, { sender: "user", text: chatInput }]);
                    setChatInput("");
                    setTimeout(() => {
                      setChatMessages((prev) => [...prev, { sender: "assistant", text: "That item pairs wonderfully with tailored trousers and classic white sneakers!" }]);
                    }, 600);
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Fixed Bottom Navbar (Reference Screenshot) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 px-6 flex justify-around items-center z-40 md:hidden">
        <Link href="/shop" className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${pathname === "/shop" ? "text-blue-600" : "text-slate-500"}`}>
          <Home className="w-5 h-5" />
          Home
        </Link>
        <Link href="/shop/scan" className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${pathname === "/shop/scan" ? "text-blue-600" : "text-slate-500"}`}>
          <Scan className="w-5 h-5" />
          Scan
        </Link>
        <Link href="/shop/search" className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${pathname === "/shop/search" ? "text-blue-600" : "text-slate-500"}`}>
          <Compass className="w-5 h-5" />
          Browse
        </Link>
        <Link href="/shop/cart" className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${pathname === "/shop/cart" ? "text-blue-600" : "text-slate-500"}`}>
          <User className="w-5 h-5" />
          Profile
        </Link>
      </nav>
    </div>
  );
}
