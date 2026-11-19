import { ethers, Interface } from "ethers";
import { FRAUD_REGISTRY_ABI, APPEAL_DAO_ABI } from "../abi";
import { deploymentConfig, RegistryDeployment } from "./deploymentConfig";
import seedsData from "../generated/seeds.json";
import { getBankById, BankConfig } from "./banks";

import {
  KavachMerkleTree,
  computeLeaf,
  computeNullifier,
  normaliseId,
  buildTreeFromEvents,
  generateMembershipProof,
  Groth16ProofSolidity,
} from "@kavach/prover";

export const HARDHAT_RPC = "http://127.0.0.1:8545";

const fraudInterface = new Interface(FRAUD_REGISTRY_ABI);
const daoInterface = new Interface(APPEAL_DAO_ABI);

export { FRAUD_REGISTRY_ABI, APPEAL_DAO_ABI, deploymentConfig };
export type { RegistryDeployment };

export const CATEGORY_MAP: Record<number, { name: string; description: string }> = {
  0: { name: "Synthetic ID", description: "Fabricated PAN/Aadhaar identity" },
  1: { name: "Mule Account", description: "Account funnelling illicit funds" },
  2: { name: "Loan Stacking", description: "Simultaneous multi-lender credit applications" },
  3: { name: "Document Forgery", description: "Forged or tampered KYC credentials" },
};

export const ERROR_MESSAGES: Record<string, string> = {
  AlreadyFlagged: "This identity commitment has already been registered in the fraud tree.",
  OnlyAuthorizedBank: "Action rejected: signer is not an authorized consortium member bank.",
  InvalidStake: "Transaction rejected: stake provided is below the mandatory 0.05 ETH minimum.",
  InvalidTTL: "Transaction rejected: flag TTL must be between 1 and 365 days.",
  UnknownRoot: "The Merkle root submitted is not recognized within the 30-root historical buffer.",
  InvalidGroth16Proof: "Zero-knowledge Groth16 proof verification failed on-chain.",
  FlagNotFound: "Flag commitment not found in active registry.",
  FlagAlreadyRevoked: "This commitment has already been revoked by AppealDAO.",
  FlagAlreadyPruned: "This flag was already pruned after expiration.",
  FlagNotExpired: "This flag epoch has not expired yet.",
  OnlyAppealDAO: "Restricted: action can only be invoked by AppealDAO.",
  OnlyConsortiumAdmin: "Restricted: action requires consortium administrator permissions.",
  AppealNotFound: "Dispute appeal record not found in DAO.",
  AppealNotActive: "This appeal is no longer active (already resolved or rejected).",
  AlreadyVoted: "This member bank has already cast a vote on this dispute appeal.",
  QuorumNotReached: "Supermajority quorum not reached: requires 2/3 of active member banks.",
  AppealAlreadyExecuted: "This appeal has already been executed.",
  VotingEnded: "The voting window for this dispute has concluded.",
  VotingStillActive: "Voting is still active for this dispute.",
  BankNotMember: "Bank is not an enrolled member of the AppealDAO.",
  BankAlreadyMember: "Bank is already enrolled as a member of AppealDAO.",
  FlagNotActiveInRegistry: "The commitment is not active in the FraudRegistry.",
};

export function decodeContractError(err: any): string {
  if (!err) return "Unknown error occurred";

  const errorData =
    err.data ||
    err.info?.error?.data ||
    err.error?.data ||
    (typeof err.data === "string" ? err.data : null);

  if (errorData && typeof errorData === "string") {
    try {
      const parsed = fraudInterface.parseError(errorData);
      if (parsed && ERROR_MESSAGES[parsed.name]) {
        return ERROR_MESSAGES[parsed.name];
      }
    } catch {}
    try {
      const parsed = daoInterface.parseError(errorData);
      if (parsed && ERROR_MESSAGES[parsed.name]) {
        return ERROR_MESSAGES[parsed.name];
      }
    } catch {}
  }

  const rawMessage = err.shortMessage || err.reason || err.message || String(err);
  for (const [key, msg] of Object.entries(ERROR_MESSAGES)) {
    if (rawMessage.includes(key)) {
      return msg;
    }
  }

  if (rawMessage.includes("user rejected action") || rawMessage.includes("rejected")) {
    return "Transaction was cancelled or rejected by user.";
  }

  return rawMessage;
}

let cachedProvider: ethers.JsonRpcProvider | null = null;

export function getProvider(): ethers.JsonRpcProvider {
  if (!cachedProvider) {
    cachedProvider = new ethers.JsonRpcProvider(HARDHAT_RPC, undefined, {
      pollingInterval: 1000,
    });
  }
  return cachedProvider;
}

export function getBankSigner(bankId: string): ethers.Signer {
  const bank = getBankById(bankId);
  if (!bank) {
    throw new Error(`Bank not found: ${bankId}`);
  }
  const provider = getProvider();
  if (bank.privateKey) {
    return new ethers.Wallet(bank.privateKey, provider);
  }
  // For local development node, derive signer on-demand from standard test mnemonic
  if (process.env.NEXT_PUBLIC_NETWORK !== "replay") {
    try {
      const mnemonic = "test test test test test test test test test test test junk";
      const hdWallet = ethers.HDNodeWallet.fromPhrase(
        mnemonic,
        undefined,
        `m/44'/60'/0'/0/${bank.accountIndex}`
      );
      return hdWallet.connect(provider);
    } catch {}
  }
  throw new Error(`Live transaction signing is disabled in replay mode. Run locally for live transactions.`);
}

export function getFraudRegistryContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(
    deploymentConfig.fraudRegistry,
    FRAUD_REGISTRY_ABI,
    signerOrProvider ?? getProvider()
  );
}

export function getAppealDAOContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(
    deploymentConfig.appealDAO,
    APPEAL_DAO_ABI,
    signerOrProvider ?? getProvider()
  );
}

/**
 * Rebuilds the off-chain incremental Merkle tree directly from on-chain event logs.
 */
export async function getSyncedMerkleTree(): Promise<KavachMerkleTree> {
  const provider = getProvider();
  const registry = getFraudRegistryContract(provider);

  try {
    const flagFilter = registry.filters.IdentityFlagged();
    const revokeFilter = registry.filters.LeafRevoked();

    const [flagEvents, revokeEvents] = await Promise.all([
      registry.queryFilter(flagFilter),
      registry.queryFilter(revokeFilter),
    ]);

    const revokedSet = new Set<bigint>();
    for (const rev of revokeEvents) {
      if ("args" in rev && rev.args) {
        revokedSet.add(BigInt(rev.args[0]));
      }
    }

    const eventList = flagEvents.map((e) => {
      const args = (e as any).args;
      return {
        leaf: BigInt(args[0]),
        index: Number(args[1]),
        revoked: revokedSet.has(BigInt(args[0])),
      };
    });

    return await buildTreeFromEvents(eventList, revokedSet, 20);
  } catch (err) {
    console.warn("Failed to query on-chain events, falling back to static seeds:", err);
    const tree = new KavachMerkleTree(20);
    await tree.init();
    for (const record of seedsData.seedRecords) {
      if (record.status !== "Revoked") {
        await tree.insert(BigInt(record.leaf));
      }
    }
    return tree;
  }
}

import { getDataProvider } from "./dataProvider";

export interface VerificationResult {
  isFlagged: boolean;
  leaf: string;
  nullifier: string;
  root: string;
  ringVelocity: number;
  distinctBankHits: number;
  flaggerBank?: string;
  categoryName?: string;
  expiresAt?: string;
  txHash?: string;
  proof?: Groth16ProofSolidity;
  verifiedLocally?: boolean;
  verificationLabel?: string;
}

/**
 * Executes full zero-knowledge screening for an applicant via DataProvider.
 */
export async function evaluateApplicant(
  rawId: string,
  bankId: string,
  onStepProgress?: (step: number, label: string) => void
): Promise<VerificationResult> {
  const provider = getDataProvider();
  return provider.screenApplicant(rawId, bankId, onStepProgress);
}

/**
 * Flags a fraudster identity commitment on-chain.
 */
export async function flagIdentityOnChain(
  bankId: string,
  rawId: string,
  category: number,
  ttlDays: number,
  stakeEther: string = "0.05"
) {
  const signer = getBankSigner(bankId);
  const registry = getFraudRegistryContract(signer);

  const normalizedId = normaliseId(rawId);
  const salt = BigInt(deploymentConfig.consortiumSalt);
  const leaf = await computeLeaf(normalizedId, salt);
  const stakeWei = ethers.parseEther(stakeEther);

  const tx = await registry.flagIdentity(leaf, category, BigInt(ttlDays), {
    value: stakeWei,
  });
  const receipt = await tx.wait();

  return {
    leaf: "0x" + leaf.toString(16),
    leafDecimal: leaf.toString(),
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed ? receipt.gasUsed.toString() : "0",
  };
}
