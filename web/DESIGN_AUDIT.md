# Kavach Network — Visual & Architectural Design Audit
**Document version:** 1.0.0  
**Target aesthetic:** Institutional Tier-1 Fintech (Stripe, Mercury, Linear)  
**Reference standard:** Light airy canvas (`#FBFCFF`), soft ambient sky/champagne mesh gradient, Instrument Serif typography with italic accent phrases, pill-segmented navigation, ink pill CTAs with white circular arrow orbs, generous white space, and zero dark-console clutter.

---

## 1. Executive Summary

The current implementation of Kavach Network reflects a classic Web3 / developer-console paradigm:
- Heavy dark background (`#070B16` / `#0D1326`) reminiscent of a hacker CLI or low-level node monitor.
- Dense, overcrowded top bar with overlapping dev badges, raw testnet addresses, block numbers, and ETH balances.
- Excessive cognitive load caused by exposed technical internals (gas, raw leaf hexes, Poseidon step diagrams) prioritized over institutional clarity.
- Wall-to-wall all-caps micro-text, harsh borders, and dark card containers lacking depth, elevation, or visual breathability.

To appeal to bank executives, Chief Risk Officers (CROs), and consortium underwriting committees, Kavach must transition from a **crypto dev console** to an **institutional fintech platform**.

---

## 2. Visual Defects & Specific Architectural Fixes

| # | Visual Defect in Current UI | Root Cause | Institutional Fintech Fix |
|---|-----------------------------|------------|---------------------------|
| **1** | **Overlapping top-bar chips & badges** | Hardcoded flex wraps, fixed margins, and uncontrolled badge stacks (`CONSORTIUM NODE`, `Dev Signer`, `ETH balance`, `Hardhat Local`, `Privacy Inspector`) colliding on viewport resize. | Redesign the header into a clean, single-tier institutional bar. Group network and bank identity into a refined pill-segmented switcher. Move debug controls (e.g. dev signer, gas) into an unobtrusive drawer or settings popover. |
| **2** | **Excess developer & blockchain noise** | Prominently displaying `0x7099...79C8`, `Hardhat Local (31337) #303`, and raw node parameters directly in the primary interface. | Hide devnet noise from the main executive viewport. Display bank credentials cleanly (e.g., "Meridian Bank • Mumbai Financial District") with an authoritative verification tick. Reserve monospace addresses for dedicated copy-to-clipboard HashChips in secondary inspectors. |
| **3** | **Monolithic dark-only palette** | Deep ink canvas (`#070B16`) with high-contrast glowing blues creates eye fatigue and feels like a security terminal rather than institutional software. | Adopt a luminous, daylight canvas (`#FBFCFF`) with pure white elevated surfaces (`#FFFFFF`), subtle tinted backgrounds (`#F3F5FA`), and an ultra-soft dual mesh gradient (sky `#D7E8FF` top-left, champagne `#FFF0C9` top-right) blurred at 120px. |
| **4** | **Flat & unrefined visual hierarchy** | Every card has the same dark surface with 1px borders and identical visual weight. Nothing stands out naturally. | Establish a clear 3-layer depth model: Canvas (`#FBFCFF`) &rarr; Surface (`#FFFFFF`) &rarr; Floating/Elevated (`#FFFFFF` with `0 12px 32px -12px rgba(11,15,26,0.08)` shadow and `rgba(11,15,26,0.08)` hairline borders). |
| **5** | **All-caps micro-label fatigue** | Ubiquitous uppercase headings (`ACTIVE MEMBER SKIN`, `CONSORTIUM PROTOCOLS`, `BANK FLAGGED COMMITMENTS`, `CAPITAL AT STAKE`, `CONSORTIUM STANDING`, `STEP 1 : BROWSER IN-MEMORY`). | Strictly enforce **Sentence case** across all UI copy, navigation links, and headings. Reserve all-caps exclusively for tiny 11px tracked eyebrows (max one per section) to anchor context. |
| **6** | **Clunky, generic rectangular buttons** | Square-ish blue buttons (`Open Loan Applicant Scanner`) feel like default UI kit widgets without brand authority. | Introduce signature **ink pill buttons** (`#0B0F1A`, radius `999px`) with crisp white typography and a trailing 32px white circular orb enclosing `ArrowUpRight` (Lucide). Secondary actions become white pill buttons with hairline borders. |
| **7** | **Cramped spacing & lack of breathing room** | Dense 8px-12px gutters with tightly packed tables and cards squeeze information together. | Increase grid rhythm: 24px–32px card padding, 48px–64px section separation, and generous whitespace surrounding core metrics and verification workflows. |
| **8** | **Over-reliance on monospace fonts for UI** | Monospace typography is currently used for table headers, labels, and status badges. | Confine monospace strictly to cryptographic artifacts (`Geist Mono` for leaf hashes, nullifiers, Merkle roots, and tx hashes). Use `Instrument Serif` for display headings and `Geist Sans` for all UI text, labels, and body copy. |
| **9** | **Bank branding recoloring entire UI components** | Bank switcher drastically tints cards, borders, and ambient glows with cyan or orange. | Restrict bank skinning to **accent tokens only** (e.g. monogram badge, 2px focus ring, active pill state). The core platform shell remains pristine institutional white/ink. |
| **10** | **Cryptographic diagram over-complexity** | "Step 1: Browser In-Memory", "Step 2: Local BN254 Math", "Step 3: On-Chain Broadcast" are rendered as dense technical blocks on the primary screen. | Abstract the cryptographic pipeline into an elegant, progressive disclosure flow or an on-demand "Privacy Inspector" modal. The main workflow presents high-level assurance ("Client-side Zero-Knowledge Shield Active"). |

---

## 3. Design Token Architecture (Single Source of Truth)

All color, typographic, and elevation values must be defined as CSS variables in `/web/src/app/globals.css` and mapped into `tailwind.config.ts`. No hardcoded hex values are permitted in components.

```css
:root {
  /* Canvas & Surfaces */
  --canvas: #FBFCFF;
  --surface: #FFFFFF;
  --subtle: #F3F5FA;
  --hairline: rgba(11, 15, 26, 0.08);

  /* Typography & Ink */
  --ink: #0B0F1A;
  --muted: #5B6475;
  --faint: #8A93A6;

  /* Ambient Mesh Gradients */
  --mesh-sky-1: #D7E8FF;
  --mesh-sky-2: #BEDCFF;
  --mesh-champagne-1: #FFF0C9;
  --mesh-champagne-2: #FFE2A0;

  /* Brand & Accents */
  --brand-sapphire: #2F5BFF;
  --consortium-gold: #B8913F;

  /* Semantic Signals */
  --signal-verified: #12A66A;
  --signal-flagged: #E5484D;
  --signal-pending: #D99100;

  /* Bank Accents (Subtle Monograms & Badges Only) */
  --bank-meridian: #0E9F9F;
  --bank-kestrel: #E8851A;
}
```

---

## 4. Component Primitive Specifications

1. **Button**:
   - `variant="primary"`: Pill (`rounded-full`), background `--ink`, text `--surface`, trailing 32px circular white orb with `ArrowUpRight` icon.
   - `variant="secondary"`: Pill (`rounded-full`), background `--surface`, hairline border `--hairline`, text `--ink`, subtle hover elevation.
   - `variant="ghost"`: Text `--muted` transitioning to `--ink` on hover, subtle pill background.
   - `variant="link"`: Text `--brand-sapphire`, underline-on-hover.
2. **StatusPill**:
   - Pill shape (`rounded-full`), height 28px, 12px text, soft background (10% tint), solid semantic dot with subtle pulse for live states.
   - Variants: `verified` (emerald), `flagged` (coral red), `pending` (amber), `consortium` (champagne gold).
3. **HashChip**:
   - Monospace font (`Geist Mono`), truncated format (`0x7099...79C8`), interactive hover tooltip, copy-to-clipboard button with animated check icon confirmation.
4. **Card**:
   - 20px border radius (`rounded-[20px]`), `--surface` background, `--hairline` border, soft dual-stage shadow (`0 1px 2px rgba(11,15,26,0.04), 0 12px 32px -12px rgba(11,15,26,0.08)`).
5. **Eyebrow & SectionHeading**:
   - Eyebrow: 11px uppercase, tracking `0.1em`, color `--faint` or `--brand-sapphire`, max one per block.
   - SectionHeading: `Instrument Serif`, font sizes 40px/56px/72px, tracking `-0.03em`, supporting italic phrase accents (e.g. `Building consortium trust with <em>cryptographic armour</em>`).
6. **MetricCard**:
   - Sentence case metric label (`--muted`), large `Instrument Serif` / tabular numeral value (`--ink`), subtitle indicating consortium context or delta.
7. **MeshBackground**:
   - Ambient, fixed, non-blocking background with sky-blue mesh blur top-left and warm champagne blur top-right (`blur-[120px]`).

---

## 5. Verification Checklist for Phase 1
- [x] Design audit complete and documented in `DESIGN_AUDIT.md`.
- [ ] Dependencies installed: Radix UI primitives, class-variance-authority, Lucide icons, Sonner.
- [ ] CSS variables declared in `globals.css` with clean structure for future dark mode override.
- [ ] `tailwind.config.ts` wired to tokens and typography scales.
- [ ] Next.js fonts loaded (`Instrument Serif`, `Geist Sans`, `Geist Mono`).
- [ ] Reusable `<MeshBackground />` implemented.
- [ ] UI primitives implemented in `@/components/ui/`.
- [ ] `/styleguide` route built showcasing all tokens, typography, and primitives.
- [ ] `pnpm build` verified green.
- [ ] Screenshots captured at 1440px and 390px.
- [ ] Zero hard-coded hex colors verified outside design tokens.

