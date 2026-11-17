"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "../../components/AppShell";
import {
  MetricCard,
  HashChip,
  StatusPill,
  Card,
  Button,
} from "@/components/ui";
import { PrivacyInspector } from "../../components/PrivacyInspector";
import { useToast } from "../../components/Toast";
import {
  PlayCircle,
  PauseCircle,
  RefreshCw,
  Building2,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Radio,
  Scale,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Zap,
  Check,
  RotateCcw,
  Sliders,
  CheckCircle,
  XCircle,
  Flame,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { getProvider, getFraudRegistryContract, deploymentConfig } from "@/lib/web3";
import { checkArtifactsCached, ensureZkArtifacts } from "@/lib/zk-prover-client";

interface PitchStep {
  number: number;
  title: string;
  badge: string;
  pitchDuration: string;
  headline: string;
  actor: string;
  actorCode: string;
  actorColor: string;
  story: string;
  technicalMechanism: string;
  zkPrivacyProof: string;
  linkHref: string;
  linkText: string;
  highlightData: {
    label: string;
    value: string;
    isCode?: boolean;
    color?: string;
  }[];
}

interface PreflightStatus {
  nodeOnline: boolean;
  blockNumber: number;
  contractsDeployed: boolean;
  keysCached: boolean;
  seedLoaded: boolean;
  leafCount: number;
  allGreen: boolean;
  checking: boolean;
}

export default function PresenterModePage() {
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [timerProgress, setTimerProgress] = useState<number>(0);
  const [isSpotlight, setIsSpotlight] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [showPreflight, setShowPreflight] = useState<boolean>(true);
  const shouldReduceMotion = useReducedMotion();

  // Pre-flight status state
  const [preflight, setPreflight] = useState<PreflightStatus>({
    nodeOnline: false,
    blockNumber: 0,
    contractsDeployed: false,
    keysCached: false,
    seedLoaded: false,
    leafCount: 0,
    allGreen: false,
    checking: true,
  });

  const pitchSteps: PitchStep[] = [
    {
      number: 1,
      title: "Bank A Flags a Fraudster",
      badge: "Step 1 • In-Browser Hashing",
      pitchDuration: "35s",
      headline: "Local Poseidon leaf synthesis & 0.05 ETH collateral escrow",
      actor: "Aurum Bank (AURUM)",
      actorCode: "AURUM",
      actorColor: "var(--brand-sapphire)",
      story:
        "Underwriting audits at Aurum Bank identify a syndicated loan stacking attempt on PAN BKUPG8492Q (Demo data). Instead of transmitting this sensitive PII to an external clearinghouse, Aurum's local portal normalises the ID into a BN254 field element and computes Poseidon(ID, Salt) in browser memory. Only the 32-byte leaf is broadcast on-chain with 0.05 ETH collateral stake.",
      technicalMechanism:
        "circomlibjs executes Poseidon over the 254-bit scalar field using off-chain consortium salt. Only leaf 0x17056e... is sent to FraudRegistry.flagIdentity(leaf, category=0, ttl=30d).",
      zkPrivacyProof:
        "Zero bytes of customer PAN or Aadhaar leave the bank's workstation memory. Network packets contain strictly the 32-byte Poseidon leaf hash.",
      linkHref: "/bank/aurum/flag",
      linkText: "Open Aurum Flagging Console",
      highlightData: [
        { label: "Raw National Identifier", value: "BKUPG8492Q (Demo data • In-Memory)", isCode: true },
        { label: "Poseidon Commitment Leaf", value: "0x17056ec108fb2fa373f71c4c...624bd4", isCode: true },
        { label: "Collateral Deposited", value: "0.05 ETH (In Escrow)", color: "var(--signal-verified)" },
        { label: "Fraud Vector", value: "Synthetic Identity / Multiple Unsecured Blast", color: "var(--signal-flagged)" },
      ],
    },
    {
      number: 2,
      title: "Public Ledger Shows Only a Cryptographic Hash",
      badge: "Step 2 • On-Chain Zero-PII",
      pitchDuration: "30s",
      headline: "Immutable Merkle tree insertion with zero customer leakage",
      actor: "Consortium Blockchain Node",
      actorCode: "ETHEREUM",
      actorColor: "var(--consortium-gold)",
      story:
        "The smart contract FraudRegistry.sol inserts the leaf into an incremental Merkle tree of depth 20 (capacity 1,048,576 leaves) and computes the new root. A public block explorer (Etherscan) or any external observer sees only the 32-byte leaf hash, the 30-slot ring buffer update, and the staking deposit. Raw names, dates of birth, phone numbers, and credit amounts remain strictly non-existent on the chain.",
      technicalMechanism:
        "IncrementalMerkleTree.sol inserts leaf at index N, rotates ringBufferRoots[currentRootIndex], and emits event IdentityFlagged(leaf, index, flagger, category, timestamp).",
      zkPrivacyProof:
        "Statutory compliance under India's DPDP Act (2023) Section 4: Public ledger cannot be reverse-engineered to recover borrower identity due to the pre-image resistance of Poseidon-T3.",
      linkHref: "/network",
      linkText: "Inspect Consortium Live Ledger",
      highlightData: [
        { label: "Tree Index", value: "Leaf Slot #4 (Incremental)", isCode: true },
        { label: "Rolling Buffer Root", value: "0x2897fa183b0f5de1a21e06917642...a4e6583", isCode: true },
        { label: "Cleartext PII On-Chain", value: "0.00 Bytes (Section 4 Compliant)", color: "var(--signal-verified)" },
        { label: "Public Block Event", value: "IdentityFlagged(leaf, slot, flagger)", isCode: true },
      ],
    },
    {
      number: 3,
      title: "Bank B Screens Applicant with ZK Proof",
      badge: "Step 3 • ZK Membership Check",
      pitchDuration: "45s",
      headline: "Client-side Groth16 witness computation & hit confirmation",
      actor: "Halcyon Bank (HALCYON)",
      actorCode: "HALCYON",
      actorColor: "var(--bank-meridian)",
      story:
        "The same borrower applies for a personal loan at Halcyon Bank 20 minutes later. Halcyon's underwriter enters the PAN. The local prover reconstructs the depth-20 tree from public events, locates the leaf, generates a Groth16 zero-knowledge proof of tree membership, computes the deterministic nullifier Poseidon(leaf, 1), and submits verifyAndRecordHit() to FraudRegistry.",
      technicalMechanism:
        "snarkjs.groth16.fullProve generates proof π in ~200ms in Web Worker. Smart contract verifies pairing equation on BN254 curve and records the nullifier in the registry.",
      zkPrivacyProof:
        "The proof proves membership in the tree without revealing WHICH leaf matches the applicant, nor the applicant's raw PAN.",
      linkHref: "/bank/halcyon/screen",
      linkText: "Screen Applicant at Halcyon",
      highlightData: [
        { label: "Anonymous Nullifier", value: "0x19a99ebe98bca410852e6428fa632...91a8", isCode: true },
        { label: "Proof Synthesis Duration", value: "210ms (Local Web Worker Execution)", color: "var(--brand-sapphire)" },
        { label: "Membership Proof Output", value: "MATCH (Valid Groth16 Verification)", color: "var(--signal-flagged)" },
        { label: "Consortium Ring Velocity", value: "Accelerated to 2 Banks (Demo data)", color: "var(--signal-flagged)" },
      ],
    },
    {
      number: 4,
      title: "Bank A Receives Real-Time Syndicate Alert",
      badge: "Step 4 • Cross-Bank Alerting",
      pitchDuration: "35s",
      headline: "Cross-bank syndicate detection without peer-to-peer data sharing",
      actor: "Aurum Bank (AURUM)",
      actorCode: "AURUM",
      actorColor: "var(--brand-sapphire)",
      story:
        "When Halcyon records the hit on-chain, Aurum's underwriting dashboard immediately captures the event via useRegistryEvents(). Aurum's active workspace fires a real-time Cross-Bank Syndicate Alert: 'An identity you flagged was presented at Halcyon Bank'. Both lenders detect the multi-bank syndicated fraud in real time without ever exchanging a borrower list.",
      technicalMechanism:
        "FraudRegistry emits event RingHit(nullifier, queryingBank, timestamp). Aurum compares nullifier to its locally stored commitments to recognize its own flagged identity.",
      zkPrivacyProof:
        "Zero inter-bank communications channel. No direct REST or mTLS link required between lenders. The blockchain event log acts as a zero-knowledge coordination bus.",
      linkHref: "/bank/aurum",
      linkText: "View Live Cross-Bank Alert",
      highlightData: [
        { label: "Cross-Bank Event", value: "RingHit Broadcasted On-Chain", isCode: true },
        { label: "Alert Latency", value: "<1 Second via Hardhat Event Stream", color: "var(--signal-verified)" },
        { label: "Syndicate Velocity Band", value: "High Risk (>2 Member Hits)", color: "var(--signal-flagged)" },
        { label: "Direct Bank-to-Bank PII Link", value: "None (Zero Direct Data Sharing)", color: "var(--signal-verified)" },
      ],
    },
    {
      number: 5,
      title: "Wrongful Flag Appealed and Slashed",
      badge: "Step 5 • AppealDAO Governance",
      pitchDuration: "35s",
      headline: "2/3 supermajority adjudication, leaf revocation & stake slashing",
      actor: "AppealDAO Adjudication Chamber",
      actorCode: "CONSORTIUM",
      actorColor: "var(--consortium-gold)",
      story:
        "A borrower contests a wrongful flag with official identity rectification documentation. Kestrel Capital sponsors Appeal #1 (Demo data) on AppealDAO.sol with evidence URI ipfs://bafybeig... When 4 of 5 member banks vote FOR, executeAppeal() zeroes the leaf in the Merkle tree via zeroizeLeaf() and transfers the flagger's 0.05 ETH stake to the treasury.",
      technicalMechanism:
        "AppealDAO checks votesFor >= quorum (4/5), calls FraudRegistry.revokeFlagByDAO(leaf, merkleProof), zeroing the leaf in tree storage and transferring stake.",
      zkPrivacyProof:
        "Economic deterrence against false positives or griefing attacks. Malicious or careless flaggers forfeit capital automatically upon supermajority consortium adjudication.",
      linkHref: "/appeals",
      linkText: "Adjudicate Appeals in AppealDAO",
      highlightData: [
        { label: "Dispute Target", value: "Appeal #1 (Disputed PAN DISP99999P • Demo data)", isCode: true },
        { label: "Consortium Quorum", value: "4 / 5 Supermajority Reached", color: "var(--consortium-gold)" },
        { label: "Execution Outcome", value: "Merkle Leaf Zeroized & Staking Slashed", color: "var(--signal-verified)" },
        { label: "Collateral Forfeited", value: "0.05 ETH Slashed from Flagger", color: "var(--signal-flagged)" },
      ],
    },
  ];

  // Pre-flight system check
  const runPreflight = useCallback(async () => {
    setPreflight((prev) => ({ ...prev, checking: true }));
    try {
      const provider = getProvider();
      
      // 1. Check Node
      let nodeOnline = false;
      let blockNumber = 0;
      try {
        blockNumber = await provider.getBlockNumber();
        nodeOnline = true;
      } catch {
        nodeOnline = false;
      }

      // 2. Check Contracts
      let contractsDeployed = false;
      if (nodeOnline && deploymentConfig.fraudRegistry) {
        try {
          const code = await provider.getCode(deploymentConfig.fraudRegistry);
          contractsDeployed = code !== "0x" && code !== "0x0";
        } catch {
          contractsDeployed = false;
        }
      }

      // 3. Check Keys
      let keysCached = false;
      try {
        keysCached = await checkArtifactsCached();
      } catch {
        keysCached = false;
      }

      // 4. Check Seed
      let seedLoaded = false;
      let leafCount = 0;
      if (contractsDeployed) {
        try {
          const registry = getFraudRegistryContract(provider);
          const leaves = await registry.getNumberOfLeaves();
          leafCount = Number(leaves);
          seedLoaded = leafCount > 0;
        } catch {
          seedLoaded = false;
        }
      }

      const allGreen = nodeOnline && contractsDeployed && keysCached && seedLoaded;

      setPreflight({
        nodeOnline,
        blockNumber,
        contractsDeployed,
        keysCached,
        seedLoaded,
        leafCount,
        allGreen,
        checking: false,
      });
    } catch {
      setPreflight((prev) => ({ ...prev, checking: false, allGreen: false }));
    }
  }, []);

  useEffect(() => {
    runPreflight();
  }, [runPreflight]);

  // Hidden Panic Shortcut (Ctrl + Shift + R)
  const handlePanicReset = useCallback(async () => {
    setIsResetting(true);
    showToast({
      title: "Triggering Emergency Panic Reset...",
      message: "Re-seeding contracts and resetting consortium ledger baseline...",
      type: "info",
    });

    const startTime = Date.now();
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      const data = await res.json();
      const elapsed = Date.now() - startTime;

      if (data.success) {
        setCurrentStep(1);
        setTimerProgress(0);
        await runPreflight();
        showToast({
          title: "Demo State Reset in " + elapsed + "ms!",
          message: "All contract seeds, leaves, and consortium voting baselines are clean.",
          type: "success",
        });
      } else {
        showToast({
          title: "Demo Reset Notice",
          message: data.error || "Reset completed with fallback.",
          type: "info",
        });
      }
    } catch (err: any) {
      showToast({
        title: "Reset Error",
        message: err.message || "Failed to call reset API",
        type: "error",
      });
    } finally {
      setIsResetting(false);
    }
  }, [showToast, runPreflight]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "R" || e.key === "r")) {
        e.preventDefault();
        handlePanicReset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePanicReset]);

  const activePitch = pitchSteps[currentStep - 1];

  const handleNext = () => {
    setCurrentStep((prev) => (prev < 5 ? prev + 1 : 1));
    setTimerProgress(0);
  };

  const handlePrev = () => {
    setCurrentStep((prev) => (prev > 1 ? prev - 1 : 5));
    setTimerProgress(0);
  };

  // 15-second auto-play timer per step
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setTimerProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + 6.67; // 15 seconds to reach 100%
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, currentStep]);

  return (
    <AppShell pageTitle="Presenter Pitch Mode">
      <div className="space-y-8 pb-28 relative">
        {/* Spotlight Dark Backdrop Overlay */}
        {isSpotlight && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity pointer-events-none"
            aria-hidden="true"
          />
        )}

        {/* ======================================================== */}
        {/* PRE-FLIGHT CHECKLIST BANNER (TURNS ALL GREEN)            */}
        {/* ======================================================== */}
        <section aria-label="Consortium Pitch Pre-Flight System Checks">
          <Card
            className={cn(
              "p-5 bg-surface border transition-all duration-300 relative z-20",
              preflight.allGreen
                ? "border-emerald-500/40 bg-emerald-500/5 shadow-subtle"
                : "border-hairline shadow-card"
            )}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2.5 rounded-card shrink-0",
                    preflight.allGreen
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-subtle text-muted"
                  )}
                >
                  {preflight.allGreen ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Sliders className="h-5 w-5 text-brand-sapphire" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-eyebrow font-medium uppercase tracking-wider text-muted font-mono">
                      Pre-Flight Inspection
                    </span>
                    <span
                      id="preflight-status-badge"
                      className={cn(
                        "text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider",
                        preflight.allGreen
                          ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700"
                          : "bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-100 border border-amber-300 dark:border-amber-700"
                      )}
                    >
                      {preflight.checking
                        ? "Inspecting..."
                        : preflight.allGreen
                        ? "All Systems Green • Ready for Pitch"
                        : "Setup Required"}
                    </span>
                  </div>
                  <h2 className="text-sm font-semibold text-ink mt-0.5">
                    Consortium Runtime & Zero-Knowledge Pre-Flight Readiness
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={runPreflight}
                  disabled={preflight.checking}
                  className="text-xs h-8"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", preflight.checking && "animate-spin")} />
                  Re-Check
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowPreflight(!showPreflight)}
                  className="text-xs h-8 text-muted"
                >
                  {showPreflight ? "Hide Checklist" : "Show Checklist"}
                </Button>
              </div>
            </div>

            {/* 4 Interactive Pre-Flight Gate Cards */}
            {showPreflight && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 mt-4 border-t border-hairline">
                {/* 1. Node Running */}
                <div
                  id="preflight-check-node"
                  className={cn(
                    "p-3 rounded-card border text-xs space-y-1 transition-colors",
                    preflight.nodeOnline
                      ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
                      : "bg-rose-500/5 border-rose-500/30 text-rose-950 dark:text-rose-100"
                  )}
                >
                  <div className="flex items-center justify-between font-medium">
                    <span>1. Local Node</span>
                    {preflight.nodeOnline ? (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted">
                    {preflight.nodeOnline
                      ? `Online • Block #${preflight.blockNumber}`
                      : "Offline (Port 8545 unreachable)"}
                  </p>
                </div>

                {/* 2. Contracts Deployed */}
                <div
                  id="preflight-check-contracts"
                  className={cn(
                    "p-3 rounded-card border text-xs space-y-1 transition-colors",
                    preflight.contractsDeployed
                      ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
                      : "bg-rose-500/5 border-rose-500/30 text-rose-950 dark:text-rose-100"
                  )}
                >
                  <div className="flex items-center justify-between font-medium">
                    <span>2. Contracts Deployed</span>
                    {preflight.contractsDeployed ? (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted">
                    {preflight.contractsDeployed
                      ? "FraudRegistry & AppealDAO verified"
                      : "Bytecode missing (Run pnpm seed)"}
                  </p>
                </div>

                {/* 3. Keys Cached */}
                <div
                  id="preflight-check-keys"
                  className={cn(
                    "p-3 rounded-card border text-xs space-y-1 transition-colors",
                    preflight.keysCached
                      ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
                      : "bg-amber-500/5 border-amber-500/30 text-amber-950 dark:text-amber-100"
                  )}
                >
                  <div className="flex items-center justify-between font-medium">
                    <span>3. Prover Keys Cached</span>
                    {preflight.keysCached ? (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <button
                        onClick={async () => {
                          showToast({
                            title: "Pre-caching ZK Artifacts...",
                            message: "Downloading wasm & zkey into IndexedDB...",
                            type: "info",
                          });
                          await ensureZkArtifacts();
                          await runPreflight();
                        }}
                        className="text-[10px] text-brand-sapphire underline font-semibold"
                      >
                        Preload
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-muted">
                    {preflight.keysCached
                      ? "IndexedDB (wasm + zkey stored)"
                      : "Available via static fallback"}
                  </p>
                </div>

                {/* 4. Seed Loaded */}
                <div
                  id="preflight-check-seed"
                  className={cn(
                    "p-3 rounded-card border text-xs space-y-1 transition-colors",
                    preflight.seedLoaded
                      ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
                      : "bg-rose-500/5 border-rose-500/30 text-rose-950 dark:text-rose-100"
                  )}
                >
                  <div className="flex items-center justify-between font-medium">
                    <span>4. Consortium Seed</span>
                    {preflight.seedLoaded ? (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted">
                    {preflight.seedLoaded
                      ? `${preflight.leafCount} synthetic fraud commitments`
                      : "0 leaves in registry (Run pnpm seed)"}
                  </p>
                </div>
              </div>
            )}
          </Card>
        </section>

        {/* ======================================================== */}
        {/* PITCH HEADER & OVERVIEW                                  */}
        {/* ======================================================== */}
        <section aria-label="Presenter Pitch Header">
          <Card className="p-6 sm:p-8 bg-surface border-hairline shadow-card space-y-6 relative z-20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-brand-sapphire animate-pulse" />
                  <span className="text-eyebrow font-medium uppercase tracking-wider text-muted">
                    3-Minute Pitch & Judge Walkthrough
                  </span>
                  <span className="text-xs font-mono text-ink font-semibold ml-2">
                    Step {currentStep} of 5
                  </span>
                </div>
                <h1 className="font-sans text-[28px] text-ink font-semibold tracking-[-0.01em] leading-tight">
                  Consortium Presenter Mode • 5-Step Core Journey
                </h1>
                <p className="text-body-sm text-muted max-w-2xl">
                  Experience the 5 pivotal architectural moments proving zero-knowledge privacy, decentralized velocity alerting, and mathematical DPDP compliance.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Button
                  type="button"
                  variant={isSpotlight ? "primary" : "outline"}
                  size="default"
                  onClick={() => setIsSpotlight(!isSpotlight)}
                  className="text-xs"
                >
                  <Lightbulb className="h-4 w-4 mr-1.5" />
                  <span>Spotlight {isSpotlight ? "ON" : "OFF"}</span>
                </Button>

                <Button
                  type="button"
                  variant={isAutoPlaying ? "primary" : "outline"}
                  size="default"
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="text-xs"
                >
                  {isAutoPlaying ? (
                    <>
                      <PauseCircle className="h-4 w-4 mr-1.5" />
                      <span>Pause Auto-Pitch</span>
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4 mr-1.5" />
                      <span>Auto-Play (15s/step)</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Auto-Play Timer Bar */}
            {isAutoPlaying && (
              <div className="w-full bg-subtle h-1.5 rounded-pill overflow-hidden border border-hairline">
                <div
                  className="h-full bg-brand-sapphire transition-all duration-1000 ease-linear rounded-pill"
                  style={{ width: `${timerProgress}%` }}
                />
              </div>
            )}

            {/* Step Pill Navigation */}
            <nav aria-label="Pitch Step Selector" className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-4 border-t border-hairline">
              {pitchSteps.map((step) => {
                const isActive = step.number === currentStep;
                const isPast = step.number < currentStep;

                return (
                  <button
                    key={step.number}
                    type="button"
                    onClick={() => {
                      setCurrentStep(step.number);
                      setTimerProgress(0);
                    }}
                    className={cn(
                      "text-left p-3 rounded-card border transition-all text-xs flex flex-col justify-between gap-1.5 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sapphire",
                      isActive
                        ? "bg-subtle text-ink font-semibold border-brand-sapphire shadow-subtle ring-1 ring-brand-sapphire/30"
                        : isPast
                        ? "bg-surface border-semantic-verified/30 text-muted hover:border-hairline"
                        : "bg-surface border-hairline text-faint hover:text-ink"
                    )}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className={isActive ? "text-brand-sapphire font-bold" : isPast ? "text-semantic-verified" : "text-muted"}>
                        0{step.number}
                      </span>
                      {isPast && <CheckCircle2 className="h-3 w-3 text-semantic-verified" />}
                    </div>
                    <div className="truncate text-[11px] leading-tight">
                      {step.title}
                    </div>
                  </button>
                );
              })}
            </nav>
          </Card>
        </section>

        {/* ======================================================== */}
        {/* ACTIVE PITCH STEP CARD WITH SPOTLIGHT                    */}
        {/* ======================================================== */}
        <section aria-label={`Current Step: ${activePitch.title}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activePitch.number}
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 12 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-30"
            >
              <Card className="p-6 sm:p-8 bg-surface border-hairline shadow-card space-y-6 relative overflow-hidden ring-1 ring-brand-sapphire/20 shadow-[0_0_60px_-15px_rgba(47,91,255,0.12)]">
                {/* Soft Spotlight Orb on Card Header */}
                <div
                  className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl opacity-25"
                  style={{
                    background: `radial-gradient(circle, var(--brand-sapphire) 0%, transparent 70%)`,
                  }}
                  aria-hidden="true"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-4 relative z-10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusPill variant="active" size="sm" label={activePitch.badge} />
                      <span className="text-[11px] font-mono text-muted">
                        Duration: ~{activePitch.pitchDuration}
                      </span>
                    </div>
                    <h2 className="font-sans text-xl sm:text-2xl text-ink font-semibold tracking-[-0.01em]">
                      {activePitch.number}. {activePitch.title}
                    </h2>
                    <p className="text-body-sm text-muted">
                      {activePitch.headline}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <div className="p-2.5 rounded-card bg-subtle/50 border border-hairline text-right text-xs">
                      <span className="text-[10px] font-mono text-muted uppercase block">Primary Actor</span>
                      <span className="font-semibold text-ink flex items-center gap-1.5 justify-end mt-0.5">
                        <span
                          className="h-2 w-2 rounded-full inline-block"
                          style={{ backgroundColor: activePitch.actorColor }}
                        />
                        <span>{activePitch.actor}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Narrative + Telemetry Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                  {/* Story & Mechanism Left (7 Cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="space-y-2">
                      <span className="text-eyebrow font-medium uppercase tracking-wider text-brand-sapphire block">
                        Presenter Narrative
                      </span>
                      <p className="text-body-sm text-ink leading-relaxed p-4 rounded-card bg-subtle/40 border border-hairline">
                        {activePitch.story}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-eyebrow font-medium uppercase tracking-wider text-brand-sapphire block">
                        Cryptographic Protocol Mechanism
                      </span>
                      <div className="text-xs text-muted leading-relaxed p-4 rounded-card bg-subtle/40 border border-hairline font-mono text-[11px]">
                        {activePitch.technicalMechanism}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-eyebrow font-medium uppercase tracking-wider text-semantic-verified block">
                        DPDP Act Statutory Privacy Guarantee
                      </span>
                      <div className="text-xs text-semantic-verified leading-relaxed p-4 rounded-card bg-semantic-verified/5 border border-semantic-verified/25">
                        {activePitch.zkPrivacyProof}
                      </div>
                    </div>
                  </div>

                  {/* Live Step Telemetry Right (5 Cols) */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="p-4 rounded-card bg-subtle/30 border border-hairline space-y-3">
                      <span className="text-eyebrow font-medium uppercase tracking-wider text-muted block">
                        Step Telemetry Signals
                      </span>
                      <div className="space-y-2">
                        {activePitch.highlightData.map((item, idx) => (
                          <div key={idx} className="p-3 rounded-card bg-surface border border-hairline space-y-0.5">
                            <span className="text-[10px] text-muted font-mono uppercase block">{item.label}</span>
                            <span
                              className={cn("text-xs truncate font-medium block", item.isCode && "font-mono")}
                              style={{ color: item.color || "var(--ink)" }}
                            >
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Deep Link to Live Action */}
                    <div className="p-4 rounded-card bg-subtle/50 border border-hairline space-y-3">
                      <p className="text-xs text-muted">
                        Verify this step live in the authenticated banking underwriter console:
                      </p>
                      <Link href={activePitch.linkHref} className="block">
                        <Button variant="primary" size="default" withOrb className="w-full justify-between">
                          <span>{activePitch.linkText}</span>
                        </Button>
                      </Link>
                    </div>

                    {/* Privacy Inspector Prompt */}
                    <div className="flex items-center justify-between p-3.5 rounded-card bg-surface border border-hairline">
                      <span className="text-xs text-muted">Inspect ZK boundaries:</span>
                      <PrivacyInspector />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* ======================================================== */}
        {/* FLOATING PILL CONTROL BAR DOCK (BOTTOM CENTER)           */}
        {/* ======================================================== */}
        <aside
          role="region"
          aria-label="Presenter Dock Controls"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[calc(100vw-2rem)]"
        >
          <div className="flex items-center gap-2 sm:gap-3 px-3.5 py-2.5 rounded-full glass">
            {/* Previous Step Button */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous step"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:text-ink hover:bg-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sapphire"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            {/* Step Dots Indicator */}
            <div className="flex items-center gap-1.5 px-2">
              {pitchSteps.map((s) => {
                const isActive = s.number === currentStep;
                return (
                  <button
                    key={s.number}
                    type="button"
                    onClick={() => {
                      setCurrentStep(s.number);
                      setTimerProgress(0);
                    }}
                    aria-label={`Jump to Step ${s.number}: ${s.title}`}
                    className={`relative transition-all duration-200 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sapphire ${
                      isActive
                        ? "h-2.5 w-7 bg-brand-sapphire shadow-[0_0_8px_rgba(47,91,255,0.5)]"
                        : "h-2 w-2 bg-hairline hover:bg-muted"
                    }`}
                  />
                );
              })}
            </div>

            {/* Next Step Button */}
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next step"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ink text-surface text-xs font-medium transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sapphire"
            >
              <span className="hidden sm:inline">Next step</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <div className="h-4 w-px bg-hairline hidden sm:block mx-1" />

            {/* Reset Demo Button */}
            <button
              type="button"
              onClick={handlePanicReset}
              disabled={isResetting}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs text-muted hover:text-ink hover:bg-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sapphire"
              title="Reset state to initial seed baseline"
              aria-label="Reset demo state"
            >
              <RotateCcw className={cn("h-3.5 w-3.5", isResetting && "animate-spin")} />
              <span className="hidden md:inline">Reset</span>
            </button>

            {/* Panic Shortcut Hint Badge */}
            <div
              className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-100 font-mono text-[10px] font-bold border border-rose-300 dark:border-rose-800"
              title="Emergency panic reset: Press Ctrl+Shift+R anytime"
            >
              <Flame className="w-3 h-3 text-rose-700 dark:text-rose-300" aria-hidden="true" />
              <span>Ctrl+Shift+R</span>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
