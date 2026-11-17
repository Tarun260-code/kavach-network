"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BrandPatternProps {
  className?: string;
  variant?: "lattice" | "dots" | "circuit";
  opacity?: number; // default 0.04 (4%)
}

export function BrandPattern({
  className,
  variant = "lattice",
  opacity = 0.04,
}: BrandPatternProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute inset-0 pointer-events-none select-none overflow-hidden",
        className
      )}
      style={{ opacity }}
    >
      <svg
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          {variant === "lattice" && (
            <pattern
              id="kavach-lattice-pattern"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              {/* Fine node-and-line lattice */}
              <path
                d="M 24 0 L 48 24 L 24 48 L 0 24 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.75"
              />
              <path
                d="M 0 0 L 48 48 M 48 0 L 0 48"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                strokeDasharray="2 2"
              />
              {/* Central and vertex Merkle nodes */}
              <circle cx="24" cy="24" r="2" fill="currentColor" />
              <circle cx="0" cy="24" r="1.25" fill="currentColor" />
              <circle cx="48" cy="24" r="1.25" fill="currentColor" />
              <circle cx="24" cy="0" r="1.25" fill="currentColor" />
              <circle cx="24" cy="48" r="1.25" fill="currentColor" />
            </pattern>
          )}

          {variant === "dots" && (
            <pattern
              id="kavach-lattice-pattern"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1" fill="currentColor" />
              <circle cx="14" cy="14" r="1.5" fill="currentColor" />
            </pattern>
          )}

          {variant === "circuit" && (
            <pattern
              id="kavach-lattice-pattern"
              width="64"
              height="64"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 0 32 H 24 L 32 24 V 8 H 56 L 64 16 V 48 L 56 56 H 32 L 24 48 V 32 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
              />
              <circle cx="24" cy="24" r="2" fill="currentColor" />
              <circle cx="56" cy="56" r="2" fill="currentColor" />
            </pattern>
          )}
        </defs>

        <rect
          width="100%"
          height="100%"
          fill="url(#kavach-lattice-pattern)"
          className="text-ink dark:text-canvas"
        />
      </svg>
    </div>
  );
}

export default BrandPattern;

