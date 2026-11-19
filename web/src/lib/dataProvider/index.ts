import { DataProvider, NetworkMode } from "./types";
import { ReplayProvider } from "./ReplayProvider";
import { LiveChainProvider } from "./LiveChainProvider";

let cachedProvider: DataProvider | null = null;
let cachedMode: NetworkMode | null = null;

export function getNetworkMode(): NetworkMode {
  if (cachedMode) return cachedMode;

  // 1. Explicit env variable
  const envMode = process.env.NEXT_PUBLIC_NETWORK?.toLowerCase();
  if (envMode === "replay" || envMode === "local") {
    cachedMode = envMode as NetworkMode;
    return cachedMode;
  }

  // 2. Client-side URL query param (?mode=replay or ?mode=local)
  if (typeof window !== "undefined") {
    try {
      const params = new URLSearchParams(window.location.search);
      const queryMode = params.get("mode")?.toLowerCase();
      if (queryMode === "replay" || queryMode === "local") {
        cachedMode = queryMode as NetworkMode;
        return cachedMode;
      }

      // 3. Vercel deployment detection
      if (
        window.location.hostname.endsWith(".vercel.app") ||
        window.location.hostname.includes("vercel")
      ) {
        cachedMode = "replay";
        return cachedMode;
      }
    } catch {
      // ignore
    }
  }

  // 4. Server-side Vercel environment detection
  if (process.env.VERCEL === "1" || process.env.NEXT_PUBLIC_VERCEL_ENV) {
    cachedMode = "replay";
    return cachedMode;
  }

  // Default to local for development, replay for production if unspecified
  cachedMode = process.env.NODE_ENV === "production" ? "replay" : "local";
  return cachedMode;
}

export function setNetworkMode(mode: NetworkMode) {
  cachedMode = mode;
  cachedProvider = null;
}

export function getDataProvider(): DataProvider {
  const mode = getNetworkMode();
  if (cachedProvider && cachedProvider.mode === mode) {
    return cachedProvider;
  }

  if (mode === "replay") {
    cachedProvider = new ReplayProvider();
  } else {
    cachedProvider = new LiveChainProvider();
  }
  return cachedProvider;
}

export * from "./types";
export { ReplayProvider } from "./ReplayProvider";
export { LiveChainProvider } from "./LiveChainProvider";
