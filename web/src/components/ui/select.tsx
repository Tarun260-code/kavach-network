"use client";

import * as React from "react";
import { ChevronDown, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
  error?: string;
  helperText?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, children, options, error, helperText, id, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-body-sm font-medium text-ink tracking-tight select-none"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "flex min-h-[44px] w-full appearance-none rounded-control border bg-surface px-3.5 py-2.5 pr-10 text-body-md text-ink shadow-subtle transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
              error
                ? "border-semantic-flagged focus-visible:ring-semantic-flagged"
                : "border-hairline hover:border-muted/40",
              className
            )}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                  >
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-muted shrink-0" />
        </div>

        {error ? (
          <div
            id={errorId}
            role="alert"
            className="flex items-center gap-1.5 text-xs text-semantic-flagged font-medium"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : helperText ? (
          <p id={helperId} className="text-[11px] text-muted">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
