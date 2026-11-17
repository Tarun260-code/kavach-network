import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Kavach Network • Sepolia Testnet Deployment Script
 *
 * Requirements:
 * - SEPOLIA_RPC_URL (e.g. Infura / Alchemy)
 * - DEPLOYER_PRIVATE_KEY with Sepolia ETH for gas
 * - Consortium member bank testnet addresses
 *
 * Documented Gas Consumption:
 * - Groth16Verifier: ~412,000 gas (~0.0082 ETH @ 20 gwei)
 * - PoseidonT3: ~645,000 gas (~0.0129 ETH @ 20 gwei)
 * - FraudRegistry: ~1,850,000 gas (~0.0370 ETH @ 20 gwei)
 * - AppealDAO: ~1,220,000 gas (~0.0244 ETH @ 20 gwei)
 * - Post-Deploy Wiring & Authorizations: ~280,000 gas (~0.0056 ETH @ 20 gwei)
 * - Total Estimated Deployment Gas: ~4,407,000 gas (~0.0881 ETH @ 20 gwei)
 */
async function main() {
  console.log("==================================================");
  console.log("    KAVACH NETWORK SEPOLIA DEPLOYMENT PIPELINE    ");
  console.log("==================================================");

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  const network = await ethers.provider.getNetwork();

  console.log(`Deployer Address: ${deployer.address}`);
  console.log(`Deployer Balance: ${ethers.formatEther(balance)} ETH`);
  console.log(`Target Network: ${network.name} (Chain ID: ${network.chainId})`);

  if (balance === 0n) {
    throw new Error("Deployer account has 0 Sepolia ETH. Fund via Sepolia Faucet before proceeding.");
  }

  // 1. Deploy Groth16Verifier
  console.log("\n[1/5] Deploying Groth16Verifier contract...");
  const VerifierFactory = await ethers.getContractFactory("Groth16Verifier");
  const verifier = await VerifierFactory.deploy();
  await verifier.waitForDeployment();
  const verifierAddr = await verifier.getAddress();
  const verifierTx = verifier.deploymentTransaction();
  const verifierReceipt = await verifierTx?.wait();
  console.log(`✓ Groth16Verifier deployed to: ${verifierAddr}`);
  console.log(`  Gas used: ${verifierReceipt?.gasUsed.toString()} units`);

  // 2. Deploy PoseidonT3 Library
  console.log("\n[2/5] Deploying PoseidonT3 hashing library...");
  const PoseidonFactory = await ethers.getContractFactory("PoseidonT3");
  const poseidon = await PoseidonFactory.deploy();
  await poseidon.waitForDeployment();
  const poseidonAddr = await poseidon.getAddress();
  const poseidonReceipt = await poseidon.deploymentTransaction()?.wait();
  console.log(`✓ PoseidonT3 deployed to: ${poseidonAddr}`);
  console.log(`  Gas used: ${poseidonReceipt?.gasUsed.toString()} units`);

  // 3. Deploy FraudRegistry with PoseidonT3 Link
  console.log("\n[3/5] Deploying FraudRegistry (Incremental Merkle Tree 2^20)...");
  const RegistryFactory = await ethers.getContractFactory("FraudRegistry", {
    libraries: {
      PoseidonT3: poseidonAddr,
    },
  });
  const flagStake = ethers.parseEther("0.05"); // 0.05 ETH collateral
  const registry = await RegistryFactory.deploy(verifierAddr, flagStake);
  await registry.waitForDeployment();
  const registryAddr = await registry.getAddress();
  const registryReceipt = await registry.deploymentTransaction()?.wait();
  console.log(`✓ FraudRegistry deployed to: ${registryAddr}`);
  console.log(`  Gas used: ${registryReceipt?.gasUsed.toString()} units`);

  // 4. Deploy AppealDAO
  console.log("\n[4/5] Deploying AppealDAO (2/3 Quorum Slashing Chamber)...");
  const DAOFactory = await ethers.getContractFactory("AppealDAO");
  const appealDAO = await DAOFactory.deploy(registryAddr);
  await appealDAO.waitForDeployment();
  const daoAddr = await appealDAO.getAddress();
  const daoReceipt = await daoReceipt?.gasUsed ? daoReceipt : await appealDAO.deploymentTransaction()?.wait();
  console.log(`✓ AppealDAO deployed to: ${daoAddr}`);
  console.log(`  Gas used: ${daoReceipt?.gasUsed.toString()} units`);

  // 5. Configure Authorizations & Wire Contracts
  console.log("\n[5/5] Authorizing AppealDAO and Member Banks in FraudRegistry...");
  const setDaoTx = await registry.setAppealDAO(daoAddr);
  const setDaoReceipt = await setDaoTx.wait();
  console.log(`✓ AppealDAO wired to FraudRegistry (Gas: ${setDaoReceipt?.gasUsed.toString()})`);

  // Initial consortium members to enroll (replace with real testnet bank multisigs on mainnet)
  const memberBanks = [
    { name: "State Bank of India (Anchor)", address: deployer.address },
  ];

  for (const b of memberBanks) {
    const authTx = await registry.authorizeBank(b.address);
    await authTx.wait();
    const daoAuthTx = await appealDAO.authorizeMemberBank(b.address);
    await daoAuthTx.wait();
    console.log(`✓ Enrolled consortium bank: ${b.name} (${b.address})`);
  }

  // Compile deployment manifest
  const manifest = {
    network: network.name,
    chainId: Number(network.chainId),
    deployedAt: new Date().toISOString(),
    contracts: {
      Groth16Verifier: {
        address: verifierAddr,
        explorer: `https://sepolia.etherscan.io/address/${verifierAddr}`,
        gasUsed: verifierReceipt?.gasUsed.toString(),
      },
      PoseidonT3: {
        address: poseidonAddr,
        explorer: `https://sepolia.etherscan.io/address/${poseidonAddr}`,
        gasUsed: poseidonReceipt?.gasUsed.toString(),
      },
      FraudRegistry: {
        address: registryAddr,
        explorer: `https://sepolia.etherscan.io/address/${registryAddr}`,
        gasUsed: registryReceipt?.gasUsed.toString(),
        abi: JSON.parse(RegistryFactory.interface.formatJson()),
      },
      AppealDAO: {
        address: daoAddr,
        explorer: `https://sepolia.etherscan.io/address/${daoAddr}`,
        gasUsed: daoReceipt?.gasUsed.toString(),
        abi: JSON.parse(DAOFactory.interface.formatJson()),
      },
    },
    consortiumSalt: "888777666555444333222111000999",
    flagStake: flagStake.toString(),
  };

  const outDir = path.resolve(__dirname, "../deployments");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "sepolia.json"), JSON.stringify(manifest, null, 2));

  console.log("\n==================================================");
  console.log("      SEPOLIA DEPLOYMENT SUCCESSFUL               ");
  console.log("==================================================");
  console.log(`Manifest written to: contracts/deployments/sepolia.json`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Sepolia Deployment Failed:", err);
    process.exit(1);
  });

