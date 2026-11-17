import { KavachMerkleTree, MerkleProof } from "./tree";
export interface MembershipWitnessInput {
    idNumber: bigint | string;
    salt: bigint | string;
    root: bigint | string;
    nullifier: bigint | string;
    pathElements: Array<bigint | string>;
    pathIndices: number[];
}
export interface Groth16ProofSolidity {
    a: [string, string];
    b: [[string, string], [string, string]];
    c: [string, string];
    input: [string, string];
}
export interface ProveOptions {
    wasmPath?: string;
    zkeyPath?: string;
    forceMock?: boolean;
}
export interface MembershipProofResult {
    matched: boolean;
    leaf?: bigint;
    nullifier?: bigint;
    root?: bigint;
    proof?: Groth16ProofSolidity;
    publicSignals?: [string, string];
    durationMs?: number;
}
/**
 * High-level prover API per spec:
 * generateMembershipProof(idRaw, salt, tree, options)
 *
 * If the identity commitment is found in the provided Merkle tree, generates a real Groth16
 * proof using snarkjs and returns { matched: true, proof, publicSignals, nullifier, root }.
 *
 * If NOT found, returns a local-only { matched: false } result without generating a proof,
 * preventing unnecessary computational overhead and preserving applicant privacy.
 */
export declare function generateMembershipProof(idRaw: string, salt: bigint | string, tree: KavachMerkleTree, options?: ProveOptions): Promise<MembershipProofResult>;
/**
 * Low-level witness proof generator compatible with explicit witness input objects.
 */
export declare function createProofFromWitness(id: string, consortiumSalt: bigint, merkleProof: MerkleProof, options?: ProveOptions): Promise<Groth16ProofSolidity>;
//# sourceMappingURL=prove.d.ts.map