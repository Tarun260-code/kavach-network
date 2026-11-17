import React from "react";
import { LucideIcon, ShieldCheck } from "lucide-react";
import { Button } from "./button";
import { BrandPattern } from "../BrandPattern";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  actionText?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  withPattern?: boolean;
  children?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon: Icon = ShieldCheck,
  actionText,
  actionLabel,
  onAction,
  className = "",
  withPattern = true,
  children,
}: EmptyStateProps) {
  const resolvedAction = actionLabel || actionText;
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center p-8 rounded-card border border-dashed border-hairline bg-subtle/30 text-center overflow-hidden",
        className
      )}
    >
      {withPattern && <BrandPattern opacity={0.035} />}
      <div className="relative z-10 p-3 rounded-full bg-surface border border-hairline text-muted mb-3 shadow-subtle">
        <Icon className="h-6 w-6 stroke-[1.5]" />
      </div>
      <h3 className="relative z-10 font-sans text-lg font-semibold tracking-[-0.01em] text-ink mb-1">
        {title}
      </h3>
      <p className="relative z-10 text-body-sm text-muted max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {resolvedAction && onAction && (
        <div className="relative z-10">
          <Button variant="primary" size="default" onClick={onAction}>
            {resolvedAction}
          </Button>
        </div>
      )}
      {children && <div className="relative z-10 mt-2">{children}</div>}
    </div>
  );
}

export default EmptyState;

