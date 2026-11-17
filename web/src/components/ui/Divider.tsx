"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  label?: React.ReactNode;
}

export function Divider({
  orientation = "horizontal",
  label,
  className,
  ...props
}: DividerProps) {
  if (orientation === "vertical") {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn("w-[1px] h-full bg-hairline shrink-0", className)}
        {...props}
      />
    );
  }

  if (label) {
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={cn("flex items-center gap-3 my-4 w-full select-none", className)}
        {...props}
      >
        <div className="flex-1 h-[1px] bg-hairline" />
        <span className="text-xs text-muted font-medium px-1 tracking-wider uppercase">
          {label}
        </span>
        <div className="flex-1 h-[1px] bg-hairline" />
      </div>
    );
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn("h-[1px] w-full bg-hairline my-4", className)}
      {...props}
    />
  );
}

export default Divider;

