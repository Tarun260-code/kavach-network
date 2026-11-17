// kavach-network/web/src/lib/alerts.ts
// Bulletproof persistent alert dismissal store across sessions, page navigations, and reloads.

export const STORAGE_KEY_DISMISSED_ALERTS = "kavach_dismissed_alerts";
export const STORAGE_KEY_DISMISSED_BLOCK = "kavach_dismissed_block";

// Module-level global state that survives Next.js page transitions and client navigations
const GLOBAL_DISMISSED_SET = new Set<string>();
let GLOBAL_DISMISSED_BLOCK = 0;

function normalizeAlertKeys(id?: string, nullifier?: string): string[] {
  const keys: string[] = [];

  const addVariants = (val?: string) => {
    if (!val || typeof val !== "string") return;
    const clean = val.toLowerCase().trim();
    if (!clean) return;
    keys.push(clean);

    const withoutAlert = clean.replace(/^alert-/, "");
    keys.push(withoutAlert);
    keys.push(`alert-${withoutAlert}`);

    const without0x = withoutAlert.replace(/^0x/, "");
    keys.push(without0x);
    keys.push(`0x${without0x}`);
    keys.push(`alert-0x${without0x}`);
    keys.push(`alert-${without0x}`);
  };

  addVariants(id);
  addVariants(nullifier);

  return Array.from(new Set(keys));
}

export function getStoredDismissedAlerts(): Set<string> {
  const set = new Set<string>(GLOBAL_DISMISSED_SET);
  if (typeof window === "undefined") return set;

  const readFromStorage = (storage: Storage) => {
    try {
      const raw = storage.getItem(STORAGE_KEY_DISMISSED_ALERTS);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          arr.forEach((item: string) => {
            if (typeof item === "string" && item.trim()) {
              normalizeAlertKeys(item).forEach((k) => {
                set.add(k);
                GLOBAL_DISMISSED_SET.add(k);
              });
            }
          });
        }
      }
    } catch {}
  };

  try {
    if (window.localStorage) readFromStorage(window.localStorage);
  } catch {}
  try {
    if (window.sessionStorage) readFromStorage(window.sessionStorage);
  } catch {}

  return set;
}

export function getStoredDismissedBlock(): number {
  if (GLOBAL_DISMISSED_BLOCK > 0) return GLOBAL_DISMISSED_BLOCK;
  if (typeof window === "undefined") return 0;

  try {
    const rawLocal = window.localStorage?.getItem(STORAGE_KEY_DISMISSED_BLOCK);
    const rawSession = window.sessionStorage?.getItem(STORAGE_KEY_DISMISSED_BLOCK);
    const block = Math.max(Number(rawLocal) || 0, Number(rawSession) || 0);
    if (block > 0) {
      GLOBAL_DISMISSED_BLOCK = block;
    }
    return GLOBAL_DISMISSED_BLOCK;
  } catch {
    return GLOBAL_DISMISSED_BLOCK;
  }
}

export function isAlertDismissed(params: {
  id?: string;
  nullifier?: string;
  blockNumber?: number;
}): boolean {
  const { id, nullifier, blockNumber } = params;

  // 1. If an event has a block number and is at or before the dismissed block threshold, it is permanently dismissed
  if (blockNumber !== undefined && blockNumber > 0) {
    const maxDismissedBlock = getStoredDismissedBlock();
    if (maxDismissedBlock > 0 && blockNumber <= maxDismissedBlock) {
      return true;
    }
  }

  // 2. Fast check against in-memory global set
  const variants = normalizeAlertKeys(id, nullifier);
  for (const v of variants) {
    if (GLOBAL_DISMISSED_SET.has(v)) {
      return true;
    }
  }

  // 3. Fallback check against localStorage & sessionStorage
  if (typeof window !== "undefined") {
    const stored = getStoredDismissedAlerts();
    for (const v of variants) {
      if (stored.has(v)) {
        return true;
      }
    }
  }

  return false;
}

export function dismissAlertPermanently(params: {
  id?: string;
  nullifier?: string;
  blockNumber?: number;
}): void {
  const { id, nullifier, blockNumber } = params;
  const variants = normalizeAlertKeys(id, nullifier);

  // Update in-memory global state
  variants.forEach((v) => GLOBAL_DISMISSED_SET.add(v));

  if (blockNumber !== undefined && blockNumber > 0) {
    GLOBAL_DISMISSED_BLOCK = Math.max(GLOBAL_DISMISSED_BLOCK, blockNumber);
  }

  if (typeof window === "undefined") return;

  const persistToStorage = (storage: Storage) => {
    try {
      const raw = storage.getItem(STORAGE_KEY_DISMISSED_ALERTS);
      const existing = raw ? JSON.parse(raw) : [];
      const combined = new Set([
        ...(Array.isArray(existing) ? existing.map((x: string) => String(x).toLowerCase().trim()) : []),
        ...variants,
      ]);
      storage.setItem(STORAGE_KEY_DISMISSED_ALERTS, JSON.stringify(Array.from(combined)));

      if (GLOBAL_DISMISSED_BLOCK > 0) {
        storage.setItem(STORAGE_KEY_DISMISSED_BLOCK, String(GLOBAL_DISMISSED_BLOCK));
      }
    } catch {}
  };

  try {
    if (window.localStorage) persistToStorage(window.localStorage);
  } catch {}
  try {
    if (window.sessionStorage) persistToStorage(window.sessionStorage);
  } catch {}

  // Dispatch custom event to notify all listeners across the window
  try {
    window.dispatchEvent(
      new CustomEvent("kavach:alert-dismissed", {
        detail: { id, nullifier, blockNumber, variants },
      })
    );
  } catch {}
}

// Initial hydration if in browser
if (typeof window !== "undefined") {
  try {
    getStoredDismissedAlerts();
    getStoredDismissedBlock();
  } catch {}
}
