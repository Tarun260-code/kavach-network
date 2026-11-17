/**
 * Centralized Institutional Microcopy Layer for Kavach Network
 * Rules:
 * 1. Buttons are active verbs ("Screen applicant", "Broadcast commitment leaf").
 * 2. Errors state: What happened, why, and what to do next.
 * 3. No raw revert strings; custom Solidity errors map to human sentences.
 * 4. Empty states explain the next action.
 * 5. Tabular numbers and Indian digit grouping where appropriate.
 */

export const COPY = {
  // Global & Navigation
  brand: {
    name: "Kavach",
    tagline: "Network",
    descriptor: "Consortium Zero-Knowledge Fraud Intelligence",
    testnetPill: "Consortium Testnet",
    syncedStatus: "Consortium Status: Synced",
  },

  nav: {
    home: "Home",
    screen: "Screen applicant",
    flag: "Flag identity",
    network: "Network activity",
    appeals: "Appeals",
    privacy: "Trust & privacy",
    trustCenter: "Trust Center",
    demoPitch: "Presenter mode",
    searchChip: "Actions",
  },

  // Actions & Buttons (Always Verbs)
  actions: {
    screenApplicant: "Screen applicant",
    launchScreening: "Launch screening engine",
    runScreening: "Run screening",
    flagIdentity: "Flag identity",
    broadcastCommitment: "Broadcast commitment leaf",
    approveApplication: "Approve application",
    declineApplication: "Decline application",
    escalateSIU: "Escalate to SIU",
    sendSecondaryReview: "Send for secondary review",
    castVoteUphold: "Vote uphold & revoke leaf",
    castVoteAgainst: "Vote against revocation",
    executeAppeal: "Execute revocation & slash flagger stake",
    resetSimulation: "Reset simulation baseline",
    runFedAvgRound: (roundNumber: number) => `Run FedAvg round #${roundNumber}`,
    inspectRing: "Inspect syndicate ring",
    viewHit: "View hit",
    openConsole: "Open bank console",
    exploreLedger: "Inspect consortium ledger",
  },

  // Role-Aware Bank Home
  home: {
    attentionHeading: "Needs your attention",
    attentionSubheading: "Items requiring active underwriter review",
    syndicateHitTitle: "Cross-Bank Syndicate Hit",
    syndicateHitBody: (bankName: string) =>
      `An identity flagged by your node was presented at ${bankName}. Concurrent velocity alert triggered.`,
    appealAwaitingTitle: "Appeal Awaiting Vote",
    appealAwaitingBody: (appealId: number, dispId: string) =>
      `Appeal #${appealId} (${dispId}) is active in AppealDAO chamber. 1 vote needed for quorum.`,
    expiringFlagsTitle: "Commitments Expiring",
    expiringFlagsBody: "1 active commitment is nearing 30-day TTL expiration. Review case notes for renewal.",
    screenCardTitle: "Screen an Applicant",
    screenCardBody:
      "Verify loan applicant credentials against depth-20 consortium Merkle tree in browser memory. Computes Groth16 zk-SNARK proof with zero cleartext disclosure.",
    flagCardTitle: "Flag Fraudulent Identity",
    flagCardBody:
      "Anchor confirmed fraudster credentials into the consortium tree. Hashes ID in local RAM and broadcasts only the 32-byte Poseidon leaf with escrow collateral.",
    recentActivityHeading: "Recent activity",
    recentActivitySubheading: (bankName: string) =>
      `Consortium audit trail of commitments and verification events for ${bankName}.`,
    emptyActivity: "No fraud commitments recorded yet. When your underwriting team flags an identity, the 32-byte leaf will appear here.",
  },

  // Screening Engine
  screening: {
    heading: "Screen an Applicant",
    subheading:
      "Evaluates national identity credentials against depth-20 consortium Merkle tree in browser memory. Proves membership or non-membership without revealing applicant PII to external nodes.",
    inputLabel: "National Identifier (PAN / Aadhaar)",
    inputPlaceholder: "e.g. BKUPG8492Q (PAN) or 12-digit Aadhaar",
    inputHelper: "Processed strictly inside local browser memory. Zero customer PII is transmitted over the network.",
    runningProof: "Synthesizing ZK proof in RAM...",
    loadPresetPrompt: "Load synthetic scenario (Demo data):",
    steps: {
      normalize: "Format & normalize national identifier",
      normalizeDetail: "Converted to 254-bit scalar field element mod r with domain salt.",
      syncTree: "Synchronize consortium fraud tree",
      syncTreeDetail: "Rebuilding tree state from on-chain FraudRegistry event logs.",
      checkLocal: "Check local commitment in memory",
      checkLocalDetail: "Binary search across active Merkle leaves. Zero PII transmitted over network.",
      synthesizeProof: "Synthesize zero-knowledge proof (Groth16)",
      synthesizeProofDetail: "Generating witness and proving depth-20 membership over BN254 curve.",
      confirmOutcome: "Confirm consortium registry outcome",
      confirmOutcomeDetail: "Finalizing on-chain record or local non-membership verification.",
    },
    decision: {
      declineRecommended: "Decline Recommended",
      reviewRecommended: "Manual Review Recommended",
      clearRecommended: "Clear / Approve Recommended",
      policyNotice:
        "Institutional Policy Notice: This recommendation is generated via zero-knowledge cryptographic checks across the consortium fraud ledger. Final loan underwriting approval, exception overrides, and adverse action filings remain under the sole discretion and authority of the authorized bank officer.",
    },
  },

  // Flag Identity Portal
  flag: {
    heading: "Flag Confirmed Fraudulent Identity",
    subheading:
      "Evaluates raw national identifier in local browser RAM, generates Poseidon commitment leaf, and broadcasts only the leaf to the consortium fraud registry. Raw PII never touches the network.",
    collateralNotice: "0.05 ETH Escrow Collateral Required",
    escrowExplanation: "Deposited to FraudRegistry; slashed upon wrongful appeal",
    whatGoesOnChainTitle: "What goes on-chain",
    stepRAM: "Browser RAM",
    stepPoseidon: "Poseidon BN254",
    stepOnChain: "On-chain Leaf",
    zeroPIIBadge: "Zero PII Broadcast",
  },

  // Appeals & Governance
  dao: {
    heading: "Appeals",
    subheading:
      "Independent consortium chamber to review contested flags. Overturning a flag requires a two-thirds quorum. When upheld, the flag is zeroed in the Merkle tree and the flagger's collateral stake is slashed.",
    activeAppeals: "Open Appeals",
    resolvedAppeals: "Resolved Appeals",
    quorumRequirement: "2/3 supermajority quorum required",
    countdownText: "Voting closes in 2d 18h",
    emptyAppeals: "No contested appeals currently open for review.",
  },

  appeals: {
    title: "Appeals",
    explainer:
      "Consortium governance chamber for peer review, dispute adjudication, and collateral slashing.",
    tabs: {
      open: "Open",
      needsMyVote: "Needs my vote",
      resolved: "Resolved",
    },
    actions: {
      fileAppeal: "File an appeal",
      rejectAppeal: "Reject appeal",
      upholdAppeal: "Uphold appeal",
      executeRevocation: "Execute revocation",
      viewEvidence: "View evidence",
      viewDefence: "View defence",
    },
    consequences: {
      upholdVote:
        "You are voting to overturn this flag. If a two-thirds quorum is reached, the flag will be zeroed in the registry and the collateral of 0.05 ETH will be forfeited. This cannot be undone.",
      rejectVote:
        "You are voting to confirm this flag. The flag will remain active in the consortium registry.",
      executeRevocation:
        "The flag will be removed from the registry and the collateral of 0.05 ETH will be forfeited. This cannot be undone.",
    },
    recusedFlagger: "Your bank anchored this flag. You are recused from voting to prevent conflicts of interest.",
    alreadyVoted: "Your bank has already cast a vote on this appeal.",
    emptyOpen: "No contested appeals currently open for adjudication.",
    emptyNeedsVote: "You have voted on all active appeals. You're all caught up.",
    emptyResolved: "No appeals have reached final resolution yet.",
    emptyOpenSub: "When member banks contest a fraudulent identity flag with counter-evidence, appeals appear here for voting.",
    emptyNeedsVoteSub: "No pending votes require your underwriting desk's signature at this time.",
    emptyResolvedSub: "Historical records of overturned flags, slashing events, and confirmed determinations will be archived here.",
  },

  // Trust & Privacy Documentation
  trust: {
    title: "Trust & privacy",
    subtitle:
      "Plain-language guarantees, cryptographic proofs, and consortium governance rules.",
    tableTitle: "What the network can and cannot see",
    tableSubtitle:
      "A complete breakdown of visibility across originating banks, blockchain records, and peer institutions.",
    screeningTitle: "How a screening stays private",
    screeningSubtitle:
      "Your customer's national identifier never leaves your browser RAM. Here is the mathematical process step-by-step.",
    accountabilityTitle: "Accountability by design",
    accountabilitySubtitle:
      "Economic deterrence and peer review prevent false blacklists and unilateral abuse.",
    retentionTitle: "Data retention & privacy-by-design",
    retentionSubtitle:
      "Engineered to enforce right-to-erasure and temporal data boundaries at the protocol layer.",
    limitationsTitle: "Honest limitations",
    limitationsSubtitle:
      "Clear operational assumptions and trust boundaries of the Kavach Network.",
    faqTitle: "Frequently asked questions",
    faqSubtitle:
      "Direct, institutional answers to key questions asked by bank risk officers and technology leads.",
    glossaryTitle: "Consortium glossary",
    glossarySubtitle:
      "Plain-language reference for cryptographic and governance terminology.",
  },

  // Contract Errors & Human-Readable Explanations (What happened, why, what to do)
  errors: {
    AlreadyFlagged: {
      title: "Commitment Already Registered",
      message:
        "What happened: This identity commitment already exists in the fraud registry.\nWhy: Another member bank anchored this leaf previously.\nNext step: Verify the existing record in Network activity before proceeding.",
    },
    OnlyAuthorizedBank: {
      title: "Signer Not Authorized",
      message:
        "What happened: Transaction rejected by consensus.\nWhy: The active wallet address is not an authorized consortium underwriter.\nNext step: Switch to an authorized bank node HSM via the top bank switcher.",
    },
    InsufficientStake: {
      title: "Insufficient Escrow Collateral",
      message:
        "What happened: Collateral deposit requirement not met.\nWhy: FraudRegistry requires exactly 0.05 ETH collateral to prevent spam.\nNext step: Fund your underwriter node wallet with testnet ETH and retry.",
    },
    QuorumNotReached: {
      title: "Consortium Quorum Not Met",
      message:
        "What happened: Appeal cannot be executed yet.\nWhy: AppealDAO requires a 2/3 supermajority (4 of 5 member banks) before slashing.\nNext step: Await additional member bank votes before executing.",
    },
    AppealNotActive: {
      title: "Appeal Closed or Inactive",
      message:
        "What happened: Voting cannot proceed.\nWhy: This appeal has either already reached resolution or its deadline passed.\nNext step: Review the outcome in the Resolved Appeals archive.",
    },
    GenericRevert: {
      title: "Transaction Reverted on Block",
      message:
        "What happened: The consortium smart contract reverted execution.\nWhy: Smart contract preconditions were not satisfied.\nNext step: Check gas limits, parameters, and network connectivity.",
    },
  },

  // Honesty Badges
  honesty: {
    demoData: "Demo data",
    simulation: "Simulation",
    localScreening: "Local screening",
    onChain: "On-chain",
  },
};

/**
 * Maps contract errors to structured 3-part institutional error advisories.
 */
export function getHumanContractError(errorNameOrMessage: string): {
  title: string;
  message: string;
} {
  for (const [key, val] of Object.entries(COPY.errors)) {
    if (errorNameOrMessage.toLowerCase().includes(key.toLowerCase())) {
      return val;
    }
  }
  return COPY.errors.GenericRevert;
}

