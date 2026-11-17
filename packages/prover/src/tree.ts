import { getPoseidon } from "./normaliseId";

export interface MerkleProof {
  root: bigint;
  leaf: bigint;
  pathElements: bigint[];
  pathIndices: number[];
  leafIndex: number;
}

export interface FlaggedEventLog {
  leaf: bigint;
  index: bigint | number;
  bank: string;
  category: number;
  newRoot: bigint;
  revoked?: boolean;
}

/**
 * Off-chain incremental Merkle tree that strictly mirrors the on-chain @zk-kit/imt.sol
 * BinaryIMT contract using Poseidon(2) hash function and depth 20.
 */
export class KavachMerkleTree {
  public readonly depth: number;
  private leaves: bigint[] = [];
  private zeroes: bigint[] = [];
  private initialized = false;

  constructor(depth: number = 20) {
    this.depth = depth;
  }

  public async init(): Promise<void> {
    if (this.initialized) return;

    const poseidon = await getPoseidon();
    this.zeroes = new Array<bigint>(this.depth + 1);
    this.zeroes[0] = 0n;

    for (let i = 1; i <= this.depth; i++) {
      const prevZero = this.zeroes[i - 1];
      const h = poseidon([prevZero, prevZero]);
      this.zeroes[i] = BigInt(poseidon.F.toString(h));
    }

    this.initialized = true;
  }

  public get numberOfLeaves(): number {
    return this.leaves.length;
  }

  public getLeaf(index: number): bigint {
    if (index < 0 || index >= this.leaves.length) {
      throw new Error(`Leaf index ${index} out of range`);
    }
    return this.leaves[index];
  }

  public indexOf(leaf: bigint): number {
    return this.leaves.findIndex((l) => l === leaf);
  }

  public contains(leaf: bigint): boolean {
    return this.indexOf(leaf) !== -1;
  }

  public async insert(leaf: bigint): Promise<{ root: bigint; leafIndex: number }> {
    await this.init();
    if (this.leaves.length >= 2 ** this.depth) {
      throw new Error("Merkle tree is full");
    }

    const leafIndex = this.leaves.length;
    this.leaves.push(leaf);
    const root = await this.getRoot();
    return { root, leafIndex };
  }

  public async update(leafIndex: number, newLeaf: bigint): Promise<bigint> {
    await this.init();
    if (leafIndex < 0 || leafIndex >= this.leaves.length) {
      throw new Error(`Leaf index ${leafIndex} out of range`);
    }
    this.leaves[leafIndex] = newLeaf;
    return this.getRoot();
  }

  public async remove(leafIndex: number): Promise<bigint> {
    return this.update(leafIndex, 0n);
  }

  public async getRoot(): Promise<bigint> {
    await this.init();
    if (this.leaves.length === 0) {
      return this.zeroes[this.depth];
    }
    const proof = await this.generateProof(0);
    return proof.root;
  }

  /**
   * Generates a Merkle inclusion proof for the leaf at `leafIndex`.
   */
  public async generateProof(leafIndex: number): Promise<MerkleProof> {
    await this.init();
    if (leafIndex < 0 || leafIndex >= this.leaves.length) {
      throw new Error(`Index ${leafIndex} out of range (total leaves: ${this.leaves.length})`);
    }

    const poseidon = await getPoseidon();
    const pathElements: bigint[] = [];
    const pathIndices: number[] = [];

    // Current level nodes map (index -> node value)
    let currentLevel = new Map<number, bigint>();
    for (let i = 0; i < this.leaves.length; i++) {
      currentLevel.set(i, this.leaves[i]);
    }

    let currentIndex = leafIndex;

    for (let level = 0; level < this.depth; level++) {
      const isRightChild = currentIndex % 2 === 1;
      const siblingIndex = isRightChild ? currentIndex - 1 : currentIndex + 1;
      const defaultZero = this.zeroes[level];

      const sibling = currentLevel.get(siblingIndex) ?? defaultZero;
      pathElements.push(sibling);
      pathIndices.push(isRightChild ? 1 : 0);

      // Compute parent level
      const nextLevel = new Map<number, bigint>();
      const maxIndexInLevel = Math.max(...Array.from(currentLevel.keys()), siblingIndex);
      const parentCount = Math.floor(maxIndexInLevel / 2) + 1;

      for (let p = 0; p < parentCount; p++) {
        const leftNode = currentLevel.get(p * 2) ?? defaultZero;
        const rightNode = currentLevel.get(p * 2 + 1) ?? defaultZero;
        const parentHash = poseidon([leftNode, rightNode]);
        nextLevel.set(p, BigInt(poseidon.F.toString(parentHash)));
      }

      currentLevel = nextLevel;
      currentIndex = Math.floor(currentIndex / 2);
    }

    const root = currentLevel.get(0) ?? this.zeroes[this.depth];

    return {
      root,
      leaf: this.leaves[leafIndex],
      pathElements,
      pathIndices,
      leafIndex,
    };
  }

  /**
   * Convenience: returns Merkle inclusion proof directly by leaf commitment value.
   * Throws if leaf is not found in tree or is zeroed (revoked).
   */
  public async getProof(leaf: bigint): Promise<MerkleProof> {
    const idx = this.indexOf(leaf);
    if (idx === -1 || leaf === 0n) {
      throw new Error(`Leaf ${leaf.toString()} not found in Merkle tree`);
    }
    return this.generateProof(idx);
  }
}

/**
 * Rebuilds the incremental Merkle tree from on-chain IdentityFlagged and LeafRevoked logs.
 * Skips/zeros out revoked leaves to ensure off-chain tree state matches FraudRegistry on-chain root.
 *
 * @param events Array of IdentityFlagged event logs (with optional revoked indicator).
 * @param revokedLeaves Optional Set or Array of leaf values that have been revoked by AppealDAO.
 * @param depth Tree depth (defaults to 20).
 */
export async function buildTreeFromEvents(
  events: Array<{ leaf: bigint | string; index: number | bigint; revoked?: boolean }>,
  revokedLeaves?: Set<bigint> | bigint[],
  depth: number = 20
): Promise<KavachMerkleTree> {
  const tree = new KavachMerkleTree(depth);
  await tree.init();

  const revokedSet = new Set<bigint>();
  if (revokedLeaves) {
    for (const r of revokedLeaves) revokedSet.add(BigInt(r));
  }

  // Sort events by leaf index to reconstruct exact insertion order
  const sorted = [...events].sort((a, b) => Number(a.index) - Number(b.index));

  for (const ev of sorted) {
    const leafVal = BigInt(ev.leaf);
    const isRevoked = ev.revoked || revokedSet.has(leafVal);
    // If leaf was revoked, insert 0n or insert then zero
    if (isRevoked) {
      await tree.insert(0n);
    } else {
      await tree.insert(leafVal);
    }
  }

  return tree;
}
