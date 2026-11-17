declare module "circomlibjs" {
  export interface PoseidonHasher {
    (inputs: Array<bigint | number | string>): Uint8Array;
    F: {
      toString(val: Uint8Array): string;
      toObject(val: Uint8Array): bigint;
    };
  }

  export function buildPoseidon(): Promise<PoseidonHasher>;
}

declare module "snarkjs" {
  export namespace groth16 {
    export interface Groth16ProofRaw {
      pi_a: [string, string, string];
      pi_b: [[string, string], [string, string], [string, string]];
      pi_c: [string, string, string];
      protocol: string;
      curve: string;
    }

    export function fullProve(
      input: Record<string, unknown>,
      wasmFile: string,
      zkeyFileName: string
    ): Promise<{
      proof: Groth16ProofRaw;
      publicSignals: string[];
    }>;

    export function verify(
      vKey: Record<string, unknown>,
      publicSignals: string[],
      proof: Groth16ProofRaw
    ): Promise<boolean>;
  }
}

