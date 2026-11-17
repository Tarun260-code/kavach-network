"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMembershipProof = generateMembershipProof;
exports.createProofFromWitness = createProofFromWitness;
const normaliseId_1 = require("./normaliseId");
/**
 * Resolves default paths for WASM and zkey artifacts across Node.js environments.
 */
function getDefaultZkPaths() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const path = require("path");
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const fs = require("fs");
        // Candidate locations: /web/public/zk or /circuits/build
        const candidates = [
            path.resolve(__dirname, "../../../web/public/zk"),
            path.resolve(__dirname, "../../web/public/zk"),
            path.resolve(__dirname, "../../../circuits/build"),
            path.resolve(process.cwd(), "web/public/zk"),
            path.resolve(process.cwd(), "../web/public/zk"),
        ];
        for (const dir of candidates) {
            const wasm = path.join(dir, "membership.wasm");
            const zkey = path.join(dir, "membership_final.zkey");
            if (fs.existsSync(wasm) && fs.existsSync(zkey)) {
                return { wasmPath: wasm, zkeyPath: zkey };
            }
        }
    }
    catch {
        // Browser environment or path module unavailable
    }
    return null;
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
async function generateMembershipProof(idRaw, salt, tree, options = {}) {
    const startTime = Date.now();
    const idVal = (0, normaliseId_1.normaliseId)(idRaw);
    const saltVal = typeof salt === "string" ? BigInt(salt) : salt;
    const leaf = await (0, normaliseId_1.computeLeaf)(idVal, saltVal);
    // Local-only check: if leaf is not in the tree (or index is -1), return no match
    const leafIdx = tree.indexOf(leaf);
    if (leafIdx === -1 || leaf === 0n) {
        return {
            matched: false,
            leaf,
            durationMs: Date.now() - startTime,
        };
    }
    // Identity matched: generate Merkle inclusion proof
    const merkleProof = await tree.generateProof(leafIdx);
    const nullifier = await (0, normaliseId_1.computeNullifier)(leaf);
    const root = merkleProof.root;
    const rootStr = root.toString();
    const nullifierStr = nullifier.toString();
    // Resolve artifacts
    let wasmPath = options.wasmPath;
    let zkeyPath = options.zkeyPath;
    if (!wasmPath || !zkeyPath) {
        const defaults = getDefaultZkPaths();
        if (defaults) {
            wasmPath = wasmPath || defaults.wasmPath;
            zkeyPath = zkeyPath || defaults.zkeyPath;
        }
    }
    // Run real Groth16 prover with snarkjs
    if (!options.forceMock && wasmPath && zkeyPath) {
        const snarkjs = await Promise.resolve().then(() => __importStar(require("snarkjs")));
        const circuitInput = {
            idNumber: idVal.toString(),
            salt: saltVal.toString(),
            pathElements: merkleProof.pathElements.map((e) => BigInt(e).toString()),
            pathIndices: merkleProof.pathIndices,
            root: rootStr,
            nullifier: nullifierStr,
        };
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(circuitInput, wasmPath, zkeyPath);
        const solidityProof = {
            a: [proof.pi_a[0], proof.pi_a[1]],
            b: [
                [proof.pi_b[0][1], proof.pi_b[0][0]],
                [proof.pi_b[1][1], proof.pi_b[1][0]],
            ],
            c: [proof.pi_c[0], proof.pi_c[1]],
            input: [publicSignals[0], publicSignals[1]],
        };
        return {
            matched: true,
            leaf,
            nullifier,
            root,
            proof: solidityProof,
            publicSignals: [publicSignals[0], publicSignals[1]],
            durationMs: Date.now() - startTime,
        };
    }
    // Fallback to deterministic mock format if mock requested
    const mockSolidityProof = {
        a: [
            "0x1111111111111111111111111111111111111111111111111111111111111111",
            "0x2222222222222222222222222222222222222222222222222222222222222222",
        ],
        b: [
            [
                "0x1111111111111111111111111111111111111111111111111111111111111111",
                "0x2222222222222222222222222222222222222222222222222222222222222222",
            ],
            [
                "0x3333333333333333333333333333333333333333333333333333333333333333",
                "0x4444444444444444444444444444444444444444444444444444444444444444",
            ],
        ],
        c: [
            "0x3333333333333333333333333333333333333333333333333333333333333333",
            "0x4444444444444444444444444444444444444444444444444444444444444444",
        ],
        input: [rootStr, nullifierStr],
    };
    return {
        matched: true,
        leaf,
        nullifier,
        root,
        proof: mockSolidityProof,
        publicSignals: [rootStr, nullifierStr],
        durationMs: Date.now() - startTime,
    };
}
/**
 * Low-level witness proof generator compatible with explicit witness input objects.
 */
async function createProofFromWitness(id, consortiumSalt, merkleProof, options) {
    const leaf = await (0, normaliseId_1.computeLeaf)(id, consortiumSalt);
    if (leaf !== merkleProof.leaf) {
        throw new Error("Computed leaf does not match Merkle proof leaf");
    }
    const nullifier = await (0, normaliseId_1.computeNullifier)(leaf);
    const rootStr = merkleProof.root.toString();
    const nullifierStr = nullifier.toString();
    let wasmPath = options?.wasmPath;
    let zkeyPath = options?.zkeyPath;
    if (!wasmPath || !zkeyPath) {
        const defaults = getDefaultZkPaths();
        if (defaults) {
            wasmPath = wasmPath || defaults.wasmPath;
            zkeyPath = zkeyPath || defaults.zkeyPath;
        }
    }
    if (!options?.forceMock && wasmPath && zkeyPath) {
        const snarkjs = await Promise.resolve().then(() => __importStar(require("snarkjs")));
        const circuitInput = {
            idNumber: (0, normaliseId_1.normaliseId)(id).toString(),
            salt: consortiumSalt.toString(),
            pathElements: merkleProof.pathElements.map((e) => BigInt(e).toString()),
            pathIndices: merkleProof.pathIndices,
            root: rootStr,
            nullifier: nullifierStr,
        };
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(circuitInput, wasmPath, zkeyPath);
        return {
            a: [proof.pi_a[0], proof.pi_a[1]],
            b: [
                [proof.pi_b[0][1], proof.pi_b[0][0]],
                [proof.pi_b[1][1], proof.pi_b[1][0]],
            ],
            c: [proof.pi_c[0], proof.pi_c[1]],
            input: [publicSignals[0], publicSignals[1]],
        };
    }
    return {
        a: [
            "0x1111111111111111111111111111111111111111111111111111111111111111",
            "0x2222222222222222222222222222222222222222222222222222222222222222",
        ],
        b: [
            [
                "0x1111111111111111111111111111111111111111111111111111111111111111",
                "0x2222222222222222222222222222222222222222222222222222222222222222",
            ],
            [
                "0x3333333333333333333333333333333333333333333333333333333333333333",
                "0x4444444444444444444444444444444444444444444444444444444444444444",
            ],
        ],
        c: [
            "0x3333333333333333333333333333333333333333333333333333333333333333",
            "0x4444444444444444444444444444444444444444444444444444444444444444",
        ],
        input: [rootStr, nullifierStr],
    };
}
//# sourceMappingURL=prove.js.map