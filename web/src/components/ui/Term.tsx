"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GLOSSARY, lookupTerm, GlossaryEntry } from "@/lib/glossary";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";
import { ArrowRight, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TermProps {
  id?: keyof typeof GLOSSARY | string;
  children?: React.ReactNode;
  className?: string;
  showIcon?: boolean;
}

export function Term({ id, children, className, showIcon = false }: TermProps) {
  const [open, setOpen] = useState(false);

  // If no explicit ID, use text content from children
  const keyToLookup = id || (typeof children === "string" ? children : "");
  const entry: GlossaryEntry | undefined = lookupTerm(keyToLookup);

  if (!entry) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          className={cn(
            "inline-flex items-center gap-0.5 border-b border-dotted border-muted/80 hover:border-brand-sapphire hover:text-ink cursor-help transition-colors select-none",
            className
          )}
          tabIndex={0}
          role="button"
          title={entry.definition}
        >
          <span>{children || entry.term}</span>
          {showIcon && <HelpCircle className="h-3 w-3 text-muted inline ml-0.5 opacity-60" />}
        </span>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        side="top"
        sideOffset={6}
        className="w-72 p-3.5 bg-surface border border-hairline shadow-elevated rounded-card text-xs space-y-2.5 z-50 animate-in fade-in zoom-in-95 duration-150"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div className="flex items-center justify-between border-b border-hairline pb-1.5">
          <span className="font-serif text-sm font-semibold text-ink">
            {entry.term}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-pill bg-subtle text-faint">
            {entry.category}
          </span>
        </div>

        <p className="text-ink font-medium leading-relaxed">
          {entry.definition}
        </p>

        {entry.plainSummary && (
          <p className="text-[11px] text-muted leading-relaxed">
            {entry.plainSummary}
          </p>
        )}

        <div className="pt-2 border-t border-hairline flex items-center justify-between text-[11px]">
          <span className="text-muted">Kavach Glossary</span>
          <Link
            href={entry.learnMoreHref}
            onClick={() => setOpen(false)}
            className="text-brand-sapphire hover:underline font-medium inline-flex items-center gap-1"
          >
            <span>Learn more</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default Term;

