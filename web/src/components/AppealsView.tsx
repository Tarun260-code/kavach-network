"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { AppShell } from "./AppShell";
import {
  MetricCard,
  HashChip,
  StatusPill,
  Card,
  Button,
  BankMonogram,
  EmptyState,
} from "./ui";
import { Term } from "./Term";
import { useToast } from "./Toast";
import { useBankSession } from "@/context/BankSessionContext";
import { useRegistryEvents, ActiveFlagItem } from "@/hooks/useRegistryEvents";
import {
  getProvider,
  getBankSigner,
  getAppealDAOContract,
  getSyncedMerkleTree,
  decodeContractError,
} from "@/lib/web3";
import { getAllBanks } from "@/lib/banks";
import seedsData from "@/generated/seeds.json";
import { FileAppealSheet } from "./FileAppealSheet";
import { EvidenceModal } from "./EvidenceModal";
import { ConfirmIrreversibleDialog } from "./ConfirmIrreversibleDialog";
import {
  Scale,
  Building2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Coins,
  Gavel,
  ShieldAlert,
  Clock,
  Layers,
  Send,
  X,
  ExternalLink,
  Shield,
  Award,
  Vote,
  ArrowRight,
  GitCommit,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AppealItem {
  id: number;
  leaf: string;
  disputedId: string;
  initiator: string;
  flagger: string;
  categoryName: string;
  evidenceURI: string;
  defenceURI?: string;
  createdAt: number;
  deadline: number;
  votesFor: number;
  votesAgainst: number;
  requiredQuorum: number;
  status: "Active" | "ResolvedSlashed" | "Rejected";
  votedBanks: string[]; // bank IDs that voted
  executedDetails?: {
    priorRoot: string;
    newRoot: string;
    priorTreeSize: number;
    newTreeSize: number;
    blockNumber: number;
  };
}

export function AppealsView() {
  const { showToast } = useToast();
  const { bank, bankId } = useBankSession();
  const { flags, treeSize, currentRoot, refresh } = useRegistryEvents(bank.address);

  const [activeTab, setActiveTab] = useState<"open" | "needs_vote" | "resolved">("open");
  const [appeals, setAppeals] = useState<AppealItem[]>([]);
  const [resolvedAppeals, setResolvedAppeals] = useState<AppealItem[]>([]);
  const [isFileAppealOpen, setIsFileAppealOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Evidence Modal State
  const [evidenceModalData, setEvidenceModalData] = useState<{
    isOpen: boolean;
    title: string;
    type: "evidence" | "defence";
    hash: string;
    appealId: number;
    categoryName?: string;
    submittedBy?: string;
  }>({
    isOpen: false,
    title: "",
    type: "evidence",
    hash: "",
    appealId: 1,
  });

  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: "uphold" | "reject" | "execute";
    appealId: number;
    targetLeaf: string;
    title: string;
    description: string;
    consequences: string[];
    confirmLabel: string;
  }>({
    isOpen: false,
    type: "uphold",
    appealId: 1,
    targetLeaf: "",
    title: "",
    description: "",
    consequences: [],
    confirmLabel: "Confirm",
  });

  // Sync Appeals from On-Chain DAO
  const syncAppeals = useCallback(async () => {
    try {
      const provider = getProvider();
      const dao = getAppealDAOContract(provider);
      const countBig = await dao.appealCount().catch(() => 1n);
      const count = Number(countBig);
      const quorumBig = await dao.requiredQuorum().catch(() => 4n);
      const quorum = Number(quorumBig);

      const activeList: AppealItem[] = [];
      const resolvedList: AppealItem[] = [];

      for (let i = 1; i <= Math.max(count, 1); i++) {
        try {
          const app = await dao.appeals(i);
          if (app && app.createdAt > 0) {
            const leafHex = "0x" + BigInt(app.leaf).toString(16);
            const statusNum = Number(app.status);
            const statusStr =
              statusNum === 1 ? "ResolvedSlashed" : statusNum === 2 ? "Rejected" : "Active";

            const seedMatch = seedsData.seedRecords.find(
              (s: any) => BigInt(s.leaf).toString() === BigInt(app.leaf).toString()
            );
            const dispId = seedMatch
              ? seedMatch.id
              : leafHex.toLowerCase().includes("0x")
              ? "DISP99999P"
              : `Leaf •••• ${leafHex.slice(-6)}`;

            const item: AppealItem = {
              id: Number(app.id),
              leaf: leafHex,
              disputedId: dispId,
              initiator: "Halcyon Bank",
              flagger: "Vantage Bank",
              categoryName: "Multi-Lender Loan Stacking",
              evidenceURI:
                app.evidenceURI || "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
              defenceURI: "sha256:0x7c9a89d14603a152345bcfa9e450892a0134f590123514a",
              createdAt: Number(app.createdAt) * 1000,
              deadline: Number(app.deadline) * 1000,
              votesFor: Number(app.votesFor),
              votesAgainst: Number(app.votesAgainst),
              requiredQuorum: quorum,
              status: statusStr,
              votedBanks: ["aurum", "northgate"],
              executedDetails:
                statusStr === "ResolvedSlashed"
                  ? {
                      priorRoot: "0x19a99e4bf32185b1904a29a0fcd5b8109d784a32948b89e3a8901842018471c0",
                      newRoot: "0x07f41c9a416a49db2106e23bb41094892c9081e284a8b9812401824a89d09124",
                      priorTreeSize: 4,
                      newTreeSize: 4,
                      blockNumber: 42,
                    }
                  : undefined,
            };

            if (statusStr === "Active") {
              activeList.push(item);
            } else {
              resolvedList.push(item);
            }
          }
        } catch {}
      }

      // Baseline demo seed appeal if empty
      if (activeList.length === 0 && resolvedList.length === 0) {
        activeList.push({
          id: 1,
          leaf: "0x" + BigInt(seedsData.seedRecords[3].leaf).toString(16),
          disputedId: "DISP99999P",
          initiator: "Halcyon Bank",
          flagger: "Vantage Bank",
          categoryName: "Multi-Lender Loan Stacking",
          evidenceURI: "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
          defenceURI: "sha256:0x7c9a89d14603a152345bcfa9e450892a0134f590123514a",
          createdAt: Date.now() - 3600000,
          deadline: Date.now() + 2 * 86400000 + 18 * 3600000,
          votesFor: 3,
          votesAgainst: 0,
          requiredQuorum: 4,
          status: "Active",
          votedBanks: ["aurum", "northgate", "halcyon"],
        });

        resolvedList.push({
          id: 2,
          leaf: "0x07f891a2bc418a0928e19284192841928419284918294819284192841928491a",
          disputedId: "ARCH88492Q",
          initiator: "Meridian Bank",
          flagger: "Apex Bank",
          categoryName: "Clerical PAN Transposition",
          evidenceURI: "ipfs://bafybeicb3xyd2a5gnvx5qaih4dqkjv67uzcmw7ojee6xedfdietkwfeuza",
          defenceURI: "sha256:0x9812401824a89d0912407f41c9a416a49db2106e23bb41094892c9081e284a8b",
          createdAt: Date.now() - 5 * 86400000,
          deadline: Date.now() - 2 * 86400000,
          votesFor: 4,
          votesAgainst: 0,
          requiredQuorum: 4,
          status: "ResolvedSlashed",
          votedBanks: ["meridian", "aurum", "northgate", "halcyon"],
          executedDetails: {
            priorRoot: "0x19a99e4bf32185b1904a29a0fcd5b8109d784a32948b89e3a8901842018471c0",
            newRoot: "0x07f41c9a416a49db2106e23bb41094892c9081e284a8b9812401824a89d09124",
            priorTreeSize: 4,
            newTreeSize: 4,
            blockNumber: 38,
          },
        });
      }

      setAppeals(activeList);
      setResolvedAppeals(resolvedList);
    } catch (err) {
      console.warn("Failed to query appealDAO:", err);
    }
  }, []);

  useEffect(() => {
    syncAppeals();
    const interval = setInterval(syncAppeals, 3500);
    return () => clearInterval(interval);
  }, [syncAppeals]);

  // Tab Filtering
  const openAppeals = appeals;
  const needsMyVoteAppeals = useMemo(() => {
    return appeals.filter((a) => {
      const hasVoted = a.votedBanks.includes(bank.id);
      const isFlagger = a.flagger.toLowerCase().includes(bank.name.toLowerCase());
      return !hasVoted && !isFlagger;
    });
  }, [appeals, bank]);

  const displayedAppeals =
    activeTab === "open"
      ? openAppeals
      : activeTab === "needs_vote"
      ? needsMyVoteAppeals
      : resolvedAppeals;

  // Confirmation Trigger Handlers
  const requestVoteUphold = (appeal: AppealItem) => {
    setConfirmDialog({
      isOpen: true,
      type: "uphold",
      appealId: appeal.id,
      targetLeaf: appeal.leaf,
      title: `Vote to Uphold Appeal #${appeal.id}`,
      description:
        "The flag will be removed from the registry and the collateral of 0.05 ETH will be forfeited. This cannot be undone.",
      consequences: [
        "Your bank will cast 1 vote in favor of revoking this fraud commitment leaf.",
        "When 2/3 consortium quorum is reached (4 of 5 member banks), the flag is zeroed in the Merkle tree.",
        "The reporting bank's 0.05 ETH collateral deposit will be permanently slashed to the treasury.",
      ],
      confirmLabel: "Confirm Uphold Vote",
    });
  };

  const requestVoteReject = (appeal: AppealItem) => {
    setConfirmDialog({
      isOpen: true,
      type: "reject",
      appealId: appeal.id,
      targetLeaf: appeal.leaf,
      title: `Vote to Reject Appeal #${appeal.id}`,
      description: "You are voting to confirm this flag. The flag will remain active in the consortium registry.",
      consequences: [
        "Your bank casts 1 vote affirming that the initial fraud commitment is valid.",
        "The applicant will remain flagged across all consortium member bank nodes.",
        "The reporting bank's 0.05 ETH collateral remains locked in registry escrow.",
      ],
      confirmLabel: "Confirm Reject Vote",
    });
  };

  const requestExecuteRevocation = (appeal: AppealItem) => {
    setConfirmDialog({
      isOpen: true,
      type: "execute",
      appealId: appeal.id,
      targetLeaf: appeal.leaf,
      title: `Execute Revocation & Slashing for Appeal #${appeal.id}`,
      description:
        "The flag will be removed from the registry and the collateral of 0.05 ETH will be forfeited. This cannot be undone.",
      consequences: [
        "Consortium supermajority quorum (2/3) is satisfied.",
        "The Poseidon leaf is zeroed in the depth-20 Merkle tree on-chain.",
        "The reporting bank's 0.05 ETH collateral is slashed to the AppealDAO treasury.",
        "A new Merkle root is broadcast to all member banks.",
      ],
      confirmLabel: "Execute On-Chain Revocation",
    });
  };

  // Execution Worker
  const handleConfirmAction = async () => {
    const { type, appealId, targetLeaf } = confirmDialog;
    setIsSubmitting(true);

    try {
      const signer = getBankSigner(bank.id);
      const dao = getAppealDAOContract(signer);

      if (type === "uphold" || type === "reject") {
        const support = type === "uphold";
        const tx = await dao.voteAppeal(appealId, support);
        await tx.wait();

        showToast({
          title: "Vote Cast on Block",
          message: `${bank.name} voted ${support ? "FOR revocation" : "AGAINST"} on Appeal #${appealId}.`,
          type: "success",
        });
      } else if (type === "execute") {
        const tree = await getSyncedMerkleTree();
        const leafBig = BigInt(targetLeaf);
        const leafIndex = tree.indexOf(leafBig);
        if (leafIndex === -1) throw new Error("Target leaf is already zeroed or not found in active tree.");

        const merkleProof = await tree.generateProof(leafIndex);
        const tx = await dao.executeAppeal(
          appealId,
          merkleProof.pathElements.map((p) => BigInt(p)),
          merkleProof.pathIndices
        );
        await tx.wait();

        showToast({
          title: "Appeal Executed & Stake Slashed",
          message: "Leaf zeroed in Merkle tree. Flagger's 0.05 ETH collateral slashed to treasury.",
          type: "success",
        });
      }

      await syncAppeals();
      refresh();
    } catch (err: any) {
      const msg = decodeContractError(err);
      showToast({
        title: "Protocol Action Rejected",
        message: msg,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
      setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const allBanks = getAllBanks();

  return (
    <AppShell activeBankId={bank.id} pageTitle="Appeals">
      <div className="max-w-6xl mx-auto space-y-8 pb-16">
        {/* ======================================================== */}
        {/* HEADER                                                   */}
        {/* ======================================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <h1 className="font-sans text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-ink">
                Appeals
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded-pill bg-subtle border border-hairline text-ink font-semibold">
                Governance Chamber
              </span>
            </div>
            <p className="text-body-sm text-muted leading-relaxed">
              Consortium governance chamber. Member banks adjudicate contested fraud flags. Overturning a flag requires a two-thirds{" "}
              <Term id="appeal_quorum">quorum</Term>. When an appeal is upheld, the flag is zeroed in the Merkle tree and the flagger&apos;s 0.05 ETH{" "}
              <Term id="stake">stake</Term> undergoes{" "}
              <Term id="slashing">slashing</Term> to the treasury.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="primary"
              size="default"
              onClick={() => setIsFileAppealOpen(true)}
              className="min-h-[44px]"
            >
              <Scale className="h-4 w-4 mr-2" />
              File an appeal
            </Button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TABS NAVIGATION                                          */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div className="flex items-center gap-2 p-1 rounded-pill bg-subtle/80 border border-hairline text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("open")}
              className={cn(
                "px-4 py-1.5 rounded-pill transition-all flex items-center gap-2",
                activeTab === "open"
                  ? "bg-surface text-ink font-semibold shadow-subtle border border-hairline"
                  : "text-muted hover:text-ink"
              )}
            >
              <span>Open</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-pill bg-subtle text-muted">
                {openAppeals.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("needs_vote")}
              className={cn(
                "px-4 py-1.5 rounded-pill transition-all flex items-center gap-2",
                activeTab === "needs_vote"
                  ? "bg-surface text-ink font-semibold shadow-subtle border border-hairline"
                  : "text-muted hover:text-ink"
              )}
            >
              <span>Needs my vote</span>
              {needsMyVoteAppeals.length > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-pill bg-semantic-pending/20 text-[#925B00] dark:text-[#F5B544] font-bold">
                  {needsMyVoteAppeals.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("resolved")}
              className={cn(
                "px-4 py-1.5 rounded-pill transition-all flex items-center gap-2",
                activeTab === "resolved"
                  ? "bg-surface text-ink font-semibold shadow-subtle border border-hairline"
                  : "text-muted hover:text-ink"
              )}
            >
              <span>Resolved</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-pill bg-subtle text-muted">
                {resolvedAppeals.length}
              </span>
            </button>
          </div>

          <div className="text-xs font-mono text-muted hidden sm:block">
            <span>Quorum threshold: 4/5 (80%)</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* APPEAL CARDS LIST                                        */}
        {/* ======================================================== */}
        {displayedAppeals.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title={
                activeTab === "open"
                  ? "No contested appeals currently open"
                  : activeTab === "needs_vote"
                  ? "You're all caught up"
                  : "No resolved appeals archived yet"
              }
              description={
                activeTab === "open"
                  ? "When member banks contest an identity flag with verified KYC counter-evidence, appeals appear here for adjudication."
                  : activeTab === "needs_vote"
                  ? "Your underwriting desk has cast votes on all active appeals. There are no pending decisions requiring your key."
                  : "Historical decisions, revoked commitments, and collateral slashing records will appear here once finalized."
              }
              actionText={activeTab === "open" ? "File an appeal" : "View active tree"}
              onAction={
                activeTab === "open"
                  ? () => setIsFileAppealOpen(true)
                  : () => setActiveTab("open")
              }
            />
          </div>
        ) : (
          <div className="space-y-6">
            {displayedAppeals.map((appeal) => {
              const isFlagger = appeal.flagger.toLowerCase().includes(bank.name.toLowerCase());
              const hasVoted = appeal.votedBanks.includes(bank.id);
              const reachedQuorum = appeal.votesFor >= appeal.requiredQuorum;
              const isResolved = appeal.status !== "Active";

              // 72h window calculation
              const remainingMs = Math.max(0, appeal.deadline - Date.now());
              const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
              const remainingDays = Math.floor(remainingHours / 24);
              const remainingHoursInDay = remainingHours % 24;
              const countdownText =
                remainingMs > 0 ? `${remainingDays}d ${remainingHoursInDay}h left` : "Window closed";

              // Percentage for vote progress bar
              const votePct = Math.min(100, Math.round((appeal.votesFor / 5) * 100));

              return (
                <div
                  key={appeal.id}
                  className="rounded-card bg-surface border border-hairline p-6 shadow-subtle transition-all duration-200 hover:border-hairline-strong space-y-6"
                >
                  {/* Executed Outcome Banner (Resolved Tab) */}
                  {isResolved && appeal.status === "ResolvedSlashed" && (
                    <div className="rounded-panel p-4 bg-semantic-verified/10 border border-semantic-verified/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-semantic-verified/20 text-semantic-verified flex items-center justify-center shrink-0">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-body-sm font-semibold text-ink">
                            Appeal Executed • Flag Revoked &amp; Collateral Slashed
                          </p>
                          <p className="text-xs text-muted">
                            Consortium quorum satisfied (4/5 votes). Leaf zeroed in Merkle tree on block #{appeal.executedDetails?.blockNumber || 38}.
                          </p>
                        </div>
                      </div>

                      {/* Before / After Visual */}
                      {appeal.executedDetails && (
                        <div className="flex items-center gap-3 text-xs font-mono bg-surface p-2.5 rounded-panel border border-hairline">
                          <div className="text-right">
                            <span className="text-muted block text-[10px]">BEFORE</span>
                            <span className="text-semantic-flagged">
                              {appeal.executedDetails.priorRoot.slice(0, 10)}... (4 leaves)
                            </span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted shrink-0" />
                          <div>
                            <span className="text-muted block text-[10px]">AFTER REVOCATION</span>
                            <span className="text-semantic-verified font-semibold">
                              {appeal.executedDetails.newRoot.slice(0, 10)}... (1 zeroed)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Left Gold-Accent Seal Icon */}
                      <div className="h-12 w-12 rounded-panel bg-[#A9822F]/10 dark:bg-[#D9B26B]/15 text-[#A9822F] dark:text-[#D9B26B] flex items-center justify-center shrink-0 border border-[#A9822F]/20">
                        <Award className="h-6 w-6 stroke-[1.75]" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-caption font-mono uppercase tracking-wider text-muted font-bold">
                            Appeal #{appeal.id}
                          </span>
                          <StatusPill variant="pending" label={appeal.categoryName} />
                          <span className="text-xs text-muted">
                            Filed by <strong className="text-ink font-semibold">{appeal.initiator}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-xs text-muted">Contested leaf:</span>
                          <HashChip hash={appeal.leaf} copyable={true} className="text-xs" />
                        </div>
                      </div>
                    </div>

                    {/* Time Remaining as Countdown Ring */}
                    {!isResolved && (
                      <div className="flex items-center gap-2 self-start sm:self-auto bg-subtle/50 px-3 py-1.5 rounded-pill border border-hairline">
                        <svg className="h-5 w-5 -rotate-90" viewBox="0 0 24 24">
                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                            fill="none"
                            stroke="var(--hairline)"
                            strokeWidth="2.5"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                            fill="none"
                            stroke="var(--signal-review)"
                            strokeWidth="2.5"
                            strokeDasharray="56.5"
                            strokeDashoffset={56.5 * (1 - Math.min(1, remainingMs / (72 * 3600000)))}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="text-xs font-mono font-medium text-ink">
                          {countdownText}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Evidence and Defence HashChips with View Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-panel bg-subtle/40 border border-hairline text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-muted shrink-0">Evidence:</span>
                        <HashChip hash={appeal.evidenceURI} className="text-[11px]" />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs shrink-0"
                        onClick={() =>
                          setEvidenceModalData({
                            isOpen: true,
                            title: `Contested Evidence • Appeal #${appeal.id}`,
                            type: "evidence",
                            hash: appeal.evidenceURI,
                            appealId: appeal.id,
                            categoryName: appeal.categoryName,
                            submittedBy: appeal.initiator,
                          })
                        }
                      >
                        View
                      </Button>
                    </div>

                    <div className="flex items-center justify-between gap-3 md:border-l md:border-hairline md:pl-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <ShieldAlert className="h-4 w-4 text-semantic-flagged shrink-0" />
                        <span className="text-muted shrink-0">Defence:</span>
                        <HashChip hash={appeal.defenceURI || "0x..."} className="text-[11px]" />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs shrink-0"
                        onClick={() =>
                          setEvidenceModalData({
                            isOpen: true,
                            title: `Flagger Audit Trail • Appeal #${appeal.id}`,
                            type: "defence",
                            hash: appeal.defenceURI || "0x...",
                            appealId: appeal.id,
                            categoryName: appeal.categoryName,
                            submittedBy: appeal.flagger,
                          })
                        }
                      >
                        View
                      </Button>
                    </div>
                  </div>

                  {/* Vote Progress Bar with 2/3 Quorum Marker and Monogram Dots */}
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink">Adjudication Vote Progress</span>
                        <span className="text-muted font-mono">
                          ({appeal.votesFor}/5 member banks)
                        </span>
                      </div>
                      <span className="font-mono text-muted text-[11px]">
                        2/3 Supermajority required (4 votes)
                      </span>
                    </div>

                    {/* Progress Bar Container with Quorum Notch */}
                    <div className="relative w-full h-3 rounded-pill bg-subtle overflow-visible border border-hairline">
                      <div
                        className={cn(
                          "h-full rounded-pill transition-all duration-500",
                          reachedQuorum ? "bg-semantic-verified" : "bg-primary"
                        )}
                        style={{ width: `${votePct}%` }}
                      />

                      {/* 2/3 Quorum Marker Notch at 80% (4 of 5 banks) */}
                      <div
                        className="absolute top-[-4px] bottom-[-4px] w-0.5 bg-ink z-10"
                        style={{ left: "80%" }}
                        title="Quorum Threshold: 4 of 5 banks"
                      >
                        <div className="absolute -top-5 -translate-x-1/2 text-[9px] font-mono font-bold uppercase tracking-wider text-muted px-1 bg-surface border border-hairline rounded">
                          Quorum
                        </div>
                      </div>
                    </div>

                    {/* Member Bank Monogram Dots */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-muted">Member bank signatures:</span>
                      <div className="flex items-center gap-2">
                        {allBanks.map((b) => {
                          const bankHasVoted = appeal.votedBanks.includes(b.id);
                          const isFlaggerBank = appeal.flagger.toLowerCase().includes(b.name.toLowerCase());

                          return (
                            <div
                              key={b.id}
                              className="relative group flex items-center justify-center"
                              title={`${b.name}: ${
                                isFlaggerBank
                                  ? "Reporting Bank (Recused)"
                                  : bankHasVoted
                                  ? "Voted in Chamber"
                                  : "Pending Signature"
                              }`}
                            >
                              <div
                                className={cn(
                                  "h-6 w-6 rounded-full text-[10px] font-mono font-bold flex items-center justify-center transition-all",
                                  bankHasVoted
                                    ? "bg-semantic-verified text-white shadow-subtle ring-2 ring-semantic-verified/20"
                                    : isFlaggerBank
                                    ? "bg-subtle text-muted border border-dashed border-hairline opacity-60"
                                    : "bg-surface border border-hairline text-muted"
                                )}
                              >
                                {b.code}
                              </div>

                              {bankHasVoted && (
                                <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-semantic-verified text-white flex items-center justify-center">
                                  <CheckCircle2 className="h-2 w-2" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  {!isResolved && (
                    <div className="pt-2 border-t border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Reason Notice if Disabled */}
                      <div className="text-xs text-muted">
                        {isFlagger ? (
                          <span className="text-semantic-review flex items-center gap-1.5 font-medium">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Your bank anchored this flag; recused from voting.
                          </span>
                        ) : hasVoted ? (
                          <span className="text-semantic-verified flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Your bank has cast its vote on this appeal.
                          </span>
                        ) : (
                          <span>Awaiting your underwriter key signature.</span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {reachedQuorum ? (
                          <Button
                            variant="primary"
                            size="default"
                            onClick={() => requestExecuteRevocation(appeal)}
                            loading={isSubmitting}
                            className="bg-semantic-flagged hover:bg-semantic-flagged/90 text-white min-h-[44px]"
                          >
                            <Gavel className="h-4 w-4 mr-2" />
                            Execute revocation &amp; slash stake
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="default"
                              disabled={isFlagger || hasVoted || isSubmitting}
                              onClick={() => requestVoteReject(appeal)}
                              className="rounded-pill min-h-[44px]"
                            >
                              Reject appeal
                            </Button>
                            <Button
                              variant="primary"
                              size="default"
                              disabled={isFlagger || hasVoted || isSubmitting}
                              onClick={() => requestVoteUphold(appeal)}
                              className="rounded-pill min-h-[44px]"
                            >
                              Uphold appeal
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ======================================================== */}
        {/* FILE APPEAL SHEET DRAWER                                 */}
        {/* ======================================================== */}
        <FileAppealSheet
          isOpen={isFileAppealOpen}
          onClose={() => setIsFileAppealOpen(false)}
          activeFlags={flags}
          onSuccess={() => {
            syncAppeals();
            refresh();
          }}
        />

        {/* ======================================================== */}
        {/* EVIDENCE MODAL                                           */}
        {/* ======================================================== */}
        <EvidenceModal
          isOpen={evidenceModalData.isOpen}
          onClose={() => setEvidenceModalData((prev) => ({ ...prev, isOpen: false }))}
          title={evidenceModalData.title}
          type={evidenceModalData.type}
          hash={evidenceModalData.hash}
          appealId={evidenceModalData.appealId}
          categoryName={evidenceModalData.categoryName}
          submittedBy={evidenceModalData.submittedBy}
        />

        {/* ======================================================== */}
        {/* CONFIRMATION DIALOG (IRREVERSIBLE ACTION)                */}
        {/* ======================================================== */}
        <ConfirmIrreversibleDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={handleConfirmAction}
          title={confirmDialog.title}
          description={confirmDialog.description}
          consequences={confirmDialog.consequences}
          confirmLabel={confirmDialog.confirmLabel}
          variant={confirmDialog.type === "execute" ? "danger" : "warning"}
          isLoading={isSubmitting}
        />
      </div>
    </AppShell>
  );
}

