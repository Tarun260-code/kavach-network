"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, icon, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-body-sm font-medium text-ink tracking-tight select-none"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3.5 flex items-center pointer-events-none text-muted">
              {icon}
            </span>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              "flex min-h-[44px] w-full rounded-control border bg-surface px-3.5 py-2.5 text-body-md text-ink placeholder:font-sans placeholder:text-muted/60 shadow-subtle transition-all duration-150 file:border-0 file:bg-transparent file:text-body-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-10",
              error
                ? "border-semantic-flagged text-ink focus-visible:ring-semantic-flagged"
                : "border-hairline hover:border-muted/40",
              className
            )}
            ref={ref}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            {...props}
          />
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
Input.displayName = "Input";

export { Input };
