"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import {
  Card,
  Button,
  StatusPill,
  HashChip,
} from "@/components/ui";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  FileCheck2,
  Server,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export default function TrustAndPrivacyPage() {
  const isolationMatrix = [
    {
      category: "Customer Legal Identity",
      items: [
        { field: "Full Legal Name", bankSees: "Visible (Internal KYC)", chainSees: "Zero Bytes (Non-Existent)", peerSees: "Zero Bytes (Hidden)" },
        { field: "PAN / Aadhaar Number", bankSees: "Visible (Memory RAM)", chainSees: "Zero Bytes (Non-Existent)", peerSees: "Zero Bytes (Hidden)" },
        { field: "DOB & Residential Address", bankSees: "Visible (Internal CBS)", chainSees: "Zero Bytes (Non-Existent)", peerSees: "Zero Bytes (Hidden)" },
      ],
    },
    {
      category: "Cryptographic Consortium Artifacts",
      items: [
        { field: "Poseidon Commitment Leaf", bankSees: "Computed in RAM", chainSees: "32-Byte Hash Leaf", peerSees: "32-Byte Hash Leaf" },
        { field: "Groth16 Membership Proof (π)", bankSees: "Generated in Client Prover", chainSees: "Verified & Discarded", peerSees: "Cryptographically Verified" },
        { field: "Anonymous Nullifier", bankSees: "Computed from Secret", chainSees: "32-Byte Collision Anchor", peerSees: "Velocity Counter Only" },
      ],
    },
    {
      category: "Financial & Underwriting Attributes",
      items: [
        { field: "Requested Loan Amount", bankSees: "Visible in Loan File", chainSees: "Zero Bytes", peerSees: "Zero Bytes" },
        { field: "Credit Score & Salary", bankSees: "Visible (Credit Bureau)", chainSees: "Zero Bytes", peerSees: "Zero Bytes" },
        { field: "Fraud Blacklist Vector", bankSees: "Categorized (0-3)", chainSees: "Integer Enum (0-3)", peerSees: "Risk Classification Only" },
      ],
    },
  ];

  return (
    <AppShell pageTitle="Trust & Privacy">
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header Card */}
        <Card className="p-6 sm:p-8 bg-surface border-hairline shadow-card">
          <div className="flex items-start sm:items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-semantic-verified/10 text-semantic-verified shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-eyebrow font-medium uppercase tracking-wider text-muted">
                  Institutional Cryptographic Guarantees
                </span>
                <StatusPill variant="verified" size="sm" label="DPDP Act §4 Compliant" pulse />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl text-ink font-normal leading-tight">
                Trust &amp; Privacy Architecture
              </h1>
              <p className="text-body-sm text-muted">
                Mathematical zero-knowledge guarantees ensure that no customer personal data, account numbers, or national identifiers ever leave the originating bank&apos;s perimeter.
              </p>
            </div>
          </div>
        </Card>

        {/* 3 Core Statutory Guarantees */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-5 bg-surface border-hairline shadow-card space-y-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-sapphire/10 text-brand-sapphire">
              <Lock className="h-4 w-4" />
            </div>
            <h3 className="font-serif text-base font-semibold text-ink">
              1. In-Browser Hashing
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Borrower identifiers are normalized and salted strictly inside your browser memory using Poseidon over the BN254 scalar field. Zero unencrypted packets reach the network.
            </p>
          </Card>

          <Card className="p-5 bg-surface border-hairline shadow-card space-y-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-semantic-verified/10 text-semantic-verified">
              <EyeOff className="h-4 w-4" />
            </div>
            <h3 className="font-serif text-base font-semibold text-ink">
              2. Zero-Knowledge Proofs
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Consortium screening uses Groth16 zk-SNARKs. Lenders prove an applicant is in the fraud registry without revealing WHICH leaf matches or disclosing the applicant&apos;s ID.
            </p>
          </Card>

          <Card className="p-5 bg-surface border-hairline shadow-card space-y-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold/10 text-brand-gold">
              <FileCheck2 className="h-4 w-4" />
            </div>
            <h3 className="font-serif text-base font-semibold text-ink">
              3. DPDP Act (2023) Section 4
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Because commitments on-chain possess collision and pre-image resistance, they do not constitute Personal Data under Indian law. Consortium members remain fully compliant.
            </p>
          </Card>
        </div>

        {/* Side-by-Side Data Isolation Matrix */}
        <Card className="p-6 sm:p-8 bg-surface border-hairline shadow-card space-y-6">
          <div className="border-b border-hairline pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-serif text-heading-md text-ink font-normal">
                Zero-Knowledge Privacy Boundary Matrix
              </h2>
              <p className="text-body-sm text-muted">
                Side-by-side audit of data visibility across the originating bank, the public blockchain, and peer consortium members.
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-pill bg-semantic-verified/10 text-semantic-verified border border-semantic-verified/25 font-semibold">
              Zero PII Transmission
            </span>
          </div>

          <div className="space-y-6">
            {isolationMatrix.map((section, sIdx) => (
              <div key={sIdx} className="space-y-3">
                <span className="text-xs font-semibold text-ink uppercase tracking-wider block">
                  {section.category}
                </span>

                <div className="overflow-x-auto rounded-card border border-hairline">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-subtle/50 text-[11px] font-medium text-muted uppercase tracking-wider border-b border-hairline">
                      <tr>
                        <th className="p-3">Data Field</th>
                        <th className="p-3">Originating Bank Sees</th>
                        <th className="p-3">Public Blockchain Sees</th>
                        <th className="p-3">Peer Consortium Banks See</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline">
                      {section.items.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-subtle/30 transition-colors">
                          <td className="p-3 font-medium text-ink">{row.field}</td>
                          <td className="p-3 text-muted">{row.bankSees}</td>
                          <td className="p-3">
                            <span className={row.chainSees.includes("Zero") ? "text-semantic-verified font-medium" : "font-mono text-muted"}>
                              {row.chainSees}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={row.peerSees.includes("Zero") ? "text-semantic-verified font-medium" : "text-muted"}>
                              {row.peerSees}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {/* Verification CTA */}
          <div className="pt-4 border-t border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs text-muted">
              Inspect on-chain proof verification contracts on Hardhat node (FraudRegistry.sol &amp; Verifier.sol).
            </span>
            <Link href="/network">
              <Button variant="outline" size="default">
                <span>View Consortium Ledger</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

