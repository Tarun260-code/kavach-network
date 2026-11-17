"use client";

import React, { useState } from "react";
import { HashChip, StatusPill, Card } from "@/components/ui";
import { cn } from "@/lib/utils";
import { Activity, TrendingUp, Building2, ArrowRight } from "lucide-react";

export interface NetworkEdge {
  id: string;
  sourceBank: string;
  targetBank: string;
  nullifier: string;
  hits: number;
  category: string;
  lastSeen: string;
}

const DEFAULT_EDGES: NetworkEdge[] = [
  {
    id: "edge-1",
    sourceBank: "meridian",
    targetBank: "hdfc",
    nullifier: "0x19a99be7f05c48b48e3a2c5a27816f5c09a8264566d8ba986dc57e51cbb58e3b",
    hits: 3,
    category: "Multi-Lender Loan Stacking",
    lastSeen: "4m ago",
  },
  {
    id: "edge-2",
    sourceBank: "sbi",
    targetBank: "icici",
    nullifier: "0x3f5c719a8e2b01c45689da2b4c10e588a91b2c4567e89012345678abcdef0123",
    hits: 2,
    category: "Synthetic Identity Ring",
    lastSeen: "18m ago",
  },
  {
    id: "edge-3",
    sourceBank: "kestrel",
    targetBank: "meridian",
    nullifier: "0x89ab12cd34ef560123456789abcdef0123456789abcdef0123456789abcdef01",
    hits: 1,
    category: "Aadhaar Mule Account",
    lastSeen: "1h ago",
  },
  {
    id: "edge-4",
    sourceBank: "sbi",
    targetBank: "hdfc",
    nullifier: "0xfa1234b5678c901d234e567f8901234567890abcdef1234567890abcdef12345",
    hits: 2,
    category: "Document Forgery",
    lastSeen: "2h ago",
  },
];

// 5 Institutional Banks distributed along a circle
// Center: (200, 160), Radius: 105
// Angle step: 2 * Math.PI / 5 = 72 deg
const CIRCLE_CENTER = { x: 200, y: 160 };
const CIRCLE_RADIUS = 105;

const BANK_NODES: Record<string, { name: string; code: string; color: string; angle: number }> = {
  meridian: { name: "Meridian Bank", code: "MB", color: "var(--primary)", angle: -Math.PI / 2 }, // Top
  aurum: { name: "Aurum Bank", code: "AU", color: "var(--brand-gold)", angle: -Math.PI / 2 + 1 * 1.2566 },
  halcyon: { name: "Halcyon Bank", code: "HA", color: "#0B4A72", angle: -Math.PI / 2 + 2 * 1.2566 },
  northgate: { name: "Northgate Bank", code: "NG", color: "#881337", angle: -Math.PI / 2 + 3 * 1.2566 },
  kestrel: { name: "Kestrel Capital", code: "KC", color: "#E8851A", angle: -Math.PI / 2 + 4 * 1.2566 },
  // Aliases for compatibility
  sbi: { name: "Meridian Bank", code: "MB", color: "var(--primary)", angle: -Math.PI / 2 },
  hdfc: { name: "Halcyon Bank", code: "HA", color: "#0B4A72", angle: -Math.PI / 2 + 2 * 1.2566 },
  icici: { name: "Aurum Bank", code: "AU", color: "var(--brand-gold)", angle: -Math.PI / 2 + 1 * 1.2566 },
};

function getNodeCoords(bankKey: string) {
  const node = BANK_NODES[bankKey] || BANK_NODES.meridian;
  return {
    x: Math.round(CIRCLE_CENTER.x + CIRCLE_RADIUS * Math.cos(node.angle)),
    y: Math.round(CIRCLE_CENTER.y + CIRCLE_RADIUS * Math.sin(node.angle)),
    ...node,
  };
}

export function RingVelocityNetworkMap({
  edges = DEFAULT_EDGES,
  className,
}: {
  edges?: NetworkEdge[];
  className?: string;
}) {
  const [selectedEdge, setSelectedEdge] = useState<NetworkEdge | null>(edges[0] || null);
  const [hoveredEdge, setHoveredEdge] = useState<NetworkEdge | null>(null);

  const activeEdge = hoveredEdge || selectedEdge;

  // Compute unique banks on the circle
  const displayBanks = [
    { id: "meridian", ...getNodeCoords("meridian") },
    { id: "aurum", ...getNodeCoords("aurum") },
    { id: "halcyon", ...getNodeCoords("halcyon") },
    { id: "northgate", ...getNodeCoords("northgate") },
    { id: "kestrel", ...getNodeCoords("kestrel") },
  ];

  return (
    <div className={cn("p-5 sm:p-6 rounded-card bg-surface border border-hairline shadow-card space-y-6 text-left", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-semantic-flagged" />
            <h3 className="font-serif text-2xl text-ink font-normal tracking-tight">
              Ring Velocity Network Topology
            </h3>
          </div>
          <p className="text-body-sm text-muted mt-0.5">
            Cross-bank syndication corridors. Edges represent shared match nullifiers without revealing raw borrower identities.
          </p>
        </div>
        <span className="text-xs font-mono text-muted bg-subtle px-3 py-1.5 rounded-pill border border-hairline self-start sm:self-auto">
          DPDP §4 &bull; Zero Cleartext PII
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SVG Network Map (7 Cols) */}
        <div className="lg:col-span-7 relative flex flex-col items-center justify-center bg-subtle/30 rounded-panel p-4 border border-hairline select-none overflow-hidden">
          <div className="sr-only">
            Consortium ring velocity network map displaying {edges.length} cross-bank syndication corridors between member institutions.
            {edges.map((e) => `${e.sourceBank.toUpperCase()} to ${e.targetBank.toUpperCase()}: ${e.hits} observed hits for ${e.category}.`).join(" ")}
          </div>

          <svg
            role="img"
            aria-label="Consortium ring velocity network graph showing syndicated fraud corridors across member banks"
            viewBox="0 0 400 320"
            className="w-full h-auto max-h-[300px] overflow-visible"
          >
            {/* Soft Ambient Ring Boundary */}
            <circle
              cx={CIRCLE_CENTER.x}
              cy={CIRCLE_CENTER.y}
              r={CIRCLE_RADIUS}
              fill="none"
              stroke="var(--hairline)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />

            {/* Central Merkle Ring Hub */}
            <circle
              cx={CIRCLE_CENTER.x}
              cy={CIRCLE_CENTER.y}
              r="18"
              fill="var(--surface)"
              stroke="var(--brand-sapphire)"
              strokeWidth="1.5"
              className="shadow-subtle"
            />
            <circle cx={CIRCLE_CENTER.x} cy={CIRCLE_CENTER.y} r="6" fill="var(--brand-sapphire)" />

            {/* Connecting Edges (thickness = hit count) */}
            {edges.map((edge) => {
              const src = getNodeCoords(edge.sourceBank);
              const tgt = getNodeCoords(edge.targetBank);

              const isCurrent = activeEdge?.id === edge.id;
              // Thickness = hit count (1 -> 1.5px, 2 -> 2.5px, 3+ -> 4px)
              const strokeThickness = edge.hits >= 3 ? 4 : edge.hits === 2 ? 2.5 : 1.5;

              return (
                <g
                  key={edge.id}
                  className="cursor-pointer group"
                  onClick={() => setSelectedEdge(edge)}
                  onMouseEnter={() => setHoveredEdge(edge)}
                  onMouseLeave={() => setHoveredEdge(null)}
                >
                  {/* Invisible broad hover target */}
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke="transparent"
                    strokeWidth="18"
                  />
                  {/* Visible Edge */}
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={
                      isCurrent
                        ? "var(--signal-flagged)"
                        : edge.hits >= 3
                        ? "var(--signal-flagged)"
                        : "var(--brand-sapphire)"
                    }
                    strokeWidth={strokeThickness}
                    strokeDasharray={edge.hits === 1 ? "4 3" : undefined}
                    strokeOpacity={isCurrent ? 1 : 0.65}
                    className="transition-all duration-150"
                  />

                  {/* Mid-point Hit Count Badge */}
                  <g transform={`translate(${(src.x + tgt.x) / 2}, ${(src.y + tgt.y) / 2})`}>
                    <circle
                      cx="0"
                      cy="0"
                      r={isCurrent ? 10 : 8}
                      fill="var(--surface)"
                      stroke={isCurrent ? "var(--signal-flagged)" : "var(--hairline)"}
                      strokeWidth="1.5"
                    />
                    <text
                      x="0"
                      y="3.5"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                      fill={edge.hits >= 3 ? "var(--signal-flagged)" : "var(--ink)"}
                    >
                      {edge.hits}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Circular Bank Nodes */}
            {displayBanks.map((bank) => (
              <g key={bank.id} className="select-none">
                <circle
                  cx={bank.x}
                  cy={bank.y}
                  r="18"
                  fill="var(--surface)"
                  stroke={bank.color}
                  strokeWidth="2"
                  className="shadow-subtle"
                />
                <text
                  x={bank.x}
                  y={bank.y + 3.5}
                  fontSize="9.5"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                  textAnchor="middle"
                  fill="var(--ink)"
                >
                  {bank.code}
                </text>
                <text
                  x={bank.x}
                  y={bank.y + 28}
                  fontSize="9.5"
                  fontFamily="sans-serif"
                  fontWeight="500"
                  textAnchor="middle"
                  fill="var(--muted)"
                >
                  {bank.name}
                </text>
              </g>
            ))}
          </svg>

          {/* Interactive Legend / Note */}
          <div className="w-full pt-3 border-t border-hairline flex items-center justify-between text-[11px] text-muted">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="h-0.5 w-4 bg-brand-sapphire inline-block" />
                <span>Single hit</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1 w-4 bg-semantic-flagged inline-block" />
                <span>3+ Syndicate corridor</span>
              </span>
            </div>
            <span className="font-mono text-faint">Hover edge for details</span>
          </div>
        </div>

        {/* Side Leaderboard & Selected Edge Inspector (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-hairline">
            <span className="text-xs font-semibold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-brand-sapphire" />
              <span>Syndicate Leaderboard</span>
            </span>
            <span className="text-[11px] font-mono text-muted">Last 48 Hours</span>
          </div>

          <div className="space-y-3">
            {edges.map((edge) => {
              const isSelected = activeEdge?.id === edge.id;
              const pct = Math.min(100, (edge.hits / 4) * 100);

              return (
                <div
                  key={edge.id}
                  onClick={() => setSelectedEdge(edge)}
                  className={cn(
                    "p-3 rounded-panel border transition-all cursor-pointer text-xs space-y-2",
                    isSelected
                      ? "bg-surface border-brand-sapphire/50 shadow-card ring-1 ring-brand-sapphire/20"
                      : "bg-subtle/50 border-hairline hover:bg-subtle"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-ink font-medium">
                      {edge.nullifier.slice(0, 10)}...{edge.nullifier.slice(-4)}
                    </span>
                    <span
                      className={cn(
                        "font-mono font-bold px-1.5 py-0.5 rounded-pill text-[10px]",
                        edge.hits >= 3
                          ? "bg-semantic-flagged/10 text-semantic-flagged"
                          : "bg-brand-sapphire/10 text-brand-sapphire"
                      )}
                    >
                      {edge.hits} {edge.hits === 1 ? "Bank" : "Banks"}
                    </span>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="h-1.5 w-full bg-subtle rounded-pill overflow-hidden border border-hairline">
                    <div
                      className={cn(
                        "h-full rounded-pill transition-all",
                        edge.hits >= 3 ? "bg-semantic-flagged" : "bg-brand-sapphire"
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted">
                    <span className="truncate max-w-[180px]">{edge.category}</span>
                    <span className="font-mono text-faint shrink-0">{edge.lastSeen}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RingVelocityNetworkMap;
