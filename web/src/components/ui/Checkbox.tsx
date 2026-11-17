"use client";

import * as React from "react";
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  description?: string;
  error?: string;
  id?: string;
  className?: string;
}

export function Checkbox({
  checked,
  onCheckedChange,
  onChange,
  disabled = false,
  label,
  description,
  error,
  id,
  className,
}: CheckboxProps) {
  const generatedId = React.useId();
  const checkboxId = id || generatedId;

  const handleToggle = () => {
    if (disabled) return;
    const next = !checked;
    onCheckedChange?.(next);
    onChange?.(next);
  };

  return (
    <div className={cn("inline-flex flex-col gap-1 text-left select-none", className)}>
      <div className="inline-flex items-start gap-3">
        <button
          id={checkboxId}
          type="button"
          role="checkbox"
          aria-checked={checked}
          disabled={disabled}
          onClick={handleToggle}
          className={cn(
            "min-h-[44px] min-w-[44px] p-2.5 flex items-center justify-center focus-visible:outline-none",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <span
            className={cn(
              "h-5 w-5 rounded-md border flex items-center justify-center transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
              error && "border-semantic-flagged",
              checked
                ? "bg-primary border-primary text-white"
                : "bg-surface border-hairline hover:border-muted/50"
            )}
          >
            {checked && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
          </span>
        </button>

        {(label || description) && (
          <label
            htmlFor={checkboxId}
            className={cn(
              "flex flex-col pt-2.5 cursor-pointer",
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

      {error && (
        <div className="pl-11 flex items-center gap-1.5 text-xs text-semantic-flagged font-medium">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default Checkbox;
