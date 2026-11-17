"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ethers } from "ethers";
import {
  getProvider,
  getFraudRegistryContract,
  getAppealDAOContract,
  CATEGORY_MAP,
} from "../lib/web3";
import { getBankByAddress } from "../lib/banks";
import seedsData from "../generated/seeds.json";
import { KavachMerkleTree, computeNullifier } from "@kavach/prover";

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

import {
  isAlertDismissed,
  dismissAlertPermanently,
  getStoredDismissedAlerts,
} from "../lib/alerts";

export function useRegistryEvents(currentBankAddress?: string) {
  const [events, setEvents] = useState<RegistryEventItem[]>([]);
  const [flags, setFlags] = useState<ActiveFlagItem[]>([]);
  const [treeSize, setTreeSize] = useState<number>(4);
  const [currentRoot, setCurrentRoot] = useState<string>("0x0");
  const [ringBufferRoots, setRingBufferRoots] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<VelocityLeaderboardItem[]>([]);
  const [crossBankAlert, setCrossBankAlert] = useState<CrossBankAlert | null>(null);
  const [loading, setLoading] = useState(true);

  const treeRef = useRef<KavachMerkleTree | null>(null);
  const knownTxHashes = useRef<Set<string>>(new Set());
  const initialAlertProcessed = useRef<boolean>(false);
  const dismissedAlertsRef = useRef<Set<string>>(getStoredDismissedAlerts());

  // Keep dismissed alert IDs synchronized with localStorage across windows/tabs
  useEffect(() => {
    const syncDismissed = () => {
      const stored = getStoredDismissedAlerts();
      stored.forEach((id) => dismissedAlertsRef.current.add(id));
    };
    syncDismissed();
    window.addEventListener("storage", syncDismissed);
    window.addEventListener("focus", syncDismissed);
    return () => {
      window.removeEventListener("storage", syncDismissed);
      window.removeEventListener("focus", syncDismissed);
    };
  }, []);

  const syncLogs = useCallback(async () => {
    try {
      const provider = getProvider();
      const registry = getFraudRegistryContract(provider);
      const dao = getAppealDAOContract(provider);

      // Fetch on-chain state
      const [onChainRoot, onChainLeaves, ringRoots] = await Promise.all([
        registry.getRoot().catch(() => 0n),
        registry.getNumberOfLeaves().catch(() => 0n),
        registry.getRingRoots().catch(() => []),
      ]);

      setTreeSize(Number(onChainLeaves));
      setCurrentRoot("0x" + BigInt(onChainRoot).toString(16));
      setRingBufferRoots(
        (ringRoots as any[]).map((r) => "0x" + BigInt(r).toString(16)).filter((r) => r !== "0x0")
      );

      // Query raw events from block 0
      const [
        flagEvents,
        hitEvents,
        revokeEvents,
        appealCreatedEvents,
        appealVotedEvents,
        appealExecutedEvents,
      ] = await Promise.all([
        registry.queryFilter(registry.filters.IdentityFlagged(), 0).catch(() => []),
        registry.queryFilter(registry.filters.RingHit(), 0).catch(() => []),
        registry.queryFilter(registry.filters.LeafRevoked(), 0).catch(() => []),
        dao.queryFilter(dao.filters.AppealCreated(), 0).catch(() => []),
        dao.queryFilter(dao.filters.AppealVoted(), 0).catch(() => []),
        dao.queryFilter(dao.filters.AppealExecuted(), 0).catch(() => []),
      ]);

      // Reconstruct flags
      const activeFlagsMap = new Map<string, ActiveFlagItem>();
      const revokedLeavesSet = new Set<string>();

      for (const rev of revokeEvents) {
        if ("args" in rev && rev.args) {
          revokedLeavesSet.add("0x" + BigInt(rev.args[0]).toString(16));
        }
      }

      for (const ev of flagEvents) {
        if (!("args" in ev) || !ev.args) continue;
        const leafBig = BigInt(ev.args[0]);
        const leafHex = "0x" + leafBig.toString(16);
        const index = Number(ev.args[1]);
        const bankAddr = ev.args[2];
        const category = Number(ev.args[3]);
        const bankInfo = getBankByAddress(bankAddr);
        const nullifierBig = await computeNullifier(leafBig);

        activeFlagsMap.set(leafHex, {
          leaf: leafHex,
          index,
          bank: bankAddr,
          bankName: bankInfo?.name || "Consortium Bank",
          bankCode: bankInfo?.code || "BNK",
          category,
          categoryName: CATEGORY_MAP[category]?.name || "Suspicious Activity",
          flaggedAt: Date.now() - 3600000,
          expiresAt: Date.now() + 30 * 86400000,
          stakeEth: "0.05",
          revoked: revokedLeavesSet.has(leafHex),
          nullifier: "0x" + nullifierBig.toString(16),
          txHash: ev.transactionHash,
        });
      }

      // If no on-chain flags returned (e.g. node reset or cold start), supplement with seeds
      if (activeFlagsMap.size === 0) {
        for (const s of seedsData.seedRecords) {
          const leafHex = "0x" + BigInt(s.leaf).toString(16);
          activeFlagsMap.set(leafHex, {
            leaf: leafHex,
            index: s.leafIndex,
            bank: s.bankAddress,
            bankName: s.bankName,
            bankCode: s.bankCode,
            category: 2,
            categoryName: "Loan Stacking",
            flaggedAt: Date.now() - 3600000,
            expiresAt: Date.now() + 30 * 86400000,
            stakeEth: "0.05",
            revoked: s.status === "Revoked",
            nullifier: "0x" + BigInt(s.nullifier).toString(16),
            txHash: "0xseed..." + s.leaf.slice(-6),
          });
        }
      }

      setFlags(Array.from(activeFlagsMap.values()));

      // Build unified event items list
      const combinedList: RegistryEventItem[] = [];

      for (const ev of flagEvents) {
        if (!("args" in ev) || !ev.args) continue;
        const leafHex = "0x" + BigInt(ev.args[0]).toString(16);
        const bankAddr = ev.args[2];
        const category = Number(ev.args[3]);
        const bankInfo = getBankByAddress(bankAddr);

        combinedList.push({
          id: `flag-${ev.transactionHash}-${ev.index}`,
          type: "IdentityFlagged",
          bank: bankAddr,
          bankName: bankInfo?.name || "Consortium Bank",
          bankCode: bankInfo?.code || "BNK",
          leaf: leafHex,
          category,
          categoryName: CATEGORY_MAP[category]?.name || "Fraud Flag",
          timestamp: new Date().toLocaleTimeString(),
          timeAgo: "Recently",
          details: `Flagged identity commitment leaf in category: ${CATEGORY_MAP[category]?.name || "Fraud"}`,
          txHash: ev.transactionHash,
          blockNumber: ev.blockNumber,
        });
      }

      for (const ev of hitEvents) {
        if (!("args" in ev) || !ev.args) continue;
        const nullifierHex = "0x" + BigInt(ev.args[0]).toString(16);
        const bankAddr = ev.args[1];
        const distinctBanks = Number(ev.args[2]);
        const bankInfo = getBankByAddress(bankAddr);

        combinedList.push({
          id: `hit-${ev.transactionHash}-${ev.index}`,
          type: "RingHit",
          bank: bankAddr,
          bankName: bankInfo?.name || "Consortium Bank",
          bankCode: bankInfo?.code || "BNK",
          nullifier: nullifierHex,
          velocity: distinctBanks,
          timestamp: new Date().toLocaleTimeString(),
          timeAgo: "Recently",
          details: `Ring Velocity accelerated to ${distinctBanks} banks via Groth16 verification`,
          txHash: ev.transactionHash,
          blockNumber: ev.blockNumber,
        });

        // Cross-bank alert logic:
        // If the current connected bank flagged this identity, and another bank records a hit:
        if (currentBankAddress) {
          // Find if current bank flagged the identity corresponding to this nullifier
          const flaggedItem = Array.from(activeFlagsMap.values()).find(
            (f) => f.nullifier.toLowerCase() === nullifierHex.toLowerCase()
          );

          if (
            flaggedItem &&
            flaggedItem.bank.toLowerCase() === currentBankAddress.toLowerCase() &&
            bankAddr.toLowerCase() !== currentBankAddress.toLowerCase()
          ) {
            const alertId = ev.transactionHash
              ? `alert-${ev.transactionHash}`
              : `alert-${nullifierHex}-${bankAddr}`;

            const dismissed = isAlertDismissed({
              id: alertId,
              nullifier: nullifierHex,
              blockNumber: ev.blockNumber,
            });

            // Check if we should alert (only if not previously dismissed by user)
            if (!dismissed) {
              setCrossBankAlert({
                id: alertId,
                nullifier: nullifierHex,
                hitBankName: bankInfo?.name || "Consortium Bank",
                hitBankAddress: bankAddr,
                flaggedBankAddress: currentBankAddress,
                timestamp: "Just now",
                message: `An identity you flagged was presented at ${bankInfo?.name || "another bank"}`,
              });
            }
          }
        }
      }

      for (const ev of revokeEvents) {
        if (!("args" in ev) || !ev.args) continue;
        const leafHex = "0x" + BigInt(ev.args[0]).toString(16);
        const bankAddr = ev.args[1];
        const slashed = ethers.formatEther(ev.args[2]);
        const bankInfo = getBankByAddress(bankAddr);

        combinedList.push({
          id: `revoke-${ev.transactionHash}-${ev.index}`,
          type: "LeafRevoked",
          bank: bankAddr,
          bankName: bankInfo?.name || "Consortium Bank",
          bankCode: bankInfo?.code || "BNK",
          leaf: leafHex,
          timestamp: new Date().toLocaleTimeString(),
          timeAgo: "Recently",
          details: `Dispute upheld: leaf revoked and ${slashed} ETH stake slashed to DAO treasury`,
          txHash: ev.transactionHash,
          blockNumber: ev.blockNumber,
        });
      }

      for (const ev of appealCreatedEvents) {
        if (!("args" in ev) || !ev.args) continue;
        const appealId = Number(ev.args[0]);
        const leafHex = "0x" + BigInt(ev.args[1]).toString(16);
        const initiator = ev.args[2];
        const bankInfo = getBankByAddress(initiator);

        combinedList.push({
          id: `appeal-${ev.transactionHash}-${appealId}`,
          type: "AppealCreated",
          bank: initiator,
          bankName: bankInfo?.name || "Consortium Bank",
          bankCode: bankInfo?.code || "BNK",
          leaf: leafHex,
          timestamp: new Date().toLocaleTimeString(),
          timeAgo: "Recently",
          details: `Dispute Appeal #${appealId} initiated with formal defense evidence CID`,
          txHash: ev.transactionHash,
          blockNumber: ev.blockNumber,
        });
      }

      for (const ev of appealVotedEvents) {
        if (!("args" in ev) || !ev.args) continue;
        const appealId = Number(ev.args[0]);
        const voter = ev.args[1];
        const support = Boolean(ev.args[2]);
        const votesFor = Number(ev.args[3]);
        const bankInfo = getBankByAddress(voter);

        combinedList.push({
          id: `vote-${ev.transactionHash}-${appealId}-${voter}`,
          type: "AppealVoted",
          bank: voter,
          bankName: bankInfo?.name || "Consortium Bank",
          bankCode: bankInfo?.code || "BNK",
          timestamp: new Date().toLocaleTimeString(),
          timeAgo: "Recently",
          details: `Voted ${support ? "FOR" : "AGAINST"} revocation on Appeal #${appealId} (${votesFor}/4 supermajority)`,
          txHash: ev.transactionHash,
          blockNumber: ev.blockNumber,
        });
      }

      for (const ev of appealExecutedEvents) {
        if (!("args" in ev) || !ev.args) continue;
        const appealId = Number(ev.args[0]);
        const leafHex = "0x" + BigInt(ev.args[1]).toString(16);
        const slashed = ethers.formatEther(ev.args[2]);

        combinedList.push({
          id: `exec-${ev.transactionHash}-${appealId}`,
          type: "AppealExecuted",
          bank: "AppealDAO",
          bankName: "AppealDAO Chamber",
          bankCode: "DAO",
          leaf: leafHex,
          timestamp: new Date().toLocaleTimeString(),
          timeAgo: "Recently",
          details: `Supermajority execution complete: ${slashed} ETH slashed and leaf zeroed in Merkle tree`,
          txHash: ev.transactionHash,
          blockNumber: ev.blockNumber,
        });
      }

      // Sort newest first
      combinedList.sort((a, b) => (b.blockNumber || 0) - (a.blockNumber || 0));

      // If empty (e.g. no events found on-chain), fallback to seeds
      if (combinedList.length === 0) {
        setEvents([
          {
            id: "seed-1",
            type: "IdentityFlagged",
            bank: seedsData.seedRecords[0].bankAddress,
            bankName: seedsData.seedRecords[0].bankName,
            bankCode: seedsData.seedRecords[0].bankCode,
            leaf: "0x" + BigInt(seedsData.seedRecords[0].leaf).toString(16),
            category: 0,
            categoryName: "Synthetic ID",
            timestamp: "10 mins ago",
            timeAgo: "10m ago",
            details: "Flagged Synthetic ID Syndicate (Stake: 0.05 ETH)",
            isDemoSeed: true,
          },
          {
            id: "seed-2",
            type: "RingHit",
            bank: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
            bankName: "Halcyon Bank",
            bankCode: "HALCYON",
            nullifier: "0x" + BigInt(seedsData.seedRecords[0].nullifier).toString(16),
            velocity: 2,
            timestamp: "5 mins ago",
            timeAgo: "5m ago",
            details: "Ring Velocity accelerated to 2 (Aurum -> Halcyon cross-bank hit)",
            isDemoSeed: true,
          },
        ]);
      } else {
        setEvents(combinedList);
      }

      // Build Ring Velocity Leaderboard
      const hitCountMap = new Map<string, { nullifier: string; count: number; lastBank: string }>();
      for (const ev of hitEvents) {
        if (!("args" in ev) || !ev.args) continue;
        const nHex = "0x" + BigInt(ev.args[0]).toString(16);
        const bAddr = ev.args[1];
        const count = Number(ev.args[2]);
        const bankInfo = getBankByAddress(bAddr);
        hitCountMap.set(nHex, {
          nullifier: nHex,
          count,
          lastBank: bankInfo?.name || "Consortium Bank",
        });
      }

      const boardItems: VelocityLeaderboardItem[] = [];
      for (const [nullifier, data] of hitCountMap.entries()) {
        const flagItem = Array.from(activeFlagsMap.values()).find(
          (f) => f.nullifier.toLowerCase() === nullifier.toLowerCase()
        );
        boardItems.push({
          nullifier,
          nullifierShort: `${nullifier.slice(0, 10)}...${nullifier.slice(-6)}`,
          distinctBanks: data.count,
          lastSeen: data.lastBank,
          categoryName: flagItem?.categoryName || "Syndicate Suspect",
          flaggedBy: flagItem?.bankName || "Consortium Flag",
        });
      }

      boardItems.sort((a, b) => b.distinctBanks - a.distinctBanks);
      setLeaderboard(boardItems);

      // If active alert was marked dismissed (e.g. from storage or another component), clear it
      setCrossBankAlert((current) => {
        if (!current) return null;
        if (isAlertDismissed({ id: current.id, nullifier: current.nullifier })) {
          return null;
        }
        return current;
      });

      setLoading(false);
    } catch (err) {
      console.error("Error synchronizing registry logs:", err);
      setLoading(false);
    }
  }, [currentBankAddress]);

  useEffect(() => {
    syncLogs();
    const interval = setInterval(syncLogs, 2000);
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
    dismissAlertPermanently({
      id: idToDismiss,
      nullifier: nullifierToDismiss,
      blockNumber,
    });
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
