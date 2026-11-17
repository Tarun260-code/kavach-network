"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface BrandItem {
  name: string;
  logo: React.ReactNode;
  href?: string;
}

export interface BrandSliderProps {
  title?: string;
  brands?: BrandItem[];
  className?: string;
}

export const DEFAULT_BRANDS: BrandItem[] = [
  {
    name: "Meridian Bank",
    logo: (
      <div className="flex items-center gap-2 group-hover:text-bank-meridian transition-colors">
        <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L3 9v11h6v-7h6v7h6V9z" opacity="0.3" />
          <path d="M12 5.5l5 4v9h-3v-5h-4v5H7v-9z" />
        </svg>
        <span className="font-sans font-bold tracking-wider text-sm sm:text-base uppercase">
          Meridian
        </span>
      </div>
    ),
  },
  {
    name: "Kestrel Capital",
    logo: (
      <div className="flex items-center gap-2 group-hover:text-bank-kestrel transition-colors">
        <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 18l8-14 8 14-8-4-8 4z" />
        </svg>
        <span className="font-sans font-bold tracking-wider text-sm sm:text-base uppercase">
          Kestrel
        </span>
      </div>
    ),
  },
  {
    name: "Aurum Trust",
    logo: (
      <div className="flex items-center gap-2 group-hover:text-brand-gold transition-colors">
        <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M12 7v10M8 12h8" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span className="font-sans font-bold tracking-wider text-sm sm:text-base uppercase">
          Aurum Trust
        </span>
      </div>
    ),
  },
  {
    name: "Halcyon Financial",
    logo: (
      <div className="flex items-center gap-2 group-hover:text-brand-sapphire transition-colors">
        <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3a9 9 0 0 0-9 9h18a9 9 0 0 0-9-9z" opacity="0.4" />
          <rect x="3" y="14" width="18" height="3" rx="1" />
          <rect x="5" y="19" width="14" height="2" rx="1" opacity="0.6" />
        </svg>
        <span className="font-sans font-bold tracking-wider text-sm sm:text-base uppercase">
          Halcyon
        </span>
      </div>
    ),
  },
  {
    name: "Northgate Bank",
    logo: (
      <div className="flex items-center gap-2 group-hover:text-brand-sapphire transition-colors">
        <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l9 4.5v11L12 22 3 17.5v-11L12 2zm0 3.2L6 8.2v7.6l6 3 6-3V8.2l-6-3z" />
        </svg>
        <span className="font-sans font-bold tracking-wider text-sm sm:text-base uppercase">
          Northgate
        </span>
      </div>
    ),
  },
  {
    name: "Vantage Credit",
    logo: (
      <div className="flex items-center gap-2 group-hover:text-semantic-verified transition-colors">
        <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l4 8h-8l4-8zm-7 11h14l-2 9H7l-2-9z" />
        </svg>
        <span className="font-sans font-bold tracking-wider text-sm sm:text-base uppercase">
          Vantage
        </span>
      </div>
    ),
  },
];

export function BrandSlider({
  title = "Verified by member institutions",
  brands = DEFAULT_BRANDS,
  className,
}: BrandSliderProps) {
  // Double list for seamless continuous infinite marquee
  const marqueeItems = [...brands, ...brands, ...brands];

  return (
    <section className={cn("relative py-12 overflow-hidden", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
          {title}
        </p>
      </div>

      {/* Marquee Wrapper with Edge Fade Gradient Masks (slows to 40% speed on hover) */}
      <div className="marquee-container relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        <div className="flex w-max animate-marquee space-x-12 sm:space-x-16 py-2">
          {marqueeItems.map((brand, idx) => (
            <div
              key={`${brand.name}-${idx}`}
              className="group flex items-center transition-all duration-300 cursor-default select-none text-ink"
            >
              {brand.logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BrandSlider;
