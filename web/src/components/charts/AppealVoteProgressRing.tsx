"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Scale, CheckCircle2 } from "lucide-react";

interface AppealVoteProgressRingProps {
  votesFor: number;
  votesAgainst?: number;
  totalVotes: number; // default 5 member banks
  requiredQuorum: number; // default 4 (80% supermajority)
  size?: number; // width/height in px (default 120)
  strokeWidth?: number; // default 8
  className?: string;
  showLabels?: boolean;
}

export function AppealVoteProgressRing({
  votesFor = 3,
  votesAgainst = 0,
  totalVotes = 5,
  requiredQuorum = 4,
  size = 120,
  strokeWidth = 8,
  className,
  showLabels = true,
}: AppealVoteProgressRingProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  const forPct = Math.min(1, votesFor / totalVotes);
  const forOffset = circumference * (1 - forPct);

  const quorumPct = requiredQuorum / totalVotes; // e.g. 0.8 (80%)
  // Quorum angle: 0deg is top (-90deg), so angle is -90 + quorumPct * 360
  const quorumAngleRad = (-90 + quorumPct * 360) * (Math.PI / 180);
  const qMarkerX = size / 2 + (radius + strokeWidth * 0.7) * Math.cos(quorumAngleRad);
  const qMarkerY = size / 2 + (radius + strokeWidth * 0.7) * Math.sin(quorumAngleRad);
  const qMarkerInnerX = size / 2 + (radius - strokeWidth * 0.7) * Math.cos(quorumAngleRad);
  const qMarkerInnerY = size / 2 + (radius - strokeWidth * 0.7) * Math.sin(quorumAngleRad);

  const hasReachedQuorum = votesFor >= requiredQuorum;

  return (
    <div className={cn("inline-flex flex-col items-center gap-3 select-none", className)}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="overflow-visible -rotate-90">
          {/* Background Track Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--hairline)"
            strokeWidth={strokeWidth}
          />

          {/* Active Votes FOR Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={hasReachedQuorum ? "var(--signal-verified)" : "var(--brand-gold)"}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={forOffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />

          {/* Quorum Marker Line */}
          <line
            x1={qMarkerInnerX}
            y1={qMarkerInnerY}
            x2={qMarkerX}
            y2={qMarkerY}
            stroke="var(--ink)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>

        {/* Central Vote Stat */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-serif text-2xl font-normal text-ink tabular-nums leading-none">
            {votesFor}
            <span className="text-muted text-xs font-mono font-normal">/{totalVotes}</span>
          </span>
          <span className="text-[10px] font-mono text-muted uppercase mt-1">
            Votes
          </span>
        </div>
      </div>

      {showLabels && (
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold">
            {hasReachedQuorum ? (
              <span className="text-semantic-verified">Quorum Reached (80%)</span>
            ) : (
              <span className="text-ink font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-semantic-pending shrink-0" />
                {requiredQuorum - votesFor} Vote Needed for Quorum
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-muted block">
            Supermajority Threshold: {requiredQuorum}/{totalVotes} Banks
          </span>
        </div>
      )}
    </div>
  );
}

export default AppealVoteProgressRing;

