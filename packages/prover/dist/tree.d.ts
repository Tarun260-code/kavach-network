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
export declare class KavachMerkleTree {
    readonly depth: number;
    private leaves;
    private zeroes;
    private initialized;
    constructor(depth?: number);
    init(): Promise<void>;
    get numberOfLeaves(): number;
    getLeaf(index: number): bigint;
    indexOf(leaf: bigint): number;
    contains(leaf: bigint): boolean;
    insert(leaf: bigint): Promise<{
        root: bigint;
        leafIndex: number;
    }>;
    update(leafIndex: number, newLeaf: bigint): Promise<bigint>;
    remove(leafIndex: number): Promise<bigint>;
    getRoot(): Promise<bigint>;
    /**
     * Generates a Merkle inclusion proof for the leaf at `leafIndex`.
     */
    generateProof(leafIndex: number): Promise<MerkleProof>;
    /**
     * Convenience: returns Merkle inclusion proof directly by leaf commitment value.
     * Throws if leaf is not found in tree or is zeroed (revoked).
     */
    getProof(leaf: bigint): Promise<MerkleProof>;
}
/**
 * Rebuilds the incremental Merkle tree from on-chain IdentityFlagged and LeafRevoked logs.
 * Skips/zeros out revoked leaves to ensure off-chain tree state matches FraudRegistry on-chain root.
 *
 * @param events Array of IdentityFlagged event logs (with optional revoked indicator).
 * @param revokedLeaves Optional Set or Array of leaf values that have been revoked by AppealDAO.
 * @param depth Tree depth (defaults to 20).
 */
export declare function buildTreeFromEvents(events: Array<{
    leaf: bigint | string;
    index: number | bigint;
    revoked?: boolean;
}>, revokedLeaves?: Set<bigint> | bigint[], depth?: number): Promise<KavachMerkleTree>;
//# sourceMappingURL=tree.d.ts.map