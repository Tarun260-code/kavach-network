import { buildPoseidon } from "circomlibjs";

export const SNARK_SCALAR_FIELD = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617"
);

// Standard Indian National Identity formats
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const AADHAAR_REGEX = /^[0-9]{12}$/;
export const VOTER_ID_REGEX = /^[A-Z]{3}[0-9]{7}$/;

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
export function validateId(rawId: string): IdValidationResult {
  if (!rawId || typeof rawId !== "string") {
    return {
      valid: false,
      type: "CUSTOM",
      normalizedId: "",
      error: "Identifier must be a non-empty string",
    };
  }

  const clean = rawId.trim().replace(/[-\s]/g, "").toUpperCase();

  if (PAN_REGEX.test(clean)) {
    return { valid: true, type: "PAN", normalizedId: clean };
  }

  if (AADHAAR_REGEX.test(clean)) {
    return { valid: true, type: "AADHAAR", normalizedId: clean };
  }

  if (VOTER_ID_REGEX.test(clean)) {
    return { valid: true, type: "VOTER_ID", normalizedId: clean };
  }

  if (clean.length >= 6 && clean.length <= 32 && /^[A-Z0-9]+$/.test(clean)) {
    return { valid: true, type: "CUSTOM", normalizedId: clean };
  }

  return {
    valid: false,
    type: "CUSTOM",
    normalizedId: clean,
    error: "Invalid identifier format. Expected PAN (e.g. ABCDE1234F) or Aadhaar (12 digits)",
  };
}

/**
 * Normalises an Indian ID string into a deterministic BN254 scalar field element.
 * For numeric IDs (Aadhaar), converts directly to BigInt.
 * For alphanumeric IDs (PAN, Voter ID), encodes ASCII bytes as big-endian integer.
 */
export function normaliseId(rawId: string): bigint {
  const validation = validateId(rawId);
  if (!validation.valid) {
    throw new Error(validation.error || "Cannot normalise invalid identity string");
  }

  const clean = validation.normalizedId;

  if (validation.type === "AADHAAR") {
    return BigInt(clean) % SNARK_SCALAR_FIELD;
  }

  // Encode ASCII characters into big-endian integer
  const hex = Buffer.from(clean, "ascii").toString("hex");
  const value = BigInt("0x" + hex);
  return value % SNARK_SCALAR_FIELD;
}

let poseidonInstance: {
  (inputs: Array<bigint | number | string>): Uint8Array;
  F: { toString(val: Uint8Array): string };
} | null = null;

export async function getPoseidon(): Promise<{
  (inputs: Array<bigint | number | string>): Uint8Array;
  F: { toString(val: Uint8Array): string };
}> {
  if (!poseidonInstance) {
    poseidonInstance = (await buildPoseidon()) as unknown as {
      (inputs: Array<bigint | number | string>): Uint8Array;
      F: { toString(val: Uint8Array): string };
    };
  }
  return poseidonInstance;
}

/**
 * Computes commitment leaf = Poseidon(idNumber, consortiumSalt).
 */
export async function computeLeaf(
  idNumber: bigint | string,
  consortiumSalt: bigint | string
): Promise<bigint> {
  const poseidon = await getPoseidon();
  const idVal = typeof idNumber === "string" ? normaliseId(idNumber) : idNumber;
  const saltVal = typeof consortiumSalt === "string" ? BigInt(consortiumSalt) : consortiumSalt;

  const hash = poseidon([idVal, saltVal]);
  return BigInt(poseidon.F.toString(hash));
}

/**
 * Computes deterministic public nullifier = Poseidon(leaf, 1).
 * Domain separator 1 ensures nullifier !== leaf.
 */
export async function computeNullifier(leaf: bigint | string): Promise<bigint> {
  const poseidon = await getPoseidon();
  const leafVal = typeof leaf === "string" ? BigInt(leaf) : leaf;

  const hash = poseidon([leafVal, 1n]);
  return BigInt(poseidon.F.toString(hash));
}

