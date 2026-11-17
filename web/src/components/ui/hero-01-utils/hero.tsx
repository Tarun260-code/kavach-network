"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "../button";
import { motion, useReducedMotion } from "framer-motion";
import { ProofNetworkHero } from "@/components/ProofNetworkHero";

export interface AvatarItem {
  id: string;
  initials: string;
  name: string;
  color: string;
}

export interface HeroProps {
  eyebrowText?: string;
  title?: React.ReactNode;
  subtitle?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  avatars?: AvatarItem[];
  ratingText?: string;
  className?: string;
}

const DEFAULT_AVATARS: AvatarItem[] = [
  { id: "mb", initials: "MB", name: "Meridian Bank", color: "#0E9F9F" },
  { id: "kc", initials: "KC", name: "Kestrel Capital", color: "#E8851A" },
  { id: "at", initials: "AT", name: "Aurum Trust", color: "#D97706" },
  { id: "hf", initials: "HF", name: "Halcyon Financial", color: "#3358F4" },
];

export function Hero({
  eyebrowText = "Consortium testnet is live",
  title,
  subtitle = "Banks flag confirmed fraudsters as cryptographic commitments. Other banks verify matches with zero-knowledge proofs. No customer data ever moves.",
  primaryCtaText = "Open bank console",
  primaryCtaHref = "/bank/meridian",
  secondaryCtaText = "See how it works",
  secondaryCtaHref = "#how-it-works",
  avatars = DEFAULT_AVATARS,
  ratingText = "Trusted by 12 consortium banks",
  className,
}: HeroProps) {
  const shouldReduceMotion = useReducedMotion();

  // Word-by-word reveal tokens with 60ms stagger
  const headlineWords = [
    { text: "Fraud", delay: 0.25, isAccent: false },
    { text: "shared,", delay: 0.31, isAccent: false },
    { text: "never", delay: 0.37, isAccent: true },
    { text: "exposed.", delay: 0.43, isAccent: true },
  ];

  return (
    <section className={cn("relative pt-4 sm:pt-6 lg:pt-8 pb-12 sm:pb-16 lg:pb-20 overflow-hidden", className)}>
      {/* Legibility Scrim Guard */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[60px] sm:top-[70px] -translate-x-1/2 w-[900px] max-w-[96vw] h-[440px] -z-10 rounded-full blur-[40px]"
        style={{
          background: "radial-gradient(ellipse 900px 440px at 50% 50%, var(--canvas) 0%, var(--canvas) 60%, transparent 100%)",
          opacity: 0.55,
        }}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Eyebrow Pill with Live Pulse Dot: rises in at 0.15s */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
          animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block mb-4 sm:mb-6"
        >
          <div className="inline-flex items-center gap-2 rounded-pill border border-hairline bg-surface/90 px-3.5 py-1.5 shadow-subtle backdrop-blur-md transition-transform duration-200 hover:scale-[1.02]">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-semantic-verified opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-semantic-verified" />
            </span>
            <span className="text-body-sm font-medium text-ink">
              {eyebrowText}
            </span>
          </div>
        </motion.div>

        {/* Display Headline: Word-by-word reveal with blur-to-sharp & shimmer on italic accent */}
        <h1 className="font-serif text-[clamp(2.5rem,5.5vw,4.5rem)] font-normal leading-[1.08] tracking-[-0.02em] text-ink max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1">
          {title ? (
            title
          ) : (
            <>
              {headlineWords.map((item, idx) => (
                <motion.span
                  key={idx}
                  initial={
                    shouldReduceMotion
                      ? false
                      : { opacity: 0, y: 12, filter: "blur(8px)" }
                  }
                  animate={
                    shouldReduceMotion
                      ? false
                      : { opacity: 1, y: 0, filter: "blur(0px)" }
                  }
                  transition={{
                    duration: 0.45,
                    delay: item.delay,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={cn(
                    "inline-block",
                    item.isAccent &&
                      "font-serif italic font-normal text-ink relative"
                  )}
                >
                  {item.isAccent ? (
                    <span className="hero-shimmer-accent">
                      {item.text}
                    </span>
                  ) : (
                    item.text
                  )}
                </motion.span>
              ))}
            </>
          )}
        </h1>

        {/* Subcopy: rises in at 0.55s */}
        <motion.p
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
          animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 sm:mt-5 max-w-2xl mx-auto text-body-lg sm:text-[18px] text-muted leading-relaxed"
        >
          {subtitle}
        </motion.p>

        {/* Primary & Secondary CTAs: rise in at 0.65s */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <Link href={primaryCtaHref}>
            <Button variant="primary" size="lg" withOrb className="h-12 px-6">
              {primaryCtaText}
            </Button>
          </Link>

          {secondaryCtaText && (
            <Link href={secondaryCtaHref || "#how-it-works"}>
              <Button variant="outline" size="lg" className="h-12 px-6">
                {secondaryCtaText}
              </Button>
            </Link>
          )}
        </motion.div>

        {/* Social Proof: Bank Avatar Stack pops in sequence (0.75s to 0.95s) */}
        <div className="mt-6 sm:mt-7 flex items-center justify-center gap-3.5 select-none">
          {/* Member-Bank Avatar Stack */}
          <div className="flex items-center isolate select-none">
            {avatars.slice(0, 4).map((av, index) => (
              <motion.div
                key={av.id}
                title={av.name}
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.7 }}
                animate={shouldReduceMotion ? false : { opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.35,
                  delay: 0.75 + index * 0.07,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={cn(
                  "relative flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full text-white ring-2 ring-canvas shadow-subtle select-none",
                  index > 0 && "-ml-[10px]"
                )}
                style={{
                  backgroundColor: av.color,
                  zIndex: avatars.length - index,
                }}
              >
                <span className="font-sans text-[12px] font-semibold tracking-normal leading-none inline-flex items-center justify-center">
                  {av.initials}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Trust Text & Demo Network Label */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, x: -6 }}
            animate={shouldReduceMotion ? false : { opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 1.02, ease: [0.16, 1, 0.3, 1] }}
            className="text-left"
          >
            <p className="text-xs font-medium text-ink">
              {ratingText}
              <span className="ml-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded-pill bg-subtle text-muted border border-hairline">
                Demo network
              </span>
            </p>
          </motion.div>
        </div>

        {/* Signature Animated Proof Network: slides up at 1.08s */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.08, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 sm:mt-10"
        >
          <ProofNetworkHero />
        </motion.div>
      </div>

      <style jsx global>{`
        .hero-shimmer-accent {
          background: linear-gradient(
            110deg,
            currentColor 30%,
            var(--brand-gold) 50%,
            currentColor 70%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmerPass 3.5s ease-in-out infinite 0.9s;
        }

        @keyframes shimmerPass {
          0% {
            background-position: 100% 0;
          }
          40% {
            background-position: -100% 0;
          }
          100% {
            background-position: -100% 0;
          }
        }
      `}</style>
    </section>
  );
}

export default Hero;
