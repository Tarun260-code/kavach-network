export declare const SNARK_SCALAR_FIELD: bigint;
export declare const PAN_REGEX: RegExp;
export declare const AADHAAR_REGEX: RegExp;
export declare const VOTER_ID_REGEX: RegExp;
export type IdType = "PAN" | "AADHAAR" | "VOTER_ID" | "CUSTOM";
export interface IdValidationResult {
    valid: boolean;
    type: IdType;
    normalizedId: string;
    error?: string;
}
/**
 * Validates and identifies the Indian identity document format.
 * Strips whitespace, hyphens, and formats to uppercase.
 */
export declare function validateId(rawId: string): IdValidationResult;
/**
 * Normalises an Indian ID string into a deterministic BN254 scalar field element.
 * For numeric IDs (Aadhaar), converts directly to BigInt.
 * For alphanumeric IDs (PAN, Voter ID), encodes ASCII bytes as big-endian integer.
 */
export declare function normaliseId(rawId: string): bigint;
export declare function getPoseidon(): Promise<{
    (inputs: Array<bigint | number | string>): Uint8Array;
    F: {
        toString(val: Uint8Array): string;
    };
}>;
/**
 * Computes commitment leaf = Poseidon(idNumber, consortiumSalt).
 */
export declare function computeLeaf(idNumber: bigint | string, consortiumSalt: bigint | string): Promise<bigint>;
/**
 * Computes deterministic public nullifier = Poseidon(leaf, 1).
 * Domain separator 1 ensures nullifier !== leaf.
 */
export declare function computeNullifier(leaf: bigint | string): Promise<bigint>;
//# sourceMappingURL=normaliseId.d.ts.map