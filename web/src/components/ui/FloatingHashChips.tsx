"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface HashChipData {
  id: string;
  hash: string;
  side: "left" | "right";
  top: string; // vertical percentage or offset
  depth: number; // 0..1 (controls blur and scale)
  blurPx: number;
  driftDuration: number;
  delaySec: number;
}

const CHIPS: HashChipData[] = [
  {
    id: "chip-1",
    hash: "0x19a9...0e3b",
    side: "left",
    top: "14vh",
    depth: 0.8,
    blurPx: 1.2,
    driftDuration: 18,
    delaySec: 0,
  },
  {
    id: "chip-2",
    hash: "0x42f7...89a1",
    side: "right",
    top: "26vh",
    depth: 0.4,
    blurPx: 0.4,
    driftDuration: 15,
    delaySec: 1.5,
  },
  {
    id: "chip-3",
    hash: "0x88c2...3d4f",
    side: "left",
    top: "42vh",
    depth: 0.6,
    blurPx: 0.8,
    driftDuration: 21,
    delaySec: 2.2,
  },
  {
    id: "chip-4",
    hash: "0x0f5b...6e21",
    side: "right",
    top: "58vh",
    depth: 0.9,
    blurPx: 1.5,
    driftDuration: 19,
    delaySec: 0.7,
  },
  {
    id: "chip-5",
    hash: "0x77e1...9c10",
    side: "left",
    top: "72vh",
    depth: 0.5,
    blurPx: 0.6,
    driftDuration: 16,
    delaySec: 3.1,
  },
  {
    id: "chip-6",
    hash: "0x3d8c...55a2",
    side: "right",
    top: "84vh",
    depth: 0.3,
    blurPx: 0.2,
    driftDuration: 22,
    delaySec: 1.0,
  },
  {
    id: "chip-7",
    hash: "0xb924...ef81",
    side: "left",
    top: "96vh",
    depth: 0.7,
    blurPx: 1.0,
    driftDuration: 17,
    delaySec: 2.8,
  },
  {
    id: "chip-8",
    hash: "0x5109...ba44",
    side: "right",
    top: "112vh",
    depth: 0.5,
    blurPx: 0.5,
    driftDuration: 20,
    delaySec: 0.4,
  },
  {
    id: "chip-9",
    hash: "0x6e78...21cc",
    side: "left",
    top: "128vh",
    depth: 0.8,
    blurPx: 1.4,
    driftDuration: 23,
    delaySec: 1.9,
  },
  {
    id: "chip-10",
    hash: "0x9a10...7fe3",
    side: "right",
    top: "142vh",
    depth: 0.4,
    blurPx: 0.3,
    driftDuration: 14,
    delaySec: 3.5,
  },
];

export interface FloatingHashChipsProps {
  scrollY?: number;
  className?: string;
}

export function FloatingHashChips({ scrollY = 0, className }: FloatingHashChipsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Parallax speed 0.6 relative to scroll
  const parallaxOffset = scrollY * 0.6;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block select-none",
        className
      )}
    >
      <div
        className="relative w-full h-[220vh] will-change-transform"
        style={{
          transform: `translate3d(0, -${parallaxOffset % 800}px, 0)`,
          transition: "transform 0.1s linear",
        }}
      >
        {CHIPS.map((chip) => {
          const isLeft = chip.side === "left";
          return (
            <div
              key={chip.id}
              className={cn(
                "absolute px-2.5 py-1 rounded-pill glass font-mono text-[10.5px] tracking-wider",
                "text-ink/80 dark:text-canvas/80 border border-hairline/60 shadow-subtle",
                "transition-opacity duration-700",
                isLeft ? "left-3 lg:left-6 xl:left-8" : "right-3 lg:right-6 xl:right-8"
              )}
              style={{
                top: chip.top,
                opacity: 0.35,
                filter: `blur(${chip.blurPx}px)`,
                animation: `floatChip ${chip.driftDuration}s ease-in-out infinite alternate`,
                animationDelay: `${chip.delaySec}s`,
              }}
            >
              <span className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-brand-sapphire/50"
                  style={{ opacity: 1 - chip.depth * 0.4 }}
                />
                <span>{chip.hash}</span>
              </span>
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        @keyframes floatChip {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(6px, -12px, 0) rotate(1deg);
          }
          100% {
            transform: translate3d(-6px, 10px, 0) rotate(-1deg);
          }
        }
      `}</style>
    </div>
  );
}

export default FloatingHashChips;
