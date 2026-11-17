"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HashChipProps extends React.HTMLAttributes<HTMLDivElement> {
  hash: string;
  truncate?: boolean;
  prefixLen?: number;
  suffixLen?: number;
  label?: string;
  copyable?: boolean;
}

export function HashChip({
  hash,
  truncate = true,
  prefixLen = 6,
  suffixLen = 4,
  label,
  copyable = true,
  className,
  ...props
}: HashChipProps) {
  const [copied, setCopied] = React.useState(false);

  const displayHash = React.useMemo(() => {
    if (!truncate || hash.length <= prefixLen + suffixLen + 3) {
      return hash;
    }
    return `${hash.slice(0, prefixLen)}...${hash.slice(-suffixLen)}`;
  }, [hash, truncate, prefixLen, suffixLen]);

  const copyToClipboard = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div
      onClick={copyToClipboard}
      title={`Click to copy: ${hash}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          copyToClipboard(e as unknown as React.MouseEvent);
        }
      }}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-pill border border-hairline bg-surface/90 px-2.5 py-1 text-body-sm text-muted shadow-subtle hover:border-brand-sapphire/30 hover:bg-subtle hover:text-ink transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sapphire",
        className
      )}
      {...props}
    >
      {label && <span className="font-sans text-faint text-body-sm">{label}:</span>}
      <span className="font-mono text-body-sm font-medium tracking-tight text-ink/90">
        {displayHash}
      </span>
      <span className="ml-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center text-faint group-hover:text-brand-sapphire transition-colors">
        {copied ? (
          <Check className="h-3.5 w-3.5 text-semantic-verified animate-in zoom-in-50 duration-150" />
        ) : (
          <Copy className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
        )}
      </span>
    </div>
  );
}

export default HashChip;

