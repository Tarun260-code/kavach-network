"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Eye,
  Users,
  CheckCircle2,
  ExternalLink,
  Shield,
  Layers,
  Database,
  Building2,
} from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  HashChip,
  StatusPill,
  Card,
} from "@/components/ui";

interface PrivacyInspectorProps {
  idNumber?: string;
  consortiumSalt?: string;
  leaf?: string;
  nullifier?: string;
  root?: string;
  triggerButton?: boolean;
}

export function PrivacyInspector({
  idNumber = "BKUPG8492Q",
  consortiumSalt = "888777666555444333222111000999",
  leaf = "0x17056ec108fb2fa373f71c4c93540eb351c3d1fb5251da8a67ff8d82ca624bd4",
  nullifier = "0x19a99ebe98bca410852e6428fa63219085ac1b04756304192b6a502cfb91a8",
  root = "0x2897fa183b0f5de1a21e069176421034c5689da764512930bf4164bca4e6583",
  triggerButton = true,
}: PrivacyInspectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("bank");

  // Global keyboard shortcut 'P' to toggle inspector anywhere
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "p" || e.key === "P") &&
        !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {triggerButton && (
        <SheetTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-medium bg-surface text-ink border border-hairline shadow-subtle hover:bg-subtle hover:border-brand-sapphire/30 transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sapphire"
            title="Toggle Privacy Inspector (Press 'P' anywhere)"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-brand-sapphire" aria-hidden="true" />
            <span className="hidden sm:inline">Privacy Inspector</span>
            <span className="inline-block px-1.5 py-0.5 text-[10px] font-mono bg-subtle text-muted rounded-pill border border-hairline">
              P
            </span>
          </button>
        </SheetTrigger>
      )}

      <SheetContent side="right" className="glass w-full sm:max-w-[480px] p-6 overflow-y-auto space-y-6">
        <SheetHeader className="pb-4 border-b border-hairline space-y-1 text-left">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-semantic-verified" />
            <span className="text-eyebrow font-medium uppercase tracking-wider text-muted">
              DPDP Act (2023) Compliant
            </span>
          </div>
          <SheetTitle className="font-sans text-xl font-semibold tracking-[-0.01em] text-ink">
            Privacy Inspector
          </SheetTitle>
          <SheetDescription className="text-body-sm text-muted">
            Mathematical proof of zero cleartext PII leakage across institutional boundaries.
          </SheetDescription>
        </SheetHeader>

        {/* DPDP Compliance Card */}
        <div className="p-4 rounded-card bg-subtle/50 border border-hairline space-y-2 text-xs">
          <div className="flex items-center justify-between text-ink font-medium">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-semantic-verified" />
              <span>Section 4 & 8 Compliance</span>
            </span>
            <span className="px-2 py-0.5 rounded-pill text-[10px] font-mono font-medium bg-semantic-verified/10 text-semantic-verified border border-semantic-verified/25">
              100% ZK Isolation
            </span>
          </div>
          <p className="text-muted leading-relaxed">
            Kavach Network enforces privacy cryptographically. Banks screen loan applicants across member registries without sharing customer lists, loan values, or unmasked credentials.
          </p>
        </div>

        {/* 3 Tabs: Bank sees / Chain sees / Other bank sees */}
        <Tabs defaultValue="bank" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="bank" className="text-xs">Bank sees</TabsTrigger>
            <TabsTrigger value="chain" className="text-xs">Chain sees</TabsTrigger>
            <TabsTrigger value="peers" className="text-xs">Other bank sees</TabsTrigger>
          </TabsList>

          {/* TAB 1: BANK SEES */}
          <TabsContent value="bank" className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-brand-sapphire" />
                Local Underwriter View
              </span>
              <span className="text-[10px] font-mono uppercase bg-semantic-flagged/10 text-semantic-flagged border border-semantic-flagged/25 px-2 py-0.5 rounded-pill font-medium">
                Client RAM Only
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-card bg-surface border border-hairline space-y-1">
                <span className="text-[11px] text-muted block font-medium">Applicant National ID</span>
                <span className="font-mono text-xs font-semibold text-ink">{idNumber}</span>
              </div>

              <div className="p-3.5 rounded-card bg-surface border border-hairline space-y-1">
                <span className="text-[11px] text-muted block font-medium">Full Legal Name</span>
                <span className="text-xs font-medium text-ink">Vikramaditya Sharma</span>
              </div>

              <div className="p-3.5 rounded-card bg-surface border border-hairline space-y-1">
                <span className="text-[11px] text-muted block font-medium">Underwriting Request</span>
                <span className="text-xs text-ink font-medium">₹15,00,000 • Unsecured Personal Loan</span>
              </div>

              <div className="p-3.5 rounded-card bg-surface border border-hairline space-y-1">
                <span className="text-[11px] text-muted block font-medium">Off-chain Consortium Salt</span>
                <span className="font-mono text-xs text-muted break-all">{consortiumSalt}</span>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: CHAIN SEES */}
          <TabsContent value="chain" className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-brand-sapphire" />
                Public Smart Contract State
              </span>
              <span className="text-[10px] font-mono uppercase bg-semantic-verified/10 text-semantic-verified border border-semantic-verified/25 px-2 py-0.5 rounded-pill font-medium">
                Zero Cleartext PII
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-card bg-surface border border-hairline space-y-1">
                <span className="text-[11px] text-muted block font-medium">Applicant National ID</span>
                <div className="flex items-center gap-2">
                  <span className="h-4 w-32 bg-ink/10 rounded inline-block animate-pulse" />
                  <span className="text-[10px] text-semantic-verified font-medium">Redacted by design</span>
                </div>
              </div>

              <div className="p-3.5 rounded-card bg-surface border border-hairline space-y-1">
                <span className="text-[11px] text-muted block font-medium">Borrower Name & Loan Terms</span>
                <div className="flex items-center gap-2">
                  <span className="h-4 w-44 bg-ink/10 rounded inline-block animate-pulse" />
                  <span className="text-[10px] text-semantic-verified font-medium">Never broadcasted</span>
                </div>
              </div>

              <div className="p-3.5 rounded-card bg-surface border border-hairline space-y-1">
                <span className="text-[11px] text-muted block font-medium">Poseidon BN254 Commitment Leaf</span>
                <HashChip hash={leaf} label="Leaf" />
              </div>

              <div className="p-3.5 rounded-card bg-surface border border-hairline space-y-1">
                <span className="text-[11px] text-muted block font-medium">One-Time Anonymous Nullifier</span>
                <HashChip hash={nullifier} label="Nullifier" />
              </div>

              <div className="p-3.5 rounded-card bg-surface border border-hairline space-y-1">
                <span className="text-[11px] text-muted block font-medium">Active Merkle Tree Root</span>
                <HashChip hash={root} label="Root" />
              </div>

              <div className="p-3.5 rounded-card bg-surface border border-hairline space-y-1">
                <span className="text-[11px] text-muted block font-medium">ZK Groth16 Proof Tuple</span>
                <span className="font-mono text-[11px] text-muted block">
                  π_A [2 G1], π_B [2 G2], π_C [2 G1] • 128 bytes
                </span>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: OTHER BANK SEES */}
          <TabsContent value="peers" className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-brand-sapphire" />
                Peer Bank Consortium View
              </span>
              <span className="text-[10px] font-mono uppercase bg-brand-sapphire/10 text-brand-sapphire border border-brand-sapphire/25 px-2 py-0.5 rounded-pill font-medium">
                Signal Only
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-card bg-surface border border-hairline space-y-1">
                <span className="text-[11px] text-muted block font-medium">Applicant Cleartext Credentials</span>
                <div className="flex items-center gap-2">
                  <span className="h-4 w-36 bg-ink/10 rounded inline-block animate-pulse" />
                  <span className="text-[10px] text-semantic-verified font-medium">Protected by ZK-SNARK</span>
                </div>
              </div>

              <div className="p-3.5 rounded-card bg-surface border border-hairline space-y-1">
                <span className="text-[11px] text-muted block font-medium">Flagging Bank Identity</span>
                <span className="text-xs font-medium text-ink">Original Underwriting Member</span>
              </div>

              <div className="p-3.5 rounded-card bg-surface border border-hairline space-y-1">
                <span className="text-[11px] text-muted block font-medium">Consortium Ring Velocity Signal</span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-pill bg-semantic-flagged/10 text-semantic-flagged text-xs font-mono font-semibold border border-semantic-flagged/25">
                    Seen at 2 banks
                  </span>
                  <span className="text-xs text-muted">Syndicate Stacking Alert</span>
                </div>
              </div>

              <div className="p-3.5 rounded-card bg-surface border border-hairline space-y-1">
                <span className="text-[11px] text-muted block font-medium">Adjudication / Appeal Rights</span>
                <span className="text-xs text-muted">Eligible for AppealDAO resolution with escrow stake protection.</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Guarantee */}
        <div className="pt-4 border-t border-hairline text-[11px] text-faint text-center">
          Kavach Network Consortium Architecture • Zero Cleartext Transmission Guarantee
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default PrivacyInspector;
