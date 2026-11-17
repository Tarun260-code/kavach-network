"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface KavachLogoProps {
  variant?: "full" | "mark" | "wordmark";
  theme?: "auto" | "light" | "dark" | "monochrome" | "sapphire";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  withTagline?: boolean;
}

export function KavachLogoMark({
  size = "md",
  theme = "auto",
  className,
}: {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  theme?: "auto" | "light" | "dark" | "monochrome" | "sapphire";
  className?: string;
}) {
  const pixelSizes = {
    xs: 20,
    sm: 24,
    md: 32,
    lg: 44,
    xl: 60,
  };

  const px = pixelSizes[size];

  // Theme styling
  // Shield shape: 40x44 viewBox
  return (
    <svg
      width={px}
      height={Math.round((px * 44) / 40)}
      viewBox="0 0 40 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 select-none transition-transform duration-200", className)}
      aria-label="Kavach Shield Logo"
    >
      <defs>
        {/* Sapphire Glow Gradient */}
        <linearGradient id="kavachSapphireGrad" x1="4" y1="4" x2="36" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2F5BFF" />
          <stop offset="100%" stopColor="#1E3DB8" />
        </linearGradient>

        {/* Champagne Subtle Accent */}
        <linearGradient id="kavachGoldGrad" x1="12" y1="8" x2="32" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF0C9" />
          <stop offset="100%" stopColor="#B8913F" />
        </linearGradient>

        {/* Shield Surface Shadow */}
        <filter id="kavachShieldShadow" x="-10%" y="-10%" width="120%" height="130%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* Outer Shield Hull */}
      <path
        d="M20 3.5C28 3.5 36.5 5.5 36.5 5.5V21C36.5 31.2 28.5 38.5 20 41.5C11.5 38.5 3.5 31.2 3.5 21V5.5C3.5 5.5 12 3.5 20 3.5Z"
        className={cn(
          theme === "sapphire" && "fill-brand-sapphire stroke-brand-sapphire",
          theme === "light" && "fill-ink stroke-ink",
          theme === "dark" && "fill-surface stroke-hairline",
          theme === "monochrome" && "fill-current stroke-current",
          theme === "auto" && "fill-ink dark:fill-surface stroke-ink/20 dark:stroke-hairline"
        )}
        strokeWidth="1.2"
      />

      {/* Internal Architectural "K" with Merkle Nodes */}
      {/* 1. Left Vertical Spine of the "K" */}
      <path
        d="M13 13.5V30.5"
        stroke={theme === "sapphire" ? "#FFFFFF" : theme === "dark" ? "#FFFFFF" : theme === "light" ? "#FBFCFF" : "currentColor"}
        className={cn(
          theme === "auto" && "stroke-canvas dark:stroke-ink",
          theme === "monochrome" && "stroke-canvas dark:stroke-surface"
        )}
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* 2. Upper Branch of "K" connecting to top Merkle node */}
      <path
        d="M14 22L25 13.5"
        stroke={theme === "sapphire" ? "#FFFFFF" : theme === "dark" ? "#FFFFFF" : theme === "light" ? "#FBFCFF" : "currentColor"}
        className={cn(
          theme === "auto" && "stroke-canvas dark:stroke-ink",
          theme === "monochrome" && "stroke-canvas dark:stroke-surface"
        )}
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* 3. Lower Branch of "K" connecting to bottom Merkle node */}
      <path
        d="M16 20.5L25.5 30.5"
        stroke={theme === "sapphire" ? "#FFFFFF" : theme === "dark" ? "#FFFFFF" : theme === "light" ? "#FBFCFF" : "currentColor"}
        className={cn(
          theme === "auto" && "stroke-canvas dark:stroke-ink",
          theme === "monochrome" && "stroke-canvas dark:stroke-surface"
        )}
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* 4. Fine Merkle Proof Lattice Interconnect */}
      <path
        d="M13 15L25 13.5M25 13.5L20 22M20 22L25.5 30.5M13 29L25.5 30.5"
        stroke="rgba(255,255,255,0.25)"
        className={cn(
          theme === "auto" && "stroke-canvas/30 dark:stroke-ink/30",
          theme === "light" && "stroke-white/30",
          theme === "dark" && "stroke-white/30"
        )}
        strokeWidth="0.8"
        strokeDasharray="1.5 1.5"
      />

      {/* Merkle Nodes at the vertices */}
      {/* Node A (Root/Stem) */}
      <circle
        cx="13"
        cy="22"
        r="2"
        className={cn(
          theme === "sapphire" ? "fill-[#FFF0C9]" : "fill-brand-gold"
        )}
      />

      {/* Node B (Upper Leaf) */}
      <circle
        cx="25"
        cy="13.5"
        r="1.8"
        className={cn(
          theme === "sapphire" ? "fill-white" : "fill-brand-sapphire"
        )}
      />

      {/* Node C (Lower Leaf) */}
      <circle
        cx="25.5"
        cy="30.5"
        r="1.8"
        className={cn(
          theme === "sapphire" ? "fill-white" : "fill-semantic-verified"
        )}
      />
    </svg>
  );
}

export function KavachLogo({
  variant = "full",
  theme = "auto",
  size = "md",
  className,
  withTagline = false,
}: KavachLogoProps) {
  if (variant === "mark") {
    return <KavachLogoMark size={size} theme={theme} className={className} />;
  }

  const textSizes = {
    xs: "text-base",
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const taglineSizes = {
    xs: "text-[9px]",
    sm: "text-[10px]",
    md: "text-[11px]",
    lg: "text-xs",
    xl: "text-xs",
  };

  if (variant === "wordmark") {
    return (
      <div className={cn("inline-flex flex-col leading-none", className)}>
        <span
          className={cn(
            "font-serif font-normal tracking-tight text-ink dark:text-ink",
            textSizes[size]
          )}
        >
          Kavach
        </span>
        {withTagline && (
          <span
            className={cn(
              "font-mono uppercase tracking-widest text-muted mt-0.5",
              taglineSizes[size]
            )}
          >
            Network
          </span>
        )}
      </div>
    );
  }

  // Full Variant: Mark + Wordmark
  return (
    <div className={cn("inline-flex items-center gap-2.5 group select-none", className)}>
      <KavachLogoMark size={size} theme={theme} />
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline gap-1.5">
          <span
            className={cn(
              "font-serif font-normal tracking-tight text-ink dark:text-ink",
              textSizes[size]
            )}
          >
            Kavach
          </span>
          <span
            className={cn(
              "font-mono font-medium tracking-wider text-muted uppercase text-[10px]",
              theme === "sapphire" && "text-brand-sapphire"
            )}
          >
            Network
          </span>
        </div>
        {withTagline && (
          <span
            className={cn(
              "font-sans text-muted tracking-tight mt-1 hidden sm:block",
              taglineSizes[size]
            )}
          >
            Consortium Fraud Intelligence
          </span>
        )}
      </div>
    </div>
  );
}

export default KavachLogo;

