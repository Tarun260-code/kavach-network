import { ethers } from "ethers";
import {
  DataProvider,
  NetworkMode,
  TreeState,
  ScreeningResult,
  AppealRecord,
} from "./types";
import {
  RegistryEventItem,
  ActiveFlagItem,
  VelocityLeaderboardItem,
  CrossBankAlert,
} from "../../hooks/useRegistryEvents";
import { BankConfig, getDemoBanks, getBankByAddress } from "../banks";
import {
  getProvider,
  getFraudRegistryContract,
  getAppealDAOContract,
  getSyncedMerkleTree,
  getBankSigner,
  deploymentConfig,
  CATEGORY_MAP,
} from "../web3";
import {
  normaliseId,
  computeLeaf,
  computeNullifier,
  Groth16ProofSolidity,
  generateMembershipProof,
} from "@kavach/prover";
import { isAlertDismissed, dismissAlertPermanently } from "../alerts";
import seedsData from "../../generated/seeds.json";

export class LiveChainProvider implements DataProvider {
  readonly mode: NetworkMode = "local";

  async getTreeState(): Promise<TreeState> {
    const provider = getProvider();
    const registry = getFraudRegistryContract(provider);

    const [rootBig, numLeavesBig, ringRootsRaw] = await Promise.all([
      registry.getRoot().catch(() => 0n),
      registry.getNumberOfLeaves().catch(() => 0n),
      registry.getRingRoots().catch(() => []),
    ]);

    const ringRoots = (ringRootsRaw as any[])
      .map((r: any) => "0x" + BigInt(r).toString(16).padStart(64, "0"))
      .filter((r: string) => !/^0x0+$/.test(r));

    return {
      depth: 20,
      root: "0x" + BigInt(rootBig).toString(16).padStart(64, "0"),
      numberOfLeaves: Number(numLeavesBig),
      leaves: [],
      ringRoots,
    };
  }

  async getEvents(): Promise<RegistryEventItem[]> {
    const provider = getProvider();
    const registry = getFraudRegistryContract(provider);
    const dao = getAppealDAOContract(provider);

    const [
      flagEvents,
      hitEvents,
      revokeEvents,
      appealCreatedEvents,
      appealVotedEvents,
      appealExecutedEvents,
    ] = await Promise.all([
      registry.queryFilter(registry.filters.IdentityFlagged(), 0).catch(() => []),
      registry.queryFilter(registry.filters.RingHit(), 0).catch(() => []),
      registry.queryFilter(registry.filters.LeafRevoked(), 0).catch(() => []),
      dao.queryFilter(dao.filters.AppealCreated(), 0).catch(() => []),
      dao.queryFilter(dao.filters.AppealVoted(), 0).catch(() => []),
      dao.queryFilter(dao.filters.AppealExecuted(), 0).catch(() => []),
    ]);

    const combinedList: RegistryEventItem[] = [];

    for (const ev of flagEvents) {
      if (!("args" in ev) || !ev.args) continue;
      const leafHex = "0x" + BigInt(ev.args[0]).toString(16).padStart(64, "0");
      const bankAddr = ev.args[2];
      const category = Number(ev.args[3]);
      const bankInfo = getBankByAddress(bankAddr);

      combinedList.push({
        id: `flag-${ev.transactionHash}-${ev.index}`,
        type: "IdentityFlagged",
        bank: bankAddr,
        bankName: bankInfo?.name || "Consortium Bank",
        bankCode: bankInfo?.code || "BNK",
        leaf: leafHex,
        category,
        categoryName: CATEGORY_MAP[category]?.name || "Fraud Flag",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        timeAgo: "Recently",
        details: `Flagged identity commitment leaf in category: ${CATEGORY_MAP[category]?.name || "Fraud"}`,
        txHash: ev.transactionHash,
        blockNumber: ev.blockNumber,
      });
    }

    for (const ev of hitEvents) {
      if (!("args" in ev) || !ev.args) continue;
      const nullifierHex = "0x" + BigInt(ev.args[0]).toString(16).padStart(64, "0");
      const bankAddr = ev.args[1];
      const distinctBanks = Number(ev.args[2]);
      const bankInfo = getBankByAddress(bankAddr);

      combinedList.push({
        id: `hit-${ev.transactionHash}-${ev.index}`,
        type: "RingHit",
        bank: bankAddr,
        bankName: bankInfo?.name || "Consortium Bank",
        bankCode: bankInfo?.code || "BNK",
        nullifier: nullifierHex,
        velocity: distinctBanks,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        timeAgo: "Recently",
        details: `Ring Velocity accelerated to ${distinctBanks} banks via Groth16 verification`,
        txHash: ev.transactionHash,
        blockNumber: ev.blockNumber,
      });
    }

    for (const ev of revokeEvents) {
      if (!("args" in ev) || !ev.args) continue;
      const leafHex = "0x" + BigInt(ev.args[0]).toString(16).padStart(64, "0");
      const bankAddr = ev.args[1];
      const slashed = ethers.formatEther(ev.args[2]);
      const bankInfo = getBankByAddress(bankAddr);

      combinedList.push({
        id: `revoke-${ev.transactionHash}-${ev.index}`,
        type: "LeafRevoked",
        bank: bankAddr,
        bankName: bankInfo?.name || "Consortium Bank",
        bankCode: bankInfo?.code || "BNK",
        leaf: leafHex,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        timeAgo: "Recently",
        details: `Dispute upheld: leaf revoked and ${slashed} ETH stake slashed to DAO treasury`,
        txHash: ev.transactionHash,
        blockNumber: ev.blockNumber,
      });
    }

    for (const ev of appealCreatedEvents) {
      if (!("args" in ev) || !ev.args) continue;
      const appealId = Number(ev.args[0]);
      const leafHex = "0x" + BigInt(ev.args[1]).toString(16).padStart(64, "0");
      const initiator = ev.args[2];
      const bankInfo = getBankByAddress(initiator);

      combinedList.push({
        id: `appeal-${ev.transactionHash}-${appealId}`,
        type: "AppealCreated",
        bank: initiator,
        bankName: bankInfo?.name || "Consortium Bank",
        bankCode: bankInfo?.code || "BNK",
        leaf: leafHex,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        timeAgo: "Recently",
        details: `Dispute Appeal #${appealId} initiated with formal defense evidence CID`,
        txHash: ev.transactionHash,
        blockNumber: ev.blockNumber,
      });
    }

    for (const ev of appealVotedEvents) {
      if (!("args" in ev) || !ev.args) continue;
      const appealId = Number(ev.args[0]);
      const voter = ev.args[1];
      const support = Boolean(ev.args[2]);
      const votesFor = Number(ev.args[3]);
      const bankInfo = getBankByAddress(voter);

      combinedList.push({
        id: `vote-${ev.transactionHash}-${appealId}-${voter}`,
        type: "AppealVoted",
        bank: voter,
        bankName: bankInfo?.name || "Consortium Bank",
        bankCode: bankInfo?.code || "BNK",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        timeAgo: "Recently",
        details: `Voted ${support ? "FOR" : "AGAINST"} revocation on Appeal #${appealId} (${votesFor}/4 supermajority)`,
        txHash: ev.transactionHash,
        blockNumber: ev.blockNumber,
      });
    }

    for (const ev of appealExecutedEvents) {
      if (!("args" in ev) || !ev.args) continue;
      const appealId = Number(ev.args[0]);
      const leafHex = "0x" + BigInt(ev.args[1]).toString(16).padStart(64, "0");
      const slashed = ethers.formatEther(ev.args[2]);

      combinedList.push({
        id: `exec-${ev.transactionHash}-${appealId}`,
        type: "AppealExecuted",
        bank: "AppealDAO",
        bankName: "AppealDAO Chamber",
        bankCode: "DAO",
        leaf: leafHex,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        timeAgo: "Recently",
        details: `Supermajority execution complete: ${slashed} ETH slashed and leaf zeroed in Merkle tree`,
        txHash: ev.transactionHash,
        blockNumber: ev.blockNumber,
      });
    }

    combinedList.sort((a, b) => (b.blockNumber || 0) - (a.blockNumber || 0));
    return combinedList;
  }

  async getActiveFlags(): Promise<ActiveFlagItem[]> {
    const provider = getProvider();
    const registry = getFraudRegistryContract(provider);

    const [flagEvents, revokeEvents] = await Promise.all([
      registry.queryFilter(registry.filters.IdentityFlagged(), 0).catch(() => []),
      registry.queryFilter(registry.filters.LeafRevoked(), 0).catch(() => []),
    ]);

    const revokedLeavesSet = new Set<string>();
    for (const rev of revokeEvents) {
      if ("args" in rev && rev.args) {
        revokedLeavesSet.add("0x" + BigInt(rev.args[0]).toString(16).padStart(64, "0"));
      }
    }

    const flagsMap = new Map<string, ActiveFlagItem>();
    for (const ev of flagEvents) {
      if (!("args" in ev) || !ev.args) continue;
      const leafBig = BigInt(ev.args[0]);
      const leafHex = "0x" + leafBig.toString(16).padStart(64, "0");
      const idx = Number(ev.args[1]);
      const bankAddr = ev.args[2];
      const category = Number(ev.args[3]);
      const bankInfo = getBankByAddress(bankAddr);

      let nullifierHex = "";
      try {
        const nullifierBig = await computeNullifier(leafBig);
        nullifierHex = "0x" + nullifierBig.toString(16).padStart(64, "0");
      } catch {
        nullifierHex = leafHex;
      }

      flagsMap.set(leafHex, {
        leaf: leafHex,
        index: idx,
        bank: bankAddr,
        bankName: bankInfo?.name || "Consortium Bank",
        bankCode: bankInfo?.code || "BNK",
        category,
        categoryName: CATEGORY_MAP[category]?.name || "Suspicious Flag",
        flaggedAt: Math.floor(Date.now() / 1000) - (12 - idx) * 3600,
        expiresAt: Math.floor(Date.now() / 1000) + 30 * 86400,
        stakeEth: "0.05",
        revoked: revokedLeavesSet.has(leafHex),
        nullifier: nullifierHex,
        txHash: ev.transactionHash,
      });
    }

    return Array.from(flagsMap.values());
  }

  async getAppeals(): Promise<AppealRecord[]> {
    const provider = getProvider();
    const dao = getAppealDAOContract(provider);
    const countBig = await dao.appealCount().catch(() => 0n);
    const count = Number(countBig);

    const appealsList: AppealRecord[] = [];
    for (let i = 1; i <= count; i++) {
      try {
        const app = await dao.appeals(i);
        if (app && Number(app.createdAt) > 0) {
          const leafHex = "0x" + BigInt(app.leaf).toString(16).padStart(64, "0");
          const seedMatch = seedsData.seedRecords.find(
            (s: any) => BigInt(s.leaf).toString() === BigInt(app.leaf).toString()
          );
          const disputedId = seedMatch?.id || `Leaf •••• ${leafHex.slice(-6)}`;
          const statusNum = Number(app.status);

          appealsList.push({
            id: Number(app.id),
            leaf: leafHex,
            disputedId,
            initiator: "Punjab National Bank",
            flagger: "Axis Bank",
            categoryName: "Multi-Lender Loan Stacking",
            evidenceURI: app.evidenceURI || "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
            defenceURI: "sha256:0x7c9a89d14603a152345bcfa9e450892a0134f590123514a",
            createdAt: Number(app.createdAt) * 1000,
            deadline: Number(app.deadline) * 1000,
            votesFor: Number(app.votesFor),
            votesAgainst: Number(app.votesAgainst),
            requiredQuorum: 4,
            status: statusNum === 1 ? "ResolvedSlashed" : statusNum === 2 ? "Rejected" : "Active",
            votedBanks: ["sbi", "icici"],
          });
        }
      } catch {}
    }

    return appealsList;
  }

  async getLeaderboard(): Promise<VelocityLeaderboardItem[]> {
    const provider = getProvider();
    const registry = getFraudRegistryContract(provider);
    const hitEvents = await registry.queryFilter(registry.filters.RingHit(), 0).catch(() => []);

    const hitCountMap = new Map<string, { nullifier: string; count: number; lastBank: string }>();
    for (const ev of hitEvents) {
      if (!("args" in ev) || !ev.args) continue;
      const nHex = "0x" + BigInt(ev.args[0]).toString(16).padStart(64, "0");
      const bAddr = ev.args[1];
      const count = Number(ev.args[2]);
      const bankInfo = getBankByAddress(bAddr);
      hitCountMap.set(nHex, {
        nullifier: nHex,
        count,
        lastBank: bankInfo?.name || "Consortium Bank",
      });
    }

    const boardItems: VelocityLeaderboardItem[] = [];
    for (const [nullifier, data] of hitCountMap.entries()) {
      boardItems.push({
        nullifier,
        nullifierShort: `${nullifier.slice(0, 10)}...${nullifier.slice(-6)}`,
        distinctBanks: data.count,
        lastSeen: data.lastBank,
        categoryName: "Synthetic Identity Syndicate",
        flaggedBy: "State Bank of India",
      });
    }

    boardItems.sort((a, b) => b.distinctBanks - a.distinctBanks);
    return boardItems;
  }

  getMemberBanks(): BankConfig[] {
    return getDemoBanks();
  }

  canSubmitTransactions(): boolean {
    return true;
  }

  async screenApplicant(
    rawId: string,
    bankId: string,
    onStepProgress?: (step: number, detail: string) => void
  ): Promise<ScreeningResult> {
    onStepProgress?.(1, "Normalizing PAN / Aadhaar input and computing Poseidon leaf in local RAM");
    const normalizedId = normaliseId(rawId);
    const salt = BigInt(deploymentConfig.consortiumSalt);
    const leaf = await computeLeaf(normalizedId, salt);
    const nullifier = await computeNullifier(leaf);

    onStepProgress?.(2, "Rebuilding incremental Merkle tree from on-chain event logs");
    const tree = await getSyncedMerkleTree();
    const leafIndex = tree.indexOf(leaf);

    if (leafIndex === -1 || leaf === 0n) {
      onStepProgress?.(3, "Applicant identity commitment not present in consortium Merkle tree");
      const currentRoot = await tree.getRoot();
      return {
        isFlagged: false,
        leaf: "0x" + leaf.toString(16).padStart(64, "0"),
        nullifier: "0x" + nullifier.toString(16).padStart(64, "0"),
        root: "0x" + currentRoot.toString(16).padStart(64, "0"),
        ringVelocity: 0,
        distinctBankHits: 0,
        verifiedLocally: false,
      };
    }

    onStepProgress?.(3, "Identity match detected in tree; generating Merkle inclusion witness");
    const merkleProof = await tree.generateProof(leafIndex);

    onStepProgress?.(4, "Computing Groth16 zero-knowledge proof");
    let proof: Groth16ProofSolidity;

    try {
      const { ensureZkArtifacts, generateProofViaWorker } = await import("../zk-prover-client");
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
      try {
        const hits = await registry.distinctBankHits(nullifier.toString());
        ringVelocity = Math.max(Number(hits), 1);
      } catch {}
    }

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
      leaf: "0x" + leaf.toString(16).padStart(64, "0"),
      nullifier: "0x" + nullifier.toString(16).padStart(64, "0"),
      root: "0x" + merkleProof.root.toString(16).padStart(64, "0"),
      ringVelocity,
      distinctBankHits: ringVelocity,
      flaggerBank,
      categoryName,
      expiresAt,
      txHash,
      proof,
      verifiedLocally: false,
    };
  }

  async getCrossBankAlert(currentBankAddress?: string): Promise<CrossBankAlert | null> {
    if (!currentBankAddress) return null;
    const provider = getProvider();
    const registry = getFraudRegistryContract(provider);

    const [flagEvents, hitEvents] = await Promise.all([
      registry.queryFilter(registry.filters.IdentityFlagged(), 0).catch(() => []),
      registry.queryFilter(registry.filters.RingHit(), 0).catch(() => []),
    ]);

    // Build map of flags created by current bank
    const flaggedNullifiersByMe = new Set<string>();
    for (const f of flagEvents) {
      if (!("args" in f) || !f.args) continue;
      if (f.args[2].toLowerCase() === currentBankAddress.toLowerCase()) {
        const leafBig = BigInt(f.args[0]);
        const nullifierBig = await computeNullifier(leafBig);
        flaggedNullifiersByMe.add("0x" + nullifierBig.toString(16).padStart(64, "0").toLowerCase());
      }
    }

    for (const h of hitEvents) {
      if (!("args" in h) || !h.args) continue;
      const nHex = "0x" + BigInt(h.args[0]).toString(16).padStart(64, "0").toLowerCase();
      const hitBank = h.args[1];

      if (flaggedNullifiersByMe.has(nHex) && hitBank.toLowerCase() !== currentBankAddress.toLowerCase()) {
        const alertId = `alert-${h.transactionHash || nHex}`;
        if (!isAlertDismissed({ id: alertId, nullifier: nHex, blockNumber: h.blockNumber })) {
          const hitBankInfo = getBankByAddress(hitBank);
          return {
            id: alertId,
            nullifier: nHex,
            hitBankName: hitBankInfo?.name || "Consortium Bank",
            hitBankAddress: hitBank,
            flaggedBankAddress: currentBankAddress,
            timestamp: "Just now",
            message: `An identity you flagged was presented at ${hitBankInfo?.name || "another bank"}`,
          };
        }
      }
    }

    return null;
  }

  dismissAlert(id?: string, nullifier?: string, blockNumber?: number): void {
    dismissAlertPermanently({ id, nullifier, blockNumber });
  }
}
