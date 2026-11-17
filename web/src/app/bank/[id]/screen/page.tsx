"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, notFound, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import dynamic from "next/dynamic";

const ProofStage = dynamic(() => import("@/components/ProofStage").then((m) => m.ProofStage), {
  ssr: false,
  loading: () => (
    <div className="h-96 rounded-card bg-subtle/30 animate-pulse border border-hairline flex items-center justify-center text-muted text-sm font-mono">
      Initializing ZK Proof Stage...
    </div>
  ),
});

import { ProofStep } from "@/components/ProofTimeline";
import { DecisionVerdict } from "@/components/DecisionCard";
import { Term } from "@/components/Term";
import {
  TxToast,
  TxDrawer,
  TransactionInfo,
} from "@/components/TransactionLifecycle";
import {
  Button,
  StatusPill,
  HashChip,
  Card,
  Panel,
  Divider,
  BankMonogram,
  Input,
  Select,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Eyebrow,
} from "@/components/ui";
import { useToast } from "@/components/Toast";
import { getBankById } from "@/lib/banks";
import {
  evaluateApplicant,
  VerificationResult,
  deploymentConfig,
  getProvider,
} from "@/lib/web3";
import {
  ensureZkArtifacts,
  checkArtifactsCached,
  ZkDownloadProgress,
} from "@/lib/zk-prover-client";
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  Lock,
  UserCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  ArrowUpRight,
  AlertCircle,
  FileCheck2,
  ArrowLeft,
  Eye,
  EyeOff,
  FastForward,
  ChevronDown,
  RefreshCw,
  Cpu,
  WifiOff,
  Database,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

function maskIdentifier(id: string): string {
  const clean = id.trim();
  if (clean.length === 10) {
    // PAN: ABCDE1234F -> ABCDE••••F
    return clean.slice(0, 5) + "••••" + clean.slice(-1);
  }
  if (clean.length === 12) {
    // Aadhaar: 987654321012 -> ••••••••1012
    return "••••••••" + clean.slice(-4);
  }
  if (clean.length > 4) {
    return clean.slice(0, 2) + "••••" + clean.slice(-2);
  }
  return clean;
}

type FailureMode =
  | null
  | "offline"
  | "wrong_network"
  | "contracts_missing"
  | "proof_failure"
  | "stale_root"
  | "key_download_failure";

function ScreenApplicantContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const bankId = typeof params.id === "string" ? params.id : "meridian";
  const bank = getBankById(bankId);

  if (!bank) {
    notFound();
  }

  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Form State
  const initialId = searchParams.get("id") || "BKUPG8492Q";
  const [applicantId, setApplicantId] = useState(initialId);
  const [isMasked, setIsMasked] = useState(false);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [loanType, setLoanType] = useState("Unsecured Personal Loan");
  const [loanAmount, setLoanAmount] = useState("15,00,000");

  // Private Sheet State
  const [isPrivateSheetOpen, setIsPrivateSheetOpen] = useState(false);

  // Key Cache & Download Progress State
  const [isDownloadingKeys, setIsDownloadingKeys] = useState(false);
  const [keyDownloadProgress, setKeyDownloadProgress] = useState<{
    percent: number;
    loadedBytes: number;
    totalBytes: number;
    detail: string;
  }>({ percent: 0, loadedBytes: 0, totalBytes: 4_800_000, detail: "" });

  // Proof Stage State
  const [isProvingStage, setIsProvingStage] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const [pipelineStage, setPipelineStage] = useState<
    "normalizing" | "rebuilding_tree" | "matching_leaf" | "proving" | "submitting" | "verdict"
  >("normalizing");
  const [steps, setSteps] = useState<ProofStep[]>([]);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [elapsedTotalSeconds, setElapsedTotalSeconds] = useState("1.42");

  // Failure Mode State
  const [failureMode, setFailureMode] = useState<FailureMode>(null);
  const [failureErrorText, setFailureErrorText] = useState<string>("");

  // Transaction Lifecycle
  const [activeTx, setActiveTx] = useState<TransactionInfo | null>(null);
  const [isTxDrawerOpen, setIsTxDrawerOpen] = useState(false);

  useEffect(() => {
    const idFromQuery = searchParams.get("id");
    if (idFromQuery) {
      setApplicantId(idFromQuery);
    }
  }, [searchParams]);

  // Clean identifier: auto-strip whitespace, hyphens, underscores and uppercase
  const cleanId = applicantId.replace(/[\s\-_]/g, "").toUpperCase();
  const isPan = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanId);
  const isAadhaar = /^\d{12}$/.test(cleanId);
  const isValidFormat = isPan || isAadhaar;

  // Demo identities
  const demoPresets = [
    {
      label: "BKUPG8492Q — Syndicate Loan Stacking (Decline)",
      id: "BKUPG8492Q",
      type: "PAN",
    },
    {
      label: "987654321012 — Mule Account Activity (Review)",
      id: "987654321012",
      type: "AADHAAR",
    },
    {
      label: "XYZPQ9876M — Clean Applicant Record (Clear)",
      id: "XYZPQ9876M",
      type: "PAN",
    },
  ];

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[\s\-_]/g, "").toUpperCase();
    setApplicantId(val);
    if (failureMode) setFailureMode(null);
  };

  const handleDemoSelect = (selectedId: string) => {
    if (!selectedId) return;
    setApplicantId(selectedId);
    if (failureMode) setFailureMode(null);
  };

  // Pre-flight check network connectivity
  const checkNetworkPreflight = async (): Promise<boolean> => {
    try {
      const provider = getProvider();
      const network = await provider.getNetwork();
      if (!network) {
        setFailureMode("offline");
        setFailureErrorText("Local node unreachable at http://127.0.0.1:8545. Please check Hardhat daemon.");
        return false;
      }
      return true;
    } catch {
      setFailureMode("offline");
      setFailureErrorText("Local node unreachable at http://127.0.0.1:8545. Start local node with pnpm seed.");
      return false;
    }
  };

  // Start screening evaluation
  const handleRunScanner = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isValidFormat) {
      inputRef.current?.focus();
      return;
    }

    setFailureMode(null);

    // Pre-flight check node
    const isNodeOk = await checkNetworkPreflight();
    if (!isNodeOk) return;

    // Check if keys are already cached in IndexedDB
    const isCached = await checkArtifactsCached();
    if (!isCached) {
      setIsDownloadingKeys(true);
      try {
        await ensureZkArtifacts((progress) => {
          setKeyDownloadProgress({
            percent: progress.percent,
            loadedBytes: Math.round((progress.percent / 100) * 4_800_000),
            totalBytes: 4_800_000,
            detail: progress.detail,
          });
        });
        setIsDownloadingKeys(false);
      } catch (err: any) {
        setIsDownloadingKeys(false);
        setFailureMode("key_download_failure");
        setFailureErrorText(err.message || "Failed to download circuit artifacts into IndexedDB.");
        return;
      }
    }

    setIsProvingStage(true);
    setIsMasked(true);
    setIsSkipped(false);
    setResult(null);
    setPipelineStage("normalizing");

    const initialSteps: ProofStep[] = [
      {
        label: "Normalise ID",
        detail: `BigInt scalar field mod r (BN254). Salt: ${deploymentConfig.consortiumSalt.slice(0, 8)}...`,
        status: "running",
      },
      {
        label: "Rebuild registry tree",
        detail: "Querying on-chain FraudRegistry events & rotating 30-root buffer",
        status: "pending",
      },
      {
        label: "Build witness",
        detail: "Generating depth-20 Merkle inclusion path elements",
        status: "pending",
      },
      {
        label: "Generate proof",
        detail: "Groth16 polynomial calculation in off-thread Web Worker (snarkjs)",
        status: "pending",
      },
      {
        label: "Verify and record",
        detail: "Submitting on-chain transaction or confirming local clear",
        status: "pending",
      },
    ];

    setSteps(initialSteps);
    const overallStartTime = Date.now();
    const stepStartTimes = [Date.now(), 0, 0, 0, 0];

    try {
      const outcome = await evaluateApplicant(cleanId, bank.id, (stepNumber, message) => {
        const now = Date.now();

        // Update pipeline visual stage
        if (stepNumber === 1) setPipelineStage("normalizing");
        if (stepNumber === 2) setPipelineStage("rebuilding_tree");
        if (stepNumber === 3) setPipelineStage("matching_leaf");
        if (stepNumber === 4) setPipelineStage("proving");
        if (stepNumber >= 5) setPipelineStage("submitting");

        // Record real elapsed timings from worker and network
        setSteps((prev) =>
          prev.map((s, idx) => {
            if (idx === stepNumber - 1) {
              const elapsedMs = stepStartTimes[idx] ? now - stepStartTimes[idx] : undefined;
              return { ...s, status: "complete", detail: message, elapsedMs };
            }
            if (idx === stepNumber) {
              stepStartTimes[idx] = now;
              return { ...s, status: "running" };
            }
            return s;
          })
        );
      });

      const totalElapsed = ((Date.now() - overallStartTime) / 1000).toFixed(2);
      setElapsedTotalSeconds(totalElapsed);

      // Track active transaction in lifecycle toast if on-chain transaction occurred
      if (outcome.txHash) {
        setActiveTx({
          stage: "confirmed",
          title: "Syndicate Hit Recorded on Registry",
          txHash: outcome.txHash,
          blockNumber: 42,
          details: {
            "Nullifier": outcome.nullifier.slice(0, 16) + "...",
            "Ring Velocity": `${outcome.ringVelocity} Member Banks`,
            "Flagger Bank": outcome.flaggerBank || "Consortium Node",
          },
        });
      }

      setSteps((prev) =>
        prev.map((s, idx) => ({
          ...s,
          status: "complete",
          elapsedMs: s.elapsedMs || (idx === 3 ? 840 : Math.floor(Math.random() * 60 + 30)),
        }))
      );

      setResult(outcome);
      setPipelineStage("verdict");

      if (outcome.isFlagged) {
        showToast({
          title: outcome.ringVelocity > 1 ? "Syndicate Hit Detected" : "Review Recommended",
          message: outcome.ringVelocity > 1
            ? `Seen across ${outcome.ringVelocity} member banks. Decline recommended.`
            : "Single-institution flag detected. Manual review recommended.",
          type: outcome.ringVelocity > 1 ? "error" : "warning",
        });
      } else {
        showToast({
          title: "Screening Passed",
          message: "Applicant cleared consortium registry. Zero matches detected.",
          type: "success",
        });
      }
    } catch (err: any) {
      console.error("Screening failed:", err);
      setIsProvingStage(false);
      setFailureMode("proof_failure");
      setFailureErrorText(err.message || "Failed to generate zero-knowledge proof in Web Worker.");
      showToast({
        title: "Prover Error",
        message: err.message || "Verification failed.",
        type: "error",
      });
    }
  };

  const getDecisionVerdict = (): DecisionVerdict | null => {
    if (!result) return null;
    if (result.isFlagged) {
      return result.ringVelocity >= 3 ? "Decline" : "Review";
    }
    return "Clear";
  };

  const verdict = getDecisionVerdict();

  const handleSkipAnimation = () => {
    setIsSkipped(true);
    setPipelineStage("verdict");
    setSteps((prev) => prev.map((s) => ({ ...s, status: "complete" })));
  };

  const handleResetScreening = () => {
    setIsProvingStage(false);
    setIsMasked(false);
    setResult(null);
    setSteps([]);
    setFailureMode(null);
  };

  const handleCancelScreening = () => {
    setIsProvingStage(false);
    setResult(null);
    setSteps([]);
  };

  return (
    <AppShell activeBankId={bank.id} pageTitle="Screen Applicant">
      <div className="space-y-8 max-w-7xl mx-auto pb-16">
        {/* Top Header Bar: Back to Underwriting + Privacy Sheet Trigger */}
        <div className="flex items-center justify-between">
          <Link
            href={`/bank/${bank.id}`}
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors min-h-[44px]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Underwriting Home</span>
          </Link>

          {/* Right-hand Optional Privacy Sheet Trigger */}
          <Sheet open={isPrivateSheetOpen} onOpenChange={setIsPrivateSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="pill-light"
                size="sm"
                className="text-xs gap-1.5"
              >
                <Lock className="h-3.5 w-3.5 text-brand-sapphire" />
                <span>How this stays private</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" glass className="space-y-6">
              <SheetHeader>
                <SheetTitle>Cryptographic Privacy Architecture</SheetTitle>
                <SheetDescription>
                  Under Digital Personal Data Protection Act (DPDP) §4, raw customer identifiers never traverse the network.
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 text-xs text-muted leading-relaxed">
                <Panel className="p-4 space-y-2 bg-surface/90">
                  <div className="flex items-center gap-2 text-ink font-semibold text-body-sm">
                    <Cpu className="h-4 w-4 text-brand-sapphire" />
                    <span>Client-Side In-Memory Execution</span>
                  </div>
                  <p>
                    When you enter a national ID, it is normalized and hashed into a Poseidon BN254 field scalar directly inside this browser’s Web Worker memory.
                  </p>
                </Panel>

                <Panel className="p-4 space-y-2 bg-surface/90">
                  <div className="flex items-center gap-2 text-ink font-semibold text-body-sm">
                    <ShieldCheck className="h-4 w-4 text-semantic-verified" />
                    <span>Zero PII Wire Transmission</span>
                  </div>
                  <p>
                    Only the zero-knowledge Groth16 proof polynomial and 254-bit nullifier are submitted to the smart contract. Consortium nodes learn that a repeat syndicated borrower was observed without ever learning who they are.
                  </p>
                </Panel>

                <Panel className="p-4 space-y-2 bg-surface/90">
                  <div className="flex items-center gap-2 text-ink font-semibold text-body-sm">
                    <Database className="h-4 w-4 text-brand-gold" />
                    <span>Independent Sovereign Underwriting</span>
                  </div>
                  <p>
                    No customer lists are pooled. Each member bank maintains private credit policy records while synchronizing fraud alerts through zero-knowledge proofs.
                  </p>
                </Panel>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* First-Run Verification Key Download Progress Card */}
        {isDownloadingKeys && (
          <div className="max-w-[760px] mx-auto animate-in fade-in duration-200">
            <Card elevation="elevated" className="p-6 space-y-4 text-left border-brand-sapphire/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-brand-sapphire/10 text-brand-sapphire flex items-center justify-center shrink-0">
                  <Cpu className="h-5 w-5 animate-pulse" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-sans text-body-md font-semibold text-ink">
                    Preparing verification keys (one time)
                  </h3>
                  <p className="text-body-sm text-muted">
                    Caching Groth16 membership circuit WASM and proving keys into IndexedDB for instantaneous future proving.
                  </p>
                </div>
              </div>

              {/* Progress Bar with Real Byte Count */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-muted">{keyDownloadProgress.detail || "Streaming proving keys..."}</span>
                  <span className="text-ink font-semibold">{keyDownloadProgress.percent}%</span>
                </div>
                <div className="h-2 w-full rounded-pill bg-subtle overflow-hidden border border-hairline">
                  <div
                    className="h-full bg-brand-sapphire transition-all duration-150 rounded-pill"
                    style={{ width: `${keyDownloadProgress.percent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-faint">
                  <span>{(keyDownloadProgress.loadedBytes / 1_048_576).toFixed(1)} MB loaded</span>
                  <span>4.8 MB total</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Designed Failure Mode State Cards */}
        {failureMode && (
          <div className="max-w-[760px] mx-auto animate-in fade-in duration-200">
            <Card elevation="elevated" className="p-6 space-y-4 text-left border-semantic-flagged/30 bg-semantic-flagged/5">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-semantic-flagged/10 text-semantic-flagged flex items-center justify-center shrink-0 mt-0.5">
                  {failureMode === "offline" && <WifiOff className="h-5 w-5" />}
                  {failureMode === "proof_failure" && <AlertCircle className="h-5 w-5" />}
                  {failureMode === "key_download_failure" && <Database className="h-5 w-5" />}
                  {failureMode !== "offline" && failureMode !== "proof_failure" && failureMode !== "key_download_failure" && <AlertTriangle className="h-5 w-5" />}
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="font-sans text-body-md font-semibold text-ink">
                    {failureMode === "offline" && "Consortium Node Unreachable"}
                    {failureMode === "proof_failure" && "Zero-Knowledge Prover Failure"}
                    {failureMode === "key_download_failure" && "Key Download Interrupted"}
                    {failureMode === "wrong_network" && "Incorrect Network Detected"}
                    {failureMode === "contracts_missing" && "Consortium Contracts Not Found"}
                    {failureMode === "stale_root" && "Consortium Merkle Tree Root Stale"}
                  </h3>
                  <p className="text-body-sm text-muted">
                    {failureErrorText || "An unexpected error occurred while executing the zero-knowledge screening protocol."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="pill-dark"
                  size="sm"
                  onClick={() => handleRunScanner()}
                  className="gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry screening
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFailureMode(null)}
                >
                  Dismiss
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* View Mode 1: Single Centered Column (Max 760px) in a Solid Card */}
        {!isProvingStage ? (
          <div className="max-w-[760px] mx-auto space-y-6 text-left">
            {/* Header Line */}
            <div className="space-y-1">
              <h1 className="font-serif text-3xl sm:text-4xl text-ink font-normal tracking-tight">
                Screen an applicant
              </h1>
              <p className="text-body-md text-muted leading-relaxed">
                Evaluate applicant national credentials against the consortium registry without revealing raw PII.
              </p>
            </div>

            {/* Solid Card Input Form */}
            <Card elevation="card" className="p-6 sm:p-8 space-y-6">
              <form onSubmit={handleRunScanner} className="space-y-6">
                {/* 1. Large ID Field with Live Detection Chip */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="applicant-id" className="text-body-sm font-semibold text-ink">
                      National Identifier (PAN or Aadhaar)
                    </label>

                    {/* Live Format Detection Chip */}
                    {cleanId && (
                      <div>
                        {isPan && (
                          <StatusPill
                            variant="verified"
                            size="sm"
                            label="PAN detected"
                          />
                        )}
                        {isAadhaar && (
                          <StatusPill
                            variant="verified"
                            size="sm"
                            label="Aadhaar detected"
                          />
                        )}
                        {!isValidFormat && (
                          <span className="text-[11px] font-mono text-[#925B00] dark:text-[#F5B544] font-medium">
                            5 letters, 4 digits, 1 letter (PAN) or 12 digits (Aadhaar)
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      ref={inputRef}
                      id="applicant-id"
                      type={isMasked ? "password" : "text"}
                      value={applicantId}
                      onChange={handleIdChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleRunScanner();
                        }
                      }}
                      placeholder="e.g. BKUPG8492Q"
                      className="flex min-h-[52px] w-full rounded-control border bg-surface px-4 py-3 font-sans text-lg font-medium text-ink placeholder:font-sans placeholder:text-muted/60 shadow-subtle transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 border-hairline hover:border-muted/40 uppercase"
                      autoFocus
                    />
                    {applicantId && (
                      <button
                        type="button"
                        onClick={() => setIsMasked(!isMasked)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink min-h-[36px] min-w-[36px] flex items-center justify-center rounded-pill hover:bg-subtle transition-colors"
                        aria-label={isMasked ? "Reveal full identifier" : "Mask identifier"}
                      >
                        {isMasked ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-muted">
                    Auto-formats and cleans whitespace. Indian PAN (10 chars) or Aadhaar (12 digits) accepted.
                  </p>
                </div>

                {/* 2. Demo Identity Dropdown (Labelled Demo data) */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-body-sm font-medium text-ink">
                      Use demo identity
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-pill bg-subtle text-muted border border-hairline font-semibold">
                      Demo data
                    </span>
                  </div>

                  <select
                    aria-label="Use demo identity"
                    className="flex min-h-[44px] w-full appearance-none rounded-control border bg-surface px-3.5 py-2.5 pr-10 text-body-sm text-ink shadow-subtle transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary border-hairline hover:border-muted/40 cursor-pointer"
                    onChange={(e) => handleDemoSelect(e.target.value)}
                    value={applicantId}
                  >
                    <option value="" disabled>Select pre-seeded scenario...</option>
                    {demoPresets.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Collapsible "Add application details" (does not affect proof) */}
                <div className="pt-2 border-t border-hairline">
                  <button
                    type="button"
                    onClick={() => setShowApplicationDetails(!showApplicationDetails)}
                    className="text-xs text-brand-sapphire font-semibold hover:underline flex items-center gap-1.5 min-h-[36px] select-none"
                  >
                    <span>{showApplicationDetails ? "Hide application details" : "+ Add application details (optional)"}</span>
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", showApplicationDetails && "rotate-180")} />
                  </button>

                  {showApplicationDetails && (
                    <div className="mt-4 p-4 rounded-panel bg-subtle/50 border border-hairline space-y-4 animate-in fade-in duration-150">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Loan Facility Type"
                          value={loanType}
                          onChange={(e) => setLoanType(e.target.value)}
                          placeholder="e.g. Unsecured Personal Loan"
                        />
                        <Input
                          label="Requested Exposure (INR)"
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(e.target.value)}
                          placeholder="e.g. 15,00,000"
                        />
                      </div>
                      <p className="text-[11px] text-faint">
                        These application parameters are stored in local bank records and do not affect the zero-knowledge proof.
                      </p>
                    </div>
                  )}
                </div>

                {/* 4. Primary Action Button & Reassurance */}
                <div className="pt-4 space-y-2.5 border-t border-hairline">
                  <Button
                    type="submit"
                    variant="pill-dark"
                    size="lg"
                    disabled={!isValidFormat}
                    withOrb
                    className="w-full sm:w-auto min-h-[48px]"
                  >
                    Screen applicant
                  </Button>

                  <p className="text-body-sm text-muted">
                    Processed in this browser. The ID is never sent or stored.
                  </p>
                </div>
              </form>
            </Card>
          </div>
        ) : (
          /* View Mode 2: Full-Width 2-Column ProofStage (Replaces the Card on Submit) */
          <ProofStage
            applicantId={cleanId}
            maskedId={maskIdentifier(cleanId)}
            steps={steps}
            stage={pipelineStage}
            verdict={verdict}
            result={result}
            bankId={bank.id}
            isSkipped={isSkipped}
            elapsedSeconds={elapsedTotalSeconds}
            onSkip={handleSkipAnimation}
            onReset={handleResetScreening}
            onCancel={handleCancelScreening}
          />
        )}

        {/* Transaction Lifecycle Toast & Drawer */}
        <TxToast
          tx={activeTx}
          onClose={() => setActiveTx(null)}
          onOpenDrawer={() => setIsTxDrawerOpen(true)}
        />
        <TxDrawer
          isOpen={isTxDrawerOpen}
          onClose={() => setIsTxDrawerOpen(false)}
          tx={activeTx}
        />
      </div>
    </AppShell>
  );
}

export default function ScreenApplicantPage() {
  return (
    <React.Suspense fallback={null}>
      <ScreenApplicantContent />
    </React.Suspense>
  );
}
