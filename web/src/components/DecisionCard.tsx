"use client";

import React, { useState } from "react";
import { Card, Button, StatusPill, HashChip, Panel, Divider } from "@/components/ui";
import { Term } from "@/components/Term";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  TrendingUp,
  Building2,
  FileCheck,
  Scale,
  Lock,
  ExternalLink,
  Shield,
  Layers,
  ArrowRight,
  ChevronDown,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type DecisionVerdict = "Clear" | "Review" | "Decline";

export interface DecisionCardProps {
  verdict: DecisionVerdict;
  reasons: string[];
  applicantId?: string;
  category?: string;
  flaggerBank?: string;
  flagExpiry?: string;
  ringVelocity?: number;
  nullifier?: string;
  txHash?: string;
  root?: string;
  leaf?: string;
  elapsedSeconds?: string | number;
  verificationLabel?: string;
  onRecordDecision?: (decision: DecisionVerdict) => void;
  onEscalate?: () => void;
  onReset?: () => void;
}

/**
 * Mini SVG Ring Velocity Network Map
 * Displays a 5-node consortium ring with active hit nodes highlighted.
 */
function MiniRingVelocityMap({ activeCount = 1 }: { activeCount?: number }) {
  const totalNodes = 5;
  const radius = 32;
  const center = 42;
  const bankNames = ["Meridian", "Kestrel", "Aurum", "Halcyon", "Northgate"];

  const nodes = Array.from({ length: totalNodes }).map((_, i) => {
    const angle = (i * 2 * Math.PI) / totalNodes - Math.PI / 2;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
      name: bankNames[i],
      isActive: i < Math.min(activeCount, totalNodes),
    };
  });

  return (
    <div className="flex items-center gap-3 p-2.5 rounded-panel bg-subtle/50 border border-hairline">
      <svg width="84" height="84" viewBox="0 0 84 84" className="shrink-0 overflow-visible">
        {/* Ring Orbit */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="3 3"
          className="text-hairline"
        />

        {/* Center Merkle Hub */}
        <circle cx={center} cy={center} r="6" className="fill-brand-sapphire/20 stroke-brand-sapphire" strokeWidth="1.5" />

        {/* Connecting Lines for active nodes */}
        {nodes.map((n, i) =>
          n.isActive ? (
            <line
              key={`line-${i}`}
              x1={center}
              y1={center}
              x2={n.x}
              y2={n.y}
              stroke="var(--signal-flagged)"
              strokeWidth="1.5"
              strokeDasharray="2 2"
              className="animate-pulse"
            />
          ) : null
        )}

        {/* Bank Nodes */}
        {nodes.map((n, i) => (
          <g key={`node-${i}`}>
            <circle
              cx={n.x}
              cy={n.y}
              r={n.isActive ? 5 : 3.5}
              className={cn(
                "transition-all duration-300",
                n.isActive
                  ? "fill-semantic-flagged stroke-white stroke-2 shadow-subtle"
                  : "fill-muted/40 stroke-hairline"
              )}
            />
            {n.isActive && (
              <circle
                cx={n.x}
                cy={n.y}
                r="8"
                fill="none"
                stroke="var(--signal-flagged)"
                strokeWidth="1"
                className="animate-ping opacity-60"
              />
            )}
          </g>
        ))}
      </svg>

      <div className="text-left space-y-0.5">
        <div className="flex items-center gap-1.5">
          <span className="font-sans text-xs font-semibold text-ink">
            {activeCount} {activeCount === 1 ? "Node Hit" : "Syndicate Nodes"}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-pill bg-semantic-flagged/10 text-semantic-flagged-text font-bold">
            Velocity {activeCount}
          </span>
        </div>
        <p className="text-[11px] text-muted leading-tight">
          {activeCount > 1
            ? `Queried across ${activeCount} separate consortium lenders within 48h syndication window.`
            : "Single institution flag registered on consortium registry."}
        </p>
      </div>
    </div>
  );
}

export function DecisionCard({
  verdict,
  reasons,
  applicantId,
  category = "Synthetic Identity Stacking",
  flaggerBank = "Another member",
  flagExpiry = "Active (28 days remaining)",
  ringVelocity = 1,
  nullifier,
  txHash,
  root,
  leaf,
  elapsedSeconds = "1.42",
  verificationLabel,
  onRecordDecision,
  onEscalate,
  onReset,
}: DecisionCardProps) {
  const [techOpen, setTechOpen] = useState(false);
  const [recordedStatus, setRecordedStatus] = useState<string | null>(null);

  const isDecline = verdict === "Decline";
  const isReview = verdict === "Review";
  const isClear = verdict === "Clear";

  // Formatted flagger bank name per consortium privacy rules
  const displayFlagger = flaggerBank.startsWith("0x") || flaggerBank.toLowerCase().includes("consortium")
    ? "Another member"
    : flaggerBank;

  const handleRecord = () => {
    setRecordedStatus(`Recorded as ${verdict}`);
    onRecordDecision?.(verdict);
  };

  return (
    <Card
      elevation="card"
      className={cn(
        "p-6 sm:p-8 space-y-6 transition-all text-left",
        isDecline && "bg-semantic-flagged/5 border-semantic-flagged/30",
        isReview && "bg-semantic-pending/5 border-semantic-pending/30",
        isClear && "bg-semantic-verified/5 border-semantic-verified/30"
      )}
    >
      {/* 1. Decision Headline & Badge */}
      <div
        className={cn(
          "pb-5 border-b flex flex-col sm:flex-row sm:items-start justify-between gap-4",
          isDecline && "border-semantic-flagged/20",
          isReview && "border-semantic-pending/20",
          isClear && "border-semantic-verified/20"
        )}
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "h-2 w-2 rounded-full shrink-0",
                isDecline && "bg-semantic-flagged",
                isReview && "bg-semantic-pending",
                isClear && "bg-semantic-verified"
              )}
            />
            <span
              className={cn(
                "text-eyebrow font-semibold uppercase tracking-wider",
                isDecline && "text-semantic-flagged-text dark:text-semantic-flagged",
                isReview && "text-[#925B00] dark:text-[#F5B544]",
                isClear && "text-semantic-verified-text dark:text-semantic-verified"
              )}
            >
              Consortium Decision Recommendation
            </span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl text-ink font-normal leading-tight">
            {isDecline && "Decline Recommended — Multi-Lender Syndicate Hit"}
            {isReview && "Review — Single-Node Incident Detected"}
            {isClear && "Clear — No Consortium Fraud Matches Detected"}
          </h2>

          <p className="text-body-sm text-muted">
            Guidance. The decision is yours.
          </p>
        </div>

        <div className="shrink-0 flex flex-wrap items-center gap-2">
          {isDecline && (
            <StatusPill
              variant="flagged"
              size="default"
              label={`FLAGGED • Decline Recommended (${ringVelocity} banks)`}
              pulse
            />
          )}
          {isReview && (
            <StatusPill
              variant="review"
              size="default"
              label="FLAGGED • Review Required"
              pulse
            />
          )}
          {isClear && (
            <StatusPill
              variant="verified"
              size="default"
              label="CLEAR • Local Screening Clear"
              pulse
            />
          )}
          {verificationLabel && (
            <span
              className="text-[11px] font-mono px-2.5 py-1 rounded-pill bg-subtle text-muted border border-hairline font-semibold"
              data-testid="verification-label"
            >
              {verificationLabel}
            </span>
          )}
        </div>
      </div>

      {/* 2. Plain-Language Reasons (2-3 items) */}
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink block">
          Key Decision Reasons:
        </span>
        <div className="grid grid-cols-1 gap-2.5">
          {reasons.map((reason, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-panel bg-surface border border-hairline flex items-start gap-3 text-body-sm leading-relaxed shadow-xs"
            >
              <div className="shrink-0 mt-0.5">
                {isDecline && <AlertCircle className="h-4 w-4 text-semantic-flagged-text dark:text-semantic-flagged" />}
                {isReview && <AlertTriangle className="h-4 w-4 text-[#925B00] dark:text-[#F5B544]" />}
                {isClear && <CheckCircle2 className="h-4 w-4 text-semantic-verified-text dark:text-semantic-verified" />}
              </div>
              <span className="text-ink font-medium">{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Evidence Panel & Syndicate Ring Velocity Map */}
      {!isClear && (
        <div className="space-y-3 pt-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink block">
            Consortium Evidence Record:
          </span>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Metadata Chips */}
            <div className="grid grid-cols-2 gap-3">
              <Panel className="p-3.5 space-y-1">
                <span className="text-muted text-[11px] block font-medium">Reporting Authority</span>
                <span className="font-semibold text-ink text-body-sm block truncate">
                  {displayFlagger}
                </span>
              </Panel>

              <Panel className="p-3.5 space-y-1">
                <span className="text-muted text-[11px] block font-medium">Fraud Typology</span>
                <span className="font-semibold text-semantic-flagged-text dark:text-semantic-flagged text-body-sm block truncate">
                  {category}
                </span>
              </Panel>

              <Panel className="p-3.5 space-y-1">
                <span className="text-muted text-[11px] block font-medium">Record Validity</span>
                <span className="font-mono text-muted text-xs block">
                  {flagExpiry}
                </span>
              </Panel>

              <Panel className="p-3.5 space-y-1">
                <span className="text-muted text-[11px] block font-medium">Nullifier Matching</span>
                <span className="font-mono text-ink text-xs block truncate">
                  {nullifier ? `${nullifier.slice(0, 10)}...` : "Confirmed"}
                </span>
              </Panel>
            </div>

            {/* Tiny Interactive SVG Network Map */}
            <MiniRingVelocityMap activeCount={ringVelocity} />
          </div>
        </div>
      )}

      {/* Clear Outcome Specific Disclaimer */}
      {isClear && (
        <div className="p-4 rounded-panel bg-surface border border-hairline text-body-sm text-muted space-y-1.5">
          <div className="flex items-center gap-2 text-ink font-semibold text-xs">
            <Info className="h-4 w-4 text-semantic-verified-text dark:text-semantic-verified" />
            <span>Local screening result. No registry match found.</span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Note: A clear result confirms this national identifier has not been flagged by any consortium member. It is not an unconditional credit guarantee; underwriting credit evaluation should proceed under standard institutional guidelines.
          </p>
        </div>
      )}

      {/* 4. Progressive Disclosure: Collapsible Technical Details */}
      <div className="rounded-panel border border-hairline bg-surface/60 overflow-hidden">
        <button
          type="button"
          onClick={() => setTechOpen(!techOpen)}
          className="w-full px-4 py-3 text-left text-xs font-medium text-muted hover:text-ink flex items-center justify-between transition-colors min-h-[44px]"
        >
          <span className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-brand-sapphire" />
            <span>Technical details (cryptographic <Term id="nullifier">nullifier</Term>, root, and on-chain hashes)</span>
          </span>
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", techOpen && "rotate-180")} />
        </button>

        {techOpen && (
          <div className="p-4 border-t border-hairline bg-surface grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {nullifier && (
              <div className="space-y-1">
                <span className="text-muted text-[11px] block font-medium">
                  Match <Term id="nullifier">Nullifier</Term>
                </span>
                <HashChip hash={nullifier} label="Nullifier" />
              </div>
            )}
            {txHash && (
              <div className="space-y-1">
                <span className="text-muted text-[11px] block font-medium">On-Chain Registry Tx</span>
                <HashChip hash={txHash} label="Tx" />
              </div>
            )}
            {root && (
              <div className="space-y-1">
                <span className="text-muted text-[11px] block font-medium">
                  Consortium <Term id="merkle_root">Merkle Root</Term>
                </span>
                <HashChip hash={root} label="Root" />
              </div>
            )}
            {leaf && (
              <div className="space-y-1">
                <span className="text-muted text-[11px] block font-medium">
                  Poseidon <Term id="leaf">Commitment Leaf</Term>
                </span>
                <HashChip hash={leaf} label="Leaf" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Decision Audit Line */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted pt-1">
        <span className="font-mono text-faint flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {txHash ? (
            <>Proof verified on-chain in <strong className="text-ink font-semibold">{elapsedSeconds}s</strong></>
          ) : (
            <>Local zero-knowledge screening verified in <strong className="text-ink font-semibold">{elapsedSeconds}s</strong></>
          )}
        </span>
        {txHash && (
          <div className="flex items-center gap-1.5">
            <span className="text-faint font-mono text-[11px]">Tx:</span>
            <HashChip hash={txHash} prefixLen={6} suffixLen={4} />
          </div>
        )}
      </div>

      {/* 6. Primary Action Buttons */}
      <div
        className={cn(
          "pt-5 border-t flex flex-wrap items-center justify-between gap-3",
          isDecline && "border-semantic-flagged/20",
          isReview && "border-semantic-pending/20",
          isClear && "border-semantic-verified/20"
        )}
      >
        <div className="text-xs text-muted font-medium">
          {recordedStatus && (
            <span className="text-semantic-verified-text dark:text-semantic-verified font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {recordedStatus}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onReset && (
            <Button
              type="button"
              variant="ghost"
              size="default"
              onClick={onReset}
            >
              Screen another
            </Button>
          )}

          {!isClear && onEscalate && (
            <Button
              type="button"
              variant="pill-light"
              size="default"
              onClick={onEscalate}
            >
              Escalate to governance
            </Button>
          )}

          <Button
            type="button"
            variant="pill-dark"
            size="default"
            withOrb
            onClick={handleRecord}
          >
            Record decision
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default DecisionCard;
