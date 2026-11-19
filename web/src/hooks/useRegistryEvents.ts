"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getDataProvider } from "../lib/dataProvider";
import {
  isAlertDismissed,
  dismissAlertPermanently,
  getStoredDismissedAlerts,
} from "../lib/alerts";

export interface RegistryEventItem {
  id: string;
  type:
    | "IdentityFlagged"
    | "RingHit"
    | "LeafRevoked"
    | "FlagPruned"
    | "AppealCreated"
    | "AppealVoted"
    | "AppealExecuted";
  bank: string;
  bankName: string;
  bankCode: string;
  leaf?: string;
  nullifier?: string;
  velocity?: number;
  category?: number;
  categoryName?: string;
  timestamp: string;
  timeAgo: string;
  details: string;
  txHash?: string;
  blockNumber?: number;
  isDemoSeed?: boolean;
}

export interface ActiveFlagItem {
  leaf: string;
  index: number;
  bank: string;
  bankName: string;
  bankCode: string;
  category: number;
  categoryName: string;
  flaggedAt: number;
  expiresAt: number;
  stakeEth: string;
  revoked: boolean;
  nullifier: string;
  txHash: string;
}

export interface VelocityLeaderboardItem {
  nullifier: string;
  nullifierShort: string;
  distinctBanks: number;
  lastSeen: string;
  categoryName: string;
  flaggedBy: string;
}

export interface CrossBankAlert {
  id: string;
  nullifier: string;
  hitBankName: string;
  hitBankAddress: string;
  flaggedBankAddress: string;
  timestamp: string;
  message: string;
}

export function useRegistryEvents(currentBankAddress?: string) {
  const [events, setEvents] = useState<RegistryEventItem[]>([]);
  const [flags, setFlags] = useState<ActiveFlagItem[]>([]);
  const [treeSize, setTreeSize] = useState<number>(4);
  const [currentRoot, setCurrentRoot] = useState<string>("0x0");
  const [ringBufferRoots, setRingBufferRoots] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<VelocityLeaderboardItem[]>([]);
  const [crossBankAlert, setCrossBankAlert] = useState<CrossBankAlert | null>(null);
  const [loading, setLoading] = useState(true);

  const dismissedAlertsRef = useRef<Set<string>>(getStoredDismissedAlerts());

  // Keep dismissed alert IDs synchronized with localStorage across windows/tabs
  useEffect(() => {
    const syncDismissed = () => {
      const stored = getStoredDismissedAlerts();
      stored.forEach((id) => dismissedAlertsRef.current.add(id));
    };
    syncDismissed();
    if (typeof window !== "undefined") {
      window.addEventListener("storage", syncDismissed);
      window.addEventListener("focus", syncDismissed);
      return () => {
        window.removeEventListener("storage", syncDismissed);
        window.removeEventListener("focus", syncDismissed);
      };
    }
  }, []);

  const syncLogs = useCallback(async () => {
    try {
      const provider = getDataProvider();
      const [treeState, eventList, flagList, boardList, alert] = await Promise.all([
        provider.getTreeState(),
        provider.getEvents(),
        provider.getActiveFlags(),
        provider.getLeaderboard(),
        provider.getCrossBankAlert(currentBankAddress),
      ]);

      setTreeSize(treeState.numberOfLeaves);
      setCurrentRoot(treeState.root);
      setRingBufferRoots(treeState.ringRoots);
      setFlags(flagList);
      setEvents(eventList);
      setLeaderboard(boardList);

      if (alert && !isAlertDismissed({ id: alert.id, nullifier: alert.nullifier })) {
        setCrossBankAlert(alert);
      } else {
        setCrossBankAlert(null);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error synchronizing registry logs via DataProvider:", err);
      setLoading(false);
    }
  }, [currentBankAddress]);

  useEffect(() => {
    syncLogs();
    const interval = setInterval(syncLogs, 3000);
    return () => clearInterval(interval);
  }, [syncLogs]);

  // Instantly clear alert on window-level dismissal event
  useEffect(() => {
    const handleAlertDismissedEvent = () => {
      setCrossBankAlert(null);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("kavach:alert-dismissed", handleAlertDismissedEvent);
      return () => window.removeEventListener("kavach:alert-dismissed", handleAlertDismissedEvent);
    }
  }, []);

  const dismissAlert = useCallback((idToDismiss?: string, nullifierToDismiss?: string, blockNumber?: number) => {
    const provider = getDataProvider();
    provider.dismissAlert(idToDismiss, nullifierToDismiss, blockNumber);
    setCrossBankAlert(null);
  }, []);

  return {
    events,
    flags,
    treeSize,
    currentRoot,
    ringBufferRoots,
    leaderboard,
    crossBankAlert,
    dismissAlert,
    loading,
    refresh: syncLogs,
  };
}
