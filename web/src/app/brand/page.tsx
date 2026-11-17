"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import {
  Card,
  Button,
  StatusPill,
  HashChip,
  BankMonogram,
  MetricCard,
} from "@/components/ui";
import {
  KavachLogo,
  KavachLogoMark,
} from "@/components/KavachLogo";
import { BrandPattern } from "@/components/BrandPattern";
import {
  CommitIllustration,
  AnchorIllustration,
  ProveIllustration,
  AppealIllustration,
  EmptyLedgerIllustration,
  NoAppealsIllustration,
  OfflineIllustration,
} from "@/components/illustrations";
import { ProofNetworkHero } from "@/components/ProofNetworkHero";
import {
  Sparkline,
  RingVelocityNetworkMap,
  MerkleTreeViewer,
  AppealVoteProgressRing,
} from "@/components/charts";
import { DataTable } from "@/components/DataTable";
import { getAllBanks, BankConfig } from "@/lib/banks";
import {
  Shield,
  Layers,
  Scale,
  Activity,
  ArrowLeft,
  Sparkles,
  GitBranch,
  Eye,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function BrandPage() {
  const banks = getAllBanks();
  const [selectedBankSkin, setSelectedBankSkin] = useState<BankConfig>(banks[0]);
  const [sampleVotes, setSampleVotes] = useState(3);

  // Sample data for density demonstration table
  const sampleTableData = [
    { id: "TX-1049", type: "IdentityFlagged", bank: "Meridian Bank", hash: "0x19a9...0e3b", exposure: "₹15,00,000", time: "2m ago" },
    { id: "TX-1050", type: "RingHit", bank: "Aurum Bank", hash: "0x3f5c...0123", exposure: "₹25,00,000", time: "14m ago" },
    { id: "TX-1051", type: "IdentityFlagged", bank: "Kestrel Capital", hash: "0x89ab...ef01", exposure: "₹8,50,000", time: "1h ago" },
    { id: "TX-1052", type: "LeafRevoked", bank: "AppealDAO Chamber", hash: "0xfa12...1234", exposure: "0.05 ETH Slashed", time: "3h ago" },
  ];

  const sampleColumns = [
    { key: "id", header: "Docket ID", render: (item: any) => <span className="font-mono text-xs">{item.id}</span> },
    {
      key: "type",
      header: "Consortium Event",
      render: (item: any) => (
        <StatusPill
          variant={item.type === "IdentityFlagged" ? "flagged" : item.type === "RingHit" ? "pending" : "verified"}
          size="sm"
          label={item.type}
        />
      ),
    },
    { key: "bank", header: "Reporting Institution", render: (item: any) => <span className="font-medium">{item.bank}</span> },
    { key: "hash", header: "Commitment Leaf", render: (item: any) => <HashChip hash={item.hash} /> },
    { key: "exposure", header: "Exposure / Stake", render: (item: any) => <span className="font-mono">{item.exposure}</span> },
    { key: "time", header: "Timestamp", render: (item: any) => <span className="text-muted font-mono">{item.time}</span> },
  ];

  return (
    <AppShell pageTitle="Brand System & Visual Language">
      <div className="space-y-12 max-w-6xl mx-auto pb-16">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Public Landing</span>
          </Link>
          <span className="text-xs font-mono text-muted bg-subtle px-2.5 py-1 rounded-pill border border-hairline">
            Kavach Design System v2.0
          </span>
        </div>

        {/* Page Header */}
        <Card className="p-8 sm:p-10 bg-surface border-hairline shadow-card relative overflow-hidden">
          <BrandPattern opacity={0.04} />
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-eyebrow font-medium uppercase tracking-wider text-muted">
                Design System &amp; Brand Manual
              </span>
              <StatusPill variant="verified" size="sm" label="Institutional Calibre" pulse />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink font-normal leading-tight">
              Brand Identity &amp; Data Visualisation
            </h1>
            <p className="text-body-md text-muted max-w-2xl leading-relaxed">
              Custom SVG logo system, 1.5px duotone cryptographic illustrations, 60fps signature proof network, unified data charting language, and formal consortium bank skins.
            </p>
          </div>
        </Card>

        {/* ======================================================== */}
        {/* 1. BRAND LOGO SYSTEM                                     */}
        {/* ======================================================== */}
        <section className="space-y-6">
          <div className="border-b border-hairline pb-3">
            <span className="text-eyebrow uppercase tracking-wider text-muted font-medium">01 / Identity</span>
            <h2 className="font-serif text-2xl text-ink font-normal mt-0.5">
              Shield-K Logo Architecture
            </h2>
            <p className="text-body-sm text-muted">
              Shield silhouette representing defensive consortium privacy, structured as an architectural "K" with a 3-node Merkle tree motif.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Full Auto Logo */}
            <Card className="p-6 flex flex-col justify-between items-center text-center space-y-4">
              <div className="h-20 flex items-center justify-center">
                <KavachLogo variant="full" size="lg" withTagline />
              </div>
              <div className="border-t border-hairline pt-3 w-full text-xs text-muted">
                <span className="font-semibold text-ink block">Full Variant (Auto)</span>
                <span>Shield mark + serif wordmark + tag</span>
              </div>
            </Card>

            {/* Sapphire Accent Logo */}
            <Card className="p-6 flex flex-col justify-between items-center text-center space-y-4">
              <div className="h-20 flex items-center justify-center">
                <KavachLogo variant="full" theme="sapphire" size="lg" />
              </div>
              <div className="border-t border-hairline pt-3 w-full text-xs text-muted">
                <span className="font-semibold text-ink block">Sapphire Theme</span>
                <span>#2F5BFF fill with champagne nodes</span>
              </div>
            </Card>

            {/* Mark Sizes Grid */}
            <Card className="p-6 flex flex-col justify-between items-center text-center space-y-4">
              <div className="h-20 flex items-center justify-center gap-3">
                <KavachLogoMark size="xs" />
                <KavachLogoMark size="sm" />
                <KavachLogoMark size="md" />
                <KavachLogoMark size="lg" />
              </div>
              <div className="border-t border-hairline pt-3 w-full text-xs text-muted">
                <span className="font-semibold text-ink block">Mark Sizes</span>
                <span>20px (xs), 24px (sm), 32px (md), 44px (lg)</span>
              </div>
            </Card>

            {/* Wordmark Only */}
            <Card className="p-6 flex flex-col justify-between items-center text-center space-y-4">
              <div className="h-20 flex items-center justify-center">
                <KavachLogo variant="wordmark" size="xl" withTagline />
              </div>
              <div className="border-t border-hairline pt-3 w-full text-xs text-muted">
                <span className="font-semibold text-ink block">Wordmark Only</span>
                <span>Instrument Serif display typography</span>
              </div>
            </Card>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 2. SIGNATURE HERO VISUAL (60 FPS PROOF NETWORK)          */}
        {/* ======================================================== */}
        <section className="space-y-6">
          <div className="border-b border-hairline pb-3">
            <span className="text-eyebrow uppercase tracking-wider text-muted font-medium">02 / Hero Visual</span>
            <h2 className="font-serif text-2xl text-ink font-normal mt-0.5">
              Proof Network Animation (60fps)
            </h2>
            <p className="text-body-sm text-muted">
              Signature animated SVG showing 5 consortium bank nodes connected to the central ledger ring, looping an 8-second flagged anchor and verified ZK response.
            </p>
          </div>

          <ProofNetworkHero />
        </section>

        {/* ======================================================== */}
        {/* 3. DUOTONE CRYPTOGRAPHIC ILLUSTRATIONS (<3KB EACH)        */}
        {/* ======================================================== */}
        <section className="space-y-6">
          <div className="border-b border-hairline pb-3">
            <span className="text-eyebrow uppercase tracking-wider text-muted font-medium">03 / Illustrations</span>
            <h2 className="font-serif text-2xl text-ink font-normal mt-0.5">
              Cryptographic Duotone Illustration Set
            </h2>
            <p className="text-body-sm text-muted">
              Custom inline SVGs with 1.5px stroke weight, duotone sapphire + champagne palette, &lt;3KB file sizes, and gentle animation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Commit */}
            <Card className="p-5 flex flex-col items-center text-center space-y-3">
              <CommitIllustration size={160} />
              <div className="space-y-1">
                <span className="font-semibold text-xs text-ink block">1. Commit in Memory</span>
                <p className="text-[11px] text-muted leading-relaxed">
                  Raw credentials salted &amp; hashed in local browser RAM.
                </p>
              </div>
            </Card>

            {/* 2. Anchor */}
            <Card className="p-5 flex flex-col items-center text-center space-y-3">
              <AnchorIllustration size={160} />
              <div className="space-y-1">
                <span className="font-semibold text-xs text-ink block">2. Anchor On-Chain</span>
                <p className="text-[11px] text-muted leading-relaxed">
                  32-byte leaf deposited to Merkle tree with 0.05 ETH stake.
                </p>
              </div>
            </Card>

            {/* 3. Prove */}
            <Card className="p-5 flex flex-col items-center text-center space-y-3">
              <ProveIllustration size={160} />
              <div className="space-y-1">
                <span className="font-semibold text-xs text-ink block">3. Prove in Browser</span>
                <p className="text-[11px] text-muted leading-relaxed">
                  Groth16 zero-knowledge proof verifies match without disclosure.
                </p>
              </div>
            </Card>

            {/* 4. Appeal */}
            <Card className="p-5 flex flex-col items-center text-center space-y-3">
              <AppealIllustration size={160} />
              <div className="space-y-1">
                <span className="font-semibold text-xs text-ink block">4. Appeal Adjudication</span>
                <p className="text-[11px] text-muted leading-relaxed">
                  Decentralized dispute resolution with 2/3 supermajority quorum.
                </p>
              </div>
            </Card>

            {/* 5. Empty Ledger */}
            <Card className="p-5 flex flex-col items-center text-center space-y-3">
              <EmptyLedgerIllustration size={160} />
              <div className="space-y-1">
                <span className="font-semibold text-xs text-ink block">5. Empty Ledger</span>
                <p className="text-[11px] text-muted leading-relaxed">
                  Designed empty state for event streams with zero records.
                </p>
              </div>
            </Card>

            {/* 6. No Appeals */}
            <Card className="p-5 flex flex-col items-center text-center space-y-3">
              <NoAppealsIllustration size={160} />
              <div className="space-y-1">
                <span className="font-semibold text-xs text-ink block">6. No Appeals Active</span>
                <p className="text-[11px] text-muted leading-relaxed">
                  Calm status state when all commitments are in peer consensus.
                </p>
              </div>
            </Card>

            {/* 7. Offline Mode */}
            <Card className="p-5 flex flex-col items-center text-center space-y-3">
              <OfflineIllustration size={160} />
              <div className="space-y-1">
                <span className="font-semibold text-xs text-ink block">7. Offline Fallback</span>
                <p className="text-[11px] text-muted leading-relaxed">
                  Node disconnection notification with local vault cache fallback.
                </p>
              </div>
            </Card>

            {/* 8. Brand Pattern Preview Card */}
            <Card className="p-5 flex flex-col items-center justify-between text-center relative overflow-hidden bg-subtle/50">
              <BrandPattern opacity={0.08} />
              <div className="relative z-10 py-6">
                <div className="h-10 w-10 mx-auto rounded-full bg-surface border border-hairline flex items-center justify-center text-brand-sapphire mb-3 shadow-subtle">
                  <Sparkles className="h-5 w-5" />
                </div>
                <span className="font-semibold text-xs text-ink block">Brand Lattice Pattern</span>
                <p className="text-[11px] text-muted mt-1">4% opacity diamond-mesh matrix</p>
              </div>
            </Card>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 4. DATA VISUALISATION LANGUAGE & CHART KIT               */}
        {/* ======================================================== */}
        <section className="space-y-6">
          <div className="border-b border-hairline pb-3">
            <span className="text-eyebrow uppercase tracking-wider text-muted font-medium">04 / Data Vis</span>
            <h2 className="font-serif text-2xl text-ink font-normal mt-0.5">
              Data Visualisation Language
            </h2>
            <p className="text-body-sm text-muted">
              Unified design language: 2px stroke lines, soft 8% area fills, hairline gridlines, direct labels, and tabular numerals.
            </p>
          </div>

          {/* (A) Sparklines inside Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <MetricCard
              label="Consortium Commitments"
              value="1,482"
              numericValue={1482}
              countUp
              sublabel="+14% this week"
              trend={{ value: "+14%", positive: true }}
              sparklineData={[1200, 1250, 1310, 1390, 1420, 1460, 1482]}
              sparklineColor="var(--brand-sapphire)"
            />

            <MetricCard
              label="Syndicate Hits (48h)"
              value="18"
              numericValue={18}
              countUp
              sublabel="Cross-bank inquiries"
              trend={{ value: "-4%", positive: false }}
              sparklineData={[24, 21, 20, 19, 18, 17, 18]}
              sparklineColor="var(--signal-flagged)"
            />

            <MetricCard
              label="AppealDAO Treasury Stake"
              value="0.25 ETH"
              sublabel="Escrow collateral locked"
              sparklineData={[0.05, 0.1, 0.15, 0.2, 0.2, 0.25, 0.25]}
              sparklineColor="var(--brand-gold)"
            />
          </div>

          {/* (B) Ring Velocity Network Map */}
          <RingVelocityNetworkMap />

          {/* (C) Merkle Tree Viewer */}
          <MerkleTreeViewer />

          {/* (D) Appeal Vote Progress Ring */}
          <Card className="p-6 bg-surface border-hairline shadow-card space-y-4">
            <div className="border-b border-hairline pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-heading-md font-normal text-ink">
                  Appeal Vote Progress Ring with Quorum Marker
                </h3>
                <p className="text-body-sm text-muted">
                  Interactive circular meter with strict 80% (4/5) supermajority quorum threshold notch.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSampleVotes((v) => Math.max(0, v - 1))}
                  disabled={sampleVotes <= 0}
                >
                  - Vote
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSampleVotes((v) => Math.min(5, v + 1))}
                  disabled={sampleVotes >= 5}
                >
                  + Vote
                </Button>
              </div>
            </div>

            <div className="py-4 flex justify-center">
              <AppealVoteProgressRing
                votesFor={sampleVotes}
                totalVotes={5}
                requiredQuorum={4}
                size={140}
                strokeWidth={9}
              />
            </div>
          </Card>
        </section>

        {/* ======================================================== */}
        {/* 5. TABLE DENSITY & SPACING SYSTEM                         */}
        {/* ======================================================== */}
        <section className="space-y-6">
          <div className="border-b border-hairline pb-3">
            <span className="text-eyebrow uppercase tracking-wider text-muted font-medium">05 / Density &amp; Tables</span>
            <h2 className="font-serif text-2xl text-ink font-normal mt-0.5">
              Table Density &amp; Layout Grid
            </h2>
            <p className="text-body-sm text-muted">
              Sticky headers, tabular numerals, subtle row hover tint, zero zebra clutter, and "Comfortable vs. Compact" density toggle.
            </p>
          </div>

          <DataTable
            title="Consortium Activity Docket"
            columns={sampleColumns}
            data={sampleTableData}
            keyExtractor={(item) => item.id}
            showDensityToggle={true}
            defaultDensity="comfortable"
          />
        </section>

        {/* ======================================================== */}
        {/* 6. FORMAL CONSORTIUM BANK SKINS                          */}
        {/* ======================================================== */}
        <section className="space-y-6">
          <div className="border-b border-hairline pb-3">
            <span className="text-eyebrow uppercase tracking-wider text-muted font-medium">06 / Bank Skins</span>
            <h2 className="font-serif text-2xl text-ink font-normal mt-0.5">
              Formal Bank Skin Configuration
            </h2>
            <p className="text-body-sm text-muted">
              Adding a new bank is a single config object. Accents color monograms and tags only; the canvas and surface remain pristine.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {banks.map((b) => (
              <div
                key={b.id}
                onClick={() => setSelectedBankSkin(b)}
                className={cn(
                  "p-4 rounded-card border transition-all cursor-pointer space-y-3",
                  selectedBankSkin.id === b.id
                    ? "bg-surface border-brand-sapphire shadow-card ring-1 ring-brand-sapphire"
                    : "bg-surface border-hairline hover:border-muted/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <BankMonogram bankId={b.id} size="default" />
                  <div>
                    <span className="font-semibold text-xs text-ink block">{b.name}</span>
                    <span className="text-[11px] text-muted">{b.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-hairline text-xs font-mono">
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: b.skin.accentColor }}
                  />
                  <span className="text-[11px] text-ink">{b.skin.accentColor}</span>
                  <span className="ml-auto text-[10px] text-faint">WCAG AA ✓</span>
                </div>
              </div>
            ))}
          </div>

          {/* Skin Deep-Dive Inspector */}
          {selectedBankSkin && (
            <Card className="p-6 bg-surface border-hairline shadow-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-hairline pb-3">
                <div className="flex items-center gap-2.5">
                  <BankMonogram bankId={selectedBankSkin.id} size="default" />
                  <div>
                    <h3 className="font-serif text-heading-md font-normal text-ink">
                      {selectedBankSkin.name} Skin Configuration
                    </h3>
                    <p className="text-body-sm text-muted">
                      {selectedBankSkin.branchCity} &bull; {selectedBankSkin.tagline}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-pill bg-subtle text-ink border border-hairline">
                  {selectedBankSkin.code}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div className="p-3 rounded bg-subtle/40 border border-hairline space-y-1">
                  <span className="text-muted text-[10px] block uppercase">Primary Accent</span>
                  <div className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: selectedBankSkin.skin.accentColor }} />
                    <span className="font-semibold text-ink">{selectedBankSkin.skin.accentColor}</span>
                  </div>
                </div>

                <div className="p-3 rounded bg-subtle/40 border border-hairline space-y-1">
                  <span className="text-muted text-[10px] block uppercase">Badge Text (Light)</span>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedBankSkin.skin.badgeTextLight }} />
                    <span className="font-semibold text-ink">
                      {selectedBankSkin.skin.badgeTextLight}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded bg-subtle/40 border border-hairline space-y-1">
                  <span className="text-muted text-[10px] block uppercase">Badge Text (Dark)</span>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedBankSkin.skin.badgeTextDark }} />
                    <span className="font-semibold text-ink">
                      {selectedBankSkin.skin.badgeTextDark}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded bg-subtle/40 border border-hairline space-y-1">
                  <span className="text-muted text-[10px] block uppercase">Row Tint State</span>
                  <span className="font-semibold text-ink">{selectedBankSkin.skin.tintBg}</span>
                </div>
              </div>
            </Card>
          )}
        </section>
      </div>
    </AppShell>
  );
}
