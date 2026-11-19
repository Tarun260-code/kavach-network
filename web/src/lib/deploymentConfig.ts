import snapshotData from "../../public/snapshot.json";

export interface RegistryDeployment {
  chainId: number;
  verifier: string;
  fraudRegistry: string;
  appealDAO: string;
  flagStake: string;
  consortiumSalt: string;
  memberBanks?: Array<{ name: string; code: string; address: string }>;
  contracts?: {
    FraudRegistry?: { address: string };
    AppealDAO?: { address: string };
    Groth16Verifier?: { address: string };
  };
}

// Safely attempt to load local deployments if available
let localDeployments: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  localDeployments = require("../generated/deployments.json");
} catch {
  // Gracefully ignored on clean Vercel clone or replay mode
}

const fallbackConfig: RegistryDeployment = {
  chainId: Number(snapshotData.chainId || 31337),
  verifier: snapshotData.contracts?.Groth16Verifier || "",
  fraudRegistry: snapshotData.contracts?.FraudRegistry || "",
  appealDAO: snapshotData.contracts?.AppealDAO || "",
  flagStake: snapshotData.flagStake || "50000000000000000",
  consortiumSalt: snapshotData.consortiumSalt || "888777666555444333222111000999",
  memberBanks: snapshotData.memberBanks || [],
  contracts: {
    FraudRegistry: { address: snapshotData.contracts?.FraudRegistry || "" },
    AppealDAO: { address: snapshotData.contracts?.AppealDAO || "" },
    Groth16Verifier: { address: snapshotData.contracts?.Groth16Verifier || "" },
  },
};

export const deploymentConfig: RegistryDeployment = localDeployments
  ? {
      chainId: Number(localDeployments.chainId || 31337),
      verifier: localDeployments.contracts?.Groth16Verifier?.address || fallbackConfig.verifier,
      fraudRegistry: localDeployments.contracts?.FraudRegistry?.address || fallbackConfig.fraudRegistry,
      appealDAO: localDeployments.contracts?.AppealDAO?.address || fallbackConfig.appealDAO,
      flagStake: localDeployments.flagStake || fallbackConfig.flagStake,
      consortiumSalt: localDeployments.consortiumSalt || fallbackConfig.consortiumSalt,
      memberBanks: localDeployments.memberBanks || fallbackConfig.memberBanks,
      contracts: localDeployments.contracts || fallbackConfig.contracts,
    }
  : fallbackConfig;

export default deploymentConfig;
