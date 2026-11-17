"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../button";
import { ThemeToggle } from "../ThemeToggle";
import { KavachLogo } from "@/components/KavachLogo";
import { motion, useReducedMotion } from "framer-motion";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../sheet";

export interface NavigationSection {
  title: string;
  href: string;
  isActive?: boolean;
}

export interface HeaderProps {
  navigation?: NavigationSection[];
  ctaText?: string;
  ctaHref?: string;
}

const DEFAULT_NAVIGATION: NavigationSection[] = [
  { title: "Product", href: "#solution" },
  { title: "How it works", href: "#how-it-works" },
  { title: "Privacy", href: "/trust" },
  { title: "Governance", href: "/appeals" },
  { title: "Trust", href: "/trust" },
];

export function Header({
  navigation = DEFAULT_NAVIGATION,
  ctaText = "Open console",
  ctaHref = "/bank/meridian",
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={shouldReduceMotion ? false : { y: -16, opacity: 0 }}
      animate={shouldReduceMotion ? false : { y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-hairline bg-surface/85 backdrop-blur-md shadow-subtle py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Wordmark */}
        <Link
          href="/"
          className="group flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sapphire rounded-pill"
        >
          <KavachLogo variant="full" size="sm" />
        </Link>

        {/* Centered Pill-Segmented Navigation with Sliding Pill Indicator (Desktop) */}
        <nav
          className="hidden md:flex items-center rounded-pill border border-hairline bg-surface/80 p-1.5 shadow-subtle backdrop-blur-md relative"
          aria-label="Main Navigation"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <ul className="flex items-center space-x-1 relative">
            {navigation.map((item, idx) => (
              <li key={item.title} className="relative">
                {hoveredIdx === idx && (
                  <motion.div
                    layoutId="nav-sliding-pill"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                    className="absolute inset-0 rounded-pill bg-subtle/80 -z-10"
                  />
                )}
                <Link
                  href={item.href}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  className={cn(
                    "relative z-10 inline-flex items-center rounded-pill px-4 py-1.5 text-body-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sapphire",
                    item.isActive
                      ? "bg-ink text-canvas shadow-subtle"
                      : "text-muted hover:text-ink"
                  )}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right CTA Button, Theme Toggle & Mobile Trigger */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Link href={ctaHref} className="hidden sm:inline-block">
            <Button variant="primary" size="default" withOrb>
              {ctaText}
            </Button>
          </Link>

          {/* Mobile Sheet Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="md:hidden rounded-full"
                aria-label="Open mobile navigation menu"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[360px] p-6 bg-surface">
              <SheetHeader className="mb-6 border-b border-hairline pb-4">
                <SheetTitle className="flex items-center gap-2">
                  <KavachLogo variant="full" size="sm" />
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col justify-between h-[calc(100%-80px)]">
                <ul className="space-y-2">
                  {navigation.map((item) => (
                    <li key={item.title}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center justify-between rounded-card px-4 py-3 text-body-md font-medium transition-colors",
                          item.isActive
                            ? "bg-subtle text-ink font-semibold"
                            : "text-muted hover:bg-subtle hover:text-ink"
                        )}
                      >
                        <span>{item.title}</span>
                        <ArrowUpRight className="h-4 w-4 text-faint" />
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="pt-6 border-t border-hairline space-y-3">
                  <Link href={ctaHref} onClick={() => setMobileOpen(false)} className="block w-full">
                    <Button variant="primary" size="lg" withOrb className="w-full">
                      {ctaText}
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}

export default Header;
