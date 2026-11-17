"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface IllustrationProps {
  className?: string;
  size?: number; // width in px
  animated?: boolean;
}

/**
 * 1. CommitIllustration
 * Raw national identifier salted & hashed locally in browser RAM into Poseidon commitment leaf.
 */
export function CommitIllustration({
  className,
  size = 140,
  animated = true,
}: IllustrationProps) {
  return (
    <svg
      width={size}
      height={Math.round((size * 100) / 140)}
      viewBox="0 0 140 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("select-none", className)}
      aria-label="Commit in Memory Illustration"
    >
      <defs>
        <linearGradient id="commitGlow" x1="20" y1="20" x2="120" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--brand-sapphire)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--brand-gold)" stopOpacity="0.08" />
        </linearGradient>
      </defs>

      {/* Background Soft Glow Capsule */}
      <rect x="10" y="12" width="120" height="76" rx="14" fill="url(#commitGlow)" stroke="var(--hairline)" strokeWidth="1" />

      {/* Browser RAM Enclave Box (Left) */}
      <rect x="20" y="24" width="40" height="52" rx="8" stroke="var(--brand-sapphire)" strokeWidth="1.5" fill="var(--surface)" />
      {/* Raw ID Line Representation */}
      <line x1="27" y1="36" x2="53" y2="36" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="27" y1="44" x2="47" y2="44" stroke="var(--faint)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="27" y1="52" x2="41" y2="52" stroke="var(--brand-gold)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Client Enclave Padlock */}
      <circle cx="50" cy="64" r="3" fill="var(--brand-sapphire)" />
      <path d="M48 64V61C48 59.9 48.9 59 50 59C51.1 59 52 59.9 52 61V64" stroke="var(--brand-sapphire)" strokeWidth="1" strokeLinecap="round" />

      {/* Mathematical Transformation Arrow / Beam */}
      <path
        d="M65 50H79"
        stroke="var(--brand-sapphire)"
        strokeWidth="1.5"
        strokeLinecap="round"
        className={cn(animated && "animate-pulse")}
      />
      <path d="M76 46L80 50L76 54" stroke="var(--brand-sapphire)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Poseidon Math Orbitals */}
      <circle cx="72" cy="50" r="7" stroke="var(--brand-gold)" strokeWidth="1" strokeDasharray="2 2" />

      {/* Output 32-Byte Commitment Leaf (Right) */}
      <rect x="85" y="28" width="36" height="44" rx="8" stroke="var(--brand-gold)" strokeWidth="1.5" fill="var(--surface)" />
      {/* Hex representation */}
      <circle cx="97" cy="42" r="3" fill="var(--brand-gold)" />
      <circle cx="109" cy="42" r="3" fill="var(--brand-sapphire)" />
      <circle cx="103" cy="54" r="3" fill="var(--signal-verified)" />
      <path d="M97 42L109 42L103 54Z" stroke="var(--hairline)" strokeWidth="1" />
    </svg>
  );
}

/**
 * 2. AnchorIllustration
 * Cryptographic leaf anchored onto on-chain Merkle tree with escrow deposit.
 */
export function AnchorIllustration({
  className,
  size = 140,
  animated = true,
}: IllustrationProps) {
  return (
    <svg
      width={size}
      height={Math.round((size * 100) / 140)}
      viewBox="0 0 140 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("select-none", className)}
      aria-label="Anchor On-Chain Illustration"
    >
      <defs>
        <linearGradient id="anchorGlow" x1="70" y1="10" x2="70" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--brand-gold)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--brand-sapphire)" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Background Capsule */}
      <rect x="10" y="12" width="120" height="76" rx="14" fill="url(#anchorGlow)" stroke="var(--hairline)" strokeWidth="1" />

      {/* Merkle Root at Top */}
      <circle cx="70" cy="28" r="9" stroke="var(--brand-gold)" strokeWidth="1.5" fill="var(--surface)" />
      <path d="M66 28L69 31L75 25" stroke="var(--brand-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Branching Proof Lines */}
      <path d="M63 34L44 50M77 34L96 50" stroke="var(--hairline)" strokeWidth="1.5" />

      {/* Mid Level Nodes */}
      <circle cx="44" cy="52" r="6" stroke="var(--brand-sapphire)" strokeWidth="1.5" fill="var(--surface)" />
      <circle cx="96" cy="52" r="6" stroke="var(--muted)" strokeWidth="1.5" fill="var(--surface)" />

      {/* Sub-branch to New Active Anchored Leaf */}
      <path d="M40 57L30 68M48 57L58 68" stroke="var(--hairline)" strokeWidth="1.5" strokeDasharray="2 2" />
      <circle cx="30" cy="70" r="4.5" fill="var(--faint)" />

      {/* Highlighted Anchored Leaf */}
      <circle
        cx="58"
        cy="70"
        r="6.5"
        stroke="var(--brand-sapphire)"
        strokeWidth="1.5"
        fill="var(--surface)"
        className={cn(animated && "animate-pulse")}
      />
      <circle cx="58" cy="70" r="2.5" fill="var(--brand-sapphire)" />

      {/* Escrow Lock / Stake Seal (Right side) */}
      <circle cx="112" cy="70" r="8" stroke="var(--brand-gold)" strokeWidth="1.5" fill="var(--surface)" />
      <path d="M109 68V66C109 64.3 110.3 63 112 63C113.7 63 115 64.3 115 66V68" stroke="var(--brand-gold)" strokeWidth="1.2" />
      <circle cx="112" cy="71" r="1.5" fill="var(--brand-gold)" />
    </svg>
  );
}

/**
 * 3. ProveIllustration
 * Client-side Groth16 zero-knowledge proof generation: private witness matches without disclosure.
 */
export function ProveIllustration({
  className,
  size = 140,
  animated = true,
}: IllustrationProps) {
  return (
    <svg
      width={size}
      height={Math.round((size * 100) / 140)}
      viewBox="0 0 140 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("select-none", className)}
      aria-label="Prove in Browser Illustration"
    >
      <defs>
        <linearGradient id="proveGlow" x1="10" y1="50" x2="130" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--brand-sapphire)" stopOpacity="0.1" />
          <stop offset="100%" stopColor="var(--signal-verified)" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      <rect x="10" y="12" width="120" height="76" rx="14" fill="url(#proveGlow)" stroke="var(--hairline)" strokeWidth="1" />

      {/* Groth16 Prover Triangle in Center */}
      <path
        d="M70 24L102 74H38L70 24Z"
        stroke="var(--brand-sapphire)"
        strokeWidth="1.5"
        fill="var(--surface)"
      />

      {/* Central ZK Verification Node */}
      <circle cx="70" cy="54" r="8" stroke="var(--signal-verified)" strokeWidth="1.5" fill="var(--surface)" />
      <path d="M67 54L69.5 56.5L74 51.5" stroke="var(--signal-verified)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Witness Rays */}
      <line x1="38" y1="74" x2="63" y2="58" stroke="var(--brand-gold)" strokeWidth="1.2" strokeDasharray="2 2" />
      <line x1="102" y1="74" x2="77" y2="58" stroke="var(--brand-sapphire)" strokeWidth="1.2" strokeDasharray="2 2" />
      <line x1="70" y1="24" x2="70" y2="46" stroke="var(--brand-sapphire)" strokeWidth="1.2" strokeDasharray="2 2" />

      {/* Corner Keymarks */}
      <circle cx="70" cy="24" r="3.5" fill="var(--brand-gold)" />
      <circle cx="38" cy="74" r="3.5" fill="var(--brand-sapphire)" />
      <circle cx="102" cy="74" r="3.5" fill="var(--brand-sapphire)" />
    </svg>
  );
}

/**
 * 4. AppealIllustration
 * Adjudication scales with 2/3 consortium consensus quorum and slashing gavel.
 */
export function AppealIllustration({
  className,
  size = 140,
  animated = true,
}: IllustrationProps) {
  return (
    <svg
      width={size}
      height={Math.round((size * 100) / 140)}
      viewBox="0 0 140 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("select-none", className)}
      aria-label="AppealDAO Adjudication Illustration"
    >
      <defs>
        <linearGradient id="appealGlow" x1="70" y1="10" x2="70" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--brand-gold)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--brand-sapphire)" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      <rect x="10" y="12" width="120" height="76" rx="14" fill="url(#appealGlow)" stroke="var(--hairline)" strokeWidth="1" />

      {/* Central Scales Pillar */}
      <line x1="70" y1="26" x2="70" y2="72" stroke="var(--brand-gold)" strokeWidth="2" strokeLinecap="round" />
      <line x1="56" y1="72" x2="84" y2="72" stroke="var(--brand-gold)" strokeWidth="2" strokeLinecap="round" />

      {/* Balance Beam */}
      <line x1="42" y1="36" x2="98" y2="36" stroke="var(--brand-sapphire)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="70" cy="36" r="3" fill="var(--brand-gold)" />

      {/* Left Pan (Disputed Leaf) */}
      <path d="M42 36L34 52M42 36L50 52" stroke="var(--hairline)" strokeWidth="1" />
      <path d="M30 52Q42 58 54 52" stroke="var(--brand-sapphire)" strokeWidth="1.5" fill="var(--surface)" />
      <circle cx="42" cy="51" r="2.5" fill="var(--signal-flagged)" />

      {/* Right Pan (Defense Evidence Dossier) */}
      <path d="M98 36L90 52M98 36L106 52" stroke="var(--hairline)" strokeWidth="1" />
      <path d="M86 52Q98 58 110 52" stroke="var(--brand-sapphire)" strokeWidth="1.5" fill="var(--surface)" />
      <rect x="94" y="46" width="8" height="7" rx="1.5" fill="var(--brand-gold)" />

      {/* Quorum Progress Arc Marker at Top */}
      <path d="M58 24C62 21 78 21 82 24" stroke="var(--signal-verified)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 5. EmptyLedgerIllustration
 * Clean empty state for an event ledger or transaction history.
 */
export function EmptyLedgerIllustration({
  className,
  size = 140,
}: IllustrationProps) {
  return (
    <svg
      width={size}
      height={Math.round((size * 100) / 140)}
      viewBox="0 0 140 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("select-none", className)}
      aria-label="Empty Ledger Illustration"
    >
      <rect x="10" y="12" width="120" height="76" rx="14" fill="var(--subtle)" stroke="var(--hairline)" strokeWidth="1" />

      {/* Clean Tiered Ledger Shelves */}
      <rect x="30" y="30" width="80" height="10" rx="3" stroke="var(--hairline)" strokeWidth="1.2" fill="var(--surface)" />
      <line x1="38" y1="35" x2="60" y2="35" stroke="var(--hairline)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="98" cy="35" r="2" fill="var(--faint)" />

      <rect x="30" y="46" width="80" height="10" rx="3" stroke="var(--hairline)" strokeWidth="1.2" fill="var(--surface)" />
      <line x1="38" y1="51" x2="52" y2="51" stroke="var(--hairline)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="98" cy="51" r="2" fill="var(--faint)" />

      <rect x="30" y="62" width="80" height="10" rx="3" stroke="var(--hairline)" strokeWidth="1.2" fill="var(--surface)" />
      <line x1="38" y1="67" x2="68" y2="67" stroke="var(--hairline)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="98" cy="67" r="2" fill="var(--faint)" />

      {/* Floating Synchronized Sentinel Dot */}
      <circle cx="114" cy="24" r="3.5" fill="var(--brand-sapphire)" />
      <circle cx="114" cy="24" r="6" stroke="var(--brand-sapphire)" strokeWidth="1" strokeDasharray="1.5 1.5" />
    </svg>
  );
}

/**
 * 6. NoAppealsIllustration
 * Calm state when zero disputes are in adjudication.
 */
export function NoAppealsIllustration({
  className,
  size = 140,
}: IllustrationProps) {
  return (
    <svg
      width={size}
      height={Math.round((size * 100) / 140)}
      viewBox="0 0 140 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("select-none", className)}
      aria-label="No Appeals Active Illustration"
    >
      <rect x="10" y="12" width="120" height="76" rx="14" fill="var(--subtle)" stroke="var(--hairline)" strokeWidth="1" />

      {/* Protective Shield Outline */}
      <path
        d="M70 24C80 24 90 27 90 27V48C90 60 80 68 70 72C60 68 50 60 50 48V27C50 27 60 24 70 24Z"
        stroke="var(--brand-gold)"
        strokeWidth="1.5"
        fill="var(--surface)"
      />

      {/* Green Checkmark inside shield */}
      <circle cx="70" cy="48" r="10" stroke="var(--signal-verified)" strokeWidth="1.5" fill="var(--signal-verified)" fillOpacity="0.1" />
      <path d="M66 48L69 51L75 45" stroke="var(--signal-verified)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

      {/* Surrounding Bank Seal Dots */}
      <circle cx="34" cy="38" r="3" fill="var(--brand-sapphire)" />
      <circle cx="106" cy="38" r="3" fill="var(--brand-sapphire)" />
      <circle cx="38" cy="64" r="3" fill="var(--faint)" />
      <circle cx="102" cy="64" r="3" fill="var(--faint)" />
    </svg>
  );
}

/**
 * 7. OfflineIllustration
 * Clear institutional notification when offline or local node disconnects.
 */
export function OfflineIllustration({
  className,
  size = 140,
}: IllustrationProps) {
  return (
    <svg
      width={size}
      height={Math.round((size * 100) / 140)}
      viewBox="0 0 140 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("select-none", className)}
      aria-label="Offline Mode Illustration"
    >
      <rect x="10" y="12" width="120" height="76" rx="14" fill="var(--subtle)" stroke="var(--hairline)" strokeWidth="1" />

      {/* Antenna Mast */}
      <line x1="70" y1="46" x2="70" y2="72" stroke="var(--faint)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="70" cy="42" r="5" stroke="var(--signal-pending)" strokeWidth="1.5" fill="var(--surface)" />
      <circle cx="70" cy="42" r="2" fill="var(--signal-pending)" />

      {/* Broken Signal Waves */}
      <path d="M58 34C64 28 76 28 82 34" stroke="var(--hairline)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
      <path d="M50 26C62 18 78 18 90 26" stroke="var(--hairline)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />

      {/* Disconnect Diagonal Slash */}
      <line x1="58" y1="56" x2="82" y2="30" stroke="var(--signal-flagged)" strokeWidth="1.5" strokeLinecap="round" />

      {/* Local Fallback Enclave Box */}
      <rect x="24" y="66" width="30" height="14" rx="4" stroke="var(--hairline)" strokeWidth="1" fill="var(--surface)" />
      <line x1="28" y1="73" x2="48" y2="73" stroke="var(--muted)" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
