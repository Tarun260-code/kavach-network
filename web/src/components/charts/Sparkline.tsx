"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  color?: string;
  fillOpacity?: number; // default 0.08 (8%)
  height?: number;
  width?: number | string;
  className?: string;
  showTooltip?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
  labels?: string[];
}

export function Sparkline({
  data = [12, 19, 15, 27, 22, 34, 40],
  color = "var(--brand-sapphire)",
  fillOpacity = 0.08,
  height = 36,
  width = "100%",
  className,
  showTooltip = true,
  valuePrefix = "",
  valueSuffix = "",
  labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
}: SparklineProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // ViewBox coordinates
  const svgWidth = 140;
  const svgHeight = 40;
  const paddingY = 4;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * svgWidth;
    const y = svgHeight - paddingY - ((val - min) / range) * (svgHeight - paddingY * 2);
    return { x, y, val, label: labels[idx] || `Point ${idx + 1}` };
  });

  const linePath = points.reduce(
    (acc, pt, idx) => `${acc} ${idx === 0 ? "M" : "L"} ${pt.x} ${pt.y}`,
    ""
  );

  const areaPath = `${linePath} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`;

  return (
    <div className={cn("relative flex items-center select-none", className)}>
      <div className="sr-only">
        Trend sparkline chart. Values range from {min} to {max}. Latest recorded value is {data[data.length - 1]}.
      </div>
      <svg
        role="img"
        aria-label={`Trend chart with ${data.length} points, ranging from ${min} to ${max}`}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ height, width }}
        className="overflow-visible"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={`sparkFill-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={fillOpacity * 2} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Soft 8% area fill */}
        <path d={areaPath} fill={`url(#sparkFill-${color})`} />

        {/* Hairline baseline */}
        <line
          x1="0"
          y1={svgHeight - 0.5}
          x2={svgWidth}
          y2={svgHeight - 0.5}
          stroke="var(--hairline)"
          strokeWidth="1"
        />

        {/* Thin 2px line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interactive Hover Point and Guide */}
        {points.map((pt, idx) => (
          <g key={idx}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoverIndex === idx ? 4 : 2}
              fill={hoverIndex === idx ? color : "var(--surface)"}
              stroke={color}
              strokeWidth="1.5"
              className="transition-all duration-150"
            />
            {/* Expanded invisible hit area */}
            <rect
              x={pt.x - 10}
              y={0}
              width={20}
              height={svgHeight}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoverIndex(idx)}
            />
          </g>
        ))}
      </svg>

      {/* Floating Tooltip Card */}
      {showTooltip && hoverIndex !== null && points[hoverIndex] && (
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-card bg-surface border border-hairline shadow-subtle text-[11px] font-mono whitespace-nowrap z-20 pointer-events-none animate-in fade-in zoom-in-95 duration-100"
        >
          <span className="text-muted mr-1">{points[hoverIndex].label}:</span>
          <span className="font-semibold text-ink tabular-nums">
            {valuePrefix}{points[hoverIndex].val}{valueSuffix}
          </span>
        </div>
      )}
    </div>
  );
}

export default Sparkline;

