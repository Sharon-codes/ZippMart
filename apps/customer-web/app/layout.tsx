import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProFlo — Smart Checkout. Smooth Flow.",
  description: "Retail scan-and-go, operations HQ, and counter verification at proflotech.com."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="shopRoot">
      <body className="shopRoot__body">{children}</body>
    </html>
  );
}
