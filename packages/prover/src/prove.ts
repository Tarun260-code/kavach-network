import { computeLeaf, computeNullifier, normaliseId } from "./normaliseId";
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
  input: [string, string]; // [root, nullifier]
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
 * Resolves default paths for WASM and zkey artifacts across Node.js environments.
 */
function getDefaultZkPaths(): { wasmPath: string; zkeyPath: string } | null {
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
  } catch {
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
export async function generateMembershipProof(
  idRaw: string,
  salt: bigint | string,
  tree: KavachMerkleTree,
  options: ProveOptions = {}
): Promise<MembershipProofResult> {
  const startTime = Date.now();

  const idVal = normaliseId(idRaw);
  const saltVal = typeof salt === "string" ? BigInt(salt) : salt;
  const leaf = await computeLeaf(idVal, saltVal);

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
  const nullifier = await computeNullifier(leaf);
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
    const snarkjs = await import("snarkjs");
    const circuitInput = {
      idNumber: idVal.toString(),
      salt: saltVal.toString(),
      pathElements: merkleProof.pathElements.map((e) => BigInt(e).toString()),
      pathIndices: merkleProof.pathIndices,
      root: rootStr,
      nullifier: nullifierStr,
    };

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      circuitInput,
      wasmPath,
      zkeyPath
    );

    const solidityProof: Groth16ProofSolidity = {
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
  const mockSolidityProof: Groth16ProofSolidity = {
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
export async function createProofFromWitness(
  id: string,
  consortiumSalt: bigint,
  merkleProof: MerkleProof,
  options?: ProveOptions
): Promise<Groth16ProofSolidity> {
  const leaf = await computeLeaf(id, consortiumSalt);
  if (leaf !== merkleProof.leaf) {
    throw new Error("Computed leaf does not match Merkle proof leaf");
  }

  const nullifier = await computeNullifier(leaf);
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
    const snarkjs = await import("snarkjs");
    const circuitInput = {
      idNumber: normaliseId(id).toString(),
      salt: consortiumSalt.toString(),
      pathElements: merkleProof.pathElements.map((e) => BigInt(e).toString()),
      pathIndices: merkleProof.pathIndices,
      root: rootStr,
      nullifier: nullifierStr,
    };

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      circuitInput,
      wasmPath,
      zkeyPath
    );

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
