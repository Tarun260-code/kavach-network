"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TimelineItem {
  id: string | number;
  title: string;
  timestamp: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  isLatest?: boolean;
}

export interface TimelineProps extends React.HTMLAttributes<HTMLOListElement> {
  items: TimelineItem[];
}

export function Timeline({ items, className, ...props }: TimelineProps) {
  return (
    <ol className={cn("relative space-y-6 pl-6 text-left", className)} {...props}>
      {/* Continuous vertical connecting line */}
      <div
        className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-hairline"
        aria-hidden="true"
      />

      {items.map((item, index) => {
        return (
          <li key={item.id} className="relative group">
            {/* Dot / Icon Node */}
            <div
              className={cn(
                "absolute -left-6 top-1 flex h-6 w-6 items-center justify-center rounded-full border bg-surface text-ink shadow-subtle transition-transform group-hover:scale-110",
                item.isLatest
                  ? "border-brand-sapphire ring-4 ring-brand-sapphire/15 text-brand-sapphire"
                  : "border-hairline text-muted"
              )}
              aria-hidden="true"
            >
              {item.icon ? (
                item.icon
              ) : (
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    item.isLatest ? "bg-brand-sapphire" : "bg-faint"
                  )}
                />
              )}
            </div>

            {/* Content Card / Item */}
            <div className="flex flex-col gap-1 pl-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-body-sm font-semibold text-ink">
                    {item.title}
                  </span>
                  {item.badge}
                </div>
                <time className="font-mono text-[11px] text-faint tabular-nums">
                  {item.timestamp}
                </time>
              </div>

              {item.description && (
                <div className="text-body-sm text-muted leading-relaxed">
                  {item.description}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default Timeline;

