"use client";

import React from "react";

interface ProFloLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function ProFloLogo({ className = "", size = 24, showText = false }: ProFloLogoProps) {
  return (
    <div className={`proflo-logo ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        {/* Hexagon outline */}
        <path
          d="M12 2.2L20.5 7.1V16.9L12 21.8L3.5 16.9V7.1L12 2.2Z"
          stroke="currentColor"
          strokeWidth="2.0"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Curved blue arrow */}
        <path
          d="M8.5 16V12.2C8.5 10.7 9.5 9.7 11 9.7H14.5"
          stroke="#0066FF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.5 7.7L15 9.7L12.5 11.7"
          stroke="#0066FF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showText && (
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.02em', fontSize: '1.25rem', textTransform: 'uppercase' }}>
          <span style={{ color: 'currentColor' }}>PRO</span>
          <span style={{ color: '#0066FF' }}>FLO</span>
        </span>
      )}
    </div>
  );
}
