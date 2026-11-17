"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import {
  MetricCard,
  HashChip,
  StatusPill,
  Card,
  BankMonogram,
  Button,
  EmptyState,
} from "@/components/ui";
import { InvestigationSheet } from "@/components/InvestigationSheet";
import { useRegistryEvents, RegistryEventItem } from "@/hooks/useRegistryEvents";
import { getAllBanks } from "@/lib/banks";
import dynamic from "next/dynamic";
import {
  Layers,
  Activity,
  Building2,
  Clock,
  Radio,
  TrendingUp,
  Search,
  Pause,
  Play,
  ArrowRight,
  GitBranch,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

const RingVelocityNetworkMap = dynamic(
  () => import("@/components/charts/RingVelocityNetworkMap").then((m) => m.RingVelocityNetworkMap),
  {
    ssr: false,
    loading: () => <div className="h-64 rounded-card bg-subtle/30 animate-pulse border border-hairline" />,
  }
);

const MerkleTreeViewer = dynamic(
  () => import("@/components/charts/MerkleTreeViewer").then((m) => m.MerkleTreeViewer),
  {
    ssr: false,
    loading: () => <div className="h-64 rounded-card bg-subtle/30 animate-pulse border border-hairline" />,
  }
);

const FederatedSimulationView = dynamic(
  () => import("@/components/FederatedSimulationView").then((m) => m.FederatedSimulationView),
  {
    ssr: false,
    loading: () => <div className="h-96 rounded-card bg-subtle/30 animate-pulse border border-hairline" />,
  }
);

export type NetworkTab = "activity" | "velocity" | "registry" | "federated";

function NetworkContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as NetworkTab) || "activity";
  const [activeTab, setActiveTab] = useState<NetworkTab>(initialTab);

  const isDemoEmpty = searchParams.get("demo_empty") === "true";

  // Tab query synchronization
  useEffect(() => {
    const t = searchParams.get("tab") as NetworkTab;
    if (t === "activity" || t === "velocity" || t === "registry" || t === "federated") {
      setActiveTab(t);
    }
  }, [searchParams]);

  const {
    events: onChainEvents,
    treeSize: onChainTreeSize,
    currentRoot: onChainRoot,
    ringBufferRoots,
    loading,
    refresh,
  } = useRegistryEvents();

  // "Live" polling & pause toggle
  const [isLivePaused, setIsLivePaused] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"All" | "Flags" | "Hits" | "Appeals" | "Revocations">("All");

  // Investigation Sheet state
  const [selectedEvent, setSelectedEvent] = useState<RegistryEventItem | null>(null);
  const [isInvestigationOpen, setIsInvestigationOpen] = useState(false);

  // New events highlight detection (1.2s soft highlight)
  const knownEventIdsRef = useRef<Set<string>>(new Set());
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());

  // Effective events (empty if demo_empty)
  const events = useMemo(() => {
    if (isDemoEmpty) return [];
    return onChainEvents;
  }, [isDemoEmpty, onChainEvents]);

  const treeSize = isDemoEmpty ? 0 : onChainTreeSize;
  const currentRoot = isDemoEmpty ? "0x0000000000000000000000000000000000000000000000000000000000000000" : onChainRoot;

  // Track newly arrived events and apply 1.2s soft highlight
  useEffect(() => {
    if (events.length === 0) return;

    if (knownEventIdsRef.current.size === 0) {
      // Initial populate: store all IDs without highlighting everything
      events.forEach((e) => knownEventIdsRef.current.add(e.id));
      return;
    }

    const newIds: string[] = [];
    events.forEach((e) => {
      if (!knownEventIdsRef.current.has(e.id)) {
        newIds.push(e.id);
        knownEventIdsRef.current.add(e.id);
      }
    });

    if (newIds.length > 0) {
      setHighlightedIds((prev) => new Set([...Array.from(prev), ...newIds]));
      const timer = setTimeout(() => {
        setHighlightedIds((prev) => {
          const next = new Set(prev);
          newIds.forEach((id) => next.delete(id));
          return next;
        });
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [events]);

  // Periodic polling when not paused
  useEffect(() => {
    if (isLivePaused) return;
    const interval = setInterval(() => {
      refresh();
    }, 2500);
    return () => clearInterval(interval);
  }, [isLivePaused, refresh]);

  // Filtered & Searched events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      // Category filter
      if (activeFilter === "Flags" && e.type !== "IdentityFlagged") return false;
      if (activeFilter === "Hits" && e.type !== "RingHit") return false;
      if (activeFilter === "Revocations" && e.type !== "LeafRevoked") return false;
      if (activeFilter === "Appeals" && !e.type.includes("Appeal")) return false;

      // Text search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesBank = e.bankName.toLowerCase().includes(q) || e.bankCode.toLowerCase().includes(q);
        const matchesCategory = e.categoryName?.toLowerCase().includes(q);
        const matchesDetails = e.details?.toLowerCase().includes(q);
        const matchesLeaf = e.leaf?.toLowerCase().includes(q);
        const matchesNullifier = e.nullifier?.toLowerCase().includes(q);
        if (!matchesBank && !matchesCategory && !matchesDetails && !matchesLeaf && !matchesNullifier) {
          return false;
        }
      }

      return true;
    });
  }, [events, activeFilter, searchQuery]);

  const distinctBanksCount = isDemoEmpty ? 0 : 5;
  const hits24h = isDemoEmpty ? 0 : events.filter((e) => e.type === "RingHit").length || 3;

  const handleRowClick = (item: RegistryEventItem) => {
    setSelectedEvent(item);
    setIsInvestigationOpen(true);
  };

  return (
    <AppShell pageTitle="Network Activity">
      <div className="space-y-8 max-w-7xl mx-auto text-left">
        {/* ======================================================== */}
        {/* HEADER: 4 METRIC CARDS                                   */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Flagged identities"
            value={`${treeSize} Leaves`}
            numericValue={treeSize}
            countUp={true}
            suffix=" Leaves"
            sublabel="Depth-20 Merkle tree capacity"
            trend={treeSize > 0 ? { value: "+3 this week", positive: true } : undefined}
            icon={<Layers className="h-4 w-4 text-brand-sapphire" />}
            sparklineData={isDemoEmpty ? [0, 0, 0, 0, 0, 0, 0] : [4, 6, 8, 9, 10, 11, treeSize || 12]}
            sparklineColor="var(--brand-sapphire)"
          />

          <MetricCard
            label="Current registry root"
            value={currentRoot ? `${currentRoot.slice(0, 10)}...` : "0x0000...0000"}
            sublabel="Active BN254 Poseidon root"
            trend={{ value: "Block sync #31", positive: true }}
            icon={<GitBranch className="h-4 w-4 text-brand-gold" />}
            sparklineData={isDemoEmpty ? [0, 0, 0, 0, 0, 0, 0] : [1, 1, 2, 2, 3, 3, 4]}
            sparklineColor="var(--brand-gold)"
          />

          <MetricCard
            label="Member banks"
            value={`${distinctBanksCount} Active`}
            numericValue={distinctBanksCount}
            countUp={true}
            suffix=" Active"
            sublabel="Underwriting institutions"
            trend={distinctBanksCount > 0 ? { value: "100% Synced", positive: true } : undefined}
            icon={<Building2 className="h-4 w-4 text-semantic-verified" />}
            sparklineData={isDemoEmpty ? [0, 0, 0, 0, 0, 0, 0] : [3, 4, 4, 5, 5, 5, distinctBanksCount]}
            sparklineColor="var(--signal-verified)"
          />

          <MetricCard
            label="Hits in 24h"
            value={`${hits24h} Detected`}
            numericValue={hits24h}
            countUp={true}
            suffix=" Detected"
            sublabel="Cross-lender syndicate attempts"
            trend={hits24h > 0 ? { value: "+2 alerts", positive: false } : undefined}
            icon={<Activity className="h-4 w-4 text-semantic-flagged" />}
            sparklineData={isDemoEmpty ? [0, 0, 0, 0, 0, 0, 0] : [0, 1, 1, 2, 2, 3, hits24h]}
            sparklineColor="var(--signal-flagged)"
          />
        </div>

        {/* ======================================================== */}
        {/* TABS: ACTIVITY | RING VELOCITY | REGISTRY | FEDERATED    */}
        {/* ======================================================== */}
        <div className="border-b border-hairline pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 bg-subtle rounded-pill border border-hairline w-fit">
            <button
              type="button"
              onClick={() => setActiveTab("activity")}
              className={cn(
                "px-4 py-1.5 rounded-pill text-xs font-medium transition-all select-none",
                activeTab === "activity"
                  ? "bg-surface text-ink font-semibold shadow-subtle border border-hairline"
                  : "text-muted hover:text-ink"
              )}
            >
              Activity
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("velocity")}
              className={cn(
                "px-4 py-1.5 rounded-pill text-xs font-medium transition-all select-none",
                activeTab === "velocity"
                  ? "bg-surface text-ink font-semibold shadow-subtle border border-hairline"
                  : "text-muted hover:text-ink"
              )}
            >
              Ring velocity
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("registry")}
              className={cn(
                "px-4 py-1.5 rounded-pill text-xs font-medium transition-all select-none",
                activeTab === "registry"
                  ? "bg-surface text-ink font-semibold shadow-subtle border border-hairline"
                  : "text-muted hover:text-ink"
              )}
            >
              Registry
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("federated")}
              className={cn(
                "px-4 py-1.5 rounded-pill text-xs font-medium transition-all select-none flex items-center gap-1.5",
                activeTab === "federated"
                  ? "bg-surface text-ink font-semibold shadow-subtle border border-hairline"
                  : "text-muted hover:text-ink"
              )}
            >
              <span>Federated simulation</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-pill bg-semantic-pending/20 text-[#925B00] dark:text-[#F5B544] font-bold">
                Simulation
              </span>
            </button>
          </div>

          {/* Right Status Indicator */}
          <div className="flex items-center gap-3 text-xs font-mono text-muted self-start sm:self-auto">
            <span>BN254 &bull; Merkle Accumulator</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: ACTIVITY                                          */}
        {/* ======================================================== */}
        {activeTab === "activity" && (
          <Card elevation="card" className="p-6 sm:p-7 space-y-6">
            {/* Table Control Bar: Filter Pills + Search + Live Pause Toggle */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-hairline">
              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(["All", "Flags", "Hits", "Appeals", "Revocations"] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={cn(
                      "px-3 py-1.5 rounded-pill text-xs font-medium transition-all select-none",
                      activeFilter === filter
                        ? "bg-ink text-white dark:bg-white dark:text-ink font-semibold shadow-subtle"
                        : "bg-subtle text-muted hover:text-ink border border-hairline hover:bg-surface"
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Search + Live Pause Toggle */}
              <div className="flex items-center gap-3 w-full lg:w-auto">
                {/* Search Input */}
                <div className="relative flex-1 sm:w-64">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by bank, leaf, nullifier..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-control border border-hairline bg-surface text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink text-xs font-mono"
                    >
                      &times;
                    </button>
                  )}
                </div>

                {/* Live Indicator with Pause Toggle */}
                <div className="flex items-center gap-1.5 p-1 bg-subtle rounded-pill border border-hairline shrink-0">
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        isLivePaused
                          ? "bg-[#925B00] dark:bg-[#F5B544]"
                          : "bg-semantic-verified animate-ping"
                      )}
                    />
                    <span className="text-[11px] font-mono font-semibold uppercase text-ink">
                      {isLivePaused ? "Paused" : "Live"}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsLivePaused(!isLivePaused)}
                    className="h-6 px-2 text-[11px] text-muted hover:text-ink gap-1 rounded-pill"
                    title={isLivePaused ? "Resume live polling" : "Pause live polling"}
                  >
                    {isLivePaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                    <span>{isLivePaused ? "Resume" : "Pause"}</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Event List / DataTable */}
            {filteredEvents.length === 0 ? (
              <div className="py-12">
                <EmptyState
                  title={isDemoEmpty ? "No consortium events recorded yet" : "No events match this filter"}
                  description={
                    isDemoEmpty
                      ? "The consortium registry is running clean on this node. When banks flag confirmed fraudsters or screen applicants, cryptographic events appear here in real time."
                      : "No events match the selected category or search query. Reset filter or clear search terms to view all events."
                  }
                  actionLabel={isDemoEmpty ? undefined : "Reset filter"}
                  onAction={() => {
                    setActiveFilter("All");
                    setSearchQuery("");
                  }}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-hairline text-muted font-medium text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-3">Event Type</th>
                      <th className="py-3 px-3">Member Bank</th>
                      <th className="py-3 px-3">Typology & Cryptographic Hashes</th>
                      <th className="py-3 px-3 text-right">Recorded</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {filteredEvents.map((item) => {
                      const isHighlighted = highlightedIds.has(item.id);

                      return (
                        <tr
                          key={item.id}
                          onClick={() => handleRowClick(item)}
                          className={cn(
                            "cursor-pointer transition-all duration-300 group",
                            isHighlighted
                              ? "bg-brand-sapphire/20 dark:bg-brand-sapphire/30 ring-1 ring-brand-sapphire/50"
                              : "hover:bg-subtle/60"
                          )}
                        >
                          {/* Event Column */}
                          <td className="py-3.5 px-3 align-top whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <StatusPill
                                variant={
                                  item.type === "IdentityFlagged"
                                    ? "flagged"
                                    : item.type === "RingHit"
                                    ? "review"
                                    : item.type === "LeafRevoked"
                                    ? "neutral"
                                    : "verified"
                                }
                                size="sm"
                                label={
                                  item.type === "IdentityFlagged"
                                    ? "Flagged"
                                    : item.type === "RingHit"
                                    ? "Hit Alert"
                                    : item.type === "LeafRevoked"
                                    ? "Revoked"
                                    : item.type
                                }
                              />
                            </div>
                          </td>

                          {/* Member Bank */}
                          <td className="py-3.5 px-3 align-top whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <BankMonogram bankId={item.bankCode.toLowerCase()} size="sm" />
                              <div>
                                <span className="font-semibold text-ink block">{item.bankName}</span>
                                <span className="text-[10px] text-faint font-mono uppercase">{item.bankCode}</span>
                              </div>
                            </div>
                          </td>

                          {/* Details & Hashes */}
                          <td className="py-3.5 px-3 align-top">
                            <div className="space-y-1.5 max-w-md">
                              <p className="text-xs text-ink font-medium leading-relaxed">
                                {item.details}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap">
                                {item.leaf && <HashChip hash={item.leaf} label="Leaf" />}
                                {item.nullifier && <HashChip hash={item.nullifier} label="Nullifier" />}
                                {item.txHash && <HashChip hash={item.txHash} label="Tx" />}
                              </div>
                            </div>
                          </td>

                          {/* Time Ago */}
                          <td className="py-3.5 px-3 align-top text-right whitespace-nowrap font-mono text-[11px] text-muted">
                            <span className="flex items-center justify-end gap-1">
                              <Clock className="h-3 w-3 text-faint" />
                              <span>{item.timeAgo || item.timestamp}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* ======================================================== */}
        {/* TAB 2: RING VELOCITY                                     */}
        {/* ======================================================== */}
        {activeTab === "velocity" && (
          <div className="space-y-6">
            <RingVelocityNetworkMap />
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: REGISTRY                                          */}
        {/* ======================================================== */}
        {activeTab === "registry" && (
          <div className="space-y-6">
            <MerkleTreeViewer
              currentRoot={currentRoot}
              treeSize={treeSize}
              rootHistory={
                ringBufferRoots.length > 0
                  ? ringBufferRoots.map((r, i) => ({
                      root: r,
                      block: 42 - i * 4,
                      timestamp: i === 0 ? "Active Root" : `${i * 15}m ago`,
                    }))
                  : undefined
              }
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: FEDERATED SIMULATION                              */}
        {/* ======================================================== */}
        {activeTab === "federated" && (
          <div className="space-y-6">
            <FederatedSimulationView />
          </div>
        )}

        {/* Right-Side Investigation Sheet (Glass) */}
        <InvestigationSheet
          open={isInvestigationOpen}
          onOpenChange={setIsInvestigationOpen}
          event={selectedEvent}
          bankId="meridian"
        />
      </div>
    </AppShell>
  );
}

export default function NetworkActivityPage() {
  return (
    <React.Suspense fallback={null}>
      <NetworkContent />
    </React.Suspense>
  );
}
