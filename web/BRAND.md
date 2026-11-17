# Kavach Network — Brand Identity & Design System Specification

**Product:** Kavach Network (Institutional Fraud Intelligence for Indian Banking)  
**Version:** 2.0 (Institutional Fintech Edition)  
**Document:** `/web/BRAND.md`  

---

## 1. Brand Essence & Philosophy

Kavach Network is an institutional fraud-prevention consortium built for licensed Indian commercial banks and NBFCs. The visual and interactive identity mirrors the world’s most trusted financial systems (Stripe, Mercury, Linear) rather than a cryptocurrency console or developer sandbox.

- **Calm Authority:** Clean light canvas, spacious 12-column grid, generous whitespace, zero visual clutter.
- **Mathematical Truth:** Clear visual metaphors for zero-knowledge commitments, Merkle proofs, and anonymized syndicate velocity.
- **Institutional Dignity:** Instrument Serif display type with editorial italic highlights, combined with Geist Sans for UI density and Geist Mono strictly for cryptographic hashes.

---

## 2. Logo System

The Kavach brand mark unites three distinct symbolic ideas:
1. **The Shield (Kavach):** An institutional defensive silhouette providing mathematical protection to loan underwriting.
2. **The Letter "K":** Dynamic geometric spine with balanced upper and lower angled arms.
3. **The Merkle Node Motif:** Three interconnected vertices (Root, Leaf A, Leaf B) with subtle proof-lattice lines demonstrating decentralized consensus.

### Logo Variants

| Variant | Components | Primary Use Case |
|---------|------------|------------------|
| **Full (`full`)** | Shield Mark + "Kavach" Wordmark + "Network" descriptor | Landing page header, Brand portal, Executive documents. |
| **Mark Only (`mark`)** | Standalone Shield Mark | Collapsed 72px left rail, Favicon, Mobile top bar, App launcher. |
| **Wordmark Only (`wordmark`)** | "Kavach" in Instrument Serif | Editorial footers, legal terms, compact headers. |

### Color Themes & Contrast

- **Auto:** Automatically adjusts between ink fill (`#0B0F1A`) on light backgrounds and subtle surface fill (`#0D1326`) with light strokes on dark backgrounds.
- **Sapphire:** Accent brand variant with vibrant `#2F5BFF` fill and champagne-gold Merkle node highlights.
- **Monochrome:** Inherits `currentColor` for watermarks and stamps.

### Clear Space & Minimum Sizes

- **Minimum Size:** 20px (`size="xs"`) for favicons and compact status bars; 24px (`size="sm"`) for dense navigation; 32px (`size="md"`) standard.
- **Clear Space:** Minimum clearance equal to 50% of the shield’s width on all four sides.

---

## 3. Brand Lattice Pattern

To anchor empty states, call-to-action cards, and section dividers without adding visual noise, Kavach uses a proprietary **node-and-line lattice pattern**:
- **Geometry:** Repeating 48×48px diamond-mesh matrix with central Merkle vertices and dashed proof rays.
- **Opacity:** Strictly capped at **4% opacity** (`opacity: 0.04`) in standard mode.
- **Component:** `<BrandPattern variant="lattice" opacity={0.04} />`

---

## 4. Typography Hierarchy

| Style | Font Family | Size / Line Height | Tracking | Usage |
|-------|-------------|--------------------|----------|-------|
| **Display 01** | Instrument Serif | `clamp(2.5rem, 6vw, 4.5rem)` / 1.05 | `-0.02em` | Landing page hero headline (with italic accents) |
| **Heading LG** | Instrument Serif | `2.25rem (36px)` / 1.15 | `-0.01em` | Section headers, milestone announcements |
| **Heading MD** | Instrument Serif | `1.5rem (24px)` / 1.25 | `normal` | Card titles, modal headers, institution name |
| **Heading SM** | Geist Sans | `1.125rem (18px)` / 1.35 | `normal` | Sub-section labels, component group titles |
| **Body LG** | Geist Sans | `1.125rem (18px)` / 1.5 | `normal` | Hero subheadings, lead paragraphs |
| **Body Regular** | Geist Sans | `0.875rem (14px)` / 1.5 | `normal` | Standard UI copy, form labels, table cells |
| **Body SM** | Geist Sans | `0.75rem (12px)` / 1.4 | `+0.01em` | Metadata, helper texts, sub-labels |
| **Code / Hash** | Geist Mono | `0.75rem (12px)` / 1.2 | `normal` | 32-byte hashes, nullifiers, addresses only |

---

## 5. Token System (CSS Variables)

```css
:root {
  /* Canvas & Surface */
  --canvas: #FBFCFF;
  --surface: #FFFFFF;
  --subtle: #F3F5FA;
  --ink: #0B0F1A;
  --muted: #5B6475;
  --faint: #8A93A6;
  --hairline: rgba(11, 15, 26, 0.08);

  /* Brand Accents */
  --brand-sapphire: #2F5BFF;
  --brand-gold: #B8913F;

  /* Semantic Signals */
  --signal-verified: #12A66A;
  --signal-flagged: #E5484D;
  --signal-pending: #D99100;

  /* Elevation (3 levels only) */
  --shadow-subtle: 0 1px 2px rgba(11, 15, 26, 0.04);
  --shadow-card: 0 4px 16px -2px rgba(11, 15, 26, 0.06);
  --shadow-elevated: 0 12px 32px -4px rgba(11, 15, 26, 0.12);
}

[data-theme="dark"] {
  --canvas: #070B16;
  --surface: #0D1326;
  --subtle: #141B35;
  --ink: #EEF1FA;
  --muted: #8A93A6;
  --faint: #5B6475;
  --hairline: rgba(238, 241, 250, 0.10);
}
```

---

## 6. Bank Skin Architecture

Adding a new member bank requires a single JSON configuration object in `web/src/lib/banks.ts`. The skin customizes the bank's accent, monogram, and badge, while leaving the institutional canvas and surface untouched:

```typescript
export interface BankSkin {
  id: string;
  name: string;
  code: string;
  category: "Public Sector" | "Private Sector" | "NBFC";
  accentColor: string;     // e.g. #0FA3A3 (Meridian Teal)
  accentGlow: string;      // e.g. rgba(15, 163, 163, 0.25)
  badgeBg: string;         // e.g. rgba(15, 163, 163, 0.12)
  badgeText: string;       // e.g. #0D8282 (Light) / #38D8D8 (Dark)
  tintBg: string;          // Subtle 4% tint for active row states
}
```

WCAG AA contrast (≥ 4.5:1 against canvas) is verified for every skin.

