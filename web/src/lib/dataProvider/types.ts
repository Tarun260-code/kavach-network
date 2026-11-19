import {
  RegistryEventItem,
  ActiveFlagItem,
  VelocityLeaderboardItem,
  CrossBankAlert,
} from "../../hooks/useRegistryEvents";
import { BankConfig } from "../banks";
import { Groth16ProofSolidity } from "@kavach/prover";

export type NetworkMode = "local" | "replay";

export interface TreeState {
  depth: number;
  root: string;
  numberOfLeaves: number;
  leaves: string[];
  ringRoots: string[];
}

export interface ScreeningResult {
  isFlagged: boolean;
  leaf: string;
  nullifier: string;
  root: string;
  ringVelocity: number;
  distinctBankHits: number;
  flaggerBank?: string;
  categoryName?: string;
  expiresAt?: string;
  txHash?: string;
  proof?: Groth16ProofSolidity;
  verifiedLocally?: boolean;
  verificationLabel?: string;
}

export interface AppealRecord {
  id: number;
  leaf: string;
  disputedId: string;
  initiator: string;
  flagger: string;
  categoryName: string;
  evidenceURI: string;
  defenceURI?: string;
  createdAt: number;
  deadline: number;
  votesFor: number;
  votesAgainst: number;
  requiredQuorum: number;
  status: "Active" | "ResolvedSlashed" | "Rejected";
  votedBanks: string[];
}

export interface DataProvider {
  readonly mode: NetworkMode;
  getTreeState(): Promise<TreeState>;
  getEvents(): Promise<RegistryEventItem[]>;
  getActiveFlags(): Promise<ActiveFlagItem[]>;
  getAppeals(): Promise<AppealRecord[]>;
  getLeaderboard(): Promise<VelocityLeaderboardItem[]>;
  getMemberBanks(): BankConfig[];
  screenApplicant(
    rawId: string,
    bankId: string,
    onStepProgress?: (step: number, detail: string) => void
  ): Promise<ScreeningResult>;
  canSubmitTransactions(): boolean;
  getCrossBankAlert(currentBankAddress?: string): Promise<CrossBankAlert | null>;
  dismissAlert(id?: string, nullifier?: string, blockNumber?: number): void;
}
