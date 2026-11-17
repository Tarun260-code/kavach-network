"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VOTER_ID_REGEX = exports.AADHAAR_REGEX = exports.PAN_REGEX = exports.SNARK_SCALAR_FIELD = void 0;
exports.validateId = validateId;
exports.normaliseId = normaliseId;
exports.getPoseidon = getPoseidon;
exports.computeLeaf = computeLeaf;
exports.computeNullifier = computeNullifier;
const circomlibjs_1 = require("circomlibjs");
exports.SNARK_SCALAR_FIELD = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
// Standard Indian National Identity formats
exports.PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
exports.AADHAAR_REGEX = /^[0-9]{12}$/;
exports.VOTER_ID_REGEX = /^[A-Z]{3}[0-9]{7}$/;
/**
 * Validates and identifies the Indian identity document format.
 * Strips whitespace, hyphens, and formats to uppercase.
 */
function validateId(rawId) {
    if (!rawId || typeof rawId !== "string") {
        return {
            valid: false,
            type: "CUSTOM",
            normalizedId: "",
            error: "Identifier must be a non-empty string",
        };
    }
    const clean = rawId.trim().replace(/[-\s]/g, "").toUpperCase();
    if (exports.PAN_REGEX.test(clean)) {
        return { valid: true, type: "PAN", normalizedId: clean };
    }
    if (exports.AADHAAR_REGEX.test(clean)) {
        return { valid: true, type: "AADHAAR", normalizedId: clean };
    }
    if (exports.VOTER_ID_REGEX.test(clean)) {
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
function normaliseId(rawId) {
    const validation = validateId(rawId);
    if (!validation.valid) {
        throw new Error(validation.error || "Cannot normalise invalid identity string");
    }
    const clean = validation.normalizedId;
    if (validation.type === "AADHAAR") {
        return BigInt(clean) % exports.SNARK_SCALAR_FIELD;
    }
    // Encode ASCII characters into big-endian integer
    const hex = Buffer.from(clean, "ascii").toString("hex");
    const value = BigInt("0x" + hex);
    return value % exports.SNARK_SCALAR_FIELD;
}
let poseidonInstance = null;
async function getPoseidon() {
    if (!poseidonInstance) {
        poseidonInstance = (await (0, circomlibjs_1.buildPoseidon)());
    }
    return poseidonInstance;
}
/**
 * Computes commitment leaf = Poseidon(idNumber, consortiumSalt).
 */
async function computeLeaf(idNumber, consortiumSalt) {
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
async function computeNullifier(leaf) {
    const poseidon = await getPoseidon();
    const leafVal = typeof leaf === "string" ? BigInt(leaf) : leaf;
    const hash = poseidon([leafVal, 1n]);
    return BigInt(poseidon.F.toString(hash));
}
//# sourceMappingURL=normaliseId.js.map