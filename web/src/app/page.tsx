"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Lock,
  Layers,
  Scale,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Eye,
  EyeOff,
  Server,
  Zap,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Cpu,
  Network,
  Gavel,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import {
  Hero01,
  Button,
  StatusPill,
  HashChip,
  Card,
  Eyebrow,
  SectionHeading,
  LandingBackground,
} from "@/components/ui";
import { InteractiveProofTeaser } from "@/components/InteractiveProofTeaser";
import { KavachLogo } from "@/components/KavachLogo";
import { BrandPattern } from "@/components/BrandPattern";

export default function LandingPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setExpandedFaq(expandedFaq === idx ? null : idx);
  };

  const faqItems = [
    {
      q: "How does Kavach prevent banks from seeing each other's customer databases?",
      a: "All on-chain records consist solely of 32-byte Poseidon hashes salted with the consortium secret. Plaintext national identifiers (PAN, Aadhaar) never leave the originating bank's secure RAM perimeter. When screening an applicant, your local browser generates a zero-knowledge membership proof without disclosing who you are checking.",
    },
    {
      q: "Is Kavach compliant with India's DPDP Act (2023)?",
      a: "Yes, by mathematical construction. Under DPDP Act Section 4, Kavach operates entirely on irreversibly transformed cryptographic commitments and zero-knowledge proofs. No personally identifiable information (PII) is stored on-chain or transferred between institutions, eliminating cross-lender data sharing liability.",
    },
    {
      q: "What prevents a malicious or competitor bank from mass-flagging innocent borrowers?",
      a: "Every identity flag requires depositing 0.05 ETH collateral into the on-chain escrow contract. Any member institution can sponsor an appeal during the 72-hour dispute window. If 2/3 of member banks uphold the appeal, the flag is pruned from the Merkle tree and the offending bank's collateral is slashed.",
    },
    {
      q: "How fast is proof generation during a real-time loan underwriting decision?",
      a: "In-browser Groth16 proof generation takes between 200ms and 800ms on standard commercial workstations using our dedicated Web Worker pipeline. Verification on-chain takes under 30ms, making it imperceptible in automated loan origination systems (LOS).",
    },
    {
      q: "What happens if the local node or RPC endpoint goes offline?",
      a: "Kavach features automatic fallback to secondary consortium RPC nodes and caches the latest Merkle root in browser IndexedDB. Underwriters can continue generating local proofs against the cached state with visible sync timestamps.",
    },
    {
      q: "How do I integrate Kavach into our bank's existing loan origination system (LOS)?",
      a: "Kavach exposes both a high-performance REST/GraphQL gateway and a client-side TypeScript SDK (@kavach/prover). It can be embedded into LOS underwriting workflows with under 20 lines of code, running either in a headless Node microservice or directly in loan officer web portals.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-canvas text-ink font-sans selection:bg-brand-sapphire/15 selection:text-ink">
      {/* ======================================================== */}
      {/* UNIFIED SCROLL-STORY FIXED BACKGROUND (Aurora + Lattice + Chips) */}
      {/* ======================================================== */}
      <LandingBackground />

      {/* ======================================================== */}
      {/* SECTIONS 1, 2, 3: HEADER, HERO, & BRAND MARQUEE (Hero01) */}
      {/* ======================================================== */}
      <div id="hero">
        <Hero01
          eyebrowText="Consortium testnet is live"
          title={
            <>
              Fraud shared, <em>never exposed.</em>
            </>
          }
          subtitle="Banks flag confirmed fraudsters as cryptographic commitments. Other banks verify matches with zero-knowledge proofs. No customer data ever moves."
          primaryCtaText="Open bank console"
          primaryCtaHref="/bank/meridian"
          secondaryCtaText="See how it works"
          secondaryCtaHref="#how-it-works"
          ratingText="Trusted by 12 consortium banks"
          brandSliderTitle="Verified by member institutions"
        />
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ======================================================== */}
        {/* SECTION 4: THE PROBLEM (Striking Split & Attack Timeline) */}
        {/* ======================================================== */}
        <section id="problem" className="py-20 sm:py-28 lg:py-32 border-t border-hairline">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Column: Striking Split Copy */}
            <div className="lg:col-span-6 space-y-6">
              <Eyebrow variant="flagged">01 / The Core Vulnerability</Eyebrow>
              
              <SectionHeading size="lg" className="text-ink">
                A fraud ring hits one bank,{" "}
                <span className="font-serif italic font-normal text-semantic-flagged">
                  then repeats the attack at ten others.
                </span>
              </SectionHeading>

              <p className="font-serif text-heading-md text-ink leading-snug">
                Banks can&apos;t share customer data.{" "}
                <span className="text-semantic-flagged font-medium">So the same attack repeats.</span>
              </p>

              {/* Exact Problem Story Caption */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-semantic-flagged-wash border border-semantic-flagged/25 text-semantic-flagged text-xs font-mono font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-semantic-flagged animate-pulse" />
                <span>Banks can&apos;t share customer data. So the same attack repeats.</span>
              </div>

              <p className="text-body-lg text-muted leading-relaxed">
                Organised loan syndicates exploit this institutional silence. When a fraudster is detected,
                privacy laws prevent the victim bank from sharing the identity with competitors. The syndicate
                submits identical loan applications to ten other lenders within hours.
              </p>

              <p className="text-body-md text-muted leading-relaxed">
                By the time traditional credit bureaus process batch reports 30 to 45 days later, the funds
                are wired, accounts emptied, and syndicates dissolved.
              </p>

              <div className="pt-2">
                <div className="inline-flex items-center gap-3 rounded-card border border-hairline bg-surface p-4 text-body-sm shadow-subtle">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-semantic-flagged/10 text-semantic-flagged">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium text-ink">30–45 Day Bureau Lag</div>
                    <div className="text-xs text-muted">Syndicates exploit this window across unsecured retail &amp; SME loans.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Animated Attack Timeline */}
            <div className="lg:col-span-6">
              <Card tilt className="p-6 sm:p-8 bg-surface border-hairline shadow-card relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-hairline mb-6">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-semantic-flagged animate-ping" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-semantic-flagged">
                      Live Multi-Bank Burst Attack
                    </span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-pill bg-semantic-flagged/10 text-semantic-flagged font-semibold">
                    Exploitation in progress
                  </span>
                </div>

                {/* Timeline Items */}
                <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-hairline">
                  {/* Event 1 */}
                  <div className="relative flex items-start gap-4 pl-8 group">
                    <span className="absolute left-1.5 top-1 h-3.5 w-3.5 rounded-full border-2 border-surface bg-semantic-flagged" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono font-bold text-ink">09:14 AM</span>
                        <span className="font-mono text-faint">T + 00m</span>
                      </div>
                      <div className="text-body-sm font-semibold text-ink">Meridian Bank</div>
                      <div className="text-xs text-muted">₹15,00,000 Unsecured personal credit application. Flagged for document anomaly.</div>
                    </div>
                  </div>

                  {/* Event 2 */}
                  <div className="relative flex items-start gap-4 pl-8 group">
                    <span className="absolute left-1.5 top-1 h-3.5 w-3.5 rounded-full border-2 border-surface bg-semantic-flagged" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono font-bold text-ink">09:28 AM</span>
                        <span className="font-mono text-semantic-flagged font-bold">+14m</span>
                      </div>
                      <div className="text-body-sm font-semibold text-ink">Kestrel Capital</div>
                      <div className="text-xs text-muted">₹12,00,000 Digital MSME overdraft application. Blind to Meridian&apos;s internal flag.</div>
                    </div>
                  </div>

                  {/* Event 3 */}
                  <div className="relative flex items-start gap-4 pl-8 group">
                    <span className="absolute left-1.5 top-1 h-3.5 w-3.5 rounded-full border-2 border-surface bg-semantic-flagged" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono font-bold text-ink">09:41 AM</span>
                        <span className="font-mono text-semantic-flagged font-bold">+27m</span>
                      </div>
                      <div className="text-body-sm font-semibold text-ink">Aurum Trust</div>
                      <div className="text-xs text-muted">₹10,00,000 Instant credit line requested. Bureau check returns clean historical score.</div>
                    </div>
                  </div>

                  {/* Event 4 */}
                  <div className="relative flex items-start gap-4 pl-8 group">
                    <span className="absolute left-1.5 top-1 h-3.5 w-3.5 rounded-full border-2 border-surface bg-semantic-flagged" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono font-bold text-ink">11:05 AM</span>
                        <span className="font-mono text-semantic-flagged font-bold">+1h 51m</span>
                      </div>
                      <div className="text-body-sm font-semibold text-ink">Halcyon Financial</div>
                      <div className="text-xs text-muted">₹14,00,000 Equipment lease finance applied. Total stacked exposure: ₹51 Lakhs.</div>
                    </div>
                  </div>

                  {/* Bureau Delay Block */}
                  <div className="relative flex items-start gap-4 pl-8 pt-2">
                    <span className="absolute left-1.5 top-3.5 h-3.5 w-3.5 rounded-full border-2 border-surface bg-muted" />
                    <div className="flex-1 rounded-card bg-subtle/70 p-3.5 border border-dashed border-hairline">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono font-semibold text-muted">30–45 Days Later</span>
                        <span className="font-mono text-semantic-flagged text-[11px] font-semibold">Bureau sync</span>
                      </div>
                      <p className="text-xs text-muted">
                        Credit bureau publishes monthly batch file. Syndicate has cashed out and defaulted across all 4 institutions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-hairline flex items-center justify-between text-xs text-muted">
                  <span>Attack window: <strong>1h 51m</strong></span>
                  <span className="text-semantic-flagged font-semibold">Consortium blind spot: 100%</span>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 5: THE SOLUTION IN 3 CARDS (Commit, Anchor, Prove) */}
        {/* ======================================================== */}
        <section id="how-it-works" className="py-20 sm:py-28 lg:py-32 border-t border-hairline">
          <div className="max-w-3xl mb-16">
            <Eyebrow variant="brand" className="mb-3">
              02 / Cryptographic Architecture
            </Eyebrow>
            <SectionHeading size="lg" className="mb-4">
              Commit. Anchor. Prove.
            </SectionHeading>
            <p className="text-body-lg text-muted">
              Three deterministic steps decouple fraud intelligence from identity exposure,
              complying with the DPDP Act (2023) by mathematical construction.
            </p>
          </div>

          <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Step 1: Commit */}
            <Card tilt interactive className="relative p-8 flex flex-col justify-between hover:shadow-card transition-all duration-300 group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-body-sm font-semibold text-faint group-hover:text-brand-sapphire transition-colors">
                    STEP 01
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-subtle text-ink group-hover:bg-brand-sapphire/10 group-hover:text-brand-sapphire transition-colors">
                    <Lock className="h-5 w-5 stroke-[1.5]" />
                  </div>
                </div>

                {/* Custom Line-Art SVG: In-Memory Hashing */}
                <div className="h-28 w-full rounded-input bg-subtle/60 border border-hairline flex items-center justify-center p-4 mb-6">
                  <svg className="w-full h-full text-muted" viewBox="0 0 200 80" fill="none">
                    <rect x="10" y="25" width="45" height="30" rx="6" stroke="currentColor" strokeWidth="1.5" fill="var(--surface)" />
                    <text x="32" y="44" fontSize="9" textAnchor="middle" fill="currentColor" fontFamily="monospace">PII</text>
                    <path d="M60 40h25m0 0l-5-5m5 5l-5 5" stroke="var(--brand-sapphire)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="105" cy="40" r="14" stroke="currentColor" strokeWidth="1.5" fill="var(--surface)" />
                    <text x="105" y="44" fontSize="8" textAnchor="middle" fill="currentColor" fontFamily="monospace">Poseidon</text>
                    <path d="M125 40h25m0 0l-5-5m5 5l-5 5" stroke="var(--brand-sapphire)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="155" y="25" width="35" height="30" rx="6" stroke="var(--signal-flagged)" strokeWidth="1.5" fill="var(--surface)" />
                    <text x="172" y="44" fontSize="8" textAnchor="middle" fill="var(--signal-flagged)" fontFamily="monospace">Leaf</text>
                  </svg>
                </div>

                <h3 className="font-serif text-heading-md text-ink mb-2">
                  Commit in memory
                </h3>
                <p className="text-body-sm text-muted leading-relaxed">
                  Raw national identifiers (PAN, Aadhaar) are salted and hashed locally in browser RAM using Poseidon over BN254. Plaintext PII never touches outbound network sockets.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-hairline flex items-center gap-2 text-xs text-faint">
                <span className="w-1.5 h-1.5 rounded-full bg-semantic-verified" />
                <span>Zero transmission of raw identifiers</span>
              </div>
            </Card>

            {/* Step 2: Anchor */}
            <Card tilt interactive className="relative p-8 flex flex-col justify-between hover:shadow-card transition-all duration-300 group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-body-sm font-semibold text-faint group-hover:text-brand-sapphire transition-colors">
                    STEP 02
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-subtle text-ink group-hover:bg-brand-sapphire/10 group-hover:text-brand-sapphire transition-colors">
                    <Layers className="h-5 w-5 stroke-[1.5]" />
                  </div>
                </div>

                {/* Custom Line-Art SVG: Merkle Root Tree */}
                <div className="h-28 w-full rounded-input bg-subtle/60 border border-hairline flex items-center justify-center p-4 mb-6">
                  <svg className="w-full h-full text-muted" viewBox="0 0 200 80" fill="none">
                    <circle cx="100" cy="18" r="10" stroke="var(--brand-gold)" strokeWidth="1.5" fill="var(--surface)" />
                    <text x="100" y="21" fontSize="7" textAnchor="middle" fill="currentColor" fontFamily="monospace">Root</text>
                    <path d="M93 25L60 48M107 25l33 23" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" />
                    <circle cx="55" cy="55" r="8" stroke="currentColor" strokeWidth="1.2" fill="var(--surface)" />
                    <circle cx="145" cy="55" r="8" stroke="currentColor" strokeWidth="1.2" fill="var(--surface)" />
                    <path d="M50 62L35 72M60 62l15 10M140 62l-15 10M150 62l15 10" stroke="currentColor" strokeWidth="1" />
                    <circle cx="35" cy="74" r="4" fill="var(--signal-flagged)" />
                    <circle cx="75" cy="74" r="4" fill="var(--signal-verified)" />
                    <circle cx="125" cy="74" r="4" fill="var(--faint)" />
                    <circle cx="165" cy="74" r="4" fill="var(--faint)" />
                  </svg>
                </div>

                <h3 className="font-serif text-heading-md text-ink mb-2">
                  Anchor on-chain
                </h3>
                <p className="text-body-sm text-muted leading-relaxed">
                  The 32-byte leaf is registered to the Ethereum FraudRegistry with 0.05 ETH escrow collateral. The Merkle root is updated atomically in a single immutable transaction.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-hairline flex items-center gap-2 text-xs text-faint">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                <span>0.05 ETH collateral escrowed per leaf</span>
              </div>
            </Card>

            {/* Step 3: Prove */}
            <Card tilt interactive className="relative p-8 flex flex-col justify-between hover:shadow-card transition-all duration-300 group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-body-sm font-semibold text-faint group-hover:text-brand-sapphire transition-colors">
                    STEP 03
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-subtle text-ink group-hover:bg-brand-sapphire/10 group-hover:text-brand-sapphire transition-colors">
                    <Shield className="h-5 w-5 stroke-[1.5]" />
                  </div>
                </div>

                {/* Custom Line-Art SVG: Groth16 Proof */}
                <div className="h-28 w-full rounded-input bg-subtle/60 border border-hairline flex items-center justify-center p-4 mb-6">
                  <svg className="w-full h-full text-muted" viewBox="0 0 200 80" fill="none">
                    <rect x="20" y="20" width="70" height="40" rx="8" stroke="currentColor" strokeWidth="1.5" fill="var(--surface)" />
                    <text x="55" y="38" fontSize="8" textAnchor="middle" fill="currentColor">Private Applicant</text>
                    <text x="55" y="50" fontSize="7" textAnchor="middle" fill="var(--faint)" fontFamily="monospace">+ Salt Witness</text>
                    <path d="M95 40h20m0 0l-4-4m4 4l-4 4" stroke="var(--brand-sapphire)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="145" cy="40" r="18" stroke="var(--brand-sapphire)" strokeWidth="1.5" fill="var(--surface)" />
                    <path d="M138 40l5 5 10-10" stroke="var(--signal-verified)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <text x="145" y="66" fontSize="7" textAnchor="middle" fill="var(--brand-sapphire)">Groth16 ZK</text>
                  </svg>
                </div>

                <h3 className="font-serif text-heading-md text-ink mb-2">
                  Prove in client browser
                </h3>
                <p className="text-body-sm text-muted leading-relaxed">
                  During loan screening, member banks generate client-side Groth16 SNARK proofs against the canonical root in &lt; 800ms. If matched, a fraud signal is raised without disclosing identity.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-hairline flex items-center gap-2 text-xs text-faint">
                <span className="w-1.5 h-1.5 rounded-full bg-semantic-verified" />
                <span>Deterministic Groth16 BN254 verification</span>
              </div>
            </Card>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 6: INTERACTIVE PROOF DEMO TEASER                  */}
        {/* ======================================================== */}
        <section id="demo" className="py-20 sm:py-28 lg:py-32 border-t border-hairline">
          <div className="max-w-3xl mb-12">
            <Eyebrow variant="brand" className="mb-3">
              03 / Live Interactive Prover
            </Eyebrow>
            <SectionHeading size="lg" className="mb-4">
              Experience the proof moment live in your browser
            </SectionHeading>
            <p className="text-body-lg text-muted">
              Run the exact client-side zero-knowledge screening flow that loan underwriters execute.
              No network round-trips for PII, verified against the canonical consortium root.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <InteractiveProofTeaser />
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 7: RING VELOCITY SPOTLIGHT                       */}
        {/* ======================================================== */}
        <section id="syndicate-velocity" className="py-20 sm:py-28 lg:py-32 border-t border-hairline">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Copy */}
            <div className="lg:col-span-6 space-y-6">
              <Eyebrow variant="brand">04 / Syndicate Velocity</Eyebrow>
              
              <SectionHeading size="lg">
                Seen at 4 banks in 48 hours, <em>without revealing a single customer.</em>
              </SectionHeading>

              <p className="text-body-lg text-muted leading-relaxed">
                Fraud syndicates exploit traditional credit bureau reporting delays of 15 to 30 days
                by applying for unsecured personal and SME credit across multiple lenders within hours.
              </p>

              <p className="text-body-md text-muted leading-relaxed">
                Kavach generates a deterministic Groth16 nullifier on each query. When the same identity
                is evaluated across multiple member institutions, the protocol tallies cross-bank ring
                velocity in real time—instantly alerting underwriters without disclosing customer details.
              </p>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-hairline">
                <div>
                  <div className="font-serif text-[32px] text-ink font-normal leading-none">&lt; 800ms</div>
                  <span className="text-xs text-muted font-medium mt-1 block">Cross-bank detection</span>
                </div>
                <div>
                  <div className="font-serif text-[32px] text-semantic-verified font-normal leading-none">4.8×</div>
                  <span className="text-xs text-muted font-medium mt-1 block">Syndicate reduction</span>
                </div>
                <div>
                  <div className="font-serif text-[32px] text-brand-sapphire font-normal leading-none">100%</div>
                  <span className="text-xs text-muted font-medium mt-1 block">Zero PII transfer</span>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/bank/meridian/onboard">
                  <Button variant="primary" size="default" withOrb>
                    Test Live Applicant Scanner
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Interactive Animated SVG */}
            <div className="lg:col-span-6">
              <Card tilt className="p-8 bg-surface shadow-elevated border-hairline overflow-hidden relative">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-hairline">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-semantic-flagged animate-ping" />
                    <span className="text-xs font-mono font-semibold uppercase text-semantic-flagged">
                      Real-Time Ring Velocity Alert
                    </span>
                  </div>
                  <StatusPill variant="flagged" size="sm" label="Velocity: 4 Hits" />
                </div>

                {/* Animated Radial Network SVG */}
                <div className="relative h-64 sm:h-72 w-full flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 400 260" fill="none">
                    {/* Concentric Pulse Rings */}
                    <circle cx="200" cy="130" r="100" stroke="rgba(229, 72, 77, 0.08)" strokeWidth="1" />
                    <circle cx="200" cy="130" r="70" stroke="rgba(229, 72, 77, 0.15)" strokeWidth="1" />
                    <circle cx="200" cy="130" r="40" stroke="rgba(229, 72, 77, 0.25)" strokeWidth="1" />

                    {/* Connection Rays */}
                    <line x1="200" y1="130" x2="80" y2="60" stroke="#0E9F9F" strokeWidth="1.5" strokeDasharray="3 3" />
                    <line x1="200" y1="130" x2="320" y2="60" stroke="#E8851A" strokeWidth="1.5" strokeDasharray="3 3" />
                    <line x1="200" y1="130" x2="80" y2="200" stroke="#B8913F" strokeWidth="1.5" strokeDasharray="3 3" />
                    <line x1="200" y1="130" x2="320" y2="200" stroke="#2F5BFF" strokeWidth="1.5" strokeDasharray="3 3" />

                    {/* Central Target Node (Hashed Identity) */}
                    <circle cx="200" cy="130" r="24" fill="var(--ink)" stroke="var(--hairline)" strokeWidth="2" />
                    <text x="200" y="133" fontSize="8" textAnchor="middle" fill="#FFFFFF" fontFamily="monospace">0x19a9</text>
                    <text x="200" y="165" fontSize="9" textAnchor="middle" fill="var(--muted)">Nullifier Hash</text>

                    {/* Bank 1: Meridian */}
                    <g transform="translate(80, 60)">
                      <circle cx="0" cy="0" r="18" fill="#0E9F9F" />
                      <text x="0" y="4" fontSize="9" textAnchor="middle" fill="#FFFFFF" fontWeight="bold">MB</text>
                      <text x="0" y="-24" fontSize="9" textAnchor="middle" fill="var(--ink)">Meridian Bank</text>
                      <text x="0" y="-14" fontSize="8" textAnchor="middle" fill="var(--faint)">09:14 AM</text>
                    </g>

                    {/* Bank 2: Kestrel */}
                    <g transform="translate(320, 60)">
                      <circle cx="0" cy="0" r="18" fill="#E8851A" />
                      <text x="0" y="4" fontSize="9" textAnchor="middle" fill="#FFFFFF" fontWeight="bold">KC</text>
                      <text x="0" y="-24" fontSize="9" textAnchor="middle" fill="var(--ink)">Kestrel Capital</text>
                      <text x="0" y="-14" fontSize="8" textAnchor="middle" fill="var(--faint)">10:02 AM</text>
                    </g>

                    {/* Bank 3: Aurum */}
                    <g transform="translate(80, 200)">
                      <circle cx="0" cy="0" r="18" fill="#B8913F" />
                      <text x="0" y="4" fontSize="9" textAnchor="middle" fill="#FFFFFF" fontWeight="bold">AT</text>
                      <text x="0" y="30" fontSize="9" textAnchor="middle" fill="var(--ink)">Aurum Trust</text>
                      <text x="0" y="40" fontSize="8" textAnchor="middle" fill="var(--faint)">11:45 AM</text>
                    </g>

                    {/* Bank 4: Halcyon */}
                    <g transform="translate(320, 200)">
                      <circle cx="0" cy="0" r="18" fill="#2F5BFF" />
                      <text x="0" y="4" fontSize="9" textAnchor="middle" fill="#FFFFFF" fontWeight="bold">HF</text>
                      <text x="0" y="30" fontSize="9" textAnchor="middle" fill="var(--ink)">Halcyon Financial</text>
                      <text x="0" y="40" fontSize="8" textAnchor="middle" fill="var(--faint)">01:20 PM</text>
                    </g>
                  </svg>
                </div>

                <div className="mt-4 pt-4 border-t border-hairline flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-muted">Target Identity: <HashChip hash="0x19a99ebe9f36b701c10d7a6e1388bf34d31d92a4f49b71e164ef15049b736b04" /></span>
                  <span className="font-medium text-semantic-flagged">4 hits within 4h 06m</span>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 8: PRIVACY BY DESIGN (Three-Column Comparison)    */}
        {/* ======================================================== */}
        <section id="privacy" className="py-20 sm:py-28 lg:py-32 border-t border-hairline">
          <div className="max-w-3xl mb-16">
            <Eyebrow variant="brand" className="mb-3">
              05 / Data Sovereignty & DPDP Compliance
            </Eyebrow>
            <SectionHeading size="lg" className="mb-4">
              Mathematical privacy, by legal definition.
            </SectionHeading>
            <p className="text-body-lg text-muted">
              Under India&apos;s Digital Personal Data Protection Act (2023), cross-lender sharing of plain
              identity records creates severe compliance liability. Kavach mathematically separates
              fraud signals from personal identifying information.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Column 1: What Banks See */}
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-subtle text-ink">
                  <Eye className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-serif text-heading-md text-ink">What banks see</h3>
                  <span className="text-xs text-faint">In local memory during review</span>
                </div>
              </div>

              <ul className="space-y-4 text-body-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-semantic-verified shrink-0 mt-0.5" />
                  <span className="text-muted">
                    <strong className="text-ink font-medium">Applicant identifier</strong> entered by loan officer in secure RAM.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-semantic-verified shrink-0 mt-0.5" />
                  <span className="text-muted">
                    <strong className="text-ink font-medium">Clearance verdict:</strong> Negative match (clean) or Positive hit.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-semantic-verified shrink-0 mt-0.5" />
                  <span className="text-muted">
                    <strong className="text-ink font-medium">Syndicate ring velocity:</strong> Count of distinct lenders presented within 48h.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-semantic-verified shrink-0 mt-0.5" />
                  <span className="text-muted">
                    <strong className="text-ink font-medium">Fraud categorization</strong> (Mule Account, Loan Stacking, Document Forgery).
                  </span>
                </li>
              </ul>
            </Card>

            {/* Column 2: What the Chain Sees */}
            <Card className="p-8 border-brand-sapphire/20 bg-surface shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-sapphire/10 text-brand-sapphire">
                  <Server className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-serif text-heading-md text-ink">What the chain sees</h3>
                  <span className="text-xs text-brand-sapphire font-medium">Immutable public ledger</span>
                </div>
              </div>

              <ul className="space-y-4 text-body-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-brand-sapphire shrink-0 mt-0.5" />
                  <span className="text-muted">
                    <strong className="text-ink font-medium">32-byte Poseidon leaf hashes</strong> (<code className="font-mono text-xs">0x19a9...0e3b</code>).
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-brand-sapphire shrink-0 mt-0.5" />
                  <span className="text-muted">
                    <strong className="text-ink font-medium">Authorized node addresses</strong> of certified member banks.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-brand-sapphire shrink-0 mt-0.5" />
                  <span className="text-muted">
                    <strong className="text-ink font-medium">Cryptographic Merkle roots</strong> and discrete tree height.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-brand-sapphire shrink-0 mt-0.5" />
                  <span className="text-muted">
                    <strong className="text-ink font-medium">Escrow deposits:</strong> 0.05 ETH collateral bonded per leaf.
                  </span>
                </li>
              </ul>
            </Card>

            {/* Column 3: What Nobody Sees */}
            <Card className="p-8 bg-subtle/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-semantic-flagged/10 text-semantic-flagged">
                  <EyeOff className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-serif text-heading-md text-ink">What nobody sees</h3>
                  <span className="text-xs text-semantic-flagged font-medium">Mathematically concealed</span>
                </div>
              </div>

              <ul className="space-y-4 text-body-sm">
                <li className="flex items-start gap-3">
                  <Lock className="h-4 w-4 text-semantic-flagged shrink-0 mt-0.5" />
                  <span className="text-muted">
                    <strong className="text-ink font-medium">Plaintext national IDs:</strong> No PAN, Aadhaar, or Passport strings.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Lock className="h-4 w-4 text-semantic-flagged shrink-0 mt-0.5" />
                  <span className="text-muted">
                    <strong className="text-ink font-medium">Customer underwriting files:</strong> Financial statements, balances, or CIBIL scores.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Lock className="h-4 w-4 text-semantic-flagged shrink-0 mt-0.5" />
                  <span className="text-muted">
                    <strong className="text-ink font-medium">Borrower identity linkages:</strong> Non-flagged clean borrowers remain completely unrecorded.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Lock className="h-4 w-4 text-semantic-flagged shrink-0 mt-0.5" />
                  <span className="text-muted">
                    <strong className="text-ink font-medium">Inter-bank portfolios:</strong> Competitor underwriting volumes or customer acquisition metrics.
                  </span>
                </li>
              </ul>
            </Card>
          </div>

          <div className="mt-10 text-center">
            <Link href="/trust">
              <Button variant="secondary" size="default">
                Explore Full DPDP &amp; Privacy Architecture <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 9: ACCOUNTABILITY & APPEAL DAO                   */}
        {/* ======================================================== */}
        <section id="governance" className="py-20 sm:py-28 lg:py-32 border-t border-hairline">
          <div className="max-w-3xl mb-16">
            <Eyebrow variant="brand" className="mb-3">
              06 / Economic Deterrence &amp; Governance
            </Eyebrow>
            <SectionHeading size="lg" className="mb-4">
              Consortium governance with economic teeth
            </SectionHeading>
            <p className="text-body-lg text-muted">
              To prevent fraudulent collusion, frivolous flagging, or false positives, every commitment
              requires bonded capital. Wrongful flags are appealed and slashed through AppealDAO.
            </p>
          </div>

          <Card tilt className="p-8 sm:p-12 border-brand-gold/30 bg-surface shadow-card relative overflow-hidden">
            {/* Ambient Gold Corner Flare */}
            <div
              className="absolute top-0 right-0 h-64 w-64 rounded-full blur-[90px] opacity-25 pointer-events-none"
              style={{ background: "radial-gradient(circle, var(--consortium-gold) 0%, transparent 70%)" }}
            />

            <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Step 1 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold/20 text-ink text-xs font-bold font-mono">
                    1
                  </div>
                  <h4 className="font-serif text-heading-md text-ink">0.05 ETH Escrow Stake</h4>
                </div>
                <p className="text-body-sm text-muted leading-relaxed">
                  When a bank flags an identity commitment, 0.05 ETH collateral is locked into the registry escrow. Malicious or wrongful flagging risks permanent forfeiture.
                </p>
                <div className="pt-1">
                  <StatusPill variant="consortium" size="sm" label="Escrow active" />
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold/20 text-ink text-xs font-bold font-mono">
                    2
                  </div>
                  <h4 className="font-serif text-heading-md text-ink">72-Hour Dispute Window</h4>
                </div>
                <p className="text-body-sm text-muted leading-relaxed">
                  Any non-flagging member bank can sponsor an applicant appeal by submitting counter-evidence hashes and opening an on-chain AppealDAO ballot.
                </p>
                <div className="pt-1">
                  <StatusPill variant="pending" size="sm" label="In-flight dispute" />
                </div>
              </div>

              {/* Step 3 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold/20 text-ink text-xs font-bold font-mono">
                    3
                  </div>
                  <h4 className="font-serif text-heading-md text-ink">2/3 Quorum &amp; Slashing</h4>
                </div>
                <p className="text-body-sm text-muted leading-relaxed">
                  Upon achieving 66.7% supermajority approval, the wrongful leaf is pruned from the Merkle tree, the borrower is cleared, and the flagging bank&apos;s stake is slashed.
                </p>
                <div className="pt-1">
                  <StatusPill variant="verified" size="sm" label="Root restored" />
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-body-sm text-muted">
                <Scale className="h-4 w-4 text-brand-gold" />
                <span>AppealDAO governs 12 member financial institutions with 1 vote per chartered bank.</span>
              </div>
              <Link href="/appeals">
                <Button variant="secondary" size="sm">
                  View AppealDAO Chamber
                </Button>
              </Link>
            </div>
          </Card>
        </section>

        {/* ======================================================== */}
        {/* SECTION 10: BUILT FOR BANKS (Stats & Security Notes)     */}
        {/* ======================================================== */}
        <section className="py-20 sm:py-28 lg:py-32 border-t border-hairline">
          <div className="max-w-3xl mb-16">
            <Eyebrow variant="brand" className="mb-3">
              07 / Institutional Readiness
            </Eyebrow>
            <SectionHeading size="lg" className="mb-4">
              Built for institutional banking infrastructure
            </SectionHeading>
            <p className="text-body-lg text-muted">
              Designed from the ground up to integrate into mission-critical loan origination pipelines with zero downtime, instant verification, and zero compliance exposure.
            </p>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Stat 1 */}
            <Card tilt interactive className="p-8 flex flex-col justify-between hover:shadow-card transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted">
                    Proving Latency
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-pill bg-subtle text-faint">
                    Demo benchmark
                  </span>
                </div>
                <div className="font-serif text-[clamp(2.5rem,5vw,3.75rem)] font-normal text-ink leading-none tracking-tight mb-3">
                  ~200 ms
                </div>
                <h4 className="text-body-sm font-semibold text-ink mb-1">
                  Average Client-Side Proving
                </h4>
                <p className="text-xs text-muted leading-relaxed">
                  Dedicated Web Worker executing snarkjs Groth16 inside browser RAM without UI thread blocking on standard employee hardware.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-hairline text-[11px] font-mono text-semantic-verified flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-semantic-verified" />
                Zero server-side proof dependencies
              </div>
            </Card>

            {/* Stat 2 */}
            <Card tilt interactive className="p-8 flex flex-col justify-between hover:shadow-card transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted">
                    Privacy Guarantee
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-pill bg-subtle text-faint">
                    DPDP Act compliant
                  </span>
                </div>
                <div className="font-serif text-[clamp(2.5rem,5vw,3.75rem)] font-normal text-ink leading-none tracking-tight mb-3">
                  0 bytes
                </div>
                <h4 className="text-body-sm font-semibold text-ink mb-1">
                  Plaintext PII Shared
                </h4>
                <p className="text-xs text-muted leading-relaxed">
                  Zero national identifiers, applicant names, or credit files ever leave the originating bank&apos;s perimeter or reach peer nodes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-hairline text-[11px] font-mono text-brand-sapphire flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-sapphire" />
                Mathematically verifiable zero-knowledge
              </div>
            </Card>

            {/* Stat 3 */}
            <Card tilt interactive className="p-8 flex flex-col justify-between hover:shadow-card transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted">
                    Scale &amp; Capacity
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-pill bg-subtle text-faint">
                    BN254 curve
                  </span>
                </div>
                <div className="font-serif text-[clamp(2.5rem,5vw,3.75rem)] font-normal text-ink leading-none tracking-tight mb-3">
                  1,048,576
                </div>
                <h4 className="text-body-sm font-semibold text-ink mb-1">
                  Merkle Tree Registry Capacity
                </h4>
                <p className="text-xs text-muted leading-relaxed">
                  Depth-20 Poseidon Merkle tree supporting over 1 million concurrent fraudulent identity commitments with constant O(1) verification gas.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-hairline text-[11px] font-mono text-ink font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                Immutable smart contract on EVM
              </div>
            </Card>
          </div>

          {/* Security Architecture Notes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-panel border border-hairline bg-surface p-4 text-xs space-y-1.5">
              <div className="font-semibold text-ink flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-brand-sapphire" />
                RBI Cyber Security Aligned
              </div>
              <p className="text-muted leading-relaxed">
                Zero-trust authentication, air-gapped secret salting, and local ephemeral key handling.
              </p>
            </div>

            <div className="rounded-panel border border-hairline bg-surface p-4 text-xs space-y-1.5">
              <div className="font-semibold text-ink flex items-center gap-2">
                <FileCheck2 className="h-3.5 w-3.5 text-semantic-verified" />
                Audited Circom Circuits
              </div>
              <p className="text-muted leading-relaxed">
                Groth16 proving system with verified R1CS constraints over the alt_bn128 curve.
              </p>
            </div>

            <div className="rounded-panel border border-hairline bg-surface p-4 text-xs space-y-1.5">
              <div className="font-semibold text-ink flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-brand-gold" />
                Sub-30ms Verification
              </div>
              <p className="text-muted leading-relaxed">
                Low gas footprint on EVM rollups enabling real-time loan underwriting gating.
              </p>
            </div>

            <div className="rounded-panel border border-hairline bg-surface p-4 text-xs space-y-1.5">
              <div className="font-semibold text-ink flex items-center gap-2">
                <Cpu className="h-3.5 w-3.5 text-primary" />
                IndexedDB Asset Caching
              </div>
              <p className="text-muted leading-relaxed">
                Verification keys and wasm provers cached client-side with sha256 integrity verification.
              </p>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 11: FAQ & FINAL CTA BAND                         */}
        {/* ======================================================== */}
        <section id="faq" className="py-20 sm:py-28 lg:py-32 border-t border-hairline">
          <div className="max-w-3xl mb-12">
            <Eyebrow variant="brand" className="mb-3">
              08 / Frequently Asked Questions
            </Eyebrow>
            <SectionHeading size="lg" className="mb-4">
              Everything you need to know about Kavach
            </SectionHeading>
            <p className="text-body-lg text-muted">
              Technical answers for bank CTOs, chief risk officers, and compliance legal teams.
            </p>
          </div>

          {/* Accessible Accordion (6 items) */}
          <div className="max-w-4xl mx-auto rounded-card border border-hairline bg-surface overflow-hidden divide-y divide-hairline shadow-subtle mb-20">
            {faqItems.map((item, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div key={idx} className="transition-colors">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-subtle/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                  >
                    <span className="font-sans text-body-md sm:text-base font-semibold text-ink">
                      {item.q}
                    </span>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-subtle text-muted">
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-6 sm:px-6 bg-subtle/20 border-t border-hairline/60 pt-4">
                      <p className="text-body-sm text-muted leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Final CTA Band */}
          <div id="cta" className="relative rounded-[24px] bg-ink text-white p-8 sm:p-14 lg:p-16 overflow-hidden shadow-elevated">
            {/* Brand Pattern Lattice at 4% opacity */}
            <BrandPattern variant="lattice" opacity={0.04} className="text-white" />

            {/* Subtle Ambient Radial Lighting */}
            <div
              className="absolute -top-32 -left-32 h-80 w-80 rounded-full blur-[100px] opacity-20 pointer-events-none"
              style={{ background: "radial-gradient(circle, var(--brand-sapphire) 0%, transparent 70%)" }}
            />
            <div
              className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full blur-[100px] opacity-25 pointer-events-none"
              style={{ background: "radial-gradient(circle, var(--consortium-gold) 0%, transparent 70%)" }}
            />

            <div className="relative z-10 max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-pill bg-white/10 px-3 py-1 text-eyebrow font-medium text-white/80 uppercase tracking-widest mb-6">
                Consortium Network Access
              </span>

              <h2 className="font-serif text-[36px] sm:text-[48px] lg:text-[56px] leading-[1.08] font-normal tracking-tight text-white mb-6">
                Ready to armour your institution against syndicated fraud?
              </h2>

              <p className="text-body-lg text-white/70 max-w-2xl mb-8 leading-relaxed">
                Connect your loan underwriting stack to Kavach Network to detect loan stacking
                and synthetic identity fraud in milliseconds without leaking customer PII.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link href="/bank/meridian">
                  <button className="inline-flex items-center justify-center whitespace-nowrap text-body-md font-medium transition-all duration-200 bg-white text-ink hover:bg-white/95 rounded-pill h-13 px-6 py-3 shadow-subtle group">
                    <span>Open Bank Console</span>
                    <span className="ml-2.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-white shadow-sm transition-transform duration-200 group-hover:scale-105 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      <ArrowRight className="h-4 w-4 stroke-[2]" />
                    </span>
                  </button>
                </Link>

                <Link href="/appeals">
                  <button className="inline-flex items-center justify-center whitespace-nowrap text-body-md font-medium transition-all duration-200 bg-transparent text-white border border-white/20 hover:bg-white/10 rounded-pill h-13 px-6 py-3">
                    Review Active Appeals
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ======================================================== */}
      {/* SECTION 12: INSTITUTIONAL FOOTER                         */}
      {/* ======================================================== */}
      <footer className="border-t border-hairline bg-surface/60 py-12 text-body-sm text-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5 pb-12 border-b border-hairline">
            {/* Col 1: Brand Info */}
            <div className="lg:col-span-2 space-y-4">
              <KavachLogo variant="full" size="md" />
              <p className="text-body-sm text-muted max-w-sm leading-relaxed">
                Zero-knowledge fraud intelligence consortium for Indian commercial banks
                and NBFCs, eliminating loan stacking under the DPDP Act (2023).
              </p>
              <div className="flex items-center gap-2 pt-2">
                <StatusPill variant="verified" size="sm" label="Consortium Testnet Active" pulse />
              </div>
            </div>

            {/* Col 2: Consortium Consoles */}
            <div className="space-y-3">
              <span className="font-sans text-xs font-semibold uppercase tracking-wider text-ink block">
                Bank Consoles
              </span>
              <ul className="space-y-2 text-body-sm">
                <li><Link href="/bank/meridian" className="hover:text-ink transition-colors">Meridian Bank Console</Link></li>
                <li><Link href="/bank/kestrel" className="hover:text-ink transition-colors">Kestrel Capital NBFC</Link></li>
                <li><Link href="/bank/meridian/screen" className="hover:text-ink transition-colors">Applicant Screening Flow</Link></li>
                <li><Link href="/bank/meridian/flag" className="hover:text-ink transition-colors">Flag Identity Protocol</Link></li>
              </ul>
            </div>

            {/* Col 3: Protocol Telemetry */}
            <div className="space-y-3">
              <span className="font-sans text-xs font-semibold uppercase tracking-wider text-ink block">
                Ledger &amp; Telemetry
              </span>
              <ul className="space-y-2 text-body-sm">
                <li><Link href="/network" className="hover:text-ink transition-colors">Live Merkle Tree</Link></li>
                <li><Link href="/network" className="hover:text-ink transition-colors">Ring Velocity Leaderboard</Link></li>
                <li><Link href="/appeals" className="hover:text-ink transition-colors">AppealDAO Chamber</Link></li>
                <li><Link href="/network" className="hover:text-ink transition-colors">Federated Simulation</Link></li>
              </ul>
            </div>

            {/* Col 4: Design & Governance */}
            <div className="space-y-3">
              <span className="font-sans text-xs font-semibold uppercase tracking-wider text-ink block">
                Resources
              </span>
              <ul className="space-y-2 text-body-sm">
                <li><Link href="/trust" className="hover:text-ink transition-colors font-medium text-brand-sapphire">Trust &amp; Privacy Center</Link></li>
                <li><Link href="/brand" className="hover:text-ink transition-colors">Brand &amp; Visual Language</Link></li>
                <li><Link href="/styleguide" className="hover:text-ink transition-colors">Design System &amp; Tokens</Link></li>
                <li><Link href="/trust#threat-model" className="hover:text-ink transition-colors">Threat Model &amp; Security</Link></li>
                <li><Link href="/trust#retention" className="hover:text-ink transition-colors">DPDP Retention &amp; Erasure</Link></li>
                <li><Link href="/trust#limitations" className="hover:text-ink transition-colors">Honest System Limitations</Link></li>
              </ul>
            </div>
          </div>

          {/* Protocol Honesty & Verification Legend */}
          <div className="py-6 border-b border-hairline flex flex-wrap items-center justify-between gap-4 text-xs">
            <span className="font-semibold text-ink uppercase tracking-wider text-[11px]">
              Protocol Transparency Legend:
            </span>
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-semantic-verified" />
                <strong>On-Chain:</strong> Real Hardhat/Ethereum smart contract state
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-brand-sapphire" />
                <strong>Local Screening:</strong> Executed strictly in browser RAM via Groth16
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-semantic-pending" />
                <strong>Simulation:</strong> Modelled federated network behaviour
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-faint" />
                <strong>Demo Data:</strong> Synthetic seed identifiers for evaluation
              </span>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
            <p>
              © {new Date().getFullYear()} Kavach Consortium Foundation. All rights reserved. Built for Indian financial infrastructure.
            </p>
            <p className="max-w-md text-center sm:text-right">
              Designed to support DPDP Act (2023) principles • Client-side Groth16 zero-knowledge proofs over BN254. Plaintext PII is never transmitted or stored.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
