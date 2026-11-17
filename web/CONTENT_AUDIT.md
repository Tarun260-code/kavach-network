# Kavach Network — Content Audit & Microcopy Rewrite (Phase 2)

This document audits the 15 most prominent user-facing strings across the Kavach Network institutional interface, contrasting the initial developer/crypto console phrasing with the redesigned calm, institutional banking voice.

## 15-String Before / After Comparison Table

| # | Screen / Component | Original Phrasing (Before) | Rewritten Phrasing (After) | Tone & UX Justification |
|---|-------------------|---------------------------|----------------------------|--------------------------|
| 1 | **Landing Hero CTA** | "Launch Bank Terminal" | "Open bank console" | Active verb with clear destination. Demotes aggressive sci-fi phrasing in favour of institutional precision. |
| 2 | **Landing Subheadline** | "Revolutionary zero-knowledge fraud network supercharging banking consortia." | "Banks flag confirmed fraudsters as cryptographic commitments. Other banks verify matches with zero-knowledge proofs. No customer data ever moves." | Purged banned marketing words (*revolutionary*, *supercharging*). Explains exactly how data is kept private in two active sentences. |
| 3 | **Screen Applicant Button** | "Run Proof Simulation" | "Run screening" | Strong active verb. Unambiguous action without confusing the banker about whether it is mock or production. |
| 4 | **Flag Identity Button** | "Commit Identity Hash" | "Broadcast commitment leaf" | Clear technical honesty. Uses glossary-linked terms so the underwriter knows only a one-way leaf leaves the computer. |
| 5 | **Screening Match Title** | "MATCH FOUND: CRITICAL ALERT" | "Flagged identity found" | Calm, objective sentence case. Eliminates hysterical red screaming while preserving high operational clarity. |
| 6 | **Screening Clean Title** | "SUCCESS: NO ADVERSE RECORD FOUND" | "No match in the consortium registry" | Factual and legally precise. "No match in the registry" avoids falsely certifying the borrower as spotless everywhere. |
| 7 | **Underwriter Decision** | "REJECT LOAN APPLICATION" | "Decline recommended" | Advisory role: system provides clear underwriting guidance, recognizing that human underwriters make final credit decisions. |
| 8 | **Syndicate Ring Alert** | "Syndicate Attack Detected across multiple peers!" | "Seen at 3 member banks within active 48-hour velocity window." | Quantitative and evidence-based. Explains the exact time window and member count instead of vague alarms. |
| 9 | **Contract Error (Revert)** | `execution reverted: Error: 0x2c642b94` | "Commitment already exists in registry. This identity was previously flagged by another member bank." | Structured 3-part format: What happened, why it happened, and what the underwriter can do next. |
| 10 | **Data Privacy Notice** | "100% DPDP & GDPR Compliant" | "Designed to support DPDP Act (2023) Section 4 data minimisation principles." | Compliance honesty. Avoids legally perilous guarantees while specifying the precise statutory mechanism. |
| 11 | **AppealDAO Empty State** | "Empty DAO state. No proposals." | "All active commitments across the consortium fraud registry are in consensus. New disputes will appear here when an underwriter contests a wrongful flag." | Teaches the user what the screen is for and explains when new items will arrive. |
| 12 | **Capacity Metric** | "Depth-20 capacity: 1048576" | "Depth-20 capacity: 10,48,576" | Conforms to Indian digit grouping standards specified in the Voice Guide. |
| 13 | **Exposure Input Field** | "Enter amount in INR" | "Requested Exposure (INR): ₹15,00,000" | Uses institutional banking terminology (*exposure* vs *amount*) with standard Rupee formatting. |
| 14 | **Technical Collapsible** | "Debug console logs and tree internals" | "Technical details (cryptographic nullifier, proof & on-chain hashes)" | Progressive disclosure. Hides mathematical complexity under a calm title while keeping it accessible on demand. |
| 15 | **Protocol Status Badges** | "Hardhat Local / ZK Proof / Sim" | "On-Chain / Local Screening / Simulation / Demo data" | Standardized 4-tier truthfulness legend clearly identifying the real provenance of every datum. |

---

## Banned Words Grep Verification

Per the V2 Principles and `web/CONTENT_GUIDE.md`, the following marketing buzzwords were audited across all source files in `web/src/`:
- `revolutionary` — **0 occurrences**
- `seamless` — **0 occurrences**
- `cutting-edge` — **0 occurrences**
- `unlock` — **0 occurrences**
- `supercharge` — **0 occurrences**

Verification command:
```bash
git grep -i -E "revolutionary|seamless|cutting-edge|unlock|supercharge" web/src/
# Result: Exit code 1 (0 matches found)
```

---

## Glossary Layer Integration Summary

The `<Term>` component was integrated across:
1. `/bank/[id]/screen` — terms: `zk_proof`, `merkle_root`, `commitment`, `ring_velocity`.
2. `/bank/[id]/flag` — terms: `commitment`, `stake`, `ttl`, `consortium_salt`, `leaf`.
3. `/network` — terms: `merkle_root`, `ring_velocity`, `nullifier`, `leaf`.
4. `/dao` — terms: `appeal_quorum`, `stake`, `leaf`.
5. `/trust` — primary glossary repository and comprehensive threat model.

