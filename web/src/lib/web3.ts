import { ethers, Interface } from "ethers";
import deploymentsData from "../generated/deployments.json";
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

export const FRAUD_REGISTRY_ABI = (deploymentsData as any).contracts?.FraudRegistry?.abi || [];
export const APPEAL_DAO_ABI = (deploymentsData as any).contracts?.AppealDAO?.abi || [];

const fraudInterface = new Interface(FRAUD_REGISTRY_ABI);
const daoInterface = new Interface(APPEAL_DAO_ABI);

export interface RegistryDeployment {
  chainId: number;
  verifier: string;
  fraudRegistry: string;
  appealDAO: string;
  flagStake: string;
  consortiumSalt: string;
}

export const deploymentConfig: RegistryDeployment = {
  chainId: deploymentsData.chainId,
  verifier: (deploymentsData as any).contracts?.Groth16Verifier?.address || "",
  fraudRegistry: (deploymentsData as any).contracts?.FraudRegistry?.address || "",
  appealDAO: (deploymentsData as any).contracts?.AppealDAO?.address || "",
  flagStake: deploymentsData.flagStake || "50000000000000000",
  consortiumSalt: deploymentsData.consortiumSalt || "888777666555444333222111000999",
};

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

export function getBankSigner(bankId: string): ethers.Wallet {
  const bank = getBankById(bankId);
  if (!bank) {
    throw new Error(`Bank not found: ${bankId}`);
  }
  const provider = getProvider();
  return new ethers.Wallet(bank.privateKey, provider);
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
}

/**
 * Executes full client-side zero-knowledge screening for an applicant.
 */
export async function evaluateApplicant(
  rawId: string,
  bankId: string,
  onStepProgress?: (step: number, label: string) => void
): Promise<VerificationResult> {
  onStepProgress?.(1, "Normalizing identifier and computing Poseidon commitment");
  const normalizedId = normaliseId(rawId);
  const salt = BigInt(deploymentConfig.consortiumSalt);
  const leaf = await computeLeaf(normalizedId, salt);
  const nullifier = await computeNullifier(leaf);

  onStepProgress?.(2, "Rebuilding incremental Merkle tree from on-chain event logs");
  const tree = await getSyncedMerkleTree();
  const leafIndex = tree.indexOf(leaf);

  if (leafIndex === -1 || leaf === 0n) {
    // Clean applicant - not in fraud registry
    onStepProgress?.(3, "Applicant identity commitment not present in consortium Merkle tree");
    const currentRoot = await tree.getRoot();
    return {
      isFlagged: false,
      leaf: "0x" + leaf.toString(16),
      nullifier: "0x" + nullifier.toString(16),
      root: "0x" + currentRoot.toString(16),
      ringVelocity: 0,
      distinctBankHits: 0,
    };
  }

  // Active flag present in tree: generate witness and proof
  onStepProgress?.(3, "Identity match detected in tree; generating Merkle inclusion witness");
  const merkleProof = await tree.generateProof(leafIndex);

  onStepProgress?.(4, "Computing Groth16 zero-knowledge proof");
  const isBrowser = typeof window !== "undefined";

  let proof: Groth16ProofSolidity;

  if (isBrowser && typeof Worker !== "undefined") {
    try {
      const { ensureZkArtifacts, generateProofViaWorker } = await import("./zk-prover-client");
      const { wasmBuffer, zkeyBuffer } = await ensureZkArtifacts((progress) => {
        onStepProgress?.(4, progress.detail);
      });

      const circuitInput = {
        idNumber: normalizedId.toString(),
        salt: salt.toString(),
        pathElements: merkleProof.pathElements.map((e) => BigInt(e).toString()),
        pathIndices: merkleProof.pathIndices,
        root: merkleProof.root.toString(),
        nullifier: nullifier.toString(),
      };

      const workerRes = await generateProofViaWorker(
        circuitInput,
        wasmBuffer,
        zkeyBuffer,
        (_stage, _pct, detail) => onStepProgress?.(4, detail)
      );
      proof = workerRes.proof;
    } catch (workerErr) {
      console.warn("Web Worker proving fallback to direct prover:", workerErr);
      const proofResult = await generateMembershipProof(rawId, salt, tree, {
        wasmPath: "/zk/membership.wasm",
        zkeyPath: "/zk/membership_final.zkey",
      });
      if (!proofResult.proof) throw new Error("Failed to generate zero-knowledge proof");
      proof = proofResult.proof;
    }
  } else {
    const wasmPath = isBrowser ? "/zk/membership.wasm" : undefined;
    const zkeyPath = isBrowser ? "/zk/membership_final.zkey" : undefined;
    const proofResult = await generateMembershipProof(rawId, salt, tree, {
      wasmPath,
      zkeyPath,
    });
    if (!proofResult.proof) {
      throw new Error("Failed to generate zero-knowledge proof for applicant");
    }
    proof = proofResult.proof;
  }

  onStepProgress?.(5, "Submitting proof to FraudRegistry to record velocity hit");
  const signer = getBankSigner(bankId);
  const registry = getFraudRegistryContract(signer);

  let txHash = "";
  let ringVelocity = 1;

  try {
    const tx = await registry.verifyAndRecordHit(
      [BigInt(proof.a[0]), BigInt(proof.a[1])],
      [
        [BigInt(proof.b[0][0]), BigInt(proof.b[0][1])],
        [BigInt(proof.b[1][0]), BigInt(proof.b[1][1])],
      ],
      [BigInt(proof.c[0]), BigInt(proof.c[1])],
      [BigInt(proof.input[0]), BigInt(proof.input[1])]
    );
    const receipt = await tx.wait();
    txHash = receipt.hash;
    const hits = await registry.distinctBankHits(nullifier.toString());
    ringVelocity = Number(hits);
  } catch (err: any) {
    console.warn("verifyAndRecordHit warning/revert:", err);
    // If already queried or reverted, read current distinctBankHits
    try {
      const hits = await registry.distinctBankHits(nullifier.toString());
      ringVelocity = Math.max(Number(hits), 1);
    } catch {}
  }

  // Fetch on-chain flag metadata
  let flaggerBank = "Consortium Bank";
  let categoryName = "Loan Stacking";
  let expiresAt = "30 days";

  try {
    const flagData = await registry.flags(leaf.toString());
    if (flagData && flagData.bank !== ethers.ZeroAddress) {
      flaggerBank = flagData.bank;
      categoryName = CATEGORY_MAP[Number(flagData.category)]?.name || "Suspicious Activity";
      expiresAt = new Date(Number(flagData.expiresAt) * 1000).toLocaleDateString();
    }
  } catch {}

  onStepProgress?.(6, `Screening complete: Match confirmed across ${ringVelocity} member banks`);

  return {
    isFlagged: true,
    leaf: "0x" + leaf.toString(16),
    nullifier: "0x" + nullifier.toString(16),
    root: "0x" + merkleProof.root.toString(16),
    ringVelocity,
    distinctBankHits: ringVelocity,
    flaggerBank,
    categoryName,
    expiresAt,
    txHash,
    proof,
  };
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
