"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  description?: string;
  id?: string;
  className?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  onChange,
  disabled = false,
  label,
  description,
  id,
  className,
}: SwitchProps) {
  const generatedId = React.useId();
  const switchId = id || generatedId;

  const handleToggle = () => {
    if (disabled) return;
    const next = !checked;
    onCheckedChange?.(next);
    onChange?.(next);
  };

  return (
    <div className={cn("inline-flex items-center gap-3 select-none text-left", className)}>
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleToggle}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-pill border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 min-h-[44px] min-w-[44px] p-2 flex items-center",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "pointer-events-none relative inline-block h-5 w-9 rounded-pill transition-colors duration-200",
            checked ? "bg-primary" : "bg-subtle border border-hairline"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-subtle transition duration-200 ease-in-out top-0.5 relative",
              checked ? "translate-x-4" : "translate-x-0.5"
            )}
          />
        </span>
      </button>

      {(label || description) && (
        <label
          htmlFor={switchId}
          className={cn(
            "flex flex-col cursor-pointer",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          {label && <span className="text-body-sm font-medium text-ink">{label}</span>}
          {description && (
            <span className="text-[11px] text-muted leading-relaxed">
              {description}
            </span>
          )}
        </label>
      )}
    </div>
  );
}

export default Switch;
