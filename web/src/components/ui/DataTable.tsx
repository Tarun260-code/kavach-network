"use client";

import React, { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { SlidersHorizontal, AlertCircle, RefreshCw } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { SkeletonTable } from "./skeleton";
import { Button } from "./button";

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  align?: "left" | "center" | "right";
  isNumeric?: boolean;
  render: (item: T, index: number) => ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (item: T) => void;
  className?: string;
  title?: string;
  showDensityToggle?: boolean;
  defaultDensity?: "comfortable" | "compact";
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyTitle = "No records found",
  emptyDescription = "There are currently no rows to display in this ledger docket.",
  onRowClick,
  className = "",
  title,
  showDensityToggle = true,
  defaultDensity = "comfortable",
  isLoading = false,
  error = null,
  onRetry,
}: DataTableProps<T>) {
  const shouldReduceMotion = useReducedMotion();
  const [density, setDensity] = useState<"comfortable" | "compact">(defaultDensity);

  const isCompact = density === "compact";

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("w-full space-y-2", className)}>
        {title && (
          <div className="px-1 text-body-sm font-semibold text-ink">
            {title}
          </div>
        )}
        <SkeletonTable rows={5} cols={columns.length} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={cn(
          "w-full rounded-card border border-semantic-flagged/30 bg-semantic-flagged/5 p-8 text-center space-y-3",
          className
        )}
      >
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-semantic-flagged/10 text-semantic-flagged">
          <AlertCircle className="h-5 w-5" />
        </div>
        <h4 className="font-sans text-body-md font-semibold text-ink">
          Unable to load ledger data
        </h4>
        <p className="text-body-sm text-muted max-w-md mx-auto">{error}</p>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="mt-2 text-brand-sapphire"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Retry query
          </Button>
        )}
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div
      className={cn(
        "w-full overflow-hidden border border-hairline rounded-card bg-surface shadow-subtle",
        className
      )}
    >
      {/* Table Toolbar (Title + Comfortable/Compact Density Toggle) */}
      {(title || showDensityToggle) && (
        <div className="px-4 py-2.5 border-b border-hairline bg-surface flex items-center justify-between gap-4 text-xs">
          {title && (
            <span className="font-sans font-semibold tracking-[-0.01em] text-ink">
              {title}
            </span>
          )}
          {showDensityToggle && (
            <div className="ml-auto flex items-center gap-1.5 bg-subtle p-0.5 rounded-pill border border-hairline">
              <button
                type="button"
                onClick={() => setDensity("comfortable")}
                aria-pressed={!isCompact}
                className={cn(
                  "px-2.5 py-0.5 rounded-pill text-[10px] font-medium transition-all select-none min-h-[24px]",
                  !isCompact
                    ? "bg-surface text-ink font-semibold shadow-subtle border border-hairline"
                    : "text-muted hover:text-ink"
                )}
              >
                Comfortable (52px)
              </button>
              <button
                type="button"
                onClick={() => setDensity("compact")}
                aria-pressed={isCompact}
                className={cn(
                  "px-2.5 py-0.5 rounded-pill text-[10px] font-medium transition-all select-none min-h-[24px]",
                  isCompact
                    ? "bg-surface text-ink font-semibold shadow-subtle border border-hairline"
                    : "text-muted hover:text-ink"
                )}
              >
                Compact (40px)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mobile Stacked Card View (< md) */}
      <div className="block md:hidden divide-y divide-hairline">
        {data.map((item, index) => {
          const rowKey = keyExtractor(item, index);
          return (
            <motion.div
              key={rowKey}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
              animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
              onClick={() => onRowClick?.(item)}
              className={cn(
                "space-y-2.5 transition-colors",
                isCompact ? "p-3" : "p-4",
                onRowClick ? "cursor-pointer hover:bg-subtle/70" : "hover:bg-subtle/30"
              )}
            >
              {columns.map((col) => {
                const alignRight = col.align === "right" || col.isNumeric;
                return (
                  <div
                    key={col.key}
                    className="flex items-start justify-between gap-3 text-xs"
                  >
                    <span className="font-mono text-[11px] uppercase tracking-wider text-muted shrink-0 pt-0.5">
                      {col.header}
                    </span>
                    <div
                      className={cn(
                        "text-ink font-medium overflow-hidden",
                        alignRight ? "text-right tabular-nums" : "text-left"
                      )}
                    >
                      {col.render(item, index)}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          );
        })}
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block overflow-x-auto max-h-[560px]">
        <table className="w-full text-left text-xs text-muted border-collapse">
          <thead className="sticky top-0 z-10 bg-surface/95 backdrop-blur-md border-b border-hairline text-[11px] uppercase tracking-wider text-muted font-medium font-mono">
            <tr>
              {columns.map((col) => {
                const alignClass =
                  col.align === "right" || col.isNumeric
                    ? "text-right"
                    : col.align === "center"
                    ? "text-center"
                    : "text-left";
                return (
                  <th
                    key={col.key}
                    className={cn(
                      "whitespace-nowrap transition-all",
                      isCompact ? "px-3.5 py-2" : "px-4 py-3",
                      alignClass,
                      col.className
                    )}
                  >
                    {col.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {data.map((item, index) => {
              const rowKey = keyExtractor(item, index);
              return (
                <tr
                  key={rowKey}
                  tabIndex={0}
                  onClick={() => onRowClick?.(item)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onRowClick?.(item);
                    }
                  }}
                  className={cn(
                    "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-sapphire focus:bg-brand-sapphire/5",
                    isCompact ? "h-[40px]" : "h-[52px]",
                    onRowClick
                      ? "cursor-pointer hover:bg-subtle/70"
                      : "hover:bg-subtle/40"
                  )}
                >
                  {columns.map((col) => {
                    const alignClass =
                      col.align === "right" || col.isNumeric
                        ? "text-right tabular-nums font-mono"
                        : col.align === "center"
                        ? "text-center"
                        : "text-left";
                    return (
                      <td
                        key={col.key}
                        className={cn(
                          "align-middle text-ink transition-all px-4",
                          isCompact ? "py-1.5" : "py-3",
                          alignClass,
                          col.className
                        )}
                      >
                        {col.render(item, index)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;

