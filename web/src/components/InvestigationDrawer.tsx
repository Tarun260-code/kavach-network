"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { HashChip } from "./HashChip";
import { Button } from "./ui/button";
import { StatusPill } from "./StatusPill";
import {
  X,
  ShieldAlert,
  Clock,
  Building2,
  FileText,
  ExternalLink,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export interface InvestigationData {
  leaf: string;
  nullifier?: string;
  category: string;
  flaggerBank: string;
  flaggedDate: string;
  distinctBankHits: number;
  timeline: Array<{
    bank: string;
    action: string;
    timestamp: string;
    txHash?: string;
  }>;
  appealStatus?: "No active appeal" | "Appeal pending" | "Revoked";
}

export interface InvestigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: InvestigationData | null;
}

export function InvestigationDrawer({ isOpen, onClose, data }: InvestigationDrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !data || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg h-full bg-surface border-l border-hairline shadow-elevated p-6 flex flex-col justify-between overflow-y-auto animate-slide-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="investigation-title"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-hairline pb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-coral/10 text-coral flex items-center justify-center">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h3 id="investigation-title" className="font-serif text-heading-md font-normal text-ink">
                  Cross-Bank Syndicate File
                </h3>
                <p className="text-xs text-muted">Consortium Multi-Lender Activity</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-muted/10 text-muted hover:text-ink transition-colors"
              aria-label="Close investigation"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Core Metric Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-hairline bg-surface/50">
              <span className="text-[11px] text-muted block">Syndicate Velocity</span>
              <span className="font-serif text-heading-md text-coral">
                {data.distinctBankHits} Banks
              </span>
              <span className="text-[10px] text-muted block">Cross-lender attempts</span>
            </div>
            <div className="p-3 rounded-lg border border-hairline bg-surface/50">
              <span className="text-[11px] text-muted block">Appeal Status</span>
              <span className="font-medium text-xs text-ink block mt-1">
                {data.appealStatus || "No active appeal"}
              </span>
              <span className="text-[10px] text-muted block">Consortium DAO</span>
            </div>
          </div>

          {/* Cryptographic Identifiers (Zero PII) */}
          <div className="space-y-2 p-4 rounded-xl border border-hairline bg-surface/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Cryptographic Artifacts
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-mono font-semibold">Zero PII</span>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-[11px] text-muted block">Flagged Leaf Commitment</span>
                <HashChip hash={data.leaf} label="leaf" />
              </div>
              {data.nullifier && (
                <div>
                  <span className="text-[11px] text-muted block">Deterministic Hit Nullifier</span>
                  <HashChip hash={data.nullifier} label="nullifier" />
                </div>
              )}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Syndicate Presentation Timeline
            </span>
            <div className="space-y-3 border-l-2 border-hairline ml-2 pl-4">
              {data.timeline.map((item, idx) => (
                <div key={idx} className="relative space-y-0.5">
                  <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-brand-sapphire ring-2 ring-surface" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-ink">{item.bank}</span>
                    <span className="text-[10px] font-mono text-muted">{item.timestamp}</span>
                  </div>
                  <p className="text-xs text-muted leading-tight">{item.action}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy & Governance Notice */}
          <div className="p-3.5 rounded-card bg-surface border border-hairline text-xs text-muted space-y-1">
            <span className="font-semibold text-ink block">Consortium Information Boundary:</span>
            <p>
              Member bank names are shared per multilateral consortium agreement. Customer identity credentials are never stored or transmitted.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-hairline flex flex-col sm:flex-row items-center gap-3">
          <Link href="/network" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full min-h-[44px]">
              View in Ledger
            </Button>
          </Link>
          <Link href="/dao" className="w-full sm:flex-1">
            <Button size="sm" className="w-full bg-brand-sapphire text-white min-h-[44px] gap-1.5">
              Escalate to Consortium DAO
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
