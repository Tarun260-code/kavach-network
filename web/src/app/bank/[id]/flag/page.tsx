"use client";

import React, { useState, useEffect } from "react";
import { notFound, useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import {
  HashChip,
  Card,
  Button,
  Label,
  Input,
} from "@/components/ui";
import { useToast } from "@/components/Toast";
import { useRegistryEvents } from "@/hooks/useRegistryEvents";
import { getBankById } from "@/lib/banks";
import { validateId, normaliseId, computeLeaf } from "@kavach/prover";
import {
  getBankSigner,
  getFraudRegistryContract,
  decodeContractError,
} from "@/lib/web3";
import { getNetworkMode } from "@/lib/dataProvider";
import { ConfirmIrreversibleDialog } from "@/components/ConfirmIrreversibleDialog";
import {
  TxToast,
  TxDrawer,
  TransactionInfo,
} from "@/components/TransactionLifecycle";
import { deploymentConfig } from "@/lib/deploymentConfig";
import {
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  ExternalLink,
  Shield,
  Layers,
  Clock,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnChainPayloadSummary {
  leaf: string;
  txHash: string;
  blockNumber: number;
  gasUsed: string;
}

const CATEGORIES = [
  { id: 2, name: "Loan Stacking", description: "Multi-lender credit line stacking in 24h" },
  { id: 0, name: "Synthetic ID", description: "Fictitious PAN / Aadhaar identity theft" },
  { id: 1, name: "Mule Account", description: "Rapid layering and money mule funneling" },
  { id: 3, name: "Doc Forgery", description: "Altered income proof / salary certificates" },
];

const DEMO_IDENTITIES = [
  { id: "BKUPG8492Q", category: 2, label: "BKUPG8492Q — Multi-Lender Loan Stacking" },
  { id: "KRNPA1092F", category: 0, label: "KRNPA1092F — Synthetic Identity Theft" },
  { id: "749281039481", category: 1, label: "749281039481 — Mule Account Funneling" },
  { id: "TAMPR8821D", category: 3, label: "TAMPR8821D — Document Forgery" },
];

export default function FlagIdentityPage() {
  const params = useParams();
  const bankId = (params?.id as string) || "aurum";
  const bank = getBankById(bankId);

  if (!bank) {
    notFound();
  }

  const { showToast } = useToast();
  const { refresh } = useRegistryEvents(bank.address);

  const [inputId, setInputId] = useState("");
  const [selectedDemoKey, setSelectedDemoKey] = useState("");
  const [category, setCategory] = useState<number>(2);
  const [ttlDays, setTtlDays] = useState(30);
  const [txState, setTxState] = useState<"idle" | "hashing" | "pending" | "confirmed" | "failed">("idle");
  const [txErrorMessage, setTxErrorMessage] = useState<string>("");
  const [computedLeafPreview, setComputedLeafPreview] = useState<string>("");
  const [lastOnChainPayload, setLastOnChainPayload] = useState<OnChainPayloadSummary | null>(null);

  // Irreversible Action Confirmation & Lifecycle State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [activeTx, setActiveTx] = useState<TransactionInfo | null>(null);
  const [isTxDrawerOpen, setIsTxDrawerOpen] = useState(false);

  // Update in-browser hash preview on typing
  useEffect(() => {
    let active = true;
    const updatePreview = async () => {
      const val = validateId(inputId);
      if (val.valid) {
        try {
          const norm = normaliseId(val.normalizedId);
          const leaf = await computeLeaf(norm, BigInt(deploymentConfig.consortiumSalt));
          if (active) {
            setComputedLeafPreview("0x" + leaf.toString(16).padStart(64, "0"));
          }
        } catch {
          if (active) setComputedLeafPreview("");
        }
      } else {
        if (active) setComputedLeafPreview("");
      }
    };

    updatePreview();
    return () => {
      active = false;
    };
  }, [inputId]);

  const validation = validateId(inputId);

  const handleSelectDemo = (id: string) => {
    setSelectedDemoKey(id);
    if (!id) {
      setInputId("");
      return;
    }
    const found = DEMO_IDENTITIES.find((d) => d.id === id);
    if (found) {
      setInputId(found.id);
      setCategory(found.category);
    }
  };

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setInputId(val);
    setSelectedDemoKey("");
  };

  const executeFlagging = async () => {
    setIsConfirmOpen(false);

    try {
      setTxState("hashing");
      setTxErrorMessage("");
      setActiveTx({
        stage: "preparing",
        title: "Computing Poseidon BN254 Commitment",
      });

      const norm = normaliseId(validation.normalizedId);
      const leafBig = await computeLeaf(norm, BigInt(deploymentConfig.consortiumSalt));
      const leafHex = "0x" + leafBig.toString(16).padStart(64, "0");

      setActiveTx({
        stage: "awaiting_signature",
        title: "Awaiting Bank Key Authorization",
        details: {
          "Collateral Stake": "0.05 ETH",
          "Validity TTL": `${ttlDays} Days`,
          "Leaf Hash": leafHex.slice(0, 16) + "...",
        },
      });

      setTxState("pending");
      const signer = getBankSigner(bank.id);
      const registry = getFraudRegistryContract(signer);

      const tx = await registry.flagIdentity(leafHex, category, BigInt(ttlDays), {
        value: BigInt(deploymentConfig.flagStake),
      });

      setActiveTx({
        stage: "pending",
        title: "Anchoring Flag in Consortium Registry",
        txHash: tx.hash,
        startTime: Date.now(),
        details: {
          "Collateral Stake": "0.05 ETH",
          "Signer Node": bank.name,
        },
      });

      const receipt = await tx.wait();
      const payload: OnChainPayloadSummary = {
        leaf: leafHex,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed ? receipt.gasUsed.toString() : "92480",
      };
      setLastOnChainPayload(payload);

      setActiveTx({
        stage: "confirmed",
        title: "Fraud Commitment Anchored On-Chain",
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        details: {
          "Gas Consumed": payload.gasUsed,
          "Collateral Locked": "0.05 ETH (Escrow)",
          "Leaf Commitment": leafHex.slice(0, 16) + "...",
        },
      });

      setTxState("confirmed");
      refresh();

      showToast({
        title: "Fraud Commitment Anchored",
        message: `Leaf ${leafHex.slice(0, 10)}... anchored on-chain with 0.05 ETH collateral.`,
        type: "success",
      });

      setInputId("");
      setSelectedDemoKey("");
    } catch (err: any) {
      console.error("Flag identity error:", err);
      const decodedMsg = decodeContractError(err);
      setTxState("failed");
      setTxErrorMessage(decodedMsg);
      setActiveTx({
        stage: "failed",
        title: "Flagging Transaction Failed",
        error: decodedMsg,
        onRetry: () => executeFlagging(),
      });
      showToast({
        title: "Transaction Failed",
        message: decodedMsg,
        type: "error",
      });
    }
  };

  const networkMode = getNetworkMode();

  const handleSimulate = async () => {
    try {
      const norm = normaliseId(validation.normalizedId);
      const leafBig = await computeLeaf(norm, BigInt(deploymentConfig.consortiumSalt));
      const leafHex = "0x" + leafBig.toString(16).padStart(64, "0");

      const payload: OnChainPayloadSummary = {
        leaf: leafHex,
        txHash: "0xsimulated" + leafHex.slice(10, 26),
        blockNumber: 42,
        gasUsed: "92480 (Simulated)",
      };
      setLastOnChainPayload(payload);
      showToast({
        title: "Simulation, not saved",
        message: `In-memory Poseidon commitment leaf ${leafHex.slice(0, 10)}... generated for preview. No on-chain transaction recorded.`,
        type: "info",
      });
    } catch (err: any) {
      showToast({
        title: "Simulation Failed",
        message: err.message || "Failed to compute simulated commitment.",
        type: "error",
      });
    }
  };

  // Stepper state calculation
  const hasInput = inputId.length > 0;
  const isIdValid = validation.valid;
  const isLeafReady = Boolean(computedLeafPreview);

  return (
    <AppShell activeBankId={bank.id} pageTitle="Flag Identity">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Page Title & One Line Description (No Header Card, No Back Link) */}
        <div>
          <h1 className="font-sans font-semibold text-[28px] text-ink tracking-[-0.01em] leading-tight">
            Flag a confirmed fraudster
          </h1>
          <p className="text-body-sm text-muted mt-1 leading-relaxed">
            Commit a one-way identity hash with 0.05 ETH escrow collateral to the consortium registry without disclosing PII.
          </p>
        </div>

        {/* 2-Column Clean Form (7/5 Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Solid Card Form */}
          <Card className="lg:col-span-7 p-6 sm:p-7 bg-surface border border-hairline shadow-card space-y-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (validation.valid) setIsConfirmOpen(true);
              }}
              className="space-y-6"
            >
              {/* ID Input with Sans Placeholder & Inline Format Validation */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="applicant-id" className="text-xs font-medium text-ink">
                    Applicant National Identifier
                  </Label>
                  {hasInput && (
                    <span
                      className={cn(
                        "text-xs font-sans font-medium transition-colors",
                        isIdValid
                          ? "text-semantic-verified"
                          : "text-semantic-flagged"
                      )}
                    >
                      {isIdValid ? `✓ Valid ${validation.type}` : validation.error}
                    </span>
                  )}
                </div>
                <Input
                  id="applicant-id"
                  type="text"
                  placeholder="e.g. BKUPG8492Q (PAN) or 12-digit Aadhaar"
                  value={inputId}
                  onChange={handleIdChange}
                  className="font-sans text-sm min-h-[44px] placeholder:font-sans placeholder:text-muted/60"
                  autoFocus
                />
                <span className="text-[11px] text-muted mt-1.5 block">
                  Supported: Indian PAN (10 chars) or Aadhaar (12 digits).
                </span>
              </div>

              {/* Use Demo Identity Dropdown (Replaces 3 Chips) */}
              <div>
                <Label htmlFor="demo-identity-select" className="text-xs font-medium text-muted block mb-1.5">
                  Use demo identity (seeded test cases)
                </Label>
                <select
                  id="demo-identity-select"
                  value={selectedDemoKey}
                  onChange={(e) => handleSelectDemo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card bg-surface border border-hairline text-xs font-sans text-ink focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
                >
                  <option value="">Select a synthetic profile...</option>
                  {DEMO_IDENTITIES.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category as Segmented Control */}
              <div>
                <Label className="text-xs font-medium text-muted block mb-2">
                  Fraud Typology Category
                </Label>
                <div
                  className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-card bg-subtle/60 border border-hairline"
                  role="radiogroup"
                  aria-label="Fraud Typology Category"
                >
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setCategory(cat.id)}
                        className={cn(
                          "px-2.5 py-2 rounded-pill text-xs font-medium text-center transition-all min-h-[38px] flex items-center justify-center",
                          isSelected
                            ? "bg-surface text-ink font-semibold shadow-subtle border border-hairline"
                            : "text-muted hover:text-ink hover:bg-surface/50"
                        )}
                        title={cat.description}
                      >
                        <span className="truncate">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Expiry Slider with Day Label & Quick Presets (1 to 365 Days) */}
              <div>
                <div className="flex justify-between items-center mb-1.5 text-xs">
                  <Label htmlFor="ttl-slider" className="font-medium text-muted">
                    Consortium Blacklist Validity
                  </Label>
                  <span className="font-mono text-ink font-semibold text-xs">
                    {ttlDays} Days
                  </span>
                </div>
                <input
                  id="ttl-slider"
                  type="range"
                  min="1"
                  max="365"
                  step="1"
                  value={ttlDays}
                  onChange={(e) => setTtlDays(Math.max(1, Math.min(365, Number(e.target.value))))}
                  className="w-full h-1.5 bg-subtle rounded-pill appearance-none cursor-pointer accent-primary min-h-[32px]"
                />
                <div className="flex justify-between text-[11px] text-muted font-medium mt-1">
                  <span>1 Day (Min)</span>
                  <span>180 Days</span>
                  <span>365 Days (Max)</span>
                </div>
                {/* Standard Duration Presets */}
                <div className="flex items-center gap-1.5 pt-2">
                  <span className="text-[11px] text-muted mr-1">Presets:</span>
                  {[30, 45, 90, 180, 365].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTtlDays(preset)}
                      className={cn(
                        "text-[11px] font-mono px-2.5 py-0.5 rounded-pill border transition-colors",
                        ttlDays === preset
                          ? "bg-primary text-white border-primary font-medium"
                          : "bg-surface border-hairline text-muted hover:text-ink hover:bg-subtle"
                      )}
                    >
                      {preset}d
                    </button>
                  ))}
                </div>
              </div>

              {/* Collateral Row: Neutral Lock Pill (Never Red) */}
              <div className="p-3.5 rounded-card bg-subtle/40 border border-hairline flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-muted">
                  <Lock className="h-4 w-4 text-muted shrink-0" />
                  <span className="font-medium text-ink">Consortium Escrow Collateral</span>
                </div>
                <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-pill bg-surface border border-hairline text-ink shadow-subtle">
                  Collateral 0.05 ETH
                </span>
              </div>

              {/* Error Banner if Reverted */}
              {txState === "failed" && (
                <div className="p-3.5 rounded-card bg-semantic-flagged-wash border border-semantic-flagged text-xs text-semantic-flagged flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-semibold block">Commitment Reverted</span>
                    <p className="leading-relaxed">{txErrorMessage || "Execution reverted on-chain."}</p>
                  </div>
                </div>
              )}

              {/* Primary Action Button: "Review commitment" / "Run locally" */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  disabled={!validation.valid || txState === "pending" || txState === "hashing"}
                  onClick={() => setIsConfirmOpen(true)}
                  className="rounded-pill min-h-[44px] px-7 font-medium shadow-subtle"
                >
                  {txState === "hashing"
                    ? "Computing Poseidon hash in RAM..."
                    : txState === "pending"
                    ? "Anchoring on registry..."
                    : "Review commitment"}
                </Button>
                {networkMode === "replay" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    disabled={!validation.valid}
                    onClick={handleSimulate}
                    className="rounded-pill min-h-[44px] px-5 font-medium border-dashed border-amber-500/50 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
                    data-testid="preview-simulation-button"
                  >
                    Try preview (Simulation, not saved)
                  </Button>
                )}
              </div>
            </form>
          </Card>

          {/* Right Column (5 cols): Solid Card "What goes on-chain" */}
          <Card className="lg:col-span-5 p-6 sm:p-7 bg-surface border border-hairline shadow-card space-y-6">
            <div className="border-b border-hairline pb-4 flex items-center justify-between">
              <div>
                <h2 className="font-sans font-semibold text-[20px] text-ink tracking-[-0.01em]">
                  What goes on-chain
                </h2>
                <p className="text-body-sm text-muted mt-0.5">
                  ID stays in your browser.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-pill bg-semantic-verified-wash text-semantic-verified-text border border-semantic-verified/25 font-semibold">
                Zero PII
              </span>
            </div>

            {/* Stepper: Starts idle and advances only as user types */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-muted tracking-wider block uppercase">
                Cryptographic Pipeline
              </span>

              <div className="space-y-2.5">
                {/* Step 1: Normalization */}
                <div
                  className={cn(
                    "flex items-center gap-3 p-2.5 rounded-card border transition-all text-xs",
                    !hasInput
                      ? "bg-subtle/20 border-hairline text-muted"
                      : isIdValid
                      ? "bg-surface border-semantic-verified/40 text-ink"
                      : "bg-surface border-amber-500/40 text-ink"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-xs font-mono shrink-0",
                      !hasInput
                        ? "bg-subtle text-muted"
                        : isIdValid
                        ? "bg-semantic-verified text-white"
                        : "bg-amber-500 text-white"
                    )}
                  >
                    {!hasInput ? "1" : isIdValid ? <CheckCircle2 className="h-3.5 w-3.5" /> : "1"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-medium block">1. Normalization in RAM</span>
                    <span className="text-[11px] text-ink/75 truncate block">
                      {!hasInput
                        ? "Idle — awaiting applicant input"
                        : isIdValid
                        ? `Parsed as valid ${validation.type}`
                        : "Formatting identifier..."}
                    </span>
                  </div>
                </div>

                {/* Step 2: Poseidon2 RAM Hash */}
                <div
                  className={cn(
                    "flex items-center gap-3 p-2.5 rounded-card border transition-all text-xs",
                    !isIdValid
                      ? "bg-subtle/20 border-hairline text-muted"
                      : isLeafReady
                      ? "bg-surface border-primary/40 text-ink"
                      : "bg-surface border-hairline text-ink"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-xs font-mono shrink-0",
                      !isIdValid
                        ? "bg-subtle text-muted"
                        : isLeafReady
                        ? "bg-primary text-white"
                        : "bg-subtle text-ink"
                    )}
                  >
                    {!isLeafReady ? "2" : <CheckCircle2 className="h-3.5 w-3.5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-medium block">2. Poseidon2 RAM Commitment</span>
                    <span className="text-[11px] text-ink/75 truncate block">
                      {!isLeafReady
                        ? "Idle — salted with consortium key"
                        : "Computed 254-bit scalar leaf"}
                    </span>
                  </div>
                </div>

                {/* Step 3: Consortium Registry */}
                <div
                  className={cn(
                    "flex items-center gap-3 p-2.5 rounded-card border transition-all text-xs",
                    txState !== "confirmed"
                      ? "bg-subtle/20 border-hairline text-muted"
                      : "bg-surface border-semantic-verified/40 text-ink"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-xs font-mono shrink-0",
                      txState !== "confirmed"
                        ? "bg-subtle text-muted"
                        : "bg-semantic-verified text-white"
                    )}
                  >
                    {txState === "confirmed" ? <CheckCircle2 className="h-3.5 w-3.5" /> : "3"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-medium block">3. Consortium Registry Anchor</span>
                    <span className="text-[11px] text-ink/75 truncate block">
                      {txState === "confirmed"
                        ? "Anchored with 0.05 ETH collateral"
                        : "Pending review & broadcast"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Hash Inspection (Waiting for input skeleton or leaf HashChip) */}
            <div className="space-y-2 pt-2 border-t border-hairline">
              <span className="text-xs font-semibold text-muted tracking-wider block uppercase">
                On-Chain Commitment Payload
              </span>

              {!isLeafReady ? (
                /* Fake zero hashes replaced by a skeleton and "Waiting for input" */
                <div className="p-3.5 rounded-card bg-subtle/30 border border-hairline space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>Poseidon Commitment Leaf</span>
                    <span className="font-mono text-[11px] text-muted font-medium">Idle</span>
                  </div>
                  <div className="h-9 rounded bg-subtle/60 border border-dashed border-hairline flex items-center px-3 text-xs text-ink font-medium font-sans">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted mr-2" />
                    Waiting for input...
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-card bg-subtle/50 border border-hairline space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>Poseidon Commitment Leaf</span>
                    <span className="font-mono text-[10px] text-semantic-verified font-medium">Ready</span>
                  </div>
                  <HashChip hash={computedLeafPreview} label="Leaf" />
                </div>
              )}
            </div>

            {/* Last On-Chain Anchored Payload Summary */}
            {lastOnChainPayload && (
              <div className="p-3.5 rounded-card bg-semantic-verified-wash border border-semantic-verified/30 space-y-2 text-xs">
                <div className="flex items-center justify-between font-semibold text-semantic-verified">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{networkMode === "replay" ? "Simulated Commitment Preview" : "Successfully Anchored On-Chain"}</span>
                  </div>
                  {networkMode === "replay" && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-pill bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                      Simulation, not saved
                    </span>
                  )}
                </div>
                <div className="space-y-1 text-[11px] font-mono text-ink">
                  <div className="flex justify-between">
                    <span className="text-muted">Tx:</span>
                    <span>{lastOnChainPayload.txHash.slice(0, 14)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Block:</span>
                    <span>#{lastOnChainPayload.blockNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Gas:</span>
                    <span>{lastOnChainPayload.gasUsed}</span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Irreversible Action Confirmation Dialog (Plain Language Consequences) */}
        <ConfirmIrreversibleDialog
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={executeFlagging}
          isReplayMode={networkMode === "replay"}
          replayCommand="pnpm dev"
          onSimulate={handleSimulate}
          simulateLabel="Simulation, not saved"
          title="Review Fraud Commitment"
          description="You are anchoring an irreversible one-way commitment in the consortium fraud registry."
          consequences={[
            "Collateral locked: 0.05 ETH collateral will be deposited into smart contract escrow.",
            `Flag expires in ${ttlDays} days automatically unless renewed by your node.`,
            "Irreversible on-chain: The commitment leaf cannot be removed without an AppealDAO governance vote.",
            "ID stays in your browser: The cleartext PAN/Aadhaar never leaves local memory.",
          ]}
          confirmLabel="Confirm & broadcast commitment"
          isLoading={txState === "pending" || txState === "hashing"}
        />

        {/* In-Flight Transaction Toast & Drawer */}
        <TxToast
          tx={activeTx}
          onOpenDrawer={() => setIsTxDrawerOpen(true)}
          onClose={() => setActiveTx(null)}
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
