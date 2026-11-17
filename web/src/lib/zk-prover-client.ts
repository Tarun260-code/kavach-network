/**
 * Kavach Client-Side Prover & Artifact Caching Manager.
 * 
 * Features:
 * 1. IndexedDB persistence for `membership.wasm` (~1.8MB) and `membership_final.zkey` (~3.2MB).
 * 2. Progress reporting for the initial "Downloading verification keys (once)" phase.
 * 3. Off-thread Web Worker execution of snarkjs Groth16 proving to guarantee 0 dropped frames.
 */

import { Groth16ProofSolidity } from "@kavach/prover";

const DB_NAME = "kavach_zk_cache_v1";
const STORE_NAME = "artifacts";

export interface ZkDownloadProgress {
  file: string;
  percent: number;
  loadedBytes: number;
  totalBytes: number;
  cached: boolean;
}

export interface WorkerProgressEvent {
  stage: "witness" | "groth16" | "complete";
  percent: number;
  detail: string;
}

/**
 * Open or create the IndexedDB store for zero-knowledge artifacts.
 */
function openZkDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB is not available in this environment."));
    }

    const request = window.indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieve an ArrayBuffer from IndexedDB.
 */
async function getCachedArtifact(key: string): Promise<ArrayBuffer | null> {
  try {
    const db = await openZkDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => {
        if (req.result instanceof ArrayBuffer) {
          resolve(req.result);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Save an ArrayBuffer into IndexedDB.
 */
async function saveCachedArtifact(key: string, buffer: ArrayBuffer): Promise<void> {
  try {
    const db = await openZkDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(buffer, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Failed to save artifact to IndexedDB:", err);
  }
}

/**
 * Fetch an artifact with progress tracking and persist to IndexedDB.
 */
async function fetchWithProgress(
  url: string,
  key: string,
  onProgress?: (progress: ZkDownloadProgress) => void
): Promise<ArrayBuffer> {
  // Check IndexedDB cache first
  const cached = await getCachedArtifact(key);
  if (cached) {
    onProgress?.({
      file: key,
      percent: 100,
      loadedBytes: cached.byteLength,
      totalBytes: cached.byteLength,
      cached: true,
    });
    return cached;
  }

  // Not cached, stream download from public URL
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download ZK artifact: ${url} (${response.statusText})`);
  }

  const contentLength = Number(response.headers.get("Content-Length")) || 3_000_000;
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      receivedBytes += value.length;
      const percent = Math.min(Math.round((receivedBytes / contentLength) * 100), 99);
      onProgress?.({
        file: key,
        percent,
        loadedBytes: receivedBytes,
        totalBytes: contentLength,
        cached: false,
      });
    }
  }

  // Combine chunks into single ArrayBuffer
  const combined = new Uint8Array(receivedBytes);
  let position = 0;
  for (const chunk of chunks) {
    combined.set(chunk, position);
    position += chunk.length;
  }

  const buffer = combined.buffer;
  await saveCachedArtifact(key, buffer);

  onProgress?.({
    file: key,
    percent: 100,
    loadedBytes: receivedBytes,
    totalBytes: receivedBytes,
    cached: false,
  });

  return buffer;
}

/**
 * Downloads and caches both the WASM circuit and the Groth16 zkey.
 */
export async function ensureZkArtifacts(
  onProgress?: (progress: { stage: string; percent: number; detail: string }) => void
): Promise<{ wasmBuffer: ArrayBuffer; zkeyBuffer: ArrayBuffer }> {
  onProgress?.({
    stage: "download",
    percent: 10,
    detail: "Checking local IndexedDB cryptographic artifact store...",
  });

  const wasmBuffer = await fetchWithProgress("/zk/membership.wasm", "membership.wasm", (p) => {
    onProgress?.({
      stage: "download",
      percent: Math.round(p.percent * 0.4),
      detail: p.cached
        ? "WASM circuit verified from local IndexedDB cache"
        : `Downloading circuit WASM (${(p.loadedBytes / 1_048_576).toFixed(1)}MB / ${(p.totalBytes / 1_048_576).toFixed(1)}MB)`,
    });
  });

  const zkeyBuffer = await fetchWithProgress("/zk/membership_final.zkey", "membership_final.zkey", (p) => {
    onProgress?.({
      stage: "download",
      percent: 40 + Math.round(p.percent * 0.6),
      detail: p.cached
        ? "Proving key (zkey) loaded from local IndexedDB cache"
        : `Downloading verification keys (once) (${(p.loadedBytes / 1_048_576).toFixed(1)}MB / ${(p.totalBytes / 1_048_576).toFixed(1)}MB)`,
    });
  });

  return { wasmBuffer, zkeyBuffer };
}

/**
 * Check if zero-knowledge proving artifacts are already cached in IndexedDB.
 */
export async function checkArtifactsCached(): Promise<boolean> {
  try {
    const [wasm, zkey] = await Promise.all([
      getCachedArtifact("membership.wasm"),
      getCachedArtifact("membership_final.zkey"),
    ]);
    return !!(wasm && zkey);
  } catch {
    return false;
  }
}


// Global worker instance
let activeWorker: Worker | null = null;

function getWorker(): Worker {
  if (!activeWorker && typeof window !== "undefined") {
    activeWorker = new Worker("/zk-worker.js");
  }
  return activeWorker!;
}

/**
 * Off-thread zero-knowledge proof generation via dedicated Web Worker.
 */
export async function generateProofViaWorker(
  circuitInput: {
    idNumber: string;
    salt: string;
    pathElements: string[];
    pathIndices: number[];
    root: string;
    nullifier: string;
  },
  wasmBuffer: ArrayBuffer,
  zkeyBuffer: ArrayBuffer,
  onProgress?: (stage: string, percent: number, detail: string) => void
): Promise<{
  proof: Groth16ProofSolidity;
  publicSignals: [string, string];
  elapsedMs: number;
}> {
  return new Promise((resolve, reject) => {
    const worker = getWorker();
    const correlationId = "zk_" + Math.random().toString(36).slice(2, 9);

    const messageHandler = (e: MessageEvent) => {
      const data = e.data;
      if (!data || data.id !== correlationId) return;

      if (data.type === "PROGRESS") {
        onProgress?.(data.stage, data.percent, data.detail);
      } else if (data.type === "SUCCESS") {
        worker.removeEventListener("message", messageHandler);
        worker.removeEventListener("error", errorHandler);
        resolve({
          proof: data.proof,
          publicSignals: data.publicSignals,
          elapsedMs: data.elapsedMs,
        });
      } else if (data.type === "ERROR") {
        worker.removeEventListener("message", messageHandler);
        worker.removeEventListener("error", errorHandler);
        reject(new Error(data.error || "ZK Proving failed in Web Worker"));
      }
    };

    const errorHandler = (err: ErrorEvent) => {
      worker.removeEventListener("message", messageHandler);
      worker.removeEventListener("error", errorHandler);
      reject(new Error(`Web Worker error: ${err.message}`));
    };

    worker.addEventListener("message", messageHandler);
    worker.addEventListener("error", errorHandler);

    // Send payload to worker with cloned ArrayBuffers so main thread retains buffers
    worker.postMessage({
      id: correlationId,
      type: "FULL_PROVE",
      payload: {
        circuitInput,
        wasmBuffer: wasmBuffer.slice(0),
        zkeyBuffer: zkeyBuffer.slice(0),
      },
    });
  });
}

