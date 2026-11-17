"use client";

import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { DecisionVerdict } from "./DecisionCard";
import { cn } from "@/lib/utils";
import { Check, ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";

export interface ProofStageVisualProps {
  applicantId: string;
  stage: "normalizing" | "rebuilding_tree" | "matching_leaf" | "proving" | "submitting" | "verdict";
  verdict: DecisionVerdict | null;
  ringVelocity?: number;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
  targetX?: number;
  targetY?: number;
}

export function ProofStageVisual({
  applicantId,
  stage,
  verdict,
  ringVelocity = 0,
  className,
}: ProofStageVisualProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const [currentHash, setCurrentHash] = useState("0x...");

  // Generate a mock or real hash representation
  useEffect(() => {
    let hash = "0x";
    for (let i = 0; i < applicantId.length; i++) {
      hash += applicantId.charCodeAt(i).toString(16);
    }
    while (hash.length < 18) hash += "9a7f3b";
    setCurrentHash(hash.slice(0, 10) + "..." + hash.slice(-4));
  }, [applicantId]);

  // Canvas particle animation
  useEffect(() => {
    if (shouldReduceMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const width = (canvas.width = canvas.offsetWidth);
    const height = (canvas.height = canvas.offsetHeight);
    const centerX = width / 2;
    const centerY = height / 2;

    // Initialize particles based on applicant ID characters
    const charCount = Math.max(applicantId.length, 10);
    for (let i = 0; i < charCount * 8; i++) {
      const angle = (Math.PI * 2 * i) / (charCount * 8);
      const distance = 40 + Math.random() * 60;
      particles.push({
        x: centerX + Math.cos(angle) * (distance * 0.4),
        y: centerY + Math.sin(angle) * (distance * 0.2),
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        alpha: 0.8,
        size: 1.5 + Math.random() * 2,
        color: i % 2 === 0 ? "#2F5BFF" : "#C8AA6E",
      });
    }

    let progress = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Stage-specific particle physics
      if (stage === "normalizing") {
        // Particles dissolve outwards from text
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.alpha = Math.max(0.2, p.alpha * 0.99);

          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (stage === "rebuilding_tree" || stage === "matching_leaf") {
        // Particles gravitationally collapse into center token
        particles.forEach((p) => {
          const dx = centerX - p.x;
          const dy = centerY - p.y;
          p.x += dx * 0.08;
          p.y += dy * 0.08;

          ctx.fillStyle = "#2F5BFF";
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (stage === "proving" || stage === "submitting") {
        // Orbital trajectory towards ledger ring
        progress += 0.03;
        const ringX = width * 0.75;
        const ringY = centerY;

        // Draw connecting spline
        ctx.strokeStyle = "rgba(47, 91, 255, 0.2)";
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(centerX * 0.6, centerY);
        ctx.quadraticCurveTo(width * 0.5, centerY - 60, ringX, ringY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Flying proof packet
        const t = (Math.sin(progress) + 1) / 2;
        const px = (1 - t) * (1 - t) * (centerX * 0.6) + 2 * (1 - t) * t * (width * 0.5) + t * t * ringX;
        const py = (1 - t) * (1 - t) * centerY + 2 * (1 - t) * t * (centerY - 60) + t * t * ringY;

        ctx.fillStyle = "#2F5BFF";
        ctx.shadowColor = "#2F5BFF";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [stage, applicantId, shouldReduceMotion]);

  // Reduced motion static fallback
  if (shouldReduceMotion) {
    return (
      <div className={cn("p-6 flex flex-col items-center justify-center text-center space-y-4", className)}>
        <div className="h-16 w-16 rounded-full bg-surface border border-hairline flex items-center justify-center shadow-subtle">
          {verdict === "Clear" && <ShieldCheck className="h-8 w-8 text-emerald-700 dark:text-emerald-300" />}
          {verdict === "Review" && <AlertTriangle className="h-8 w-8 text-amber-600" />}
          {verdict === "Decline" && <ShieldAlert className="h-8 w-8 text-coral" />}
          {!verdict && <span className="font-mono text-xs text-brand-sapphire">ZK</span>}
        </div>
        <div>
          <span className="text-xs uppercase tracking-wider text-muted block">Identifier Stage</span>
          <span className="font-mono text-sm text-ink font-semibold">{currentHash}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full h-[320px] rounded-xl bg-surface/40 border border-hairline overflow-hidden flex flex-col items-center justify-center", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Floating State Indicators */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-3 pointer-events-none select-none">
        {stage === "normalizing" && (
          <div className="space-y-1 animate-fade-in">
            <span className="font-mono text-heading-md font-semibold text-ink tracking-widest">
              {applicantId}
            </span>
            <p className="text-xs text-muted">Normalizing identifier &bull; Computing Poseidon scalar</p>
          </div>
        )}

        {(stage === "rebuilding_tree" || stage === "matching_leaf") && (
          <div className="p-3 rounded-lg bg-surface border border-brand-sapphire/40 shadow-card space-y-1 animate-rise-in">
            <span className="text-[10px] uppercase tracking-wider text-muted block">Identity Commitment</span>
            <span className="font-mono text-xs font-semibold text-brand-sapphire">{currentHash}</span>
          </div>
        )}

        {(stage === "proving" || stage === "submitting") && (
          <div className="flex items-center gap-8 animate-fade-in">
            <div className="p-3 rounded-lg bg-surface border border-hairline text-left space-y-0.5">
              <span className="text-[10px] text-muted uppercase tracking-wider">ZK Witness</span>
              <span className="font-mono text-xs font-semibold text-ink block">Depth-20 Path</span>
            </div>
            <div className="h-10 w-10 rounded-full border-2 border-brand-sapphire border-t-transparent animate-spin flex items-center justify-center" />
            <div className="p-3 rounded-lg bg-surface border border-hairline text-left space-y-0.5">
              <span className="text-[10px] text-muted uppercase tracking-wider">Ledger Ring</span>
              <span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-300 block">Root 0x4b7f...</span>
            </div>
          </div>
        )}

        {stage === "verdict" && verdict && (
          <div className="space-y-2 animate-scale-up">
            <div
              className={cn(
                "h-16 w-16 mx-auto rounded-full flex items-center justify-center shadow-card",
                verdict === "Clear" && "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30",
                verdict === "Review" && "bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/30",
                verdict === "Decline" && "bg-coral/15 text-rose-900 dark:text-rose-200 border border-coral/30"
              )}
            >
              {verdict === "Clear" && <ShieldCheck className="h-8 w-8" />}
              {verdict === "Review" && <AlertTriangle className="h-8 w-8" />}
              {verdict === "Decline" && <ShieldAlert className="h-8 w-8" />}
            </div>
            <div>
              <span className="font-serif text-heading-md font-medium text-ink block">
                {verdict === "Clear" && "Clean Consortium Record"}
                {verdict === "Review" && "High-Velocity Pattern (Review)"}
                {verdict === "Decline" && "Confirmed Fraudster (Decline)"}
              </span>
              <p className="text-xs text-muted">
                {verdict === "Clear"
                  ? "Identity commitment not found in active depth-20 fraud tree."
                  : `Matched consortium registry with ring velocity: ${ringVelocity} member banks.`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Subtle corner label */}
      <span className="absolute bottom-3 right-3 text-[10px] font-mono text-faint">
        Groth16 Engine &bull; Zero PII Exposed
      </span>
    </div>
  );
}
