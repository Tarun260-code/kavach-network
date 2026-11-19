import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const deploymentsPath = path.resolve(__dirname, "../web/src/generated/deployments.json");
const abiDir = path.resolve(__dirname, "../web/src/abi");

if (!fs.existsSync(abiDir)) {
  fs.mkdirSync(abiDir, { recursive: true });
}

const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf-8"));

const fraudAbi = deployments.contracts?.FraudRegistry?.abi || [];
const daoAbi = deployments.contracts?.AppealDAO?.abi || [];
const verifierAbi = deployments.contracts?.Groth16Verifier?.abi || [];

fs.writeFileSync(
  path.join(abiDir, "FraudRegistry.json"),
  JSON.stringify(fraudAbi, null, 2)
);
fs.writeFileSync(
  path.join(abiDir, "AppealDAO.json"),
  JSON.stringify(daoAbi, null, 2)
);
fs.writeFileSync(
  path.join(abiDir, "Groth16Verifier.json"),
  JSON.stringify(verifierAbi, null, 2)
);

const indexTs = `// Contract ABIs extracted from compiled artifacts
import FraudRegistryAbi from "./FraudRegistry.json";
import AppealDAOAbi from "./AppealDAO.json";
import Groth16VerifierAbi from "./Groth16Verifier.json";

export const FRAUD_REGISTRY_ABI = FraudRegistryAbi;
export const APPEAL_DAO_ABI = AppealDAOAbi;
export const GROTH16_VERIFIER_ABI = Groth16VerifierAbi;

export { FraudRegistryAbi, AppealDAOAbi, Groth16VerifierAbi };
`;

fs.writeFileSync(path.join(abiDir, "index.ts"), indexTs);

console.log("Successfully extracted contract ABIs to web/src/abi/");
