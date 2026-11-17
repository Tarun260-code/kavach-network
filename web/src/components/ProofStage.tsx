"use client";

import React, { useState } from "react";
import { ProofStep } from "./ProofTimeline";
import { ProofStageVisual } from "./ProofStageVisual";
import { DecisionCard, DecisionVerdict } from "./DecisionCard";
import { Button } from "./ui/button";
import { Card, Panel } from "./ui/card";
import { HashChip } from "./ui/HashChip";
import { StatusPill } from "./ui/StatusPill";
import { Term } from "./Term";
import {
  CheckCircle2,
  Loader2,
  FastForward,
  RotateCcw,
  Shield,
  X,
  ChevronDown,
  Layers,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProofStageProps {
  applicantId: string;
  maskedId: string;
  steps: ProofStep[];
  stage: "normalizing" | "rebuilding_tree" | "matching_leaf" | "proving" | "submitting" | "verdict";
  verdict: DecisionVerdict | null;
  result: any;
  bankId: string;
  isSkipped: boolean;
  elapsedSeconds?: string | number;
  onSkip: () => void;
  onReset: () => void;
  onCancel?: () => void;
}

export function ProofStage({
  applicantId,
  maskedId,
  steps,
  stage,
  verdict,
  result,
  bankId,
  isSkipped,
  elapsedSeconds = "1.42",
  onSkip,
  onReset,
  onCancel,
}: ProofStageProps) {
  const isComplete = stage === "verdict" && verdict !== null;
  const [openStepDetails, setOpenStepDetails] = useState<Record<number, boolean>>({});

  const toggleStepDetails = (idx: number) => {
    setOpenStepDetails((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Canonical technical details for each step
  const getStepTechDetails = (idx: number) => {
    switch (idx) {
      case 0:
        return [
          { label: "Modulus", value: "r = 21888242871839275222246405745257275088548364400416034343698204186575808495617" },
          { label: "Salt scalar", value: "0x1a8f9c... (Consortium salt)" },
        ];
      case 1:
        return [
          { label: "Tree depth", value: "20 levels (capacity 1,048,576)" },
          { label: "Leaves count", value: result?.treeLeavesCount ? `${result.treeLeavesCount} active fraud commitments` : "12 on-chain commitments" },
          { label: "Poseidon root", value: result?.root || "0x28f9... (BN254)" },
        ];
      case 2:
        return [
          { label: "Inclusion path", value: "20 sibling hashes computed" },
          { label: "Nullifier derivation", value: "Poseidon(id, salt, index)" },
        ];
      case 3:
        return [
          { label: "Constraint count", value: "3,428 R1CS constraints" },
          { label: "Prover engine", value: "Groth16 Web Worker (off-thread)" },
          { label: "Curve", value: "alt_bn128 (BN254)" },
        ];
      case 4:
        return [
          { label: "On-chain call", value: "verifyAndRecordHit(proof, publicSignals)" },
          { label: "Public signals", value: "[MerkleRoot, MatchNullifier]" },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="w-full space-y-6 text-left animate-in fade-in duration-200">
      {/* Top Banner with Context & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-card bg-surface border border-hairline shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-brand-sapphire/10 border border-brand-sapphire/20 flex items-center justify-center text-brand-sapphire shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-sm text-ink">{maskedId}</span>
              <span className="px-2 py-0.5 rounded-pill text-[10px] font-mono bg-semantic-verified/10 text-semantic-verified-text dark:text-semantic-verified font-bold border border-semantic-verified/25">
                Processed in Browser RAM
              </span>
            </div>
            <p className="text-xs text-muted">
              Applicant credential is evaluated strictly in local browser memory. Raw PII never touches the network.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isComplete && (
            <>
              {!isSkipped && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSkip}
                  className="text-xs gap-1.5"
                >
                  <FastForward className="h-3.5 w-3.5" />
                  Skip animation
                </Button>
              )}
              {onCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  className="text-xs text-muted hover:text-ink gap-1"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </Button>
              )}
            </>
          )}

          {isComplete && (
            <Button
              variant="pill-light"
              size="sm"
              onClick={onReset}
              className="text-xs gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Screen another applicant
            </Button>
          )}
        </div>
      </div>

      {/* Main 2-Column Split: Left = Step Timings & Technical Details; Right = Visual Stage & Result Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Vertical Step Timeline (5 Steps with Real Timings) */}
        <div className="lg:col-span-5 space-y-4">
          <Card elevation="card" className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-brand-sapphire" />
                <span className="font-serif text-heading-md font-normal text-ink">
                  Verification Pipeline
                </span>
              </div>
              <span className="text-[11px] font-mono text-muted bg-subtle px-2 py-0.5 rounded-pill">
                Off-thread Worker (60fps)
              </span>
            </div>

            <div className="space-y-4">
              {steps.map((step, idx) => {
                const isRunning = step.status === "running";
                const isCompleteStep = step.status === "complete";
                const isPending = step.status === "pending";
                const techDetails = getStepTechDetails(idx);
                const isOpen = openStepDetails[idx];

                return (
                  <div key={idx} className="flex items-start gap-3 relative">
                    {/* Continuous vertical connecting line */}
                    {idx < steps.length - 1 && (
                      <div
                        className={cn(
                          "absolute left-3 top-6 bottom-0 w-0.5 -ml-[1px] transition-colors",
                          isCompleteStep ? "bg-semantic-verified/40" : "bg-hairline"
                        )}
                        aria-hidden="true"
                      />
                    )}

                    {/* Step Icon Node */}
                    <div className="shrink-0 mt-0.5 z-10" aria-hidden="true">
                      {isCompleteStep && (
                        <div className="h-6 w-6 rounded-full bg-semantic-verified/15 text-semantic-verified-text dark:text-semantic-verified flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      )}
                      {isRunning && (
                        <div className="h-6 w-6 rounded-full bg-brand-sapphire/10 text-brand-sapphire flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      )}
                      {isPending && (
                        <div className="h-6 w-6 rounded-full bg-surface border border-hairline text-faint flex items-center justify-center text-[10px] font-mono">
                          {idx + 1}
                        </div>
                      )}
                    </div>

                    {/* Step Text, Elapsed ms & Collapsible Tech Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "text-body-sm font-medium",
                            isRunning && "text-brand-sapphire font-semibold",
                            isCompleteStep && "text-ink font-semibold",
                            isPending && "text-muted"
                          )}
                        >
                          {step.label}
                        </span>
                        {step.elapsedMs !== undefined && (
                          <span className="font-mono text-[11px] text-muted tabular-nums shrink-0">
                            {step.elapsedMs}ms
                          </span>
                        )}
                      </div>

                      {step.detail && (
                        <p className="text-[11px] text-muted font-mono leading-tight truncate">
                          {step.detail}
                        </p>
                      )}

                      {/* Technical Details Toggle */}
                      {(isRunning || isCompleteStep) && techDetails.length > 0 && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => toggleStepDetails(idx)}
                            className="text-[10px] font-mono text-brand-sapphire hover:underline flex items-center gap-1 select-none"
                          >
                            <span>Technical details</span>
                            <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
                          </button>

                          {isOpen && (
                            <div className="mt-1.5 p-2 rounded-panel bg-subtle/70 border border-hairline text-[10px] font-mono space-y-1 animate-in fade-in duration-150">
                              {techDetails.map((td, i) => (
                                <div key={i} className="flex justify-between gap-2">
                                  <span className="text-muted">{td.label}:</span>
                                  <span className="text-ink font-semibold truncate max-w-[200px]">{td.value}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Visual Stage & Decision Card */}
        <div className="lg:col-span-7 space-y-6">
          <ProofStageVisual
            applicantId={applicantId}
            stage={stage}
            verdict={verdict}
            ringVelocity={result?.ringVelocity || 0}
          />

          {/* Decision-First Result Card when complete */}
          {isComplete && verdict && (
            <DecisionCard
              verdict={verdict}
              reasons={
                verdict === "Clear"
                  ? [
                      "Zero matching fraud commitments detected across all consortium registries.",
                      "No concurrent loan inquiry velocity detected across peer lenders.",
                      "Local screening executed in browser memory with zero network data leakage.",
                    ]
                  : [
                      `Flagged by another member for ${result?.categoryName || "Synthetic Identity"}.`,
                      `Seen at ${result?.ringVelocity || 1} member banks within active 48-hour syndication window.`,
                      `Active commitment recorded on-chain with 0.05 ETH collateral deposit.`,
                    ]
              }
              category={result?.categoryName}
              flaggerBank={result?.flaggerBank}
              flagExpiry={result?.expiresAt}
              ringVelocity={result?.ringVelocity}
              leaf={result?.leaf}
              nullifier={result?.nullifier}
              txHash={result?.txHash}
              root={result?.root}
              elapsedSeconds={elapsedSeconds}
              onReset={onReset}
              onEscalate={() => {
                window.location.href = `/dao?action=appeal&leaf=${encodeURIComponent(result?.leaf || "")}&nullifier=${encodeURIComponent(result?.nullifier || "")}`;
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ProofStage;
