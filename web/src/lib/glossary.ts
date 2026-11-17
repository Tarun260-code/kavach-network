export interface GlossaryEntry {
  term: string;
  aliases: string[];
  definition: string;
  plainSummary: string;
  category: "Cryptography" | "Consortium Governance" | "Risk Velocity";
  learnMoreHref: string;
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  commitment: {
    term: "Commitment",
    aliases: ["Commitment leaf", "Leaf", "Fraud commitment", "Poseidon leaf"],
    definition: "A one-way fingerprint of an identity. It cannot be reversed into the original ID.",
    plainSummary: "Computed locally using Poseidon-T3 over a 254-bit scalar field with consortium salt. The raw PAN or Aadhaar is discarded immediately after hashing.",
    category: "Cryptography",
    learnMoreHref: "/trust#how-it-works",
  },
  leaf: {
    term: "Merkle Leaf",
    aliases: ["Leaf", "Commitment leaf"],
    definition: "A one-way fingerprint of an identity stored in the registry. It cannot be reversed into the original ID.",
    plainSummary: "A 32-byte cryptographic element inserted into the depth-20 incremental tree.",
    category: "Cryptography",
    learnMoreHref: "/trust#how-it-works",
  },
  nullifier: {
    term: "Nullifier",
    aliases: ["Nullifier hash", "Anonymous nullifier"],
    definition: "A match fingerprint that lets the network count repeat attempts without seeing who.",
    plainSummary: "Derived deterministically from Poseidon(leaf, 1) during screening. Prevents double-counting while maintaining zero borrower identification.",
    category: "Cryptography",
    learnMoreHref: "/trust#threat-model",
  },
  merkle_root: {
    term: "Merkle Root",
    aliases: ["Tree root", "Active root", "Consortium root"],
    definition: "A single value that summarises the entire flagged list.",
    plainSummary: "A 32-byte hash capturing the state of up to 10,48,576 fraud commitments. Kept in a 30-root rolling cyclic buffer on-chain.",
    category: "Cryptography",
    learnMoreHref: "/trust#how-it-works",
  },
  zk_proof: {
    term: "Zero-Knowledge Proof",
    aliases: ["zk-SNARK", "Groth16 proof", "ZK proof", "Membership proof", "zero knowledge proof", "zk proof", "zk proofs"],
    definition: "A proof that something is true without revealing why.",
    plainSummary: "Generated locally in ~200ms using Groth16 over the BN254 curve. Mathematically proves that an applicant matches a flagged leaf without disclosing the leaf or ID.",
    category: "Cryptography",
    learnMoreHref: "/trust#how-it-works",
  },
  ring_velocity: {
    term: "Ring Velocity",
    aliases: ["Velocity", "Syndicate velocity", "Cross-bank hits", "ring velocity"],
    definition: "How many different banks saw the same flagged identity recently.",
    plainSummary: "Monitored over a rolling 48-hour window. Two or more distinct bank screenings on the same nullifier triggers an automated syndicate alert.",
    category: "Risk Velocity",
    learnMoreHref: "/network#velocity",
  },
  stake: {
    term: "Collateral Stake",
    aliases: ["Escrow stake", "Collateral deposit", "0.05 ETH stake", "stake", "deposit"],
    definition: "A 0.05 ETH security deposit locked by the flagging bank to deter false or careless reports.",
    plainSummary: "Held in FraudRegistry escrow. Automatically forfeited and slashed if the flag is overturned by supermajority AppealDAO consensus.",
    category: "Consortium Governance",
    learnMoreHref: "/trust#threat-model",
  },
  ttl: {
    term: "Validity TTL",
    aliases: ["TTL", "Epoch", "Expiration", "ttl", "validity ttl"],
    definition: "Time-to-live after which a flagged commitment expires automatically, aligned with data retention rules.",
    plainSummary: "Configurable between 30 and 365 days. Expired records are treated as non-existent by the smart contract to ensure right-to-erasure compliance.",
    category: "Consortium Governance",
    learnMoreHref: "/trust#retention",
  },
  appeal_quorum: {
    term: "Appeal Quorum",
    aliases: ["Quorum", "Supermajority", "2/3 consensus", "appeal quorum", "quorum"],
    definition: "The two-thirds supermajority vote required by member banks to overturn a flag and slash the flagger.",
    plainSummary: "Enforced autonomously by AppealDAO.sol. Prevents unilateral blacklisting by requiring peer review of defense documentation.",
    category: "Consortium Governance",
    learnMoreHref: "/trust#threat-model",
  },
  slashing: {
    term: "Collateral Slashing",
    aliases: ["Slashing", "Slash", "Forfeiture", "slashing", "stake slashing"],
    definition: "Forfeiture of the 0.05 ETH collateral when an appeal is upheld by quorum.",
    plainSummary: "The slashed collateral is transferred to the AppealDAO treasury to economically penalize careless or abusive blacklisting.",
    category: "Consortium Governance",
    learnMoreHref: "/trust#accountability",
  },
  consortium_salt: {
    term: "Consortium Salt",
    aliases: ["Salt", "Secret salt", "Domain salt", "consortium salt", "salt"],
    definition: "A shared off-chain secret known only to authorized banks that prevents brute-force dictionary attacks.",
    plainSummary: "Distributed via mutual TLS among licensed financial institutions. Pre-image rainbow table attacks are rendered computationally infeasible.",
    category: "Cryptography",
    learnMoreHref: "/trust#threat-model",
  },
};

export function lookupTerm(keyOrText: string): GlossaryEntry | undefined {
  const normalized = keyOrText.toLowerCase().replace(/[^a-z0-9]/g, "_");
  if (GLOSSARY[normalized]) return GLOSSARY[normalized];

  // Try alias search
  const textLower = keyOrText.toLowerCase();
  for (const entry of Object.values(GLOSSARY)) {
    if (entry.term.toLowerCase() === textLower) return entry;
    if (entry.aliases.some((a) => a.toLowerCase() === textLower)) return entry;
  }
  return undefined;
}
