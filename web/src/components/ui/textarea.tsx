"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-body-sm font-medium text-ink tracking-tight select-none"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            "flex min-h-[96px] w-full rounded-control border bg-surface px-3.5 py-2.5 text-body-md text-ink placeholder:font-sans placeholder:text-muted/60 shadow-subtle transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 resize-y",
            error
              ? "border-semantic-flagged focus-visible:ring-semantic-flagged"
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
Textarea.displayName = "Textarea";

export { Textarea };
