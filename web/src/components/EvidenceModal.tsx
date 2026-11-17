"use client";

import React from "react";
import { Modal } from "./Modal";
import { Button, HashChip, StatusPill } from "./ui";
import { FileText, ShieldCheck, ExternalLink, Calendar, UserCheck, Lock } from "lucide-react";

export interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: "evidence" | "defence";
  hash: string;
  appealId: number;
  categoryName?: string;
  submittedBy?: string;
}

export function EvidenceModal({
  isOpen,
  onClose,
  title,
  type,
  hash,
  appealId,
  categoryName = "Identity Verification Dispute",
  submittedBy = "Member Bank",
}: EvidenceModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={`Consortium Adjudication Record • Appeal #${appealId}`}
      maxWidth="md"
    >
      <div className="space-y-4 pt-1">
        {/* Verification Banner */}
        <div className="p-3.5 rounded-card bg-subtle/60 border border-hairline flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-signal-verified/10 text-signal-verified flex items-center justify-center shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-body-sm font-semibold text-ink">Cryptographically Anchored</p>
              <p className="text-caption text-muted">Signed by authorized underwriter key</p>
            </div>
          </div>
          <StatusPill variant="verified" label="Verified Hash" />
        </div>

        {/* Details Grid */}
        <div className="rounded-panel border border-hairline bg-surface p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-hairline">
            <span className="text-muted">Document Type</span>
            <span className="font-medium text-ink">
              {type === "evidence" ? "Contested KYC Documentation" : "Reporting Bank Audit Trail"}
            </span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-hairline">
            <span className="text-muted">Dispute Typology</span>
            <span className="font-medium text-ink">{categoryName}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-hairline">
            <span className="text-muted">Submitted By</span>
            <span className="font-medium text-ink">{submittedBy}</span>
          </div>

          <div className="flex flex-col gap-1 pb-2 border-b border-hairline">
            <span className="text-muted">IPFS / Content Hash</span>
            <HashChip hash={hash} copyable={true} className="self-start text-[11px]" />
          </div>

          <div className="flex items-center justify-between text-muted pt-1">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> Zero PII Disclosed to Chain
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> 72h Review Window
            </span>
          </div>
        </div>

        {/* Plain Language Underwriter Notes */}
        <div className="p-3.5 rounded-panel bg-subtle/30 border border-hairline space-y-1">
          <span className="text-caption font-semibold uppercase tracking-wider text-muted">
            Underwriter Justification
          </span>
          <p className="text-body-sm text-ink leading-relaxed">
            {type === "evidence"
              ? "Applicant presented primary physical biometric credentials and signed Aadhaar XML matching registered identity. Bank claims wrongful blacklisting due to clerical transposition."
              : "Originating underwriter logged 3 multi-lender credit applications within a 2-hour window. Verified fraud commitment leaf deposited with 0.05 ETH collateral."}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

