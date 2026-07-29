"use client";

import React from "react";

interface ProFloLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  lightText?: boolean;
}

export function ProFloLogo({ className = "", size = 28, showText = true, lightText = false }: ProFloLogoProps) {
  const textColor = lightText ? "#FFFFFF" : "currentColor";
  const brandBlue = "#0052FF";

  return (
    <div className={`proflo-logo ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        {/* Rounded Hexagon Outline */}
        <path
          d="M16 3L27.25 9.5V22.5L16 29L4.75 22.5V9.5L16 3Z"
          stroke={textColor}
          strokeWidth="3.2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Curved Vibrant Blue Arrow */}
        <path
          d="M11 22V16.5C11 14.5 12.5 13 14.5 13H19.5"
          stroke={brandBlue}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16.5 10L19.5 13L16.5 16"
          stroke={brandBlue}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showText && (
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          letterSpacing: '0.06em',
          fontSize: `${size * 0.65}px`,
          textTransform: 'uppercase',
          lineHeight: 1,
          display: 'inline-flex',
          alignItems: 'center'
        }}>
          <span style={{ color: textColor }}>PRO</span>
          <span style={{ color: brandBlue }}>FLO</span>
        </span>
      )}
    </div>
  );
}
