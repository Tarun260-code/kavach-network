"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Clock, Shield, Activity, HelpCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusPillVariant =
  | "verified"
  | "flagged"
  | "review"
  | "pending"
  | "consortium"
  | "neutral"
  | "active";

export interface StatusPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: StatusPillVariant;
  label?: string;
  pulse?: boolean;
  size?: "sm" | "default";
  showIcon?: boolean;
}

export function StatusPill({
  variant = "neutral",
  label,
  pulse = false,
  size = "default",
  showIcon = true,
  className,
  children,
  ...props
}: StatusPillProps) {
  const variantConfig: Record<
    StatusPillVariant,
    {
      container: string;
      dot: string;
      icon: React.ComponentType<{ className?: string }>;
      ariaLabel: string;
    }
  > = {
    verified: {
      container:
        "bg-semantic-verified/10 text-semantic-verified-text border-semantic-verified/25 dark:bg-semantic-verified/15 dark:border-semantic-verified/30 dark:text-semantic-verified",
      dot: "bg-semantic-verified",
      icon: CheckCircle2,
      ariaLabel: "Verified status",
    },
    flagged: {
      container:
        "bg-semantic-flagged/10 text-semantic-flagged-text border-semantic-flagged/25 dark:bg-semantic-flagged/15 dark:border-semantic-flagged/30 dark:text-semantic-flagged",
      dot: "bg-semantic-flagged",
      icon: AlertCircle,
      ariaLabel: "Flagged alert",
    },
    review: {
      container:
        "bg-semantic-pending/15 text-[#925B00] dark:text-[#F5B544] border-semantic-pending/30 dark:bg-semantic-pending/20",
      dot: "bg-semantic-pending",
      icon: AlertTriangle,
      ariaLabel: "Requires review",
    },
    pending: {
      container:
        "bg-semantic-pending/10 text-[#925B00] dark:text-[#F5B544] border-semantic-pending/25 dark:bg-semantic-pending/15",
      dot: "bg-semantic-pending",
      icon: Clock,
      ariaLabel: "Pending status",
    },
    consortium: {
      container:
        "bg-brand-gold/15 text-[#855D10] dark:text-[#D9B26B] border-brand-gold/30 dark:bg-brand-gold/20",
      dot: "bg-brand-gold",
      icon: Shield,
      ariaLabel: "Consortium authority",
    },
    neutral: {
      container: "bg-subtle text-muted border-hairline",
      dot: "bg-faint",
      icon: HelpCircle,
      ariaLabel: "Neutral status",
    },
    active: {
      container:
        "bg-brand-sapphire/10 text-brand-sapphire border-brand-sapphire/25 dark:bg-brand-sapphire/15",
      dot: "bg-brand-sapphire",
      icon: Activity,
      ariaLabel: "Active status",
    },
  };

  const current = variantConfig[variant] || variantConfig.neutral;
  const IconComponent = current.icon;

  return (
    <span
      role="status"
      aria-label={label || (typeof children === "string" ? children : current.ariaLabel)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border font-medium select-none transition-colors",
        size === "sm"
          ? "px-2 py-0.5 text-[11px] leading-tight"
          : "px-2.5 py-1 text-xs leading-normal",
        current.container,
        className
      )}
      {...props}
    >
      {/* Indicator Dot with optional pulse */}
      <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
        {pulse && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
              current.dot
            )}
          />
        )}
        <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", current.dot)} />
      </span>

      {/* Dual indicator icon so color is never the only signal (WCAG 1.4.1) */}
      {showIcon && (
        <IconComponent
          className={cn(
            "shrink-0",
            size === "sm" ? "h-3 w-3 stroke-[2]" : "h-3.5 w-3.5 stroke-[2]"
          )}
          aria-hidden="true"
        />
      )}

      <span className="truncate">{label || children}</span>
    </span>
  );
}

export default StatusPill;
