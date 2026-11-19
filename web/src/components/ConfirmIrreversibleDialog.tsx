"use client";

import React, { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./ui/button";
import { AlertTriangle, Lock, ShieldAlert, Copy, Check, Terminal } from "lucide-react";

export interface ConfirmIrreversibleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  consequences: string[];
  confirmLabel: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  isLoading?: boolean;
  isReplayMode?: boolean;
  replayCommand?: string;
  onSimulate?: () => void | Promise<void>;
  simulateLabel?: string;
}

export function ConfirmIrreversibleDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  consequences,
  confirmLabel,
  cancelLabel = "Cancel",
  variant = "warning",
  isLoading = false,
  isReplayMode = false,
  replayCommand = "pnpm dev",
  onSimulate,
  simulateLabel = "Simulation, not saved",
}: ConfirmIrreversibleDialogProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleConfirm = async () => {
    await onConfirm();
    setAcknowledged(false);
  };

  const handleClose = () => {
    setAcknowledged(false);
    onClose();
  };

  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText(replayCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      subtitle={isReplayMode ? "Demo Snapshot (Read-Only Mode)" : "Irreversible On-Chain Protocol Action"}
      maxWidth="md"
    >
      <div className="space-y-4 pt-1">
        {isReplayMode ? (
          <div className="p-3.5 rounded-card bg-amber-500/10 border border-amber-500/25 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <Terminal className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-body-sm text-ink space-y-1">
                <p className="font-semibold text-xs text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                  Read-Only Replay Mode Active
                </p>
                <p className="text-xs text-ink/80 leading-relaxed">
                  This hosted demo replays recorded consortium data without a live blockchain. To broadcast live transactions to smart contracts, run the stack locally.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 p-2 rounded bg-surface/80 border border-hairline font-mono text-xs">
              <span className="text-ink truncate">{replayCommand}</span>
              <button
                type="button"
                onClick={handleCopyCommand}
                className="flex items-center gap-1 px-2 py-1 rounded bg-subtle hover:bg-subtle/80 text-[11px] text-muted hover:text-ink shrink-0 transition-colors"
                title="Copy command"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-card bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-body-sm text-ink space-y-1">
              <p className="font-medium">{description}</p>
              <p className="text-xs text-muted">
                Blockchain transactions cannot be rolled back or undone once confirmed by consortium validators.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Protocol Consequences
          </span>
          <ul className="space-y-2 text-xs text-ink/80">
            {consequences.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {!isReplayMode && (
          <label className="flex items-start gap-2.5 p-3 rounded-card border border-hairline bg-surface/50 cursor-pointer hover:bg-surface transition-colors">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 rounded border-hairline text-brand-sapphire focus:ring-brand-sapphire"
            />
            <span className="text-xs text-ink leading-tight select-none">
              I understand this action executes immediately on the consortium smart contract and cannot be undone.
            </span>
          </label>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-hairline">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isLoading}
            className="min-h-[44px]"
          >
            {cancelLabel}
          </Button>

          {isReplayMode ? (
            <>
              {onSimulate && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await onSimulate();
                    handleClose();
                  }}
                  className="min-h-[44px] border-dashed border-amber-500/50 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
                  data-testid="simulate-button"
                >
                  Try preview: {simulateLabel}
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                onClick={handleCopyCommand}
                className="min-h-[44px] bg-ink hover:bg-ink/90 text-surface flex items-center gap-2"
                data-testid="run-locally-submit"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? "Copied command!" : "Run locally to submit"}</span>
              </Button>
            </>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={handleConfirm}
              disabled={!acknowledged || isLoading}
              className={`min-h-[44px] ${
                variant === "danger"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-brand-sapphire hover:bg-brand-sapphire/90 text-white"
              }`}
            >
              {isLoading ? "Executing..." : confirmLabel}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
