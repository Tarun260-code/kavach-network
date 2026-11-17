"use client";

import * as React from "react";
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepItem {
  id: string | number;
  title: string;
  description?: string;
  status?: "complete" | "current" | "upcoming" | "error";
}

export interface StepperProps extends React.HTMLAttributes<HTMLOListElement> {
  steps: StepItem[];
  currentStepIndex?: number;
  orientation?: "horizontal" | "vertical";
  onStepClick?: (step: StepItem, index: number) => void;
}

export function Stepper({
  steps,
  currentStepIndex,
  orientation = "horizontal",
  onStepClick,
  className,
  ...props
}: StepperProps) {
  const isHorizontal = orientation === "horizontal";

  return (
    <nav aria-label="Progress">
      <ol
        className={cn(
          "flex",
          isHorizontal
            ? "items-center w-full gap-2 sm:gap-4 overflow-x-auto py-2"
            : "flex-col space-y-4",
          className
        )}
        {...props}
      >
        {steps.map((step, idx) => {
          // Determine status if not explicitly set
          let computedStatus: "complete" | "current" | "upcoming" | "error" =
            step.status || "upcoming";
          if (currentStepIndex !== undefined) {
            if (idx < currentStepIndex) computedStatus = "complete";
            else if (idx === currentStepIndex) computedStatus = "current";
            else computedStatus = "upcoming";
          }

          const isComplete = computedStatus === "complete";
          const isCurrent = computedStatus === "current";
          const isError = computedStatus === "error";
          const isInteractive = Boolean(onStepClick);

          return (
            <li
              key={step.id}
              className={cn(
                "flex items-center",
                isHorizontal ? "flex-1 min-w-[120px]" : "w-full"
              )}
            >
              <div
                role={isInteractive ? "button" : undefined}
                tabIndex={isInteractive ? 0 : undefined}
                onClick={() => onStepClick?.(step, idx)}
                onKeyDown={(e) => {
                  if (isInteractive && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onStepClick?.(step, idx);
                  }
                }}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "group flex items-center gap-3 transition-colors",
                  isInteractive && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sapphire rounded-panel p-1"
                )}
              >
                {/* Step Circle Indicator */}
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold font-mono transition-all",
                    isComplete &&
                      "bg-semantic-verified text-white border-semantic-verified shadow-subtle",
                    isCurrent &&
                      "bg-brand-sapphire text-white border-brand-sapphire shadow-subtle ring-4 ring-brand-sapphire/20",
                    isError &&
                      "bg-semantic-flagged text-white border-semantic-flagged ring-4 ring-semantic-flagged/20",
                    !isComplete &&
                      !isCurrent &&
                      !isError &&
                      "bg-subtle text-muted border-hairline"
                  )}
                  aria-hidden="true"
                >
                  {isComplete ? (
                    <Check className="h-4 w-4 stroke-[2.5]" />
                  ) : isError ? (
                    <AlertCircle className="h-4 w-4 stroke-[2.5]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </span>

                {/* Step Text */}
                <div className="flex flex-col text-left">
                  <span
                    className={cn(
                      "text-body-sm font-semibold tracking-tight transition-colors",
                      isCurrent && "text-ink",
                      isComplete && "text-ink/80",
                      !isCurrent && !isComplete && "text-muted"
                    )}
                  >
                    {step.title}
                  </span>
                  {step.description && (
                    <span className="text-[11px] text-faint line-clamp-1">
                      {step.description}
                    </span>
                  )}
                </div>
              </div>

              {/* Connector line for horizontal orientation */}
              {isHorizontal && idx < steps.length - 1 && (
                <div
                  className={cn(
                    "ml-3 h-0.5 flex-1 transition-colors rounded-full",
                    idx < (currentStepIndex ?? 0)
                      ? "bg-semantic-verified"
                      : "bg-hairline"
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Stepper;

