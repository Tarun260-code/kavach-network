"use client";

import React, { useState } from "react";
import { Card, Button, StatusPill, HashChip } from "./ui";
import {
  CheckCircle2,
  ShieldAlert,
  Clock,
  Sparkles,
  ArrowRight,
  Cpu,
  Lock,
  Layers,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function InteractiveProofTeaser() {
  const [selectedScenario, setSelectedScenario] = useState<"clean" | "fraud">("fraud");

  const scenarios = {
    clean: {
      id: "AARPA1234K",
      label: "Clean Applicant",
      type: "First-time borrower",
      outcome: "Clear",
      variant: "verified" as const,
      timings: ["8ms", "14ms", "28ms", "138ms", "18ms"],
      totalTime: "206ms",
      verdict: "Negative match. No active fraud commitments found in consortium Merkle tree.",
      ringVelocity: "0 hits",
      networkStatus: "Zero on-chain transmission",
    },
    fraud: {
      id: "BKUPG8492Q",
      label: "Syndicate Loan Stacking",
      type: "Multi-lender burst attack",
      outcome: "Decline",
      variant: "flagged" as const,
      timings: ["11ms", "16ms", "32ms", "145ms", "24ms"],
      totalTime: "228ms",
      verdict: "Cryptographic membership proof verified over BN254. Active flag registered by Meridian Bank.",
      ringVelocity: "4 hits across 3 banks",
      networkStatus: "Cross-bank nullifier collision detected",
    },
  };

  const active = scenarios[selectedScenario];

  return (
    <Card className="p-6 sm:p-8 bg-surface border-hairline shadow-card overflow-hidden relative">
      {/* Header Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-hairline">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary">
              Prover Sandbox
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-pill bg-subtle text-muted">
              Client RAM Engine
            </span>
          </div>
          <h3 className="font-sans text-lg font-semibold text-ink">
            Interactive Zero-Knowledge Prover
          </h3>
          <p className="text-caption text-muted">
            Evaluate how client-side proving resolves applicant queries in volatile browser memory.
          </p>
        </div>

        {/* Scenario Switcher */}
        <div className="flex items-center gap-2 p-1 rounded-pill bg-subtle/80 border border-hairline self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSelectedScenario("fraud")}
            className={cn(
              "px-3.5 py-1.5 rounded-pill text-xs font-medium transition-all",
              selectedScenario === "fraud"
                ? "bg-surface text-ink font-semibold shadow-subtle border border-hairline"
                : "text-muted hover:text-ink"
            )}
          >
            Syndicate Flag
          </button>
          <button
            type="button"
            onClick={() => setSelectedScenario("clean")}
            className={cn(
              "px-3.5 py-1.5 rounded-pill text-xs font-medium transition-all",
              selectedScenario === "clean"
                ? "bg-surface text-ink font-semibold shadow-subtle border border-hairline"
                : "text-muted hover:text-ink"
            )}
          >
            Clean Applicant
          </button>
        </div>
      </div>

      {/* Timeline Steps with Micro-Timings */}
      <div className="py-6 space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-ink">Prover Pipeline Execution</span>
          <span className="font-mono text-muted flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-primary" /> Total: {active.totalTime}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div className="p-3 rounded-panel bg-subtle/40 border border-hairline space-y-1">
            <div className="flex items-center justify-between text-[11px] text-muted">
              <span>01. Normalize</span>
              <span className="font-mono font-semibold text-ink">{active.timings[0]}</span>
            </div>
            <p className="text-[10px] text-muted leading-tight">Converted to BN254 scalar</p>
          </div>

          <div className="p-3 rounded-panel bg-subtle/40 border border-hairline space-y-1">
            <div className="flex items-center justify-between text-[11px] text-muted">
              <span>02. Salt Permute</span>
              <span className="font-mono font-semibold text-ink">{active.timings[1]}</span>
            </div>
            <p className="text-[10px] text-muted leading-tight">Poseidon-T3 salted hash</p>
          </div>

          <div className="p-3 rounded-panel bg-subtle/40 border border-hairline space-y-1">
            <div className="flex items-center justify-between text-[11px] text-muted">
              <span>03. Tree Query</span>
              <span className="font-mono font-semibold text-ink">{active.timings[2]}</span>
            </div>
            <p className="text-[10px] text-muted leading-tight">Depth-20 binary search</p>
          </div>

          <div className="p-3 rounded-panel bg-subtle/40 border border-hairline space-y-1">
            <div className="flex items-center justify-between text-[11px] text-muted">
              <span>04. Groth16</span>
              <span className="font-mono font-semibold text-ink">{active.timings[3]}</span>
            </div>
            <p className="text-[10px] text-muted leading-tight">Witness &amp; proof synthesis</p>
          </div>

          <div className="p-3 rounded-panel bg-subtle/40 border border-hairline space-y-1">
            <div className="flex items-center justify-between text-[11px] text-muted">
              <span>05. Outcome</span>
              <span className="font-mono font-semibold text-ink">{active.timings[4]}</span>
            </div>
            <p className="text-[10px] text-muted leading-tight">Deterministic decision</p>
          </div>
        </div>
      </div>

      {/* Verdict Showcase Card */}
      <div
        className={cn(
          "p-5 rounded-panel border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4",
          active.outcome === "Clear"
            ? "bg-semantic-verified/10 border-semantic-verified/30"
            : "bg-semantic-flagged/10 border-semantic-flagged/30"
        )}
      >
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
              active.outcome === "Clear"
                ? "bg-semantic-verified/20 text-semantic-verified"
                : "bg-semantic-flagged/20 text-semantic-flagged"
            )}
          >
            {active.outcome === "Clear" ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <ShieldAlert className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-sans text-base font-semibold text-ink">
                Verdict: {active.outcome} Recommended
              </h4>
              <StatusPill variant={active.variant} size="sm" label={active.label} />
            </div>
            <p className="text-body-sm text-muted mt-0.5 max-w-xl leading-relaxed">
              {active.verdict}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:items-end text-xs font-mono shrink-0 gap-1 pt-2 sm:pt-0 border-t sm:border-t-0 border-hairline">
          <span className="text-muted">Ring Velocity: <strong className="text-ink">{active.ringVelocity}</strong></span>
          <span className="text-muted">{active.networkStatus}</span>
        </div>
      </div>
    </Card>
  );
}

