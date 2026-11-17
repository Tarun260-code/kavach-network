"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "faint" | "brand" | "gold" | "flagged" | "verified";
  as?: "span" | "div" | "p";
}

export function Eyebrow({
  className,
  variant = "faint",
  as: Comp = "span",
  children,
  ...props
}: EyebrowProps) {
  const colorMap = {
    faint: "text-faint",
    brand: "text-brand-sapphire",
    gold: "text-brand-gold",
    flagged: "text-semantic-flagged",
    verified: "text-semantic-verified",
  };

  return (
    <Comp
      className={cn(
        "inline-flex items-center gap-1.5 text-eyebrow font-medium uppercase tracking-[0.08em] select-none",
        colorMap[variant],
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

export default Eyebrow;

