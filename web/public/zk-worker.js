/* eslint-disable no-undef */
/**
 * Kavach Web Worker for Groth16 Zero-Knowledge Proof Generation.
 * Runs snarkjs off the main UI thread to guarantee steady 60fps responsiveness.
 */

try {
  importScripts('/zk/snarkjs.min.js');
} catch (e) {
  console.warn("Worker importScripts(/zk/snarkjs.min.js) failed:", e);
}

self.onmessage = async function (e) {
  const { id, type, payload } = e.data || {};

  if (type === "PING") {
    self.postMessage({ id, type: "PONG" });
    return;
  }

  if (type === "FULL_PROVE") {
    const startTime = Date.now();
    try {
      if (typeof snarkjs === "undefined") {
        throw new Error("snarkjs is not available in web worker context");
      }

      self.postMessage({
        id,
        type: "PROGRESS",
        stage: "witness",
        percent: 35,
        detail: "Calculating witness from Depth-20 Merkle path elements",
      });

      const { circuitInput, wasmBuffer, zkeyBuffer } = payload;
      const wasm = new Uint8Array(wasmBuffer);
      const zkey = new Uint8Array(zkeyBuffer);

      self.postMessage({
        id,
        type: "PROGRESS",
        stage: "groth16",
        percent: 75,
        detail: "Synthesizing BN254 Groth16 proof polynomial (snarkjs)",
      });

      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        circuitInput,
        wasm,
        zkey
      );

      const elapsedMs = Date.now() - startTime;

      self.postMessage({
        id,
        type: "SUCCESS",
        proof: {
          a: [proof.pi_a[0], proof.pi_a[1]],
          b: [
            [proof.pi_b[0][1], proof.pi_b[0][0]],
            [proof.pi_b[1][1], proof.pi_b[1][0]],
          ],
          c: [proof.pi_c[0], proof.pi_c[1]],
          input: [publicSignals[0], publicSignals[1]],
        },
        publicSignals,
        elapsedMs,
      });
    } catch (err) {
      console.error("ZK Worker fullProve failed:", err);
      self.postMessage({
        id,
        type: "ERROR",
        error: err && err.message ? err.message : String(err),
        elapsedMs: Date.now() - startTime,
      });
    }
  }
};

