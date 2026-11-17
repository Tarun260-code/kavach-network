"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "./card";
import { MetricCountUp } from "./MetricCountUp";
import { Sparkline } from "../charts/Sparkline";
import { motion, useReducedMotion } from "framer-motion";

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  numericValue?: number;
  countUp?: boolean;
  prefix?: string;
  suffix?: string;
  sublabel?: string;
  trend?: {
    value: string;
    positive?: boolean;
  };
  icon?: React.ReactNode;
  sparklineData?: number[];
  sparklineColor?: string;
}

export function MetricCard({
  label,
  value,
  numericValue,
  countUp = false,
  prefix = "",
  suffix = "",
  sublabel,
  trend,
  icon,
  sparklineData,
  sparklineColor,
  className,
  ...props
}: MetricCardProps) {
  const shouldReduceMotion = useReducedMotion();

  // If numericValue is provided or value is a pure number and countUp is enabled
  const isNumeric = typeof value === "number" || typeof numericValue === "number";
  const numToCount = numericValue ?? (typeof value === "number" ? value : null);

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
    >
      <Card
        className={cn(
          "p-6 md:p-7 flex flex-col justify-between transition-shadow duration-200 hover:shadow-card relative overflow-hidden",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between gap-4">
          <span className="text-body-sm font-medium text-muted">{label}</span>
          {icon && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-subtle text-muted">
              {icon}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-end justify-between gap-2">
          <div>
            <div className="font-serif text-[42px] leading-none tracking-tight text-ink tabular-nums font-normal">
              {countUp && numToCount !== null ? (
                <MetricCountUp value={numToCount} prefix={prefix} suffix={suffix} />
              ) : (
                value
              )}
            </div>

            {(sublabel || trend) && (
              <div className="mt-2.5 flex items-center gap-2 text-body-sm text-faint">
                {trend && (
                  <span
                    className={cn(
                      "font-medium",
                      trend.positive ? "text-semantic-verified" : "text-semantic-flagged"
                    )}
                  >
                    {trend.value}
                  </span>
                )}
                {sublabel && <span>{sublabel}</span>}
              </div>
            )}
          </div>

          {/* Embedded Sparkline (if data supplied) */}
          {sparklineData && sparklineData.length > 1 && (
            <div className="w-24 shrink-0 mb-1">
              <Sparkline
                data={sparklineData}
                color={sparklineColor || "var(--brand-sapphire)"}
                height={28}
                showTooltip={false}
              />
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

export default MetricCard;
