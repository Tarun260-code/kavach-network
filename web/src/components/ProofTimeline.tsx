"use client";

import React, { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProofStep {
  label: string;
  detail?: string;
  status: "pending" | "running" | "complete" | "error";
  durationMs?: number;
  elapsedMs?: number;
}

interface ProofTimelineProps {
  steps: ProofStep[];
  isGenerating?: boolean;
  className?: string;
}

export function ProofTimeline({ steps, isGenerating, className }: ProofTimelineProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  if (!steps || steps.length === 0) return null;

  return (
    <div className={cn("rounded-card border border-hairline bg-surface p-5 shadow-subtle space-y-4", className)}>
      <div className="flex items-center justify-between pb-3 border-b border-hairline">
        <div className="flex items-center gap-2">
          <div className="flex h-2 w-2 rounded-full bg-brand-sapphire animate-pulse" />
          <span className="font-serif text-sm font-semibold text-ink">
            Client-Side Screening Engine
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isGenerating && (
            <span className="text-[11px] font-medium text-brand-sapphire animate-pulse">
              Evaluating in memory...
            </span>
          )}
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted bg-subtle px-2 py-0.5 rounded-pill border border-hairline">
            Local &bull; Zero PII
          </span>
        </div>
      </div>

      <div className="space-y-3 relative before:absolute before:top-3 before:bottom-3 before:left-[13px] before:w-[1px] before:bg-hairline">
        {steps.map((step, idx) => {
          const isExpanded = expandedIndex === idx;
          const isComplete = step.status === "complete";
          const isRunning = step.status === "running";
          const isError = step.status === "error";

          return (
            <div key={idx} className="relative flex items-start gap-3 pl-0.5">
              {/* Stepper Node Icon */}
              <div className="relative z-10 shrink-0 mt-0.5">
                {isComplete ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-semantic-verified/10 text-semantic-verified border border-semantic-verified/30">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                ) : isRunning ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-sapphire/10 text-brand-sapphire border border-brand-sapphire/30">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  </div>
                ) : isError ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-semantic-flagged/10 text-semantic-flagged border border-semantic-flagged/30">
                    <AlertCircle className="h-3.5 w-3.5" />
                  </div>
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface border border-hairline text-faint">
                    <span className="text-[10px] font-mono">{idx + 1}</span>
                  </div>
                )}
              </div>

              {/* Step Info */}
              <div className="flex-1 min-w-0 bg-subtle/30 rounded-card p-2.5 border border-hairline transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "text-xs font-medium truncate",
                      isComplete && "text-ink font-semibold",
                      isRunning && "text-brand-sapphire font-semibold",
                      !isComplete && !isRunning && "text-muted"
                    )}
                  >
                    {step.label}
                  </span>

                  <div className="flex items-center gap-2 shrink-0">
                    {step.durationMs !== undefined && (
                      <span className="font-mono text-[11px] text-muted tabular-nums">
                        {step.durationMs}ms
                      </span>
                    )}

                    {step.detail && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(idx)}
                        className="text-faint hover:text-ink p-0.5 rounded transition-colors text-[10px] flex items-center gap-0.5"
                        aria-label={isExpanded ? "Hide technical details" : "Show technical details"}
                      >
                        <span className="hidden sm:inline">Details</span>
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Collapsible Technical Details */}
                {step.detail && isExpanded && (
                  <div className="mt-2 pt-2 border-t border-hairline font-mono text-[11px] text-muted break-all leading-relaxed bg-surface/70 p-2 rounded border border-hairline">
                    <div className="text-[10px] text-faint font-sans uppercase font-medium mb-1">
                      Technical Cryptographic Specification
                    </div>
                    {step.detail}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Keep export for backward compatibility
export { ProofTimeline as ProofTerminal };
export default ProofTimeline;
