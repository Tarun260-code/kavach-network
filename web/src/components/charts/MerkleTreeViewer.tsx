"use client";

import React, { useState } from "react";
import { HashChip, Button, StatusPill, Card } from "@/components/ui";
import { Sparkline } from "@/components/charts/Sparkline";
import { cn } from "@/lib/utils";
import { GitBranch, Layers, CheckCircle2, ChevronDown, ChevronUp, Clock, History } from "lucide-react";

interface TreeNode {
  id: string;
  hash: string;
  label: string;
  category?: string;
  blockNumber: number;
}

export function MerkleTreeViewer({
  currentRoot = "0x4b7f98a183928192039481729384719283749182739481729384719283749182",
  treeSize = 12,
  rootHistory = [
    { root: "0x4b7f98a183928192039481729384719283749182739481729384719283749182", block: 42, timestamp: "Just now" },
    { root: "0x2897fa183b0f5de1a21e069176421034c5689da764512930bf4164bca4e6583", block: 38, timestamp: "12m ago" },
    { root: "0x17056ec108fb2fa373f71c4c93540eb351c3d1fb5251da8a67ff8d82ca624bd4", block: 31, timestamp: "45m ago" },
    { root: "0x0f8a5f34d3991823908471928731920839481729384719283749182739481729", block: 24, timestamp: "2h ago" },
    { root: "0x9812739182739182739182739182739182739182739182739182739182739182", block: 15, timestamp: "5h ago" },
  ],
  className,
}: {
  currentRoot?: string;
  treeSize?: number;
  rootHistory?: Array<{ root: string; block: number; timestamp: string }>;
  className?: string;
}) {
  const [selectedLeafIndex, setSelectedLeafIndex] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // 4 representative active leaves in the bottom visible tier
  const leaves: TreeNode[] = [
    {
      id: "leaf-0",
      hash: "0x17056ec108fb2fa373f71c4c93540eb351c3d1fb5251da8a67ff8d82ca624bd4",
      label: "Leaf #0",
      category: "Syndicate Loan Stacking",
      blockNumber: 15,
    },
    {
      id: "leaf-1",
      hash: "0x3f5c719a8e2b01c45689da2b4c10e588a91b2c4567e89012345678abcdef0123",
      label: "Leaf #1",
      category: "Mule Account Funnel",
      blockNumber: 24,
    },
    {
      id: "leaf-2",
      hash: "0x89ab12cd34ef560123456789abcdef0123456789abcdef0123456789abcdef01",
      label: "Leaf #2",
      category: "Tampered Aadhaar XML",
      blockNumber: 31,
    },
    {
      id: "leaf-3",
      hash: "0xfa1234b5678c901d234e567f8901234567890abcdef1234567890abcdef12345",
      label: "Leaf #3",
      category: "Document Forgery",
      blockNumber: 38,
    },
  ];

  // Path computation:
  // If leaf = 0 or 1, active branch goes through Node 1-0
  // If leaf = 2 or 3, active branch goes through Node 1-1
  const activeLevel1 = selectedLeafIndex <= 1 ? "node-1-0" : "node-1-1";
  const siblingLeafIndex = selectedLeafIndex % 2 === 0 ? selectedLeafIndex + 1 : selectedLeafIndex - 1;
  const selectedLeaf = leaves[selectedLeafIndex] || leaves[0];

  return (
    <div className={cn("p-5 sm:p-6 rounded-card bg-surface border border-hairline shadow-card space-y-6 text-left", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-brand-sapphire" />
            <h3 className="font-serif text-2xl text-ink font-normal tracking-tight">
              Consortium Merkle Tree Registry
            </h3>
          </div>
          <p className="text-body-sm text-muted mt-0.5">
            Depth-20 BN254 Poseidon accumulator. Every commitment is zero-knowledge verified against active or rolling roots.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-mono text-muted bg-subtle px-2.5 py-1 rounded-pill border border-hairline">
            Capacity: 10,48,576 Leaves
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs h-8 px-2 gap-1 text-muted"
          >
            <span>{isExpanded ? "Collapse" : "Expand"}</span>
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 3-Level Interactive Tree Visualization (7 Cols) */}
          <div className="lg:col-span-7 bg-subtle/30 rounded-panel p-4 border border-hairline flex flex-col items-center select-none overflow-x-auto">
            <div className="sr-only">
              Interactive 3-level Merkle tree diagram displaying authentication path from leaf {selectedLeafIndex} to root.
            </div>

            <svg
              role="img"
              aria-label={`Merkle tree authentication path from selected leaf ${selectedLeafIndex} to root`}
              viewBox="0 0 460 220"
              className="w-full max-w-[460px] h-auto overflow-visible"
            >
              {/* Level 0 Root to Level 1 Nodes */}
              <line
                x1="230"
                y1="30"
                x2="115"
                y2="90"
                stroke={activeLevel1 === "node-1-0" ? "var(--brand-sapphire)" : "var(--hairline)"}
                strokeWidth={activeLevel1 === "node-1-0" ? "2.5" : "1.2"}
                strokeDasharray={activeLevel1 === "node-1-0" ? undefined : "3 3"}
              />
              <line
                x1="230"
                y1="30"
                x2="345"
                y2="90"
                stroke={activeLevel1 === "node-1-1" ? "var(--brand-sapphire)" : "var(--hairline)"}
                strokeWidth={activeLevel1 === "node-1-1" ? "2.5" : "1.2"}
                strokeDasharray={activeLevel1 === "node-1-1" ? undefined : "3 3"}
              />

              {/* Level 1 Nodes to Level 2 Leaves */}
              <line
                x1="115"
                y1="90"
                x2="55"
                y2="160"
                stroke={selectedLeafIndex === 0 ? "var(--brand-sapphire)" : siblingLeafIndex === 0 ? "var(--brand-gold)" : "var(--hairline)"}
                strokeWidth={selectedLeafIndex === 0 || siblingLeafIndex === 0 ? "2" : "1"}
              />
              <line
                x1="115"
                y1="90"
                x2="175"
                y2="160"
                stroke={selectedLeafIndex === 1 ? "var(--brand-sapphire)" : siblingLeafIndex === 1 ? "var(--brand-gold)" : "var(--hairline)"}
                strokeWidth={selectedLeafIndex === 1 || siblingLeafIndex === 1 ? "2" : "1"}
              />
              <line
                x1="345"
                y1="90"
                x2="285"
                y2="160"
                stroke={selectedLeafIndex === 2 ? "var(--brand-sapphire)" : siblingLeafIndex === 2 ? "var(--brand-gold)" : "var(--hairline)"}
                strokeWidth={selectedLeafIndex === 2 || siblingLeafIndex === 2 ? "2" : "1"}
              />
              <line
                x1="345"
                y1="90"
                x2="405"
                y2="160"
                stroke={selectedLeafIndex === 3 ? "var(--brand-sapphire)" : siblingLeafIndex === 3 ? "var(--brand-gold)" : "var(--hairline)"}
                strokeWidth={selectedLeafIndex === 3 || siblingLeafIndex === 3 ? "2" : "1"}
              />

              {/* ROOT NODE (Level 0) */}
              <g className="cursor-default">
                <circle cx="230" cy="30" r="14" fill="var(--surface)" stroke="var(--brand-sapphire)" strokeWidth="2.5" className="shadow-subtle" />
                <circle cx="230" cy="30" r="5" fill="var(--brand-sapphire)" />
                <text x="230" y="10" fontSize="9" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle" fill="var(--ink)">
                  ROOT
                </text>
              </g>

              {/* LEVEL 1 INTERMEDIATE NODES */}
              <g>
                <circle
                  cx="115"
                  cy="90"
                  r="10"
                  fill="var(--surface)"
                  stroke={activeLevel1 === "node-1-0" ? "var(--brand-sapphire)" : "var(--hairline)"}
                  strokeWidth="2"
                />
                <circle cx="115" cy="90" r="3" fill={activeLevel1 === "node-1-0" ? "var(--brand-sapphire)" : "var(--faint)"} />

                <circle
                  cx="345"
                  cy="90"
                  r="10"
                  fill="var(--surface)"
                  stroke={activeLevel1 === "node-1-1" ? "var(--brand-sapphire)" : "var(--hairline)"}
                  strokeWidth="2"
                />
                <circle cx="345" cy="90" r="3" fill={activeLevel1 === "node-1-1" ? "var(--brand-sapphire)" : "var(--faint)"} />
              </g>

              {/* LEAF NODES (Level 2) */}
              {leaves.map((leaf, idx) => {
                const xCoords = [55, 175, 285, 405];
                const x = xCoords[idx];
                const isSelected = selectedLeafIndex === idx;
                const isSibling = siblingLeafIndex === idx;

                return (
                  <g
                    key={leaf.id}
                    className="cursor-pointer group"
                    onClick={() => setSelectedLeafIndex(idx)}
                  >
                    <circle
                      cx={x}
                      cy="160"
                      r={isSelected ? "12" : "9"}
                      fill="var(--surface)"
                      stroke={
                        isSelected
                          ? "var(--brand-sapphire)"
                          : isSibling
                          ? "var(--brand-gold)"
                          : "var(--hairline)"
                      }
                      strokeWidth={isSelected ? "2.5" : "1.5"}
                      className="transition-all duration-150"
                    />
                    <circle
                      cx={x}
                      cy="160"
                      r={isSelected ? "4" : "2.5"}
                      fill={
                        isSelected
                          ? "var(--brand-sapphire)"
                          : isSibling
                          ? "var(--brand-gold)"
                          : "var(--muted)"
                      }
                    />
                    <text
                      x={x}
                      y="185"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                      fill={isSelected ? "var(--brand-sapphire)" : "var(--muted)"}
                    >
                      {leaf.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Path Key */}
            <div className="w-full pt-3 mt-2 border-t border-hairline flex items-center justify-between text-[11px] text-muted">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-brand-sapphire" />
                  <span>Selected Leaf Path</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-brand-gold" />
                  <span>Inclusion Sibling</span>
                </span>
              </div>
              <span className="font-mono text-faint">Click any leaf to inspect path</span>
            </div>
          </div>

          {/* Right Column: Leaf Details + Rolling Root Buffer + Sparkline (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Selected Leaf Telemetry */}
            <div className="p-3.5 rounded-panel bg-subtle/50 border border-hairline space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink">{selectedLeaf.label} Commitment</span>
                <StatusPill variant="verified" size="sm" label="Inclusion Verified" />
              </div>
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px]">
                  <span className="text-muted block mb-0.5">Poseidon Leaf Hash</span>
                  <HashChip hash={selectedLeaf.hash} label="Leaf" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted pt-1 border-t border-hairline">
                  <span>Typology: <strong className="text-ink">{selectedLeaf.category}</strong></span>
                  <span className="font-mono text-faint">Block #{selectedLeaf.blockNumber}</span>
                </div>
              </div>
            </div>

            {/* Tree Size Over Time Sparkline */}
            <div className="p-3.5 rounded-panel bg-subtle/50 border border-hairline space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ink flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-brand-sapphire" />
                  <span>Tree Size Growth (7d)</span>
                </span>
                <span className="font-mono font-bold text-ink">{treeSize} Leaves</span>
              </div>
              <Sparkline
                data={[2, 4, 5, 7, 8, 10, treeSize]}
                color="var(--brand-sapphire)"
                height={32}
                labels={["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Today"]}
              />
            </div>

            {/* 30-Root Rolling Buffer History */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ink flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5 text-brand-gold" />
                  <span>30-Root Rolling Buffer</span>
                </span>
                <span className="text-[10px] font-mono text-muted">Contracts §4.2</span>
              </div>

              <div
                tabIndex={0}
                role="region"
                aria-label="30-Root rolling buffer history"
                className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              >
                {rootHistory.map((item, idx) => (
                  <div
                    key={item.root + idx}
                    className="flex items-center justify-between p-2 rounded bg-surface border border-hairline text-[11px]"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-sapphire shrink-0" />
                      <span className="font-mono text-ink">{item.root.slice(0, 10)}...</span>
                      {idx === 0 && (
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-semantic-verified/15 text-semantic-verified font-bold">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 font-mono text-faint text-[10px]">
                      <span>Block #{item.block}</span>
                      <span>&bull;</span>
                      <span>{item.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MerkleTreeViewer;
