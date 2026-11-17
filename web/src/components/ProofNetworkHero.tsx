"use client";

import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BankNode {
  id: string;
  name: string;
  code: string;
  angleDeg: number; // position on 360 ring
  color: string;
  isFlagger?: boolean;
  isVerifier?: boolean;
}

const NODES: BankNode[] = [
  { id: "meridian", name: "Meridian Bank", code: "MB", angleDeg: -90, color: "#0E9F9F", isFlagger: true },
  { id: "aurum", name: "Aurum Bank", code: "AU", angleDeg: -18, color: "#3358F4", isVerifier: true },
  { id: "halcyon", name: "Halcyon Bank", code: "HA", angleDeg: 54, color: "#0B4A72" },
  { id: "northgate", name: "Northgate Bank", code: "NG", angleDeg: 126, color: "#881337" },
  { id: "vantage", name: "Vantage Bank", code: "VA", angleDeg: 198, color: "#701A75" },
];

export function ProofNetworkHero({ className }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [fps, setFps] = useState(60);
  const [animTime, setAnimTime] = useState(0);
  const [isDebug, setIsDebug] = useState(false);

  // Check ?debug=1 query flag
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setIsDebug(params.get("debug") === "1");
    }
  }, []);

  // Pause when off-screen via IntersectionObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 60 FPS RequestAnimationFrame Loop (8-second cycle)
  useEffect(() => {
    if (shouldReduceMotion || !isVisible) return;

    let frameId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let lastFpsUpdate = performance.now();

    const loop = (currentTime: number) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;

      // Update cycle time (8000ms loop)
      setAnimTime((prev) => (prev + delta) % 8000);

      // FPS Calculation
      frameCount++;
      if (currentTime - lastFpsUpdate >= 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastFpsUpdate)));
        frameCount = 0;
        lastFpsUpdate = currentTime;
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isVisible, shouldReduceMotion]);

  // Center & radius geometry for 540x380 SVG
  const cx = 270;
  const cy = 190;
  const orbitRadius = 135;
  const ringRadius = 42;

  // Calculate node coordinates
  const nodePositions = NODES.map((node) => {
    const rad = (node.angleDeg * Math.PI) / 180;
    return {
      ...node,
      x: cx + orbitRadius * Math.cos(rad),
      y: cy + orbitRadius * Math.sin(rad),
    };
  });

  // Animation timeline phases (0 to 8000ms)
  // Phase 1 (0 - 2800ms): Flag particle travels from Meridian (Node 0) to Center Ring
  const tFlag = Math.min(1, Math.max(0, animTime / 2800));
  const flagStart = nodePositions[0]; // Meridian
  const flagCurrentX = flagStart.x + (cx - flagStart.x) * tFlag;
  const flagCurrentY = flagStart.y + (cy - flagStart.y) * tFlag;

  // Phase 2 (2800 - 4500ms): Center Ring Absorbs & Root updates
  const isAnchoring = animTime >= 2800 && animTime < 4500;
  const ringPulseScale = isAnchoring ? 1 + 0.08 * Math.sin(((animTime - 2800) / 1700) * Math.PI) : 1;

  // Phase 3 (4500 - 7500ms): SBI queries and verified ZK pulse ripples back to SBI (Node 1)
  const isVerifying = animTime >= 4500 && animTime < 7500;
  const tVerify = Math.min(1, Math.max(0, (animTime - 4500) / 3000));
  const verifyTarget = nodePositions[1]; // SBI
  const verifyCurrentX = cx + (verifyTarget.x - cx) * tVerify;
  const verifyCurrentY = cy + (verifyTarget.y - cy) * tVerify;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full max-w-2xl mx-auto rounded-card p-4 sm:p-6 bg-surface/60 border border-hairline shadow-card backdrop-blur-md overflow-hidden select-none",
        className
      )}
    >
      {/* Top Telemetry Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-hairline text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-semantic-verified animate-pulse" />
          <span className="font-serif font-medium text-ink">
            Consortium Zero-Knowledge Proof Network
          </span>
        </div>
        {isDebug ? (
          <div className="flex items-center gap-2.5 text-[11px] font-mono text-muted">
            <span>60fps Engine</span>
            <span className="text-hairline">&bull;</span>
            <span className="tabular-nums font-semibold text-semantic-verified">{fps} FPS</span>
            <span className="text-hairline">&bull;</span>
            <span className="text-faint">{shouldReduceMotion ? "Static mode" : "8s loop"}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[11px] font-mono text-muted">
            <span className="text-faint">BN254 • Groth16</span>
          </div>
        )}
      </div>

      {/* Signature Animated SVG Canvas */}
      <div className="relative flex items-center justify-center">
        <svg
          viewBox="0 0 540 380"
          className="w-full h-auto max-h-[360px] overflow-visible"
          aria-label="Interactive 5-Bank Consortium Proof Network Animation"
        >
          <defs>
            {/* Background Radial Ambiance */}
            <radialGradient id="ringAmbiance" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--brand-sapphire)" stopOpacity="0.12" />
              <stop offset="80%" stopColor="var(--brand-gold)" stopOpacity="0.04" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>

            {/* Verification Glow */}
            <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="var(--signal-verified)" floodOpacity="0.6" />
            </filter>

            {/* Flagged Hazard Glow */}
            <filter id="flagGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="var(--signal-flagged)" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Central Ambiance Aura */}
          <circle cx={cx} cy={cy} r={ringRadius * 2.2} fill="url(#ringAmbiance)" />

          {/* Background Orbit Ring */}
          <circle
            cx={cx}
            cy={cy}
            r={orbitRadius}
            fill="none"
            stroke="var(--hairline)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Bank Radial Connection Rays */}
          {nodePositions.map((node) => (
            <line
              key={`ray-${node.id}`}
              x1={cx}
              y1={cy}
              x2={node.x}
              y2={node.y}
              stroke="var(--hairline)"
              strokeWidth="1.2"
            />
          ))}

          {/* ======================================================== */}
          {/* ANIMATED PARTICLES & RAYS (WHEN MOTION NOT REDUCED)      */}
          {/* ======================================================== */}
          {!shouldReduceMotion && (
            <>
              {/* Particle 1: Flagged Hash from Meridian -> Center */}
              {animTime < 2800 && (
                <g filter="url(#flagGlow)">
                  <line
                    x1={flagStart.x}
                    y1={flagStart.y}
                    x2={flagCurrentX}
                    y2={flagCurrentY}
                    stroke="var(--signal-flagged)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx={flagCurrentX} cy={flagCurrentY} r="4.5" fill="var(--signal-flagged)" />
                  {/* Floating Hash Micro-pill */}
                  <rect
                    x={flagCurrentX + 8}
                    y={flagCurrentY - 12}
                    width="68"
                    height="18"
                    rx="4"
                    fill="var(--surface)"
                    stroke="var(--signal-flagged)"
                    strokeWidth="1"
                  />
                  <text
                    x={flagCurrentX + 42}
                    y={flagCurrentY}
                    fontSize="8"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fill="var(--signal-flagged)"
                    fontWeight="bold"
                  >
                    0x19a9...0e3b
                  </text>
                </g>
              )}

              {/* Particle 2: Verification Ray from Center -> SBI */}
              {isVerifying && (
                <g filter="url(#emeraldGlow)">
                  <line
                    x1={cx}
                    y1={cy}
                    x2={verifyCurrentX}
                    y2={verifyCurrentY}
                    stroke="var(--signal-verified)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx={verifyCurrentX} cy={verifyCurrentY} r="4.5" fill="var(--signal-verified)" />
                  {/* Floating Proof Verified Pill */}
                  <rect
                    x={verifyCurrentX - 100}
                    y={verifyCurrentY - 12}
                    width="92"
                    height="18"
                    rx="4"
                    fill="var(--surface)"
                    stroke="var(--signal-verified)"
                    strokeWidth="1"
                  />
                  <text
                    x={verifyCurrentX - 54}
                    y={verifyCurrentY}
                    fontSize="8"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                    fill="var(--signal-verified)"
                    fontWeight="bold"
                  >
                    Groth16 Verified ✓
                  </text>
                </g>
              )}
            </>
          )}

          {/* ======================================================== */}
          {/* CENTRAL CONSORTIUM LEDGER RING                           */}
          {/* ======================================================== */}
          <g transform={`translate(${cx}, ${cy}) scale(${ringPulseScale}) translate(${-cx}, ${-cy})`}>
            {/* Outer Rotating Hash Ring */}
            <circle
              cx={cx}
              cy={cy}
              r={ringRadius}
              fill="var(--surface)"
              stroke={isAnchoring ? "var(--signal-flagged)" : isVerifying ? "var(--signal-verified)" : "var(--brand-sapphire)"}
              strokeWidth="2"
              className="transition-colors duration-300"
            />
            {/* Inner Concentric Proof Boundary */}
            <circle
              cx={cx}
              cy={cy}
              r={ringRadius - 8}
              fill="none"
              stroke="var(--brand-gold)"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            {/* Central Merkle Hub Label */}
            <text
              x={cx}
              y={cy - 6}
              fontSize="9"
              fontFamily="sans-serif"
              fontWeight="bold"
              textAnchor="middle"
              fill="var(--ink)"
            >
              MERKLE ROOT
            </text>
            <text
              x={cx}
              y={cy + 8}
              fontSize="8"
              fontFamily="monospace"
              textAnchor="middle"
              fill="var(--muted)"
            >
              0x4b7f...98a1
            </text>
            <text
              x={cx}
              y={cy + 19}
              fontSize="7"
              fontFamily="monospace"
              textAnchor="middle"
              fill="var(--brand-sapphire)"
            >
              Depth-20 Tree
            </text>
          </g>

          {/* ======================================================== */}
          {/* 5 BANK NODES                                             */}
          {/* ======================================================== */}
          {nodePositions.map((node) => (
            <g key={node.id} className="cursor-pointer group">
              {/* Outer Bank Node Capsule */}
              <circle
                cx={node.x}
                cy={node.y}
                r="20"
                fill="var(--surface)"
                stroke={node.color}
                strokeWidth="1.8"
                className="transition-transform duration-200 group-hover:scale-110 shadow-card"
              />
              {/* Monogram Text */}
              <text
                x={node.x}
                y={node.y + 4}
                fontSize="9"
                fontWeight="bold"
                fontFamily="sans-serif"
                textAnchor="middle"
                fill="var(--ink)"
              >
                {node.code}
              </text>

              {/* Status Ring Indicator */}
              <circle
                cx={node.x + 13}
                cy={node.y - 13}
                r="4.5"
                fill={node.isFlagger ? "var(--signal-flagged)" : node.isVerifier ? "var(--signal-verified)" : "var(--brand-sapphire)"}
                stroke="var(--surface)"
                strokeWidth="1.2"
              />

              {/* Bank Name Tooltip Label */}
              <text
                x={node.x}
                y={node.y + 32}
                fontSize="10"
                fontFamily="sans-serif"
                fontWeight="500"
                textAnchor="middle"
                fill="var(--ink)"
              >
                {node.name}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Explanatory Caption Strip */}
      <div className="mt-3 pt-3 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-muted">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-signal-flagged" />
          <span>Stage 1: Flagged Hash Anchored</span>
          <span className="text-hairline">&rarr;</span>
          <span className="h-1.5 w-1.5 rounded-full bg-signal-verified" />
          <span>Stage 2: Client Groth16 Proof Evaluated</span>
        </div>
        <span className="font-mono text-[10px] text-faint">
          Zero raw PII leaves member bank perimeter
        </span>
      </div>
    </div>
  );
}

export default ProofNetworkHero;

