"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  size?: "sm" | "default";
  className?: string;
  name?: string;
  ariaLabel?: string;
}

export function SegmentedControl<T extends string = string>({
  value,
  onChange,
  options,
  size = "default",
  className,
  name,
  ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel || name || "Segmented options"}
      className={cn(
        "inline-flex p-1 rounded-panel bg-subtle/80 border border-hairline w-full sm:w-auto select-none",
        className
      )}
    >
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={opt.disabled}
            onClick={() => !opt.disabled && onChange(opt.value)}
            className={cn(
              "flex-1 inline-flex items-center justify-center gap-2 rounded-control font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px] px-3.5",
              size === "sm" ? "text-xs py-1" : "text-sm py-2",
              isSelected
                ? "bg-surface text-ink shadow-subtle border border-hairline/80 font-semibold"
                : "text-muted hover:text-ink hover:bg-surface/50",
              opt.disabled && "opacity-40 cursor-not-allowed"
            )}
          >
            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;

