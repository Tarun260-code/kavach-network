"use client";

import React from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  HashChip,
  StatusPill,
  Button,
  BankMonogram,
  Panel,
} from "@/components/ui";
import { RegistryEventItem } from "@/hooks/useRegistryEvents";
import {
  ShieldAlert,
  Clock,
  Building2,
  ExternalLink,
  Scale,
  Activity,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export interface InvestigationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: RegistryEventItem | null;
  bankId?: string;
}

export function InvestigationSheet({
  open,
  onOpenChange,
  event,
  bankId = "meridian",
}: InvestigationSheetProps) {
  if (!event) return null;

  const isFlagged = event.type === "IdentityFlagged";
  const isHit = event.type === "RingHit";
  const isRevoked = event.type === "LeafRevoked";
  const isAppeal = event.type.includes("Appeal");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" glass className="space-y-6 overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <StatusPill
              variant={isFlagged ? "flagged" : isHit ? "review" : isRevoked ? "neutral" : "verified"}
              size="sm"
              label={
                isFlagged
                  ? "Registry Flag"
                  : isHit
                  ? "Velocity Hit"
                  : isRevoked
                  ? "Revoked"
                  : "Consortium Event"
              }
            />
            <span className="text-[11px] font-mono text-muted">DPDP §4 Protected</span>
          </div>
          <SheetTitle className="text-xl">Syndicate Investigation File</SheetTitle>
          <SheetDescription>
            Multi-lender audit trail and cryptographic zero-knowledge telemetry.
          </SheetDescription>
        </SheetHeader>

        {/* Identity & Hash Summary */}
        <Panel className="p-4 bg-surface/90 border border-hairline space-y-3">
          <div className="flex items-center justify-between border-b border-hairline pb-2.5">
            <div className="flex items-center gap-2">
              <BankMonogram bankId={event.bankCode.toLowerCase()} size="sm" />
              <div>
                <span className="text-xs font-semibold text-ink block">{event.bankName}</span>
                <span className="text-[10px] font-mono text-faint uppercase">{event.bankCode}</span>
              </div>
            </div>
            <span className="text-xs font-mono text-muted">{event.timeAgo || event.timestamp}</span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-muted text-[11px] block mb-1">Typology Classification</span>
              <span className="font-semibold text-ink">{event.categoryName || "Suspicious Underwriting Activity"}</span>
            </div>

            {event.leaf && (
              <div>
                <span className="text-muted text-[11px] block mb-1">Poseidon BN254 Leaf</span>
                <HashChip hash={event.leaf} label="Leaf" />
              </div>
            )}

            {event.nullifier && (
              <div>
                <span className="text-muted text-[11px] block mb-1">Match Nullifier Token</span>
                <HashChip hash={event.nullifier} label="Nullifier" />
              </div>
            )}

            {event.txHash && (
              <div>
                <span className="text-muted text-[11px] block mb-1">Settlement Transaction</span>
                <HashChip hash={event.txHash} label="Tx" />
              </div>
            )}
          </div>
        </Panel>

        {/* Ring Velocity & Corridors */}
        <Panel className="p-4 bg-surface/90 border border-hairline space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-brand-sapphire" />
              <span className="text-xs font-semibold text-ink">Ring Velocity Telemetry</span>
            </div>
            <span className="text-xs font-mono font-bold text-semantic-flagged">
              {event.velocity ? `${event.velocity} Member Banks` : "Single Incident"}
            </span>
          </div>

          <p className="text-xs text-muted leading-relaxed">
            {event.velocity && event.velocity > 1
              ? `This identity commitment was presented across ${event.velocity} independent consortium lenders within the 48-hour syndication window.`
              : "This credential has been flagged on-chain with 0.05 ETH collateral. No secondary syndication hits detected yet."}
          </p>

          <div className="pt-2 flex items-center gap-1.5">
            <span className="text-[11px] text-faint">Consortium Exposure:</span>
            <span className="font-mono text-xs font-semibold text-ink">
              {event.velocity ? `${event.velocity * 15},00,000 INR (Est.)` : "Single Facility"}
            </span>
          </div>
        </Panel>

        {/* Multi-Node Audit Trail */}
        <Panel className="p-4 bg-surface/90 border border-hairline space-y-3">
          <span className="text-xs font-semibold text-ink block">Timeline of Events</span>
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2.5">
              <span className="h-2 w-2 rounded-full bg-semantic-flagged mt-1 shrink-0" />
              <div>
                <span className="font-medium text-ink block">Initial Flag Registered</span>
                <span className="text-muted text-[11px]">{event.bankName} deposited 0.05 ETH collateral</span>
              </div>
            </div>

            {event.velocity && event.velocity > 1 && (
              <div className="flex items-start gap-2.5">
                <span className="h-2 w-2 rounded-full bg-semantic-pending mt-1 shrink-0" />
                <div>
                  <span className="font-medium text-ink block">Syndicate Velocity Triggered</span>
                  <span className="text-muted text-[11px]">Query match verified via client-side Groth16 proof</span>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2.5">
              <span className="h-2 w-2 rounded-full bg-semantic-verified mt-1 shrink-0" />
              <div>
                <span className="font-medium text-ink block">Consortium Ledger Synced</span>
                <span className="text-muted text-[11px]">Depth-20 Merkle root updated on-chain</span>
              </div>
            </div>
          </div>
        </Panel>

        {/* Related Appeal Status */}
        <Panel className="p-4 bg-surface/90 border border-hairline space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-brand-gold" />
              <span className="text-xs font-semibold text-ink">AppealDAO Status</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-pill bg-subtle text-muted border border-hairline">
              Governance
            </span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            {isRevoked
              ? "Flag revoked by 80% supermajority in AppealDAO. Collateral refunded."
              : isAppeal
              ? "Dispute active in AppealDAO chamber. Underwriters may review defense evidence."
              : "No dispute has been filed for this commitment. Flag active under 30-day TTL."}
          </p>
        </Panel>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-hairline">
          <Link
            href={`/bank/${bankId}/screen${event.leaf ? `?leaf=${encodeURIComponent(event.leaf)}` : ""}`}
            className="w-full block"
          >
            <Button variant="pill-dark" size="sm" withOrb className="w-full">
              <UserCheck className="h-3.5 w-3.5 mr-1.5" />
              <span>Screen this identity in RAM</span>
            </Button>
          </Link>

          <Link href="/dao" className="w-full block">
            <Button variant="pill-light" size="sm" className="w-full">
              <Scale className="h-3.5 w-3.5 mr-1.5" />
              <span>View AppealDAO Chamber</span>
            </Button>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default InvestigationSheet;

