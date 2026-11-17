# Kavach Network — Institutional Voice & Content Guide

**Product:** Kavach Network (Zero-Knowledge Consortium Fraud Intelligence for Regulated Banks)  
**Standard:** Institutional, calm, precise, and transparent. Content is UI.

---

## 1. Core Principles of Voice

1. **Calm, Authoritative, and Institutional:**
   We speak like a central banking regulatory infrastructure or a Tier-1 clearinghouse (e.g. SWIFT, RBI RTGS, Depository Trust). We do not speak like a Silicon Valley consumer app, a Web3 crypto game, or an AI wrapper.

2. **Sentence Case Everywhere:**
   - Headings, navigation items, buttons, table headers, and status pills must use sentence case.
   - *Correct:* "Screen an applicant", "Flagged identity found", "Needs your attention".
   - *Incorrect:* "Screen An Applicant", "Flagged Identity Found", "Needs Your Attention".
   - *Exception:* Proper nouns, statutory titles (DPDP Act, Section 4), and bank names (State Bank of India).

3. **Short Sentences & Active Voice:**
   Underwriters work under tight credit SLA deadlines. Minimize cognitive load.
   - *Correct:* "HDFC Bank flagged this identifier 11 days ago. Decline recommended."
   - *Incorrect:* "This identifier has been flagged by HDFC Bank in an operation that was executed 11 days prior."

4. **Glossary-Backed Precision (No Unexplained Jargon):**
   Technical and cryptographic terms (Poseidon commitment, Merkle root, nullifier, ring velocity, Groth16 proof) must never appear naked without an interactive `<Term>` component providing an immediate one-sentence plain English explanation.

5. **Tabular Numerics & Indian Digit Grouping:**
   - Use monospace tabular figures (`font-mono` / `tabular-nums`) for currency amounts, block numbers, counts, and elapsed times.
   - Format exposure amounts using Indian comma grouping: `₹15,00,000`, `₹1,25,00,000`.
   - Format capacities clearly: `10,48,576 leaves`.

---

## 2. Banned Words & Approved Replacements

To eliminate promotional hype, AI-generated clichés, and speculative crypto slang, the following words are strictly banned across the codebase:

| Banned Word / Phrase | Institutional Replacement | Reason |
|---|---|---|
| *revolutionary* | "consortium-verified", "cryptographic" | Hyperbolic and unprovable |
| *seamless* | "direct", "integrated", "local" | Overused cliché; obscures architectural complexity |
| *cutting-edge* | "zero-knowledge", "Groth16", "BN254" | Vague marketing jargon; state the actual standard |
| *unlock* | "enable", "verify", "access" | Gaming/consumer metaphor inappropriate for banking |
| *supercharge* | "accelerate", "scale", "streamline" | Juvenile marketing tone |
| *frictionless* | "efficient", "client-side", "automated" | In banking, appropriate friction (collateral, quorum) is intentional |
| *trustless* | "cryptographically verifiable" | Confusing to risk committees; banks rely on institutional trust + math |
| *airtight* | "mathematically proven", "zero-leakage" | Informal idiom |
| *game-changing* | "privacy-preserving", "statutory compliant" | Empty puffery |

---

## 3. Microcopy Standards by Element

### Buttons (Must Be Active Verbs)
- Primary actions describe the exact business consequence:
  - *Do:* "Screen applicant", "Flag identity", "Approve application", "Decline application", "Cast vote", "Execute revocation".
  - *Don't:* "Run", "Submit", "Proceed", "Click here", "Go".

### Error Messages (Three-Part Formula)
Every error message presented to a banking officer or underwriter must answer three questions:
1. **What happened?** (Plain-language occurrence)
2. **Why did it happen?** (Root cause without raw hex dumps)
3. **What to do next?** (Actionable resolution step)

*Example:*
> *"Commitment already registered. A commitment leaf matching this identifier was previously anchored by State Bank of India on block #104. Verify the active status in the consortium ledger before re-submitting."*

### Empty States (Educational First Step)
Never present a blank space with "No data". Teach the user what happens next:
- *Do:* "No fraud commitments registered yet. When your underwriting team flags an identity, the 32-byte Poseidon leaf and audit timestamp will appear here."
- *Don't:* "Nothing here!"

---

## 4. Standard Honesty Badges & Footprint

All simulated, test, or synthetic components must carry standardized honesty pills:

| Badge Text | Visual Token | Meaning |
|---|---|---|
| **Demo data** | `bg-subtle text-muted` | Pre-seeded synthetic test profiles for demonstration; not real citizen records. |
| **Simulation** | `bg-semantic-pending/10 text-semantic-pending` | Local browser-only algorithmic models (e.g. FedAvg); not live production AI. |
| **Local screening** | `bg-semantic-verified/10 text-semantic-verified` | Executed strictly in workstation RAM; zero network telemetry broadcast. |
| **On-chain** | `bg-brand-sapphire/10 text-brand-sapphire` | Confirmed transaction state anchored in Ethereum/Hardhat smart contracts. |

