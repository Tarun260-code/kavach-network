"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface BankMonogramProps extends React.HTMLAttributes<HTMLDivElement> {
  bankId: "meridian" | "aurum" | "halcyon" | "northgate" | "vantage" | "kestrel" | string;
  name?: string;
  size?: "sm" | "default" | "lg";
  showName?: boolean;
}

export function BankMonogram({
  bankId,
  name,
  size = "default",
  showName = false,
  className,
  ...props
}: BankMonogramProps) {
  const getInitials = (bank: string, customName?: string) => {
    if (customName) {
      return customName
        .split(" ")
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase();
    }
    const map: Record<string, string> = {
      meridian: "MB",
      aurum: "AU",
      halcyon: "HA",
      northgate: "NG",
      vantage: "VA",
      kestrel: "KC",
      sbi: "AU",
      hdfc: "HA",
      icici: "NG",
      axis: "VA",
      pnb: "KC",
    };
    return map[bank.toLowerCase()] || bank.slice(0, 2).toUpperCase();
  };

  const sizeClasses = {
    sm: "h-7 w-7 text-xs",
    default: "h-9 w-9 text-body-sm",
    lg: "h-12 w-12 text-body-lg",
  };

  const bankBgClasses: Record<string, string> = {
    meridian: "bg-[#065F63] text-white",
    aurum: "bg-[#1E3DB8] text-white",
    halcyon: "bg-[#0B4A72] text-white",
    northgate: "bg-[#881337] text-white",
    vantage: "bg-[#701A75] text-white",
    kestrel: "bg-[#9A3412] text-white",
    sbi: "bg-[#1E3DB8] text-white",
    hdfc: "bg-[#0B4A72] text-white",
    icici: "bg-[#881337] text-white",
    axis: "bg-[#701A75] text-white",
    pnb: "bg-[#9A3412] text-white",
  };

  const initials = getInitials(bankId, name);
  const bgClass = bankBgClasses[bankId?.toLowerCase()] || "bg-[#1E3DB8] text-white";

  return (
    <div className={cn("inline-flex items-center gap-2.5", className)} {...props}>
      <div
        aria-hidden="true"
        className={cn(
          "relative flex shrink-0 items-center justify-center rounded-full font-sans font-bold shadow-subtle select-none transition-transform hover:scale-105",
          sizeClasses[size],
          bgClass
        )}
      >
        <span>{initials}</span>
      </div>

      {showName && (
        <span className="font-medium text-ink truncate text-sm">
          {name || bankId.toUpperCase()}
        </span>
      )}
    </div>
  );
}

export default BankMonogram;
