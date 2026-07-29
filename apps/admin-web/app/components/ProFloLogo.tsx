"use client";

import React from "react";

interface ProFloLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  lightText?: boolean;
}

export function ProFloLogo({ className = "", size = 28, showText = true, lightText = false }: ProFloLogoProps) {
  if (showText) {
    return (
      <img
        src="/logo.svg"
        alt="ProFlo"
        className={className}
        style={{ height: size, width: "auto", display: "inline-block", verticalAlign: "middle" }}
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="590 25 240 260"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <image href="/logo.svg" x="0" y="0" width="1387" height="445" />
    </svg>
  );
}
