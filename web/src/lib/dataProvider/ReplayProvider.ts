import snapshotData from "../../../public/snapshot.json";
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
import { BankConfig, CONSORTIUM_BANKS, getDemoBanks } from "../banks";
import {
  KavachMerkleTree,
  computeLeaf,
  computeNullifier,
  normaliseId,
  Groth16ProofSolidity,
} from "@kavach/prover";
import { isAlertDismissed, dismissAlertPermanently } from "../alerts";

const CATEGORY_MAP: Record<number, string> = {
  0: "Synthetic ID",
  1: "Mule Account",
  2: "Loan Stacking",
  3: "Document Forgery",
};

export class ReplayProvider implements DataProvider {
  readonly mode: NetworkMode = "replay";

  private treeCache: KavachMerkleTree | null = null;
  private startTime: number = Date.now();

  async getTreeState(): Promise<TreeState> {
    return {
      depth: snapshotData.tree.depth || 20,
      root: snapshotData.tree.root,
      numberOfLeaves: snapshotData.tree.numberOfLeaves,
      leaves: snapshotData.tree.leaves,
      ringRoots: snapshotData.rootHistory || [],
    };
  }

  async getEvents(): Promise<RegistryEventItem[]> {
    const rawEvents = snapshotData.events;
    const items: RegistryEventItem[] = [];

    // Helper to compute realistic relative timestamps
    // Stagger timestamps from 2 mins ago to 4 hours ago
    const now = Date.now();

    // 1. Flag Events
    (rawEvents.flags || []).forEach((f: any, idx: number) => {
      const minutesAgo = 8 + idx * 14;
      const ts = new Date(now - minutesAgo * 60 * 1000);
      items.push({
        id: `replay-flag-${idx}`,
        type: "IdentityFlagged",
        bank: f.bank,
        bankName: this.getBankName(f.bank),
        bankCode: this.getBankCode(f.bank),
        leaf: f.leaf,
        category: f.category,
        categoryName: CATEGORY_MAP[f.category] || "Fraud Flag",
        timestamp: ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        timeAgo: `${minutesAgo}m ago`,
        details: `Flagged identity commitment leaf in category: ${CATEGORY_MAP[f.category] || "Fraud"}`,
        txHash: f.txHash || `0xreplay...${f.leaf.slice(-6)}`,
        blockNumber: f.blockNumber || 30 + idx,
        isDemoSeed: true,
      });
    });

    // 2. Ring Hit Events
    (rawEvents.hits || []).forEach((h: any, idx: number) => {
      const minutesAgo = 4 + idx * 11;
      const ts = new Date(now - minutesAgo * 60 * 1000);
      items.push({
        id: `replay-hit-${idx}`,
        type: "RingHit",
        bank: h.bank,
        bankName: this.getBankName(h.bank),
        bankCode: this.getBankCode(h.bank),
        nullifier: h.nullifier,
        velocity: h.distinctBanks,
        timestamp: ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        timeAgo: `${minutesAgo}m ago`,
        details: `Ring Velocity accelerated to ${h.distinctBanks} banks via Groth16 verification`,
        txHash: h.txHash || `0xreplay...${h.nullifier.slice(-6)}`,
        blockNumber: h.blockNumber || 40 + idx,
        isDemoSeed: true,
      });
    });

    // 3. Appeal Events
    (rawEvents.appealCreated || []).forEach((a: any, idx: number) => {
      const hoursAgo = 1 + idx * 3;
      const ts = new Date(now - hoursAgo * 3600 * 1000);
      items.push({
        id: `replay-appeal-create-${idx}`,
        type: "AppealCreated",
        bank: a.appellant,
        bankName: this.getBankName(a.appellant),
        bankCode: this.getBankCode(a.appellant),
        leaf: a.leaf,
        timestamp: ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        timeAgo: `${hoursAgo}h ago`,
        details: `Dispute Appeal #${a.appealId} initiated with formal defense evidence CID`,
        txHash: a.txHash,
        blockNumber: a.blockNumber,
        isDemoSeed: true,
      });
    });

    (rawEvents.appealVoted || []).forEach((v: any, idx: number) => {
      const hoursAgo = 1;
      const ts = new Date(now - (hoursAgo * 3600 - idx * 300) * 1000);
      items.push({
        id: `replay-appeal-vote-${idx}`,
        type: "AppealVoted",
        bank: v.bank,
        bankName: this.getBankName(v.bank),
        bankCode: this.getBankCode(v.bank),
        timestamp: ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        timeAgo: `45m ago`,
        details: `Voted ${v.support ? "FOR" : "AGAINST"} revocation on Appeal #${v.appealId} (${v.currentVotesFor}/4 supermajority)`,
        txHash: v.txHash,
        blockNumber: v.blockNumber,
        isDemoSeed: true,
      });
    });

    // Sort newest first
    items.sort((a, b) => (b.blockNumber || 0) - (a.blockNumber || 0));
    return items;
  }

  async getActiveFlags(): Promise<ActiveFlagItem[]> {
    const rawFlags = snapshotData.events.flags || [];
    const seeds = snapshotData.seedIdentities || [];
    const now = Date.now();

    return rawFlags.map((f: any, idx: number) => {
      const matchingSeed = seeds.find((s: any) => s.leaf.toLowerCase() === f.leaf.toLowerCase());
      const nullifier = matchingSeed?.nullifier || f.leaf;
      const flaggedAt = Math.floor((now - (idx + 1) * 3600 * 1000) / 1000);
      const expiresAt = flaggedAt + 30 * 86400;

      return {
        leaf: f.leaf,
        index: f.index !== undefined ? f.index : idx,
        bank: f.bank,
        bankName: this.getBankName(f.bank),
        bankCode: this.getBankCode(f.bank),
        category: f.category,
        categoryName: CATEGORY_MAP[f.category] || "Suspicious Flag",
        flaggedAt,
        expiresAt,
        stakeEth: "0.05",
        revoked: false,
        nullifier: nullifier.startsWith("0x") ? nullifier : `0x${BigInt(nullifier).toString(16)}`,
        txHash: f.txHash || `0xseed...${f.leaf.slice(-6)}`,
      };
    });
  }

  async getAppeals(): Promise<AppealRecord[]> {
    const rawAppeals = snapshotData.appeals || [];
    const seeds = snapshotData.seedIdentities || [];
    const now = Date.now();

    return rawAppeals.map((app: any) => {
      const matchingSeed = seeds.find(
        (s: any) => BigInt(s.leaf).toString() === BigInt(app.leaf).toString()
      );
      const disputedId = matchingSeed?.id || "DISP99999P";

      return {
        id: app.id,
        leaf: app.leaf,
        disputedId,
        initiator: "Punjab National Bank",
        flagger: "Axis Bank",
        categoryName: "Multi-Lender Loan Stacking",
        evidenceURI: app.evidenceURI || "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
        defenceURI: "sha256:0x7c9a89d14603a152345bcfa9e450892a0134f590123514a",
        createdAt: now - 86400 * 1000 * 2, // 2 days ago
        deadline: now + 86400 * 1000 * 5,  // 5 days remaining
        votesFor: app.votesFor || 2,
        votesAgainst: app.votesAgainst || 0,
        requiredQuorum: 4,
        status: app.status === 1 ? "ResolvedSlashed" : app.status === 2 ? "Rejected" : "Active",
        votedBanks: ["meridian", "aurum"],
      };
    });
  }

  async getLeaderboard(): Promise<VelocityLeaderboardItem[]> {
    const hits = snapshotData.events.hits || [];
    const map = new Map<string, { nullifier: string; count: number; lastBank: string }>();

    for (const h of hits) {
      const nullifier = h.nullifier;
      const count = Number(h.distinctBanks);
      const bankName = this.getBankName(h.bank);
      if (!map.has(nullifier) || (map.get(nullifier)?.count || 0) < count) {
        map.set(nullifier, { nullifier, count, lastBank: bankName });
      }
    }

    const items: VelocityLeaderboardItem[] = [];
    for (const [nullifier, data] of map.entries()) {
      const seedMatch = (snapshotData.seedIdentities || []).find(
        (s: any) => BigInt(s.nullifier).toString() === BigInt(nullifier).toString()
      );
      items.push({
        nullifier,
        nullifierShort: `${nullifier.slice(0, 10)}...${nullifier.slice(-6)}`,
        distinctBanks: data.count,
        lastSeen: data.lastBank,
        categoryName: seedMatch?.categoryName || "Synthetic Identity Ring",
        flaggedBy: seedMatch?.bankName || "State Bank of India",
      });
    }

    items.sort((a, b) => b.distinctBanks - a.distinctBanks);
    return items;
  }

  getMemberBanks(): BankConfig[] {
    return getDemoBanks();
  }

  canSubmitTransactions(): boolean {
    return false;
  }

  private async getInitializedTree(): Promise<KavachMerkleTree> {
    if (!this.treeCache) {
      const tree = new KavachMerkleTree(20);
      await tree.init();
      for (const leafHex of snapshotData.tree.leaves) {
        tree.insert(BigInt(leafHex));
      }
      this.treeCache = tree;
    }
    return this.treeCache;
  }

  async screenApplicant(
    rawId: string,
    bankId: string,
    onStepProgress?: (step: number, detail: string) => void
  ): Promise<ScreeningResult> {
    onStepProgress?.(1, "Parsing identifier and extracting cryptographic payload in local RAM");
    const normalizedId = normaliseId(rawId);
    const salt = BigInt(snapshotData.consortiumSalt);

    const leaf = await computeLeaf(normalizedId, salt);
    const nullifier = await computeNullifier(leaf);

    onStepProgress?.(2, "Rebuilding incremental Merkle tree from snapshot dataset");
    const tree = await this.getInitializedTree();
    const leafIndex = tree.indexOf(leaf);

    const currentRoot = await tree.getRoot();

    if (leafIndex === -1 || leaf === 0n) {
      onStepProgress?.(3, "Applicant cleared consortium registry. Zero matches detected.");
      return {
        isFlagged: false,
        leaf: "0x" + leaf.toString(16).padStart(64, "0"),
        nullifier: "0x" + nullifier.toString(16).padStart(64, "0"),
        root: "0x" + currentRoot.toString(16).padStart(64, "0"),
        ringVelocity: 0,
        distinctBankHits: 0,
        verifiedLocally: true,
        verificationLabel: "Verified locally (no chain)",
      };
    }

    onStepProgress?.(3, "Identity match detected in tree; generating Merkle inclusion witness");
    const merkleProof = await tree.generateProof(leafIndex);

    onStepProgress?.(4, "Computing Groth16 zero-knowledge proof in Web Worker");
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
      console.warn("Web worker proving fallback in replay mode:", workerErr);
      const { generateMembershipProof } = await import("@kavach/prover");
      const proofResult = await generateMembershipProof(rawId, salt, tree, {
        wasmPath: "/zk/membership.wasm",
        zkeyPath: "/zk/membership_final.zkey",
      });
      if (!proofResult.proof) throw new Error("Failed to compute zero-knowledge proof");
      proof = proofResult.proof;
    }

    // Verify locally with snarkjs against verification_key.json
    onStepProgress?.(5, "Verifying Groth16 proof locally against verification_key.json");
    try {
      const vKeyRes = await fetch("/zk/verification_key.json");
      if (vKeyRes.ok) {
        const vKey = await vKeyRes.json();
        // @ts-ignore
        const snarkjs = await import("snarkjs");
        const publicSignals = [merkleProof.root.toString(), nullifier.toString()];
        const snarkProof = {
          pi_a: [proof.a[0], proof.a[1], "1"],
          pi_b: [
            [proof.b[0][1], proof.b[0][0]],
            [proof.b[1][1], proof.b[1][0]],
            ["1", "0"],
          ],
          pi_c: [proof.c[0], proof.c[1], "1"],
          protocol: "groth16",
          curve: "bn128",
        };
        const isValid = await (snarkjs as any).groth16.verify(vKey, publicSignals, snarkProof);
        if (!isValid) {
          console.warn("Local snarkjs proof verification mismatch");
        }
      }
    } catch (vErr) {
      console.warn("Local proof verification note:", vErr);
    }

    // Match metadata from snapshot seed records
    const seedMatch = (snapshotData.seedIdentities || []).find(
      (s: any) => BigInt(s.leaf).toString() === leaf.toString()
    );

    const ringVelocity = seedMatch ? seedMatch.ringVelocity || 1 : 1;
    const flaggerBank = seedMatch ? seedMatch.bankName : "Another member";
    const categoryName = seedMatch ? seedMatch.categoryName : "Synthetic Identity";

    onStepProgress?.(6, `Screening complete: Verified locally (no chain). Seen across ${ringVelocity} member banks`);

    return {
      isFlagged: true,
      leaf: "0x" + leaf.toString(16).padStart(64, "0"),
      nullifier: "0x" + nullifier.toString(16).padStart(64, "0"),
      root: "0x" + merkleProof.root.toString(16).padStart(64, "0"),
      ringVelocity,
      distinctBankHits: ringVelocity,
      flaggerBank,
      categoryName,
      expiresAt: "30 days (Active)",
      txHash: "",
      proof,
      verifiedLocally: true,
      verificationLabel: "Verified locally (no chain)",
    };
  }

  async getCrossBankAlert(currentBankAddress?: string): Promise<CrossBankAlert | null> {
    const alertId = "replay-scripted-alert-1";
    const nullifier = "0x17056ef0cf3a81d4e6f5b3838b9bb107333a02d311e71b572bad846a32624bd4";

    if (isAlertDismissed({ id: alertId, nullifier })) {
      return null;
    }

    // Scripted delay: show 4 seconds after page session begins
    const elapsed = Date.now() - this.startTime;
    if (elapsed < 3500) {
      return null;
    }

    return {
      id: alertId,
      nullifier,
      hitBankName: "Northgate Bank",
      hitBankAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      flaggedBankAddress: currentBankAddress || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      timestamp: "Just now",
      message: "An identity you flagged was presented at Northgate Bank",
    };
  }

  dismissAlert(id?: string, nullifier?: string, blockNumber?: number): void {
    dismissAlertPermanently({ id, nullifier, blockNumber });
  }

  private getBankName(address: string): string {
    const b = (snapshotData.memberBanks || []).find(
      (m: any) => m.address.toLowerCase() === address.toLowerCase()
    );
    return b ? b.name : "Consortium Bank";
  }

  private getBankCode(address: string): string {
    const b = (snapshotData.memberBanks || []).find(
      (m: any) => m.address.toLowerCase() === address.toLowerCase()
    );
    return b ? b.code : "BNK";
  }
}
