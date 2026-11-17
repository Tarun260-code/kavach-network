import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Kavach Network – Local Deployment Script
 * Deploys MockVerifier, PoseidonT3, FraudRegistry, and AppealDAO to the
 * connected network, writes addresses + ABIs to web/src/generated/deployments.json,
 * and prints the gas cost of a sample flagIdentity() call.
 */
export async function deployContracts() {
  const [admin, sbiBank, hdfcBank, iciciBank, axisBank, pnbBank] = await ethers.getSigners();

  console.log("==================================================");
  console.log("       KAVACH NETWORK DEPLOYMENT PIPELINE         ");
  console.log("==================================================");
  console.log("Deployer / Consortium Admin:", admin.address);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("");

  // 1. Deploy Real Groth16Verifier (was MockVerifier in Phase 1)
  const Verifier = await ethers.getContractFactory("Groth16Verifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log("[1/4] Groth16Verifier deployed to:", verifierAddress);

  // ── 2. PoseidonT3 Library ──────────────────────────────────────────────────
  const PoseidonT3 = await ethers.getContractFactory("PoseidonT3");
  const poseidonT3 = await PoseidonT3.deploy();
  await poseidonT3.waitForDeployment();
  const poseidonAddress = await poseidonT3.getAddress();
  console.log("[2/4] PoseidonT3 library deployed to:", poseidonAddress);

  // ── 3. FraudRegistry ──────────────────────────────────────────────────────
  const FLAG_STAKE = ethers.parseEther("0.05"); // == MIN_STAKE constant
  const Registry = await ethers.getContractFactory("FraudRegistry", {
    libraries: {
      PoseidonT3: poseidonAddress,
    },
  });
  const registry = await Registry.deploy(verifierAddress, FLAG_STAKE, admin.address);
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("[3/4] FraudRegistry deployed to:", registryAddress);

  // ── 4. AppealDAO ───────────────────────────────────────────────────────────
  const memberBanks = [
    sbiBank.address,
    hdfcBank.address,
    iciciBank.address,
    axisBank.address,
    pnbBank.address,
  ];

  const DAO = await ethers.getContractFactory("AppealDAO");
  const appealDAO = await DAO.deploy(registryAddress, admin.address, memberBanks);
  await appealDAO.waitForDeployment();
  const daoAddress = await appealDAO.getAddress();
  console.log("[4/4] AppealDAO deployed to:", daoAddress);

  // ── 5. Configure Permissions ───────────────────────────────────────────────
  await registry.connect(admin).setAppealDAO(daoAddress);
  for (const bank of memberBanks) {
    await registry.connect(admin).setBankAuthorization(bank, true);
  }
  console.log("\nConfigured AppealDAO and authorized 5 member banks in FraudRegistry.");

  // ── 6. Gas Measurement (Optional / Dry-Run) ────────────────────────────────
  // Skipped during live deployments to keep registry tree clean for seed data.

  // ── 7. Write Deployment Manifest ──────────────────────────────────────────
  // Fetch ABIs from compiled artifacts
  const registryArtifact = await import("../artifacts/contracts/FraudRegistry.sol/FraudRegistry.json", { assert: { type: "json" } });
  const daoArtifact = await import("../artifacts/contracts/AppealDAO.sol/AppealDAO.json", { assert: { type: "json" } });
  const verifierArtifact = await import("../artifacts/contracts/Groth16Verifier.sol/Groth16Verifier.json", { assert: { type: "json" } });

  const deployments = {
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    timestamp: new Date().toISOString(),
    flagStake: FLAG_STAKE.toString(),
    consortiumSalt: "888777666555444333222111000999", // demo seed – not the real consortium secret
    memberBanks: [
      { name: "State Bank of India", code: "SBI", address: sbiBank.address },
      { name: "HDFC Bank", code: "HDFC", address: hdfcBank.address },
      { name: "ICICI Bank", code: "ICICI", address: iciciBank.address },
      { name: "Axis Bank", code: "AXIS", address: axisBank.address },
      { name: "Punjab National Bank", code: "PNB", address: pnbBank.address },
    ],
    contracts: {
      FraudRegistry: {
        address: registryAddress,
        abi: registryArtifact.default.abi,
      },
      AppealDAO: {
        address: daoAddress,
        abi: daoArtifact.default.abi,
      },
      Groth16Verifier: {
        address: verifierAddress,
        abi: verifierArtifact.default.abi,
      },
      PoseidonT3: {
        address: poseidonAddress,
        abi: [],
      },
    },
  };

  const outputDirs = [
    path.resolve(__dirname, "../../web/src/generated"),
    path.resolve(__dirname, "../deployments"),
  ];

  for (const dir of outputDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(path.join(dir, "deployments.json"), JSON.stringify(deployments, null, 2));
  }

  console.log("\nDeployment manifest (addresses + ABIs) written to:");
  console.log("  web/src/generated/deployments.json");
  console.log("  contracts/deployments/deployments.json");
  console.log("\n==================================================");
  console.log("   DEPLOYMENT COMPLETE                           ");
  console.log("==================================================");

  return { verifier, registry, appealDAO, deployments };
}

if (require.main === module) {
  deployContracts()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
