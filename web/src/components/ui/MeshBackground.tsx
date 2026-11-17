"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type StoryBackgroundState = "calm" | "problem" | "solution" | "proof" | "governance" | "cta";

export interface MeshBackgroundProps {
  className?: string;
  variant?: "hero" | "app" | "landing" | "subtle" | "normal" | "vivid";
  intensity?: "app" | "landing" | "subtle" | "normal" | "vivid";
  storyState?: StoryBackgroundState;
  scrollY?: number;
}

export function MeshBackground({
  className,
  variant,
  intensity = "app",
  storyState = "calm",
  scrollY = 0,
}: MeshBackgroundProps) {
  const isHero = variant === "hero" || intensity === "landing" || intensity === "vivid";
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasPointer, setHasPointer] = useState(false);

  // Desktop Cursor Light: 520px spotlight following pointer with 0.08 lerp
  useEffect(() => {
    if (!isHero || typeof window === "undefined") return;

    // Only enable on desktop fine pointer and when reduced motion is NOT requested
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reducedMotion) return;

    let targetX = -1000;
    let targetY = -1000;
    let currentX = -1000;
    let currentY = -1000;
    let rAFId: number;
    let isMoving = false;

    const handlePointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isMoving) {
        currentX = targetX;
        currentY = targetY;
        isMoving = true;
        setHasPointer(true);
      }
    };

    const animate = () => {
      if (isMoving && containerRef.current) {
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;
        containerRef.current.style.setProperty("--mx", `${currentX}px`);
        containerRef.current.style.setProperty("--my", `${currentY}px`);
      }
      rAFId = requestAnimationFrame(animate);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    rAFId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      cancelAnimationFrame(rAFId);
    };
  }, [isHero]);

  // Compute story-specific color tokens with smooth 750ms CSS transitions
  const isProblem = storyState === "problem";
  const isSolution = storyState === "solution";
  const isProof = storyState === "proof";
  const isGovernance = storyState === "governance";
  const isCta = storyState === "cta";

  // Parallax speed 0.2 relative to scroll
  const parallaxOffset = scrollY * 0.2;

  if (!isHero) {
    // Standard ambient mesh for in-app views
    return (
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-canvas opacity-40 transition-opacity duration-500",
          className
        )}
      >
        <div
          className="absolute -top-32 -left-32 h-[560px] w-[560px] rounded-full blur-[120px]"
          style={{
            background: "radial-gradient(circle, var(--mesh-sky) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-20 right-1/4 h-[580px] w-[580px] rounded-full blur-[130px]"
          style={{
            background: "radial-gradient(circle, var(--mesh-lavender) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-32 -right-24 h-[640px] w-[640px] rounded-full blur-[140px]"
          style={{
            background: "radial-gradient(circle, var(--mesh-champagne) 0%, transparent 70%)",
          }}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-canvas transition-colors duration-700 ease-out",
        className
      )}
    >
      {/* Parallax Container: moves at scroll speed 0.2 */}
      <div
        className="absolute inset-0 overflow-hidden will-change-transform"
        style={{
          transform: `translate3d(0, -${parallaxOffset % 400}px, 0)`,
          transition: "transform 0.1s linear",
        }}
      >
        {/* Blob 1: Top-Left (Sky in Calm/Solution, Amber in Problem, Emerald in Proof, Gold in Governance) */}
        <div
          className="aurora-blob-1 absolute -top-28 -left-20 w-[720px] h-[720px] rounded-full blur-[110px] transition-all duration-700 ease-out"
          style={{
            opacity: isCta ? 0.2 : isProblem ? 0.65 : 0.75,
            background: isProblem
              ? "radial-gradient(circle, #F59E0B 0%, transparent 70%)"
              : isGovernance
              ? "radial-gradient(circle, #D97706 0%, transparent 70%)"
              : isProof
              ? "radial-gradient(circle, #10B981 0%, transparent 70%)"
              : "radial-gradient(circle, var(--mesh-sky) 0%, transparent 70%)",
          }}
        />

        {/* Blob 2: Centre-Top (Lavender in Calm, Rose-Amber in Problem, Sapphire in Solution, Champagne in Governance) */}
        <div
          className="aurora-blob-2 absolute -top-16 left-[28%] w-[680px] h-[680px] rounded-full blur-[110px] transition-all duration-700 ease-out"
          style={{
            opacity: isCta ? 0.15 : isProblem ? 0.6 : 0.7,
            background: isProblem
              ? "radial-gradient(circle, #F43F5E 0%, transparent 70%)"
              : isGovernance
              ? "radial-gradient(circle, #FEF3C7 0%, transparent 70%)"
              : isProof
              ? "radial-gradient(circle, #059669 0%, transparent 70%)"
              : isSolution
              ? "radial-gradient(circle, #3358F4 0%, transparent 70%)"
              : "radial-gradient(circle, var(--mesh-lavender) 0%, transparent 70%)",
          }}
        />

        {/* Blob 3: Right (Champagne in Calm, Warm Amber in Problem, Gold in Governance) */}
        <div
          className="aurora-blob-3 absolute top-20 -right-24 w-[740px] h-[740px] rounded-full blur-[110px] transition-all duration-700 ease-out"
          style={{
            opacity: isCta ? 0.25 : isProblem ? 0.6 : 0.65,
            background: isProblem
              ? "radial-gradient(circle, #FB923C 0%, transparent 70%)"
              : isGovernance
              ? "radial-gradient(circle, #F59E0B 0%, transparent 70%)"
              : isProof
              ? "radial-gradient(circle, #34D399 0%, transparent 70%)"
              : "radial-gradient(circle, var(--mesh-champagne) 0%, transparent 70%)",
          }}
        />

        {/* Blob 4: Bottom-Left (Mint in Calm, Rose in Problem, Sapphire in Solution) */}
        <div
          className="aurora-blob-4 absolute top-[440px] left-[5%] w-[580px] h-[580px] rounded-full blur-[110px] transition-all duration-700 ease-out"
          style={{
            opacity: isCta ? 0.1 : isProblem ? 0.5 : 0.55,
            background: isProblem
              ? "radial-gradient(circle, #FDA4AF 0%, transparent 70%)"
              : isGovernance
              ? "radial-gradient(circle, #FDE68A 0%, transparent 70%)"
              : isProof
              ? "radial-gradient(circle, #065F46 0%, transparent 70%)"
              : isSolution
              ? "radial-gradient(circle, #1E40AF 0%, transparent 70%)"
              : "radial-gradient(circle, var(--mesh-mint) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Story-Specific Section Tint Overlay (Warm Amber-Rose Wash in Problem, Deep Ink in CTA) */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700 ease-out"
        style={{
          backgroundColor: isCta
            ? "#0E1330"
            : isProblem
            ? "rgba(245, 158, 11, 0.06)"
            : isGovernance
            ? "rgba(217, 119, 6, 0.04)"
            : isProof
            ? "rgba(16, 185, 129, 0.04)"
            : "transparent",
          opacity: isCta ? 0.96 : 1,
        }}
      />

      {/* Desktop Cursor Light Spotlight (520px, 0.08 lerp, fine pointer only, disabled on reduced-motion) */}
      <div
        className={cn(
          "hidden md:block motion-reduce:hidden transition-opacity duration-300",
          hasPointer && !isCta ? "opacity-100" : "opacity-0"
        )}
      >
        <div
          className="absolute w-[520px] h-[520px] rounded-full -translate-x-1/2 -translate-y-1/2 will-change-transform pointer-events-none"
          style={{
            left: "var(--mx, -1000px)",
            top: "var(--my, -1000px)",
            background: isProblem
              ? "radial-gradient(circle 260px at center, rgba(254, 243, 199, 0.45) 0%, rgba(245, 158, 11, 0.08) 45%, transparent 70%)"
              : "radial-gradient(circle 260px at center, rgba(255, 255, 255, 0.55) 0%, rgba(51, 88, 244, 0.06) 45%, transparent 70%)",
          }}
        />
      </div>

      {/* Inline SVG feTurbulence Noise Texture (~3% opacity light, 5% dark, soft-light blend) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />
    </div>
  );
}

export default MeshBackground;
