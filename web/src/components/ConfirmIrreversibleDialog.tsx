"use client";

import React, { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./ui/button";
import { AlertTriangle, Lock, ShieldAlert } from "lucide-react";

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
}: ConfirmIrreversibleDialogProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  const handleConfirm = async () => {
    await onConfirm();
    setAcknowledged(false);
  };

  const handleClose = () => {
    setAcknowledged(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      subtitle="Irreversible On-Chain Protocol Action"
      maxWidth="md"
    >
      <div className="space-y-4 pt-1">
        <div className="p-3.5 rounded-card bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-body-sm text-ink space-y-1">
            <p className="font-medium">{description}</p>
            <p className="text-xs text-muted">
              Blockchain transactions cannot be rolled back or undone once confirmed by consortium validators.
            </p>
          </div>
        </div>

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

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-hairline">
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
        </div>
      </div>
    </Modal>
  );
}

