"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import {
  MetricCard,
  HashChip,
  StatusPill,
  Card,
  Button,
  BankMonogram,
  Kbd,
  EmptyState,
} from "@/components/ui";
import { Term } from "@/components/Term";
import { useRegistryEvents } from "@/hooks/useRegistryEvents";
import { getBankById } from "@/lib/banks";
import seedsData from "@/generated/seeds.json";
import {
  ShieldAlert,
  Coins,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  UserCheck,
  Scale,
  Calendar,
  AlertCircle,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FlagRow {
  id: string;
  maskedId: string;
  type: string;
  leaf: string;
  nullifier: string;
  category: number;
  categoryName: string;
  reason: string;
  flaggedAt: string;
  expiresInDays: number;
  stakeEth: string;
  status: string;
  txHash?: string;
  isDemoSeed?: boolean;
}

export default function BankDashboardPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const bankId = (params?.id as string) || "meridian";
  const bank = getBankById(bankId);

  if (!bank) {
    notFound();
  }

  const isDemoEmpty = searchParams.get("demo_empty") === "true";

  const { flags: onChainFlags, events } = useRegistryEvents(bank.address);
  const [flags, setFlags] = useState<FlagRow[]>([]);

  // Time-aware greeting
  const [greeting, setGreeting] = useState("Good afternoon");
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Persona name mapping per spec:
  // Priya = fraud analyst at Bank A (meridian/sbi)
  // Rohan = onboarding officer at Bank B (aurum/hdfc)
  // Meera = consortium governance member (northgate/axis)
  const personaNames: Record<string, string> = {
    meridian: "Priya",
    sbi: "Priya",
    aurum: "Rohan",
    hdfc: "Rohan",
    northgate: "Meera",
    axis: "Meera",
    halcyon: "Aarav",
    icici: "Aarav",
    kestrel: "Kavita",
    pnb: "Kavita",
  };
  const underwriterName = personaNames[bank.id] || "Priya";

  // Sync flags from on-chain logs for this bank
  useEffect(() => {
    if (isDemoEmpty) {
      setFlags([]);
      return;
    }

    const bankFlags = onChainFlags.filter(
      (f) => f.bank.toLowerCase() === bank.address.toLowerCase()
    );

    const rows: FlagRow[] = bankFlags.map((f, idx) => {
      const seed = seedsData.seedRecords.find(
        (s: any) => BigInt(s.leaf).toString() === BigInt(f.leaf).toString()
      );
      const maskedId = seed
        ? `${seed.id.slice(0, 3)}••••${seed.id.slice(-2)}`
        : `ID •••• ${f.leaf.slice(-4)}`;

      return {
        id: `flag-${f.leaf}-${idx}`,
        maskedId,
        type: seed ? seed.type : "PAN / AADHAAR",
        leaf: f.leaf,
        nullifier: f.nullifier,
        category: f.category,
        categoryName: f.categoryName,
        reason: seed ? seed.reason : f.categoryName + " - Fraud Blacklist",
        flaggedAt: seed ? "Demo data" : "On-Chain Active",
        expiresInDays: 30,
        stakeEth: f.stakeEth,
        status: f.revoked ? "Revoked" : "Active",
        txHash: f.txHash,
        isDemoSeed: !!seed,
      };
    });

    setFlags(rows);
  }, [onChainFlags, bank.address, isDemoEmpty]);

  // Global keyboard shortcuts (S -> Screen, F -> Flag)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)
      ) {
        return;
      }
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        router.push(`/bank/${bank.id}/screen`);
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        router.push(`/bank/${bank.id}/flag`);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [bank.id, router]);

  // Derive "Needs your attention" items
  const recentHits = events.filter((e) => e.type === "RingHit");
  const expiringFlags = flags.filter((f) => f.status === "Active" && f.expiresInDays <= 7);
  const activeAppealsCount = 1; // Active Appeal #1 on AppealDAO

  // Assemble attention items list (empty if isDemoEmpty)
  const attentionItems = isDemoEmpty
    ? []
    : [
        {
          id: "hit-1",
          icon: <TrendingUp className="h-4 w-4 text-semantic-flagged" />,
          text: "An identity flagged by your node was presented at Halcyon Bank",
          relativeTime: "2m ago",
          actionLabel: "Review hit",
          href: "/network?tab=velocity",
        },
        {
          id: "appeal-1",
          icon: <Scale className="h-4 w-4 text-brand-gold" />,
          text: "Appeal #1 awaiting underwriter vote in AppealDAO chamber",
          relativeTime: "2d left",
          actionLabel: "Cast vote",
          href: "/dao",
        },
        {
          id: "expire-1",
          icon: <Clock className="h-4 w-4 text-brand-sapphire" />,
          text: "Active commitment for synthetic identity stacking expiring in 6 days",
          relativeTime: "6d left",
          actionLabel: "Renew",
          href: `/bank/${bank.id}/flag`,
        },
      ];

  // Recent activity stream (8 items max)
  const recentActivity = isDemoEmpty
    ? []
    : flags.slice(0, 8).map((row) => ({
        id: row.id,
        category: row.categoryName,
        maskedId: row.maskedId,
        leaf: row.leaf,
        nullifier: row.nullifier,
        txHash: row.txHash,
        status: row.status,
        relativeTime: "Just now",
        isDemoSeed: row.isDemoSeed,
      }));

  return (
    <AppShell activeBankId={bank.id} pageTitle="Overview">
      <div className="space-y-8 max-w-6xl mx-auto text-left">
        {/* ======================================================== */}
        {/* 1. GREETING HEADER (NO BIG HEADER CARD)                  */}
        {/* ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-4">
            <BankMonogram bankId={bank.id} size="lg" />
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-serif text-3xl sm:text-4xl text-ink font-normal tracking-tight">
                  {greeting}, {underwriterName}
                </h1>
                <StatusPill variant="verified" size="sm" label="Authorized Underwriter Node" pulse />
              </div>

              {/* Small status line */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                <span className="font-medium text-ink">{bank.name}</span>
                <span>&bull;</span>
                <span className="font-mono text-faint">Node {bank.address.slice(0, 6)}...{bank.address.slice(-4)}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-1 font-mono text-semantic-verified">
                  <span className="h-1.5 w-1.5 rounded-full bg-semantic-verified animate-pulse" />
                  <span>Consortium Testnet #31</span>
                </span>
                <span>&bull;</span>
                <span className="text-faint">DPDP §4 RAM-isolated</span>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts Pill */}
          <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-mono text-muted bg-subtle px-3 py-1.5 rounded-pill border border-hairline">
            <span>Keys:</span>
            <span className="flex items-center gap-1 text-ink font-medium">
              <Kbd>S</Kbd> Screen
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-ink font-medium">
              <Kbd>F</Kbd> Flag
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. "NEEDS YOUR ATTENTION" STRIP (OR CALM CAUGHT-UP LINE) */}
        {/* ======================================================== */}
        {attentionItems.length > 0 ? (
          <Card elevation="card" className="p-5 space-y-3 border-brand-sapphire/20 bg-surface">
            <div className="flex items-center justify-between border-b border-hairline pb-2.5">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-brand-sapphire" />
                <h2 className="font-sans text-body-md font-semibold text-ink">
                  Needs your attention
                </h2>
              </div>
              <span className="text-[11px] font-mono text-muted">
                {attentionItems.length} items requiring review
              </span>
            </div>

            {/* Compact Rows */}
            <div className="divide-y divide-hairline">
              {attentionItems.map((item) => (
                <div
                  key={item.id}
                  className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-subtle/50 px-2 rounded-panel transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-subtle">
                      {item.icon}
                    </div>
                    <span className="text-body-sm text-ink font-medium leading-relaxed">
                      {item.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <span className="font-mono text-[11px] text-faint">
                      {item.relativeTime}
                    </span>
                    <Link href={item.href}>
                      <Button variant="ghost" size="sm" className="text-xs h-7 px-2.5 text-brand-sapphire font-semibold hover:bg-brand-sapphire/10">
                        <span>{item.actionLabel}</span>
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          /* Calm Caught-Up Strip when Empty */
          <div className="flex items-center gap-2.5 py-3 px-4 rounded-panel bg-surface border border-hairline text-xs text-muted shadow-subtle animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 text-semantic-verified shrink-0" />
            <span className="text-ink font-medium">You&apos;re all caught up.</span>
            <span>No pending cross-bank velocity hits, active appeal votes, or expiring commitments.</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. TWO PRIMARY ACTION CARDS SIDE BY SIDE (24px RADIUS)   */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Action Card 1: Screen Applicant (Primary Action) */}
          <Card
            elevation="card"
            className="p-6 sm:p-7 bg-brand-sapphire/[0.03] border-brand-sapphire/20 hover:border-brand-sapphire/50 transition-all flex flex-col justify-between space-y-5"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-sapphire/10 text-brand-sapphire">
                  <UserCheck className="h-6 w-6" />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-muted">Shortcut:</span>
                  <Kbd>S</Kbd>
                  <StatusPill variant="verified" size="sm" label="Zero PII Transfer" />
                </div>
              </div>

              <div>
                <h3 className="font-serif text-2xl text-ink font-normal tracking-tight">
                  Screen applicant
                </h3>
                <p className="text-body-sm text-muted mt-1 leading-relaxed">
                  Verify loan applicant credentials against depth-20 consortium Merkle tree in browser memory. Computes Groth16 zk-SNARK proof with zero cleartext disclosure.
                </p>
              </div>

              {/* Custom Line-Art SVG (Duotone Sapphire + Champagne, 1.5px Stroke) */}
              <div className="pt-2 select-none">
                <svg width="100%" height="56" viewBox="0 0 320 56" fill="none" className="overflow-visible">
                  {/* Credential Card */}
                  <rect x="10" y="8" width="80" height="40" rx="8" stroke="var(--brand-sapphire)" strokeWidth="1.5" fill="var(--surface)" />
                  <line x1="22" y1="20" x2="68" y2="20" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="22" y1="28" x2="52" y2="28" stroke="var(--faint)" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="72" cy="34" r="4" fill="var(--brand-gold)" />

                  {/* Flow Arrow into Hash Aperture */}
                  <line x1="100" y1="28" x2="135" y2="28" stroke="var(--brand-sapphire)" strokeWidth="1.5" strokeDasharray="3 3" />
                  <path d="M132 24L137 28L132 32" stroke="var(--brand-sapphire)" strokeWidth="1.5" strokeLinecap="round" />

                  {/* Poseidon Aperture Hub */}
                  <circle cx="165" cy="28" r="16" fill="var(--surface)" stroke="var(--brand-gold)" strokeWidth="1.5" />
                  <circle cx="165" cy="28" r="6" fill="var(--brand-sapphire)" />

                  {/* Verification Pulse Beam */}
                  <line x1="192" y1="28" x2="225" y2="28" stroke="var(--semantic-verified)" strokeWidth="1.5" />
                  <path d="M222 24L227 28L222 32" stroke="var(--semantic-verified)" strokeWidth="1.5" strokeLinecap="round" />

                  {/* Shield Token Outcome */}
                  <rect x="238" y="8" width="72" height="40" rx="8" stroke="var(--semantic-verified)" strokeWidth="1.5" fill="var(--surface)" />
                  <path d="M266 22L271 27L282 17" stroke="var(--semantic-verified)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="274" cy="34" r="2.5" fill="var(--brand-gold)" />
                </svg>
              </div>
            </div>

            <div className="pt-2">
              <Link href={`/bank/${bank.id}/screen`} className="w-full sm:w-auto inline-block">
                <Button variant="pill-dark" size="lg" withOrb className="w-full sm:w-auto">
                  Screen applicant
                </Button>
              </Link>
            </div>
          </Card>

          {/* Action Card 2: Flag Identity */}
          <Card
            elevation="card"
            className="p-6 sm:p-7 bg-semantic-flagged/[0.03] border-semantic-flagged/20 hover:border-semantic-flagged/50 transition-all flex flex-col justify-between space-y-5"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-semantic-flagged/10 text-semantic-flagged">
                  <ShieldAlert className="h-6 w-6" />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-muted">Shortcut:</span>
                  <Kbd>F</Kbd>
                  <StatusPill variant="flagged" size="sm" label="0.05 ETH Collateral" />
                </div>
              </div>

              <div>
                <h3 className="font-serif text-2xl text-ink font-normal tracking-tight">
                  Flag identity
                </h3>
                <p className="text-body-sm text-muted mt-1 leading-relaxed">
                  Anchor confirmed fraudster credentials into the consortium tree. Hashes ID in local RAM and broadcasts only the 32-byte Poseidon leaf with escrow collateral.
                </p>
              </div>

              {/* Custom Line-Art SVG (Duotone Flagged + Champagne, 1.5px Stroke) */}
              <div className="pt-2 select-none">
                <svg width="100%" height="56" viewBox="0 0 320 56" fill="none" className="overflow-visible">
                  {/* Flagged Shield */}
                  <rect x="10" y="8" width="80" height="40" rx="8" stroke="var(--signal-flagged)" strokeWidth="1.5" fill="var(--surface)" />
                  <path d="M50 16L65 24V34L50 42L35 34V24L50 16Z" stroke="var(--signal-flagged)" strokeWidth="1.2" />
                  <circle cx="50" cy="28" r="3" fill="var(--signal-flagged)" />

                  {/* Flow Arrow into Lock Vault */}
                  <line x1="100" y1="28" x2="135" y2="28" stroke="var(--brand-gold)" strokeWidth="1.5" strokeDasharray="3 3" />
                  <path d="M132 24L137 28L132 32" stroke="var(--brand-gold)" strokeWidth="1.5" strokeLinecap="round" />

                  {/* Escrow Coin Lock */}
                  <circle cx="165" cy="28" r="16" fill="var(--surface)" stroke="var(--brand-gold)" strokeWidth="1.5" />
                  <text x="165" y="32" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle" fill="var(--brand-gold)">
                    ETH
                  </text>

                  {/* Merkle Root Inscription */}
                  <line x1="192" y1="28" x2="225" y2="28" stroke="var(--brand-sapphire)" strokeWidth="1.5" />
                  <path d="M222 24L227 28L222 32" stroke="var(--brand-sapphire)" strokeWidth="1.5" strokeLinecap="round" />

                  {/* Tree Leaf Token */}
                  <rect x="238" y="8" width="72" height="40" rx="8" stroke="var(--brand-sapphire)" strokeWidth="1.5" fill="var(--surface)" />
                  <circle cx="274" cy="22" r="5" fill="var(--brand-sapphire)" />
                  <circle cx="260" cy="34" r="4" stroke="var(--brand-gold)" strokeWidth="1.2" />
                  <circle cx="288" cy="34" r="4" stroke="var(--brand-gold)" strokeWidth="1.2" />
                </svg>
              </div>
            </div>

            <div className="pt-2">
              <Link href={`/bank/${bank.id}/flag`} className="w-full sm:w-auto inline-block">
                <Button variant="pill-light" size="lg" className="w-full sm:w-auto">
                  Flag identity
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* ======================================================== */}
        {/* 4. THREE METRIC CARDS (COUNT-UP, SPARKLINE, TREND DELTA) */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            label="Flags submitted"
            value={flags.length}
            numericValue={flags.length}
            countUp={true}
            sublabel="Active fraud commitments"
            trend={{ value: "+12% this week", positive: true }}
            icon={<ShieldAlert className="h-4 w-4 text-semantic-flagged" />}
            sparklineData={[1, 2, 2, 3, 3, 4, flags.length || 4]}
            sparklineColor="var(--signal-flagged)"
          />

          <MetricCard
            label="Collateral locked"
            value={`${(flags.length * 0.05).toFixed(2)} ETH`}
            numericValue={Number((flags.length * 0.05).toFixed(2))}
            countUp={true}
            suffix=" ETH"
            sublabel="0.05 ETH per active leaf"
            trend={{ value: "0.05 ETH/leaf", positive: true }}
            icon={<Coins className="h-4 w-4 text-brand-gold" />}
            sparklineData={[0.05, 0.10, 0.10, 0.15, 0.15, 0.20, Number((flags.length * 0.05).toFixed(2)) || 0.20]}
            sparklineColor="var(--brand-gold)"
          />

          <MetricCard
            label="Hits on your flags"
            value={recentHits.length || 2}
            numericValue={recentHits.length || 2}
            countUp={true}
            sublabel="Cross-lender velocity alerts"
            trend={{ value: "+2 new hits", positive: false }}
            icon={<TrendingUp className="h-4 w-4 text-brand-sapphire" />}
            sparklineData={[0, 1, 1, 2, 2, 2, recentHits.length || 2]}
            sparklineColor="var(--brand-sapphire)"
          />
        </div>

        {/* ======================================================== */}
        {/* 5. RECENT ACTIVITY TIMELINE (8 ITEMS MAX, "VIEW ALL")     */}
        {/* ======================================================== */}
        <Card elevation="card" className="p-6 sm:p-8 space-y-6">
          <div className="border-b border-hairline pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-sans text-xl text-ink font-semibold tracking-[-0.01em]">
                Recent activity
              </h2>
              <p className="text-body-sm text-muted">
                Consortium audit trail of commitments and verification events for {bank.name}.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-muted">
                {recentActivity.length} of {flags.length} records
              </span>
              <Link
                href="/network"
                className="text-xs text-brand-sapphire font-semibold hover:underline inline-flex items-center gap-1 min-h-[32px]"
              >
                <span>View all</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {recentActivity.length === 0 ? (
            <div className="py-8">
              <EmptyState
                title="No recent commitments"
                description="No fraud commitments recorded yet for this underwriter. When you flag a confirmed fraudulent ID or evaluate an applicant, events appear here."
                actionLabel="Flag confirmed fraudster"
                onAction={() => router.push(`/bank/${bank.id}/flag`)}
              />
            </div>
          ) : (
            <div className="divide-y divide-hairline">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-subtle/40 px-2 rounded-panel transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-subtle text-muted">
                      <ShieldAlert className="h-4 w-4 text-semantic-flagged" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-body-sm font-medium text-ink">
                          {item.category} commitment registered
                        </span>
                        {item.isDemoSeed && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-pill bg-subtle text-faint border border-hairline">
                            Demo data
                          </span>
                        )}
                        <StatusPill
                          variant={item.status === "Active" ? "flagged" : "neutral"}
                          size="sm"
                          label={item.status}
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted">
                        <span>Masked: <code className="font-mono text-ink font-medium">{item.maskedId}</code></span>
                        <span>&bull;</span>
                        <span>Leaf: <HashChip hash={item.leaf} /></span>
                        {item.txHash && (
                          <>
                            <span>&bull;</span>
                            <span>Tx: <HashChip hash={item.txHash} /></span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center text-xs text-faint shrink-0">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="h-3 w-3" />
                      <span>{item.relativeTime}</span>
                    </span>
                    <span className="font-mono text-ink font-semibold">
                      0.05 ETH
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
