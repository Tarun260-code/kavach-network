"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  KeyRound,
  ExternalLink,
  ChevronRight,
  X,
  RotateCcw,
} from "lucide-react";
import { HashChip } from "./HashChip";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export type TxStage =
  | "idle"
  | "preparing"
  | "awaiting_signature"
  | "pending"
  | "confirmed"
  | "failed";

export interface TransactionInfo {
  id?: string;
  stage: TxStage;
  title: string;
  txHash?: string;
  blockNumber?: number;
  error?: string;
  startTime?: number;
  elapsedSeconds?: number;
  details?: Record<string, string>;
  onRetry?: () => void;
}

interface TxToastProps {
  tx: TransactionInfo | null;
  onClose?: () => void;
  onOpenDrawer?: () => void;
}

export function TxToast({ tx, onClose, onOpenDrawer }: TxToastProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!tx || (tx.stage !== "pending" && tx.stage !== "awaiting_signature")) {
      return;
    }
    const start = tx.startTime || Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.max(1, Math.floor((Date.now() - start) / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [tx]);

  if (!tx || tx.stage === "idle") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 max-w-md w-full p-4 rounded-xl bg-surface border border-hairline shadow-elevated transition-all animate-rise-in"
    >
      <div className="flex items-start gap-3">
        {/* Stage Icon */}
        <div className="shrink-0 mt-0.5">
          {tx.stage === "preparing" && (
            <div className="h-8 w-8 rounded-full bg-brand-sapphire/10 flex items-center justify-center text-brand-sapphire">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
          {tx.stage === "awaiting_signature" && (
            <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 animate-pulse">
              <KeyRound className="h-4 w-4" />
            </div>
          )}
          {tx.stage === "pending" && (
            <div className="h-8 w-8 rounded-full bg-brand-sapphire/10 flex items-center justify-center text-brand-sapphire">
              <Clock className="h-4 w-4 animate-spin text-brand-sapphire" />
            </div>
          )}
          {tx.stage === "confirmed" && (
            <div className="h-8 w-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          )}
          {tx.stage === "failed" && (
            <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-600">
              <AlertCircle className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-medium text-xs text-ink">{tx.title}</span>
            {onClose && (
              <button
                onClick={onClose}
                className="text-muted hover:text-ink transition-colors p-1"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <p className="text-xs text-muted leading-relaxed">
            {tx.stage === "preparing" && "Computing Poseidon commitment & witness payload..."}
            {tx.stage === "awaiting_signature" && "Awaiting cryptographic authorization from bank signer..."}
            {tx.stage === "pending" && (
              <span className="flex items-center gap-1.5">
                Broadcasted to consortium testnet &bull;{" "}
                <span className="font-mono text-ink font-medium">{elapsed}s</span> elapsed
              </span>
            )}
            {tx.stage === "confirmed" && (
              <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                Confirmed in block #{tx.blockNumber || "latest"}
              </span>
            )}
            {tx.stage === "failed" && (
              <span className="text-red-600">
                {tx.error || "Transaction reverted by consortium rules."}
              </span>
            )}
          </p>

          {/* Transaction Hash */}
          {tx.txHash && (
            <div className="pt-1 flex items-center gap-2">
              <HashChip hash={tx.txHash} label="tx" />
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center gap-2 pt-2">
            {tx.stage === "failed" && tx.onRetry && (
              <Button
                size="sm"
                variant="outline"
                onClick={tx.onRetry}
                className="h-7 text-xs px-2.5 gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
              >
                <RotateCcw className="h-3 w-3" />
                Retry action
              </Button>
            )}

            {onOpenDrawer && (
              <button
                onClick={onOpenDrawer}
                className="text-[11px] text-brand-sapphire hover:underline flex items-center gap-0.5 ml-auto"
              >
                Inspect technical details
                <ChevronRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface TxDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tx: TransactionInfo | null;
}

export function TxDrawer({ isOpen, onClose, tx }: TxDrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !tx || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md h-full bg-surface border-l border-hairline shadow-elevated p-6 flex flex-col justify-between overflow-y-auto animate-slide-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tx-drawer-title"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-hairline pb-4">
            <div>
              <h3 id="tx-drawer-title" className="font-serif text-heading-md font-normal text-ink">
                Transaction Lifecycle
              </h3>
              <p className="text-xs text-muted">Consortium On-Chain Execution Record</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-muted/10 text-muted hover:text-ink transition-colors"
              aria-label="Close drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4 rounded-xl border border-hairline bg-surface/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">Lifecycle Status</span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider",
                  tx.stage === "confirmed" && "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30",
                  tx.stage === "pending" && "bg-brand-sapphire/15 text-brand-sapphire dark:text-blue-300 border border-brand-sapphire/30",
                  tx.stage === "failed" && "bg-red-500/15 text-red-800 dark:text-red-200 border border-red-500/30",
                  (tx.stage === "preparing" || tx.stage === "awaiting_signature") &&
                    "bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/30"
                )}
              >
                {tx.stage.replace("_", " ")}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">Action</span>
              <span className="text-xs font-semibold text-ink">{tx.title}</span>
            </div>

            {tx.blockNumber && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Block Height</span>
                <span className="font-mono text-xs text-ink">#{tx.blockNumber}</span>
              </div>
            )}

            {tx.txHash && (
              <div className="space-y-1 pt-1 border-t border-hairline">
                <span className="text-xs text-muted block">Transaction Hash</span>
                <HashChip hash={tx.txHash} label="tx" />
              </div>
            )}
          </div>

          {/* Dynamic Details Table */}
          {tx.details && Object.keys(tx.details).length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Protocol Telemetry
              </span>
              <div className="divide-y divide-hairline rounded-lg border border-hairline bg-surface/30">
                {Object.entries(tx.details).map(([key, val]) => (
                  <div key={key} className="p-2.5 flex items-center justify-between text-xs">
                    <span className="text-muted">{key}</span>
                    <span className="font-mono text-ink font-medium">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tx.error && (
            <div className="p-3.5 rounded-card bg-red-500/10 border border-red-500/20 text-xs text-red-700 space-y-1">
              <span className="font-semibold block">Consortium Revert Reason:</span>
              <p>{tx.error}</p>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-hairline flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose} className="min-h-[44px]">
            Close
          </Button>
          {tx.stage === "failed" && tx.onRetry && (
            <Button
              size="sm"
              onClick={() => {
                onClose();
                tx.onRetry?.();
              }}
              className="bg-brand-sapphire text-white min-h-[44px]"
            >
              Retry Transaction
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
