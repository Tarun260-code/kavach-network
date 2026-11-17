"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-card bg-subtle/80 dark:bg-subtle/40", className)}
      {...props}
    />
  );
}

function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2.5", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4 rounded-input",
            i === lines - 1 && lines > 1 ? "w-3/5" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

function SkeletonMetric({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-card border border-hairline bg-surface p-6 shadow-subtle space-y-4",
        className
      )}
    >
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-28 rounded-input" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-10 w-36 rounded-input" />
      <Skeleton className="h-4 w-44 rounded-input" />
    </div>
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-card border border-hairline bg-surface p-6 shadow-subtle space-y-4",
        className
      )}
    >
      <div className="space-y-2">
        <Skeleton className="h-5 w-40 rounded-input" />
        <Skeleton className="h-4 w-60 rounded-input" />
      </div>
      <div className="space-y-2 pt-2">
        <Skeleton className="h-4 w-full rounded-input" />
        <Skeleton className="h-4 w-5/6 rounded-input" />
        <Skeleton className="h-4 w-4/6 rounded-input" />
      </div>
      <div className="pt-2 flex justify-end gap-2">
        <Skeleton className="h-9 w-24 rounded-pill" />
        <Skeleton className="h-9 w-32 rounded-pill" />
      </div>
    </div>
  );
}

function SkeletonTable({
  rows = 4,
  cols = 4,
  className,
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-card border border-hairline bg-surface shadow-subtle",
        className
      )}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-hairline bg-subtle/50 px-4 py-3">
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={c} className="h-4 w-20 rounded-input" />
        ))}
      </div>
      {/* Rows */}
      <div className="divide-y divide-hairline">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center justify-between px-4 py-3.5">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton
                key={c}
                className={cn(
                  "h-4 rounded-input",
                  c === 0 ? "w-28" : c === cols - 1 ? "w-16" : "w-24"
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export {
  Skeleton,
  SkeletonText,
  SkeletonMetric,
  SkeletonCard,
  SkeletonTable,
};
export default Skeleton;
