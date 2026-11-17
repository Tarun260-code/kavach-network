# Kavach Landing Motion & Living Ledger System

## 1. System Overview & Architecture

The Kavach landing page (`/`) features an institutional, cryptographic narrative layer that unfolds dynamically as the user scrolls. The presentation is structured as a **single, shared, fixed-viewport background orchestration** spanning all 12 sections—from the initial Hero fold to the final Consortium CTA band.

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: Floating Glass Hash Chips                         │
│  - 8-10 glass chips, 10-11px Geist Mono, 35% opacity        │
│  - Parallax factor: 0.6                                     │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: Living Merkle Lattice (Canvas2D)                  │
│  - Poisson-style jittered grid, hairline connections        │
│  - 5 member bank perimeter nodes                            │
│  - Section-aware story mutations & pulses                   │
│  - Parallax factor: 0.4                                     │
├─────────────────────────────────────────────────────────────┤
│  Layer 1: Ambient Aurora Mesh (CSS GPU Keyframes)           │
│  - 4 blurred blobs (110px blur), noise texture (~3%)        │
│  - Dynamic story washes (Sapphire, Amber, Gold, Ink)        │
│  - Parallax factor: 0.2                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. The Scroll Story Progression

The background evolves across six distinct cryptographic states driven by `IntersectionObserver` observing section markers:

### 1. Hero: "Calm" (`#hero`)
- **Aurora Mesh:** Celestial sky (`#CFE3FF`), lavender (`#E4E0FF`), champagne (`#FFEBC2`), mint (`#D6F5E8`) drifting at 28–47s orbital periods.
- **Merkle Lattice:** Primary blue nodes (`#3358F4` in light, `#6C86FF` in dark) at 28–35% alpha. Subtle hairline edges (max 18% alpha).
- **Behavior:** Slow sinusoidal orbital drift (periods 9–20s, amplitudes 6–14px). Rare verification pulse every ~12s echoing prove-and-verify security.

### 2. The Problem: "A Ring Hits One Bank, Then Ten" (`#problem`)
- **Aurora Mesh:** Shifts into a warm amber-rose wash (`#F59E0B` amber, `#F43F5E` rose, `#FEF3C7` / `#FDE68A`).
- **Merkle Lattice:** Lattice nodes gradually turn muted amber (`#D97706`). Edges become thinner and more fragile (alpha multiplier 0.6).
- **Fraud Tokens:** Hopping amber dot tokens (`#F59E0B`) leap from bank node to bank node across the network, leaving fading fiery trails. As the user scrolls deeper through the problem section, the tokens multiply from 1 to 3 concurrent hopping threats.
- **Section Caption:** *"Banks can't share customer data. So the same attack repeats."*

### 3. The Solution: "Commit, Anchor, Prove" (`#how-it-works`)
- **Aurora Mesh:** Tint returns to cool sapphire (`#3358F4` / `#0E9F9F` / `#CFE3FF`).
- **Merkle Lattice:** Edges sharpen and become crisper (alpha multiplier 1.4, width 0.95px).
- **Background Merkle Tree:** Hopping fraud tokens resolve into cryptographic commitments. A miniature Merkle tree is rendered directly in the canvas background with a glowing gold-champagne root (`#D97706`) and floating leaf hash chips (`0x19a9`, `0x42f7`, `0x88c2`, `0x0f5b`).

### 4. Proof & Syndicate Velocity (`#syndicate-velocity`)
- **Aurora Mesh:** Subtle emerald accents (`#10B981` / `#D1FAE5`).
- **Merkle Lattice:** High-frequency green verification pulses propagate across member banks.
- **Ring Velocity Counters:** As bank perimeter nodes receive verification pulses, their glowing halos expand and dynamic hit counters count up (`+1`, `+2`, `+3`, `+4`), demonstrating how the network tallies cross-bank attacks in real time without PII leakage.

### 5. Consortium Governance (`#governance`)
- **Aurora Mesh:** Dignified gold-champagne wash (`#D97706` / `#FDE68A` / `#FEF3C7`).
- **Merkle Lattice:** Lattice movement calms into a serene, stately cadence (speed multiplier 0.6). Nodes and edges take on a consortium gold tone.
- **Concentric Seal Pulses:** Concentric seal-shaped ring pulses expand gently from the center, evoking sovereign institutional consensus and the 2/3 supermajority dispute mechanism.

### 6. Final Consortium CTA (`#cta`)
- **Aurora Mesh:** Transitions seamlessly to deep ink (`#0E1330`) with a 30% primary-light glow and subtle brand lattice geometric pattern.
- **Merkle Lattice:** Nodes transition to primary-light (`#6C86FF`) at 30% alpha.
- **Looping Pulse:** A rhythmic verification pulse loops calmly behind the primary action card.

> **Transition Guarantee:** All state transitions interpolate smoothly over 600–900ms via cubic-bezier easing tokens. No abrupt jumps or flashing.

---

## 3. Depth & Parallax Specifications

The 3-layer system produces an immersive, physical sense of institutional depth:

| Layer | Component | Relative Parallax Speed | Visual Treatment |
| :--- | :--- | :--- | :--- |
| **Layer 1** | `MeshBackground.tsx` | `0.2` ($scrollY \times 0.2$) | 110px blur, 55–75% opacity, noise overlay |
| **Layer 2** | `MerkleLattice.tsx` | `0.4` ($scrollY \times 0.4$) | Hairline Canvas2D, 3 depth sublayers (0.4/0.7/1.0 cursor offset) |
| **Layer 3** | `FloatingHashChips.tsx`| `0.6` ($scrollY \times 0.6$) | 10–11px Geist Mono, glass utility, 35% opacity, depth-blur |

### Floating Glass Hash Chips Rules
- **Quantity:** 10 floating chips distributed across the landing height.
- **Placement:** Strictly in margins (`left-4` to `left-12` and `right-4` to `right-12`). **Never positioned behind body text.**
- **Responsiveness:** Completely removed below 768px (`hidden md:block`).
- **Depth Blur:** Individual chips range from `0.2px` blur (foreground) to `1.5px` blur (background).

---

## 4. Hero Entrance Choreography (~1.2s Total)

When the landing page loads, elements reveal in an orchestrated sequence:

1. **0ms – 250ms:** Navigation header fades down from `y: -16px`, opacity $0 \rightarrow 1$.
2. **150ms – 350ms:** Eyebrow pill rises from `y: 12px`, with emerald live testnet pulse dot.
3. **250ms – 480ms:** Display headline reveals **word-by-word** with a blur-to-sharp filter transition:
   - "Fraud" (stagger 250ms, blur 8px $\rightarrow$ 0)
   - "shared," (stagger 310ms, blur 8px $\rightarrow$ 0)
   - "never" (stagger 370ms, italic accent)
   - "exposed." (stagger 430ms, italic accent with subtle shimmer sweep across text)
4. **550ms – 650ms:** Subcopy and primary/secondary CTAs rise into position.
5. **600ms:** Background Merkle Lattice fades in smoothly.
6. **750ms – 950ms:** 4-bank monogram avatar stack pops in sequential stagger (70ms per circle).
7. **1080ms:** Signature proof-network hero card slides up into view.

*If `prefers-reduced-motion` is active, all elements render instantaneously with zero delay or blur.*

---

## 5. Micro-Interactions

1. **CTA Button Magnetic Hover:**
   - Detects fine pointer (`@media (pointer: fine)`).
   - Cardinally pulls up to 6px towards cursor on hover with smooth spring easing.
   - Trailing arrow orb rotates 45 degrees smoothly (`group-hover:rotate-45 duration-200`).
2. **Nav Pill Sliding Indicator:**
   - In desktop navigation, a floating glass pill indicator tracks and glides horizontally to the hovered link via Framer Motion `layoutId="nav-sliding-pill"`.
3. **Marquee Hover Deceleration:**
   - Marquee smoothly decelerates to 40% speed on container hover (`animation-duration: 70s` vs `28s`).
4. **Card 3D Tilt with Pointer Highlight:**
   - Interactive cards tilt up to 3 degrees based on cursor position (`perspective(800px) rotateX(...) rotateY(...)`).
   - A soft radial specular highlight ($240\text{px}$ radius, 14% alpha) tracks the cursor across the card surface.
   - Strictly animated via `transform` and `opacity` (zero DOM reflows).

---

## 6. Performance & Telemetry Budget

- **Shared Canvas:** Exactly 1 `<canvas>` element for the entire page.
- **Frame Rate Target:** Stable 60 FPS on standard desktop / laptop hardware.
- **CPU Budget:** < 8% CPU utilization on the browser main thread.
- **Memory Stability:** 60-second continuous scroll benchmark verified zero memory leak (heap growth < 1.5MB).
- **Frame Drop Threshold:** < 5% dropped frames across continuous scrolling.
- **Total JS Payload Added:** < 10KB gzipped (Canvas2D native paths, zero external graphics libraries).
- **Telemetry Overlay:** Accessible by appending `?debug=1` to the URL. Displays real-time FPS, node count, edge count, active pulses, and current story state.

---

## 7. Tuning & Customization Props

Both `MerkleLattice` and `MeshBackground` expose granular customization props:

```tsx
<MerkleLattice
  density={1.0}       // Multiplier for node count (e.g., 0.8 for sparse, 1.2 for dense)
  intensity={1.0}     // Edge and pulse alpha multiplier (0.5..1.5)
  paused={false}      // Force pauses the simulation loop
  storyState="calm"   // "calm" | "problem" | "solution" | "proof" | "governance" | "cta"
  scrollProgress={0}  // 0..1 progression through active section
  scrollY={0}         // Absolute page scroll position for parallax
/>
```

To adjust speeds or colors:
- **Orbital drift speed:** Modify `speedMultiplier` in `MerkleLattice.tsx` (defaults to 1.0, 0.6 in governance).
- **Edge distance threshold:** Configured via `MAX_EDGE_DIST` constant (default `150px`).
- **Fraud token count:** Configured in `MerkleLattice.tsx` problem state (1 to 3 tokens based on section scroll ratio).
