# Kavach Network — Institutional UX Heuristic Audit & Task Efficiency Analysis

**Product:** Kavach Network (Consortium Zero-Knowledge Fraud Intelligence for Regulated Banks)  
**Standard:** Nielsen Norman Group 10 Usability Heuristics & Basel III / RBI Cyber Security Framework Workflow Standards  
**Scope:** Public Landing (`/`), Bank Workspace Home (`/bank/[id]`), Screening Engine (`/bank/[id]/screen` / `/onboard`), Commitment Portal (`/bank/[id]/flag`), Network Activity (`/network`), Governance Chamber (`/dao`), Presenter Pitch (`/demo`), and Privacy Inspector.

---

## 1. Executive Summary & Core Heuristic Scores

| Route | Primary Purpose | NN/g Heuristic Score (1–5) | Key UX Friction Identified |
|---|---|:---:|---|
| `/` | Consortium value proposition & trust onboarding | 4.6 / 5.0 | High clarity; needs direct path for evaluators to test privacy proof in 1 click. |
| `/bank/[id]` | Bank home & situational underwriter command center | 3.8 / 5.0 | Form was embedded directly on home competing with primary screening action. Needed priority attention strip. |
| `/bank/[id]/screen` | Zero-knowledge loan applicant screening engine | 4.2 / 5.0 | Binary "MATCH / NO MATCH" verdict required underwriter to manually synthesize risk policy. Needs Clear / Review / Decline recommendation. |
| `/bank/[id]/flag` | Client-side commitment generation & on-chain anchor | 4.1 / 5.0 | Data flow preview was separated from submission action; needs focused 1-task flow. |
| `/network` | Consortium distributed ledger, Merkle roots, velocity | 4.4 / 5.0 | Telemetry was split across disconnected sub-routes; Federated Intelligence was isolated instead of integrated as a tab. |
| `/dao` | AppealDAO dispute resolution & stake slashing | 4.3 / 5.0 | Evidence CID and voting quorum were clean, but lacked a 1-screen consolidated adjudication summary for instant member sign-off. |
| `/demo` | 3-minute guided investor / evaluator pitch | 4.8 / 5.0 | Clean guided sequence; needs global hotkey (Cmd+K) trigger to avoid polluting primary banking navigation. |

---

## 2. Nielsen's 10 Usability Heuristics Evaluation

### H1: Visibility of System Status
* **Current State:** The client-side Groth16 prover streams real execution steps (Normalizing -> Rebuilding Tree -> Computing Witness -> Generating Groth16 -> Submitting). On-chain transaction state displays hashing, pending, and confirmed indicators.
* **Friction:** In the home screen, cross-bank syndication hits and pending DAO votes were buried in disparate sub-pages rather than surfaced immediately upon authentication.
* **Severity:** **P0**
* **One-line Fix:** Introduce a top-level **"Needs your attention"** strip on `/bank/[id]` highlighting real-time hits on your flags, appeals awaiting your vote, and flags expiring in <7 days.

### H2: Match Between System and the Real World
* **Current State:** Terms like "Poseidon-T3 BN254 scalar field", "incremental depth-20 tree", and "nullifier hash" are native to cryptographers, but loan officers speak in credit terms ("High Velocity Risk", "Synthetic Identity", "Decline Recommended").
* **Friction:** The applicant screening result produced raw "MATCH / NO MATCH" with technical nullifier hashes instead of an institutional underwriting recommendation.
* **Severity:** **P0**
* **One-line Fix:** Replace binary match outputs with an institutional **Decision Card** (Clear / Review / Decline) accompanied by 2–3 plain-language justifications and a mandatory institutional guidance disclaimer.

### H3: User Control and Freedom
* **Current State:** Modal inspectors can be dismissed with `Esc` or overlay clicks. Bank switcher allows instant pivoting across authorized nodes.
* **Friction:** Power users and analysts navigating repetitive tasks (switching between screening an applicant and checking an appeal) had to use multi-click mouse navigation.
* **Severity:** **P1**
* **One-line Fix:** Implement a universal **Command Palette (`Cmd/Ctrl+K`)** allowing instant navigation, action triggering, and hash/ID lookup from any screen.

### H4: Consistency and Standards
* **Current State:** Tokens are defined in `globals.css` with semantic classes (`surface`, `subtle`, `ink`, `hairline`, `brand-sapphire`, `signal-verified`).
* **Friction:** Sidebar had redundant and competing labels ("Overview & Protocol", "Bank Fraud Terminal", "Credit Intake Scanner", "Network Ledger & Tree").
* **Severity:** **P0**
* **One-line Fix:** Standardize navigation into exactly **6 clean items**: Home, Screen applicant, Flag identity, Network activity, Appeals, and Trust & privacy.

### H5: Error Prevention
* **Current State:** Real-time client-side validation for Indian National Identifiers (PAN `[A-Z]{5}[0-9]{4}[A-Z]{1}` and Aadhaar 12-digit numeric) prevents malformed data from reaching the Poseidon hash function.
* **Friction:** Flagging a fraudster requires a non-refundable 0.05 ETH collateral deposit subject to AppealDAO slashing. The irreversible financial liability was not highlighted before submission.
* **Severity:** **P1**
* **One-line Fix:** Display an explicit collateral escrow confirmation badge with clear explanation of AppealDAO slashing risks before transaction signing.

### H6: Recognition Rather Than Recall
* **Current State:** Test profiles ("Syndicate Attack", "Mule Account", "Clean Applicant") prefill synthetic data for instant demonstration.
* **Friction:** When viewing an active appeal in `/dao`, the disputed identity was represented as a raw 32-byte hex string requiring the member to cross-reference the ledger to understand the context.
* **Severity:** **P1**
* **One-line Fix:** Display masked identifier context (`BKUP••••9Q`), reporting bank name, and fraud vector tags directly on the appeal card.

### H7: Flexibility and Efficiency of Use
* **Current State:** Desktop, tablet, and mobile views adapt gracefully.
* **Friction:** Onboarding officers screening batches of loan applicants had to click through multiple screens to reach the input field.
* **Severity:** **P1**
* **One-line Fix:** Support `Cmd+K -> Screen applicant` hotkey shortcut and autofocus the primary applicant ID input upon page load.

### H8: Aesthetic and Minimalist Design
* **Current State:** Light canvas (`#FBFCFF`) with soft sky/champagne mesh gradient, serif headers (`Instrument Serif`), and high whitespace discipline.
* **Friction:** The bank overview page previously crammed the overview stats, the entire flagging form, and the audit log onto a single cluttered viewport, creating cognitive overload and competing calls to action.
* **Severity:** **P0**
* **One-line Fix:** Separate the dedicated Flagging Portal into `/bank/[id]/flag`, reserving `/bank/[id]` strictly for institutional situational awareness and 2 primary launch cards.

### H9: Help Users Recognize, Diagnose, and Recover from Errors
* **Current State:** If an applicant is not found in the registry, the system displays an emerald verified card explaining the zero-knowledge non-membership guarantee.
* **Friction:** In case of an on-chain transaction reversion (e.g. duplicate leaf or insufficient gas), the error was logged in console with a generic error toast.
* **Severity:** **P2**
* **One-line Fix:** Map smart contract custom error signatures (`LeafAlreadyExists`, `QuorumNotReached`, `InsufficientStake`) to plain-English banking advisory messages.

### H10: Help and Documentation
* **Current State:** Privacy Inspector modal provides side-by-side comparison ("What Bank Sees / What Chain Sees / What Peer Banks See").
* **Friction:** The architectural explanation was hidden behind a floating button that first-time evaluators frequently missed.
* **Severity:** **P1**
* **One-line Fix:** Add a dedicated **"Trust & Privacy"** entry in the primary sidebar navigation leading directly to the interactive zero-knowledge DPDP Act architectural inspection.

---

## 3. Prioritized Findings Matrix (P0 / P1 / P2)

| ID | Priority | Screen | Issue Description | One-Line Fix |
|---|:---:|---|---|---|
| **F-01** | **P0** | Global Nav | Sidebar had duplicate and confusing naming ("Credit Intake Scanner", "Bank Fraud Terminal", "Overview & Protocol"). | Consolidate navigation to exactly 6 canonical items with role-focused labels. |
| **F-02** | **P0** | `/bank/[id]` | Home view suffered from dual competing primary actions (screen vs. flag form embedded on home). | Relocate form to `/bank/[id]/flag`; transform Home into a priority-ordered role-aware dashboard. |
| **F-03** | **P0** | `/bank/[id]` | Critical cross-bank syndicate hits and pending votes were not surfaced proactively. | Implement a top "Needs your attention" notification strip at the very top of the bank home. |
| **F-04** | **P0** | `/bank/[id]/screen` | Raw "MATCH / NO MATCH" output forced the user to calculate underwriting policy manually. | Upgrade to a 3-tier Decision Card (Clear / Review / Decline) with 2–3 plain-language justifications. |
| **F-05** | **P1** | Global | Power users lacked keyboard navigation across views and hash lookup. | Build a global `Cmd/Ctrl+K` Command Palette with action triggers and quick search. |
| **F-06** | **P1** | `/network` | Federated Intelligence was isolated in a standalone sub-route, fragmenting the network story. | Embed Federated Learning as a first-class tab directly within the Network Activity view. |
| **F-07** | **P1** | `/demo` | Presenter Pitch mode occupied valuable top-level sidebar real estate meant for banking operations. | Move Presenter Mode to a quick-action utility menu and Command Palette trigger. |
| **F-08** | **P2** | `/dao` | Evidence CID was bare text requiring manual verification. | Provide 1-click verification drawer with IPFS preview and fraudster timeline. |

---

## 4. "Clicks to Complete" Task Efficiency Analysis

Comparison of user effort and cognitive friction across the 4 core banking workflows before vs. after Phase 1 restructuring:

| Core Task | Target Persona | Before Clicks | After Clicks | Click Reduction | Time to Complete (Est.) | Primary Friction Eliminated |
|---|---|:---:|:---:|:---:|:---:|---|
| **Task 1: Flag Confirmed Fraudster** | Priya (Bank A Fraud Analyst) | 4 clicks | **2 clicks** | **-50%** | < 25 seconds | Removed scrolling past overview stats; dedicated 1-task portal with auto-focused ID field and live leaf preview. |
| **Task 2: Screen Loan Applicant** | Rohan (Bank B Onboarding Officer) | 3 clicks | **1 click** (from Home) or `Cmd+K` | **-66%** | < 15 seconds | Primary "Screen applicant" card on Home opens dedicated tool immediately; decision card gives instant institutional guidance. |
| **Task 3: Review & Vote on Appeal** | Meera (Consortium Governance Member) | 5 clicks | **2 clicks** | **-60%** | < 30 seconds | "Needs your attention" strip deep-links directly to open appeals; 1-click supermajority vote with integrated evidence summary. |
| **Task 4: Understand Privacy & DPDP Compliance** | Evaluator / Regulatory Judge | 4 clicks | **1 click** | **-75%** | < 20 seconds | "Trust & Privacy" added directly to primary navigation; 60-second self-evident 3-column data-boundary proof. |

---

## 5. Architectural Recommendations for Phase 1 Execution

1. **Navigation Structure:**
   - Standardize routes:
     - `/bank/[id]` -> **Home (Role-Aware Overview)**
     - `/bank/[id]/screen` -> **Screen applicant** (with automatic backward-compatible redirect from `/bank/[id]/onboard`)
     - `/bank/[id]/flag` -> **Flag identity** (clean dedicated commitment submission portal)
     - `/network` -> **Network activity** (with sub-tabs for "Ledger & Tree", "Ring Velocity", and "Federated Intelligence")
     - `/dao` -> **Appeals** (Adjudication Chamber)
     - `/privacy` -> **Trust & privacy** (DPDP Section 4 zero-knowledge verification)
2. **Command Palette (`Cmd/Ctrl+K`):** Accessible globally with keyboard shortcut, fast navigation items, and action execution.
3. **Institutional Decision Card:** Standardized component rendering `Decline Recommended` (rose), `Manual Review Recommended` (amber), or `Clear / Approve Recommended` (emerald), complete with bulleted risk factors and policy guidance notice.

