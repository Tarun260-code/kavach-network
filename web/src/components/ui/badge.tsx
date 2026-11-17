"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-pill border px-2.5 py-0.5 text-body-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-sapphire focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "border-hairline bg-surface text-ink shadow-subtle",
        secondary:
          "border-transparent bg-subtle text-muted hover:bg-subtle/80",
        destructive:
          "border-semantic-flagged/20 bg-semantic-flagged/10 text-semantic-flagged",
        outline:
          "border-hairline text-ink",
        verified:
          "border-semantic-verified/20 bg-semantic-verified/10 text-semantic-verified",
        pending:
          "border-semantic-pending/20 bg-semantic-pending/10 text-semantic-pending",
        gold:
          "border-brand-gold/25 bg-brand-gold/15 text-brand-gold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

