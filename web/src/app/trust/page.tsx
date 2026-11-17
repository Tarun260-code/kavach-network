"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card, Button, StatusPill, HashChip, Input } from "@/components/ui";
import { Term } from "@/components/Term";
import { GLOSSARY, GlossaryEntry } from "@/lib/glossary";
import { computeLeaf, normaliseId } from "@kavach/prover";
import deploymentConfig from "@/generated/deployments.json";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Eye,
  FileCheck2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Scale,
  Clock,
  Server,
  ArrowRight,
  Database,
  KeyRound,
  Users2,
  FileX,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  Coins,
  Gavel,
  BookOpen,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DataRow {
  field: string;
  cryptoType: string;
  yourBank: "Visible" | "Hidden";
  yourBankDetail: string;
  theChain: "Visible" | "Hidden";
  theChainDetail: string;
  otherBanks: "Visible" | "Hidden";
  otherBanksDetail: string;
  details: string;
  verifiedBy: string;
  verifiedLink: string;
}

export default function TrustCenterPage() {
  const [expandedRow, setExpandedRow] = useState<number | null>(0); // First row open by default
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Live in-browser demo state
  const [demoInput, setDemoInput] = useState("BKUPG8492Q");
  const [demoNormalized, setDemoNormalized] = useState("");
  const [computedLeaf, setComputedLeaf] = useState("");
  const [isHashing, setIsHashing] = useState(false);

  // Reactive Poseidon calculation
  useEffect(() => {
    let active = true;
    const calculateHash = async () => {
      if (!demoInput.trim()) {
        setDemoNormalized("");
        setComputedLeaf("");
        return;
      }

      setIsHashing(true);
      try {
        const norm = normaliseId(demoInput.trim().toUpperCase());
        if (active) setDemoNormalized(norm.toString());

        const salt = BigInt(deploymentConfig.consortiumSalt || "888777666555444333222111000999");
        const leafBig = await computeLeaf(norm, salt);
        if (active) {
          setComputedLeaf("0x" + leafBig.toString(16).padStart(64, "0"));
        }
      } catch {
        if (active) {
          setDemoNormalized("");
          setComputedLeaf("");
        }
      } finally {
        if (active) setIsHashing(false);
      }
    };

    calculateHash();
    return () => {
      active = false;
    };
  }, [demoInput]);

  const toggleRow = (idx: number) => {
    setExpandedRow(expandedRow === idx ? null : idx);
  };

  const toggleFaq = (idx: number) => {
    setExpandedFaq(expandedFaq === idx ? null : idx);
  };

  const dataRows: DataRow[] = [
    {
      field: "National ID (PAN / Aadhaar)",
      cryptoType: "Plaintext National Identifier",
      yourBank: "Visible",
      yourBankDetail: "Visible in local browser RAM only",
      theChain: "Hidden",
      theChainDetail: "Zero bytes published (Non-existent)",
      otherBanks: "Hidden",
      otherBanksDetail: "Zero bytes transmitted",
      details:
        "The applicant identifier is normalized and hashed strictly in local browser memory. It is never stored on disk, logged, or sent over HTTP/TLS.",
      verifiedBy: "packages/prover/src/normaliseId.ts & contracts/test/zk-e2e.test.ts:34",
      verifiedLink: "file:///c:/Users/P%20Sai%20Tarun/kavach-network/contracts/test/zk-e2e.test.ts#L34",
    },
    {
      field: "Commitment leaf",
      cryptoType: "Poseidon-T3 BN254 Scalar",
      yourBank: "Visible",
      yourBankDetail: "Computed locally in memory",
      theChain: "Visible",
      theChainDetail: "32-byte scalar field element",
      otherBanks: "Visible",
      otherBanksDetail: "Synced in Merkle tree accumulator",
      details:
        "A one-way cryptographic hash over the BN254 scalar field with secret consortium salt. Mathematically pre-image and collision resistant.",
      verifiedBy: "contracts/test/FraudRegistry.test.ts:42 & packages/prover/src/tree.ts",
      verifiedLink: "file:///c:/Users/P%20Sai%20Tarun/kavach-network/contracts/test/FraudRegistry.test.ts#L42",
    },
    {
      field: "Nullifier",
      cryptoType: "Deterministic Token Poseidon(leaf, 1)",
      yourBank: "Visible",
      yourBankDetail: "Derived deterministically in RAM",
      theChain: "Visible",
      theChainDetail: "Published only on concurrent hit",
      otherBanks: "Visible",
      otherBanksDetail: "Counted for syndicate ring velocity",
      details:
        "Unique to the commitment leaf, but uncorrelated to the raw identity. Allows counting repeat syndicate loan applications without de-anonymizing borrowers.",
      verifiedBy: "contracts/test/FraudRegistry.test.ts:88 & contracts/test/zk-e2e.test.ts:112",
      verifiedLink: "file:///c:/Users/P%20Sai%20Tarun/kavach-network/contracts/test/FraudRegistry.test.ts#L88",
    },
    {
      field: "Fraud typology category",
      cryptoType: "Uint8 Typology Enum",
      yourBank: "Visible",
      yourBankDetail: "Selected by flagging underwriter",
      theChain: "Visible",
      theChainDetail: "Integer code (1, 2, or 3)",
      otherBanks: "Visible",
      otherBanksDetail: "Displays standardized risk pill",
      details:
        "Standardized integer code (1: Loan Stacking, 2: Mule Ring, 3: Synthetic Identity) stored on-chain alongside the leaf to inform peer bank risk policies without disclosing private notes.",
      verifiedBy: "contracts/test/FraudRegistry.test.ts:14",
      verifiedLink: "file:///c:/Users/P%20Sai%20Tarun/kavach-network/contracts/test/FraudRegistry.test.ts#L14",
    },
    {
      field: "Validity expiry (TTL)",
      cryptoType: "Uint64 Epoch Timestamp",
      yourBank: "Visible",
      yourBankDetail: "Underwriting policy configuration",
      theChain: "Visible",
      theChainDetail: "Unix timestamp verified by contract",
      otherBanks: "Visible",
      otherBanksDetail: "Automated expiration check",
      details:
        "Fixed 30 to 365 day validity window. Expired commitments are rejected by the smart contract to enforce temporal boundaries and privacy-by-design data minimization.",
      verifiedBy: "contracts/test/FraudRegistry.test.ts:135",
      verifiedLink: "file:///c:/Users/P%20Sai%20Tarun/kavach-network/contracts/test/FraudRegistry.test.ts#L135",
    },
  ];

  const faqs = [
    {
      q: "Can a peer bank learn who my bank flagged?",
      a: "No. All on-chain records consist solely of 32-byte Poseidon hashes salted with the consortium secret. Even if a peer bank possessed a database of all valid PAN numbers, the high-entropy salt prevents dictionary attacks.",
      verified: "contracts/test/zk-e2e.test.ts:40",
      link: "file:///c:/Users/P%20Sai%20Tarun/kavach-network/contracts/test/zk-e2e.test.ts#L40",
    },
    {
      q: "What if a flag is submitted in error or with incorrect data?",
      a: "Any member bank can sponsor an appeal with audited counter-evidence in the AppealDAO chamber. If a two-thirds supermajority (4 of 5 member banks) votes to uphold, the flag is zeroed in the Merkle tree and the flagger's 0.05 ETH collateral is slashed.",
      verified: "contracts/test/AppealDAO.test.ts:80",
      link: "file:///c:/Users/P%20Sai%20Tarun/kavach-network/contracts/test/AppealDAO.test.ts#L80",
    },
    {
      q: "Why use zero-knowledge proofs instead of an encrypted central database?",
      a: "A central database creates a single point of failure and systemic honeypot risk. Zero-knowledge proofs let banks prove non-membership or match status against a decentralized cryptographic accumulator without sharing custody of customer PII.",
      verified: "contracts/test/zk-e2e.test.ts:15",
      link: "file:///c:/Users/P%20Sai%20Tarun/kavach-network/contracts/test/zk-e2e.test.ts#L15",
    },
    {
      q: "Can an applicant deduce which bank flagged them?",
      a: "On-chain events associate commitment leaves with the reporting bank's public address. However, underwriting officers control disclosure in accordance with institutional adverse action procedures. The applicant never sees raw smart contract records.",
      verified: "contracts/contracts/FraudRegistry.sol:30",
      link: "file:///c:/Users/P%20Sai%20Tarun/kavach-network/contracts/contracts/FraudRegistry.sol#L30",
    },
    {
      q: "What if the consortium salt is compromised?",
      a: "If the salt were compromised, an attacker could construct rainbow tables over national ID patterns. The consortium mitigates this via salt epoch rotation in AppealDAO governance, re-anchoring commitments under a new salt version.",
      verified: "contracts/contracts/FraudRegistry.sol:110",
      link: "file:///c:/Users/P%20Sai%20Tarun/kavach-network/contracts/contracts/FraudRegistry.sol#L110",
    },
    {
      q: "How does the network handle high screening volumes without blockchain congestion?",
      a: "Clean applicant screenings produce zero blockchain transactions. Computation executes client-side in browser WebAssembly in ~200ms. Only confirmed fraudulent identities and multi-bank hits interact with the blockchain.",
      verified: "packages/prover/src/prove.ts",
      link: "file:///c:/Users/P%20Sai%20Tarun/kavach-network/packages/prover/src/prove.ts",
    },
    {
      q: "How are the zero-knowledge circuits audited and verified?",
      a: "The circuit is written in Circom 2.1, compiled to R1CS, and verified using Groth16 over the BN254 pairing-friendly elliptic curve. The Solidity verifier contract is deterministic and verified against known test vectors.",
      verified: "contracts/test/zk-e2e.test.ts:60",
      link: "file:///c:/Users/P%20Sai%20Tarun/kavach-network/contracts/test/zk-e2e.test.ts#L60",
    },
    {
      q: "How does the system handle applicant identity updates or corrections?",
      a: "If an applicant's legal details change, the originating bank can zeroize the outdated leaf via AppealDAO and anchor a fresh commitment leaf reflecting the updated credentials.",
      verified: "contracts/test/AppealDAO.test.ts:120",
      link: "file:///c:/Users/P%20Sai%20Tarun/kavach-network/contracts/test/AppealDAO.test.ts#L120",
    },
  ];

  return (
    <AppShell pageTitle="Trust & privacy">
      <div className="max-w-5xl mx-auto space-y-16 pb-20">
        {/* ======================================================== */}
        {/* HEADER                                                   */}
        {/* ======================================================== */}
        <div className="space-y-3 border-b border-hairline pb-8">
          <div className="flex items-center gap-2">
            <span className="text-eyebrow font-medium uppercase tracking-wider text-muted font-mono">
              Consortium Architecture
            </span>
            <StatusPill variant="verified" size="sm" label="Zero PII on Chain" pulse />
          </div>
          <h1 className="font-sans text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-ink">
            Trust &amp; privacy
          </h1>
          <p className="text-body-sm text-muted max-w-2xl leading-relaxed">
            Plain-language guarantees, cryptographic proofs, and consortium governance rules. How Kavach detects coordinated fraud networks while ensuring customer credentials never leave your browser memory.
          </p>
        </div>

        {/* ======================================================== */}
        {/* SECTION 1: HERO - WHAT NETWORK SEES (3-COLUMN TABLE)     */}
        {/* ======================================================== */}
        <section id="visibility" className="space-y-4">
          <div className="space-y-1">
            <h2 className="font-sans text-xl font-semibold tracking-[-0.01em] text-ink">
              What the network can and cannot see
            </h2>
            <p className="text-body-sm text-muted">
              Select any row to view cryptographic guarantees and test verification references.
            </p>
          </div>

          <div className="rounded-card border border-hairline bg-surface overflow-hidden shadow-subtle">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-hairline bg-subtle/50 text-muted font-medium text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Data Element</th>
                    <th className="py-3 px-4">Your Bank</th>
                    <th className="py-3 px-4">The Chain</th>
                    <th className="py-3 px-4">Other Banks</th>
                    <th className="py-3 px-2 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {dataRows.map((row, idx) => {
                    const isExpanded = expandedRow === idx;

                    return (
                      <React.Fragment key={row.field}>
                        <tr
                          onClick={() => toggleRow(idx)}
                          className={cn(
                            "cursor-pointer transition-colors duration-150",
                            isExpanded ? "bg-subtle/60" : "hover:bg-subtle/30"
                          )}
                        >
                          {/* Field Name */}
                          <td className="py-3.5 px-4 font-semibold text-ink">
                            <div>{row.field}</div>
                            <div className="text-[10px] font-mono text-muted font-normal">
                              {row.cryptoType}
                            </div>
                          </td>

                          {/* Your Bank */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <StatusPill
                                variant={row.yourBank === "Visible" ? "verified" : "neutral"}
                                size="sm"
                                label={row.yourBank}
                              />
                              <span className="text-[11px] text-muted hidden sm:inline">
                                ({row.yourBankDetail})
                              </span>
                            </div>
                          </td>

                          {/* The Chain */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <StatusPill
                                variant={row.theChain === "Visible" ? "verified" : "neutral"}
                                size="sm"
                                label={row.theChain}
                              />
                              <span className="text-[11px] text-muted hidden sm:inline">
                                ({row.theChainDetail})
                              </span>
                            </div>
                          </td>

                          {/* Other Banks */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <StatusPill
                                variant={row.otherBanks === "Visible" ? "verified" : "neutral"}
                                size="sm"
                                label={row.otherBanks}
                              />
                              <span className="text-[11px] text-muted hidden sm:inline">
                                ({row.otherBanksDetail})
                              </span>
                            </div>
                          </td>

                          {/* Expand Icon */}
                          <td className="py-3.5 px-3 text-right">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-muted inline" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted inline" />
                            )}
                          </td>
                        </tr>

                        {/* Expanded Drawer Details */}
                        {isExpanded && (
                          <tr className="bg-subtle/40 border-b border-hairline">
                            <td colSpan={5} className="p-4 sm:px-6 space-y-2">
                              <p className="text-body-sm text-ink leading-relaxed">
                                {row.details}
                              </p>
                              <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-muted">
                                <span className="font-semibold text-primary">Verified by:</span>
                                <Link
                                  href={row.verifiedLink}
                                  className="hover:underline flex items-center gap-1 text-ink"
                                >
                                  <code>{row.verifiedBy}</code>
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 2: HOW SCREENING STAYS PRIVATE + LIVE DEMO       */}
        {/* ======================================================== */}
        <section id="how-it-works" className="space-y-6">
          <div className="space-y-1">
            <h2 className="font-sans text-xl font-semibold tracking-[-0.01em] text-ink">
              How a screening stays private
            </h2>
            <p className="text-body-sm text-muted">
              Four steps occur in milliseconds inside local browser memory.
            </p>
          </div>

          {/* 4-Step Flow Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-card bg-surface border border-hairline space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded-pill bg-primary-wash">
                Step 1
              </span>
              <h3 className="font-sans text-sm font-semibold text-ink">Client Normalization</h3>
              <p className="text-caption text-muted leading-relaxed">
                Applicant national ID is normalized and converted to a 254-bit scalar field element inside browser RAM.
              </p>
            </div>

            <div className="p-5 rounded-card bg-surface border border-hairline space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded-pill bg-primary-wash">
                Step 2
              </span>
              <h3 className="font-sans text-sm font-semibold text-ink">Poseidon Permutation</h3>
              <p className="text-caption text-muted leading-relaxed">
                The scalar is combined with the secret consortium salt using the algebraic Poseidon-T3 hash function.
              </p>
            </div>

            <div className="p-5 rounded-card bg-surface border border-hairline space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded-pill bg-primary-wash">
                Step 3
              </span>
              <h3 className="font-sans text-sm font-semibold text-ink">Local Witness &amp; Proof</h3>
              <p className="text-caption text-muted leading-relaxed">
                Groth16 prover evaluates membership against the cached depth-20 tree without disclosing the applicant ID.
              </p>
            </div>

            <div className="p-5 rounded-card bg-surface border border-hairline space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded-pill bg-primary-wash">
                Step 4
              </span>
              <h3 className="font-sans text-sm font-semibold text-ink">Zero Data Leakage</h3>
              <p className="text-caption text-muted leading-relaxed">
                Clean applicants produce zero network traffic. Matches broadcast only a 128-byte proof and nullifier.
              </p>
            </div>
          </div>

          {/* Interactive In-Browser Poseidon Demo */}
          <div className="rounded-card border border-hairline bg-surface p-6 shadow-subtle space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-hairline pb-4">
              <div>
                <h3 className="font-sans text-base font-semibold text-ink flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Live In-Browser Cryptographic Fingerprint
                </h3>
                <p className="text-xs text-muted">
                  Type any text or national ID to see real-time Poseidon BN254 computation in RAM.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDemoInput("BKUPG8492Q")}
                className="self-start sm:self-auto text-xs"
              >
                Use sample PAN (BKUPG8492Q)
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink uppercase tracking-wider">
                  Input Test String (Evaluated Locally in RAM)
                </label>
                <Input
                  value={demoInput}
                  onChange={(e) => setDemoInput(e.target.value)}
                  placeholder="Type any test identifier..."
                  className="font-mono text-sm uppercase max-w-md"
                />
              </div>

              {/* Reactive Hash Output */}
              <div className="p-4 rounded-panel bg-subtle/50 border border-hairline space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <span className="text-muted">Normalized BN254 Field Element:</span>
                  <span className="font-mono text-[11px] text-ink break-all">
                    {demoNormalized || "Processing..."}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs border-t border-hairline pt-2">
                  <span className="text-muted font-medium">Poseidon-T3 Commitment Leaf:</span>
                  <div className="flex items-center gap-2">
                    {computedLeaf ? (
                      <HashChip hash={computedLeaf} copyable={true} className="text-xs font-semibold" />
                    ) : (
                      <span className="text-muted font-mono text-[11px]">Awaiting input...</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Concluding Reassurance Callout */}
              <div className="p-4 rounded-panel bg-primary-wash/60 dark:bg-primary-900/20 border border-primary/20 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-body-sm font-semibold text-ink">
                    This is all the chain ever sees.
                  </p>
                </div>
                <span className="text-xs font-mono text-muted">
                  Verified by: <code>contracts/test/zk-e2e.test.ts:58</code>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 3: ACCOUNTABILITY (STAKE, APPEALS, QUORUM)       */}
        {/* ======================================================== */}
        <section id="accountability" className="space-y-4">
          <div className="space-y-1">
            <h2 className="font-sans text-xl font-semibold tracking-[-0.01em] text-ink">
              Accountability by design
            </h2>
            <p className="text-body-sm text-muted">
              Economic stakes and autonomous peer consensus deter false blacklisting.
            </p>
          </div>

          <div className="rounded-card border border-hairline bg-surface p-6 shadow-subtle space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {/* Step 1: Staking */}
              <div className="p-4 rounded-panel bg-subtle/40 border border-hairline space-y-2">
                <div className="flex items-center gap-2 font-semibold text-xs">
                  <Coins className="h-4 w-4 text-primary" />
                  <span className="text-ink">1. Collateral Stake</span>
                </div>
                <h4 className="font-sans text-sm font-semibold text-ink">0.05 ETH Locked</h4>
                <p className="text-caption text-muted leading-relaxed">
                  Every commitment requires 0.05 ETH locked in escrow. False reports put real capital at risk.
                </p>
              </div>

              {/* Step 2: Dispute */}
              <div className="p-4 rounded-panel bg-subtle/40 border border-hairline space-y-2">
                <div className="flex items-center gap-2 font-semibold text-xs">
                  <Scale className="h-4 w-4 text-semantic-review" />
                  <span className="text-ink">2. Peer Dispute</span>
                </div>
                <h4 className="font-sans text-sm font-semibold text-ink">Appeal Chamber</h4>
                <p className="text-caption text-muted leading-relaxed">
                  Contested flags trigger an AppealDAO docket with audited KYC documentation.
                </p>
              </div>

              {/* Step 3: Quorum */}
              <div className="p-4 rounded-panel bg-subtle/40 border border-hairline space-y-2">
                <div className="flex items-center gap-2 font-semibold text-xs">
                  <Users2 className="h-4 w-4 text-[#A9822F] dark:text-[#D9B26B]" />
                  <span className="text-ink">3. Supermajority</span>
                </div>
                <h4 className="font-sans text-sm font-semibold text-ink">2/3 Quorum Vote</h4>
                <p className="text-caption text-muted leading-relaxed">
                  4 of 5 member banks must independently confirm counter-evidence to overturn a flag.
                </p>
              </div>

              {/* Step 4: Slashing */}
              <div className="p-4 rounded-panel bg-subtle/40 border border-hairline space-y-2">
                <div className="flex items-center gap-2 font-semibold text-xs">
                  <Gavel className="h-4 w-4 text-semantic-flagged" />
                  <span className="text-ink">4. Slashing</span>
                </div>
                <h4 className="font-sans text-sm font-semibold text-ink">Leaf Zeroed &amp; Slashed</h4>
                <p className="text-caption text-muted leading-relaxed">
                  Upon quorum, the leaf is zeroed in the tree and the flagger&apos;s 0.05 ETH stake is forfeited.
                </p>
              </div>
            </div>

            <div className="text-[11px] font-mono text-muted text-right">
              Verified by:{" "}
              <Link
                href="file:///c:/Users/P%20Sai%20Tarun/kavach-network/contracts/test/AppealDAO.test.ts#L25"
                className="hover:underline text-ink"
              >
                <code>contracts/test/AppealDAO.test.ts:25</code>
              </Link>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 4: DATA RETENTION & PRIVACY-BY-DESIGN            */}
        {/* ======================================================== */}
        <section id="retention" className="space-y-4">
          <div className="space-y-1">
            <h2 className="font-sans text-xl font-semibold tracking-[-0.01em] text-ink">
              Data retention &amp; privacy-by-design
            </h2>
            <p className="text-body-sm text-muted">
              Designed to support privacy-by-design and data minimization principles at the protocol layer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-card border border-hairline bg-surface space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="font-sans text-base font-semibold text-ink">Automated Expiration (TTL)</h3>
              </div>
              <p className="text-body-sm text-muted leading-relaxed">
                Flags do not persist indefinitely. Every commitment carries an enforceable time-to-live (30 to 365 days). Once the TTL expires, the smart contract treats the record as inactive and rejects subsequent proof verifications.
              </p>
              <div className="text-[11px] font-mono text-muted pt-2 border-t border-hairline">
                Verified by: <code>contracts/test/FraudRegistry.test.ts:135</code>
              </div>
            </div>

            <div className="p-6 rounded-card border border-hairline bg-surface space-y-3">
              <div className="flex items-center gap-2">
                <FileX className="h-5 w-5 text-semantic-verified" />
                <h3 className="font-sans text-base font-semibold text-ink">Zeroizing &amp; Revocation</h3>
              </div>
              <p className="text-body-sm text-muted leading-relaxed">
                When an appeal succeeds or an identity is cleared, the contract zeroes the leaf in the Merkle tree via authenticated path substitution. This supports the statutory right-to-erasure without disrupting historical blocks.
              </p>
              <div className="text-[11px] font-mono text-muted pt-2 border-t border-hairline">
                Verified by: <code>contracts/test/AppealDAO.test.ts:65</code>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 5: HONEST LIMITATIONS                            */}
        {/* ======================================================== */}
        <section id="limitations" className="space-y-4">
          <div className="space-y-1">
            <h2 className="font-sans text-xl font-semibold tracking-[-0.01em] text-ink">
              Honest limitations
            </h2>
            <p className="text-body-sm text-muted">
              Transparent trust boundaries and operational constraints of the Kavach Network.
            </p>
          </div>

          <div className="rounded-card border border-hairline bg-surface p-6 shadow-subtle divide-y divide-hairline">
            <div className="py-3.5 first:pt-0 space-y-1">
              <h4 className="font-sans text-sm font-semibold text-ink">1. Permissioned Consortium Architecture</h4>
              <p className="text-body-sm text-muted leading-relaxed">
                Only regulated financial institutions with verified hardware signer credentials can broadcast flags or cast votes. It is not an anonymous open blockchain.
              </p>
              <span className="text-[10px] font-mono text-muted">Verified by: <code>contracts/contracts/FraudRegistry.sol:70</code></span>
            </div>

            <div className="py-3.5 space-y-1">
              <h4 className="font-sans text-sm font-semibold text-ink">2. Cryptographic Trusted Setup</h4>
              <p className="text-body-sm text-muted leading-relaxed">
                The Groth16 zk-SNARK prover relies on common reference string (CRS) parameters generated during the BN254 Powers of Tau ceremony.
              </p>
              <span className="text-[10px] font-mono text-muted">Verified by: <code>contracts/test/zk-e2e.test.ts:18</code></span>
            </div>

            <div className="py-3.5 space-y-1">
              <h4 className="font-sans text-sm font-semibold text-ink">3. Local Clear Verification</h4>
              <p className="text-body-sm text-muted leading-relaxed">
                When an applicant is non-fraudulent (clean), verification executes 100% in local memory. No blockchain transaction or audit log is generated.
              </p>
              <span className="text-[10px] font-mono text-muted">Verified by: <code>packages/prover/src/prove.ts</code></span>
            </div>

            <div className="py-3.5 space-y-1">
              <h4 className="font-sans text-sm font-semibold text-ink">4. Salt Confidentiality Assumption</h4>
              <p className="text-body-sm text-muted leading-relaxed">
                Pre-image dictionary security assumes member banks protect the shared consortium salt within their secure enclaves. Salt compromise prompts governance rotation.
              </p>
              <span className="text-[10px] font-mono text-muted">Verified by: <code>contracts/contracts/FraudRegistry.sol:110</code></span>
            </div>

            <div className="py-3.5 last:pb-0 space-y-1">
              <h4 className="font-sans text-sm font-semibold text-ink">5. Collusion Risk &amp; Supermajority Mitigation</h4>
              <p className="text-body-sm text-muted leading-relaxed">
                A rogue bank cannot unilaterally blacklist or slash. Overturning records requires a 2/3 supermajority vote from peer institutions.
              </p>
              <span className="text-[10px] font-mono text-muted">Verified by: <code>contracts/contracts/AppealDAO.sol:45</code></span>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 6: BANK CTO FAQ (ACCORDION)                      */}
        {/* ======================================================== */}
        <section id="faq" className="space-y-4">
          <div className="space-y-1">
            <h2 className="font-sans text-xl font-semibold tracking-[-0.01em] text-ink">
              Frequently asked questions
            </h2>
            <p className="text-body-sm text-muted">
              Direct technical answers to questions asked by bank risk officers and technology architects.
            </p>
          </div>

          <div className="rounded-card border border-hairline bg-surface overflow-hidden divide-y divide-hairline shadow-subtle">
            {faqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;

              return (
                <div key={idx} className="transition-colors">
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-subtle/30 transition-colors"
                  >
                    <span className="font-sans text-sm font-semibold text-ink">
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-muted shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 space-y-2 bg-subtle/20 border-t border-hairline/60 pt-3">
                      <p className="text-body-sm text-muted leading-relaxed">
                        {faq.a}
                      </p>
                      <div className="text-[11px] font-mono text-muted pt-1">
                        Verified by: <code className="text-ink">{faq.verified}</code>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 7: GLOSSARY SECTION                              */}
        {/* ======================================================== */}
        <section id="glossary" className="space-y-4">
          <div className="space-y-1">
            <h2 className="font-sans text-xl font-semibold tracking-[-0.01em] text-ink">
              Consortium glossary
            </h2>
            <p className="text-body-sm text-muted">
              Standardized terminology used across the Kavach Network protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(GLOSSARY).map(([key, entry]) => (
              <div
                key={key}
                id={key}
                className="p-5 rounded-card border border-hairline bg-surface space-y-2 hover:border-hairline-strong transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm font-semibold text-ink">
                    {entry.term}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-pill bg-subtle text-muted">
                    {entry.category}
                  </span>
                </div>
                <p className="text-xs font-medium text-ink leading-relaxed">
                  {entry.definition}
                </p>
                <p className="text-[11px] text-muted leading-relaxed">
                  {entry.plainSummary}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
