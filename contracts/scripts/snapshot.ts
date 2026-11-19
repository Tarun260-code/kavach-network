import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Known synthetic demo identity set.
 * Any identifier NOT in this set triggers a safety warning.
 */
const ALLOWED_SYNTHETIC_IDS = new Set([
  "BKUPG8492Q",
  "987654321012",
  "XYZAB5678M",
  "829301928374",
  "ABCDE1234F",
  "456789012345",
  "LMNOP9876Q",
  "234567890123",
  "QRSTU5432V",
  "678901234567",
  "WXYZK8765T",
  "DISP99999P",
]);

// Hardhat default private keys to detect and prevent accidental leakage
const KNOWN_HARDHAT_PRIVATE_KEYS = [
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
  "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
  "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a",
  "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba",
];

export async function exportSnapshot() {
  console.log("==================================================");
  console.log("        KAVACH NETWORK SNAPSHOT EXPORTER          ");
  console.log("==================================================");

  const deploymentsFile = path.resolve(__dirname, "../../web/src/generated/deployments.json");
  if (!fs.existsSync(deploymentsFile)) {
    throw new Error("No deployments.json found. Run 'pnpm seed' first.");
  }
  const deployments = JSON.parse(fs.readFileSync(deploymentsFile, "utf-8"));

  const provider = ethers.provider;
  const network = await provider.getNetwork();
  console.log(`Connected network: ${network.name} (ChainID: ${network.chainId})`);

  const registryAddress = deployments.contracts.FraudRegistry.address;
  const daoAddress = deployments.contracts.AppealDAO.address;
  const verifierAddress = deployments.contracts.Groth16Verifier.address;

  const registryAbi = deployments.contracts.FraudRegistry.abi;
  const daoAbi = deployments.contracts.AppealDAO.abi;

  const registry = new ethers.Contract(registryAddress, registryAbi, provider) as any;
  const dao = new ethers.Contract(daoAddress, daoAbi, provider) as any;

  console.log("Fetching tree state from FraudRegistry...");
  const [rootBig, numLeavesBig, ringRootsRaw] = await Promise.all([
    registry.getRoot(),
    registry.getNumberOfLeaves(),
    registry.getRingRoots(),
  ]);

  const currentRoot = "0x" + BigInt(rootBig).toString(16).padStart(64, "0");
  const numberOfLeaves = Number(numLeavesBig);
  const ringRoots = (ringRootsRaw as any[])
    .map((r: any) => "0x" + BigInt(r).toString(16).padStart(64, "0"))
    .filter((r: string) => !/^0x0+$/.test(r));

  console.log(`Current Merkle Root: ${currentRoot}`);
  console.log(`Number of Leaves: ${numberOfLeaves}`);
  console.log(`Ring History Roots: ${ringRoots.length}`);

  // Query events from block 0
  console.log("Querying on-chain historical events...");
  const [
    flagEvents,
    hitEvents,
    revokeEvents,
    appealCreatedEvents,
    appealVotedEvents,
    appealExecutedEvents,
  ] = await Promise.all([
    registry.queryFilter(registry.filters.IdentityFlagged(), 0),
    registry.queryFilter(registry.filters.RingHit(), 0),
    registry.queryFilter(registry.filters.LeafRevoked(), 0),
    dao.queryFilter(dao.filters.AppealCreated(), 0),
    dao.queryFilter(dao.filters.AppealVoted(), 0),
    dao.queryFilter(dao.filters.AppealExecuted(), 0),
  ]);

  console.log(`  - IdentityFlagged: ${flagEvents.length}`);
  console.log(`  - RingHit: ${hitEvents.length}`);
  console.log(`  - LeafRevoked: ${revokeEvents.length}`);
  console.log(`  - AppealCreated: ${appealCreatedEvents.length}`);
  console.log(`  - AppealVoted: ${appealVotedEvents.length}`);
  console.log(`  - AppealExecuted: ${appealExecutedEvents.length}`);

  // Fetch block timestamps for realism
  const blockTimestamps: Record<number, number> = {};
  const getBlockTime = async (blockNum: number) => {
    if (!blockTimestamps[blockNum]) {
      const b = await provider.getBlock(blockNum);
      blockTimestamps[blockNum] = b ? b.timestamp : Math.floor(Date.now() / 1000);
    }
    return blockTimestamps[blockNum];
  };

  // Extract leaves in strict sequential index order
  const leavesByIndex: { index: number; leaf: string; category: number; bank: string }[] = [];
  const flagsList = [];

  for (const ev of flagEvents) {
    const leaf = "0x" + BigInt(ev.args[0]).toString(16).padStart(64, "0");
    const index = Number(ev.args[1]);
    const bank = ev.args[2];
    const category = Number(ev.args[3]);
    const newRoot = "0x" + BigInt(ev.args[4]).toString(16).padStart(64, "0");
    const ts = await getBlockTime(ev.blockNumber);

    leavesByIndex.push({ index, leaf, category, bank });
    flagsList.push({
      leaf,
      index,
      bank,
      category,
      newRoot,
      blockNumber: ev.blockNumber,
      txHash: ev.transactionHash,
      timestamp: ts,
    });
  }

  leavesByIndex.sort((a, b) => a.index - b.index);
  const orderedLeaves = leavesByIndex.map((item) => item.leaf);

  // Hits list
  const hitsList = [];
  for (const ev of hitEvents) {
    const nullifier = "0x" + BigInt(ev.args[0]).toString(16).padStart(64, "0");
    const bank = ev.args[1];
    const distinctBanks = Number(ev.args[2]);
    const ts = await getBlockTime(ev.blockNumber);
    hitsList.push({
      nullifier,
      bank,
      distinctBanks,
      blockNumber: ev.blockNumber,
      txHash: ev.transactionHash,
      timestamp: ts,
    });
  }

  // Revocations list
  const revocationsList = [];
  for (const ev of revokeEvents) {
    const leaf = "0x" + BigInt(ev.args[0]).toString(16).padStart(64, "0");
    const bank = ev.args[1];
    const slashedStake = ev.args[2].toString();
    const recipient = ev.args[3];
    const ts = await getBlockTime(ev.blockNumber);
    revocationsList.push({
      leaf,
      bank,
      slashedStake,
      recipient,
      blockNumber: ev.blockNumber,
      txHash: ev.transactionHash,
      timestamp: ts,
    });
  }

  // Appeal details
  const appealCreatedList = [];
  for (const ev of appealCreatedEvents) {
    const appealId = Number(ev.args[0]);
    const leaf = "0x" + BigInt(ev.args[1]).toString(16).padStart(64, "0");
    const reportingBank = ev.args[2];
    const appellant = ev.args[3];
    const evidenceURI = ev.args[4];
    const ts = await getBlockTime(ev.blockNumber);
    appealCreatedList.push({
      appealId,
      leaf,
      reportingBank,
      appellant,
      evidenceURI,
      blockNumber: ev.blockNumber,
      txHash: ev.transactionHash,
      timestamp: ts,
    });
  }

  const appealVotedList = [];
  for (const ev of appealVotedEvents) {
    const appealId = Number(ev.args[0]);
    const bank = ev.args[1];
    const support = Boolean(ev.args[2]);
    const currentVotesFor = Number(ev.args[3]);
    const ts = await getBlockTime(ev.blockNumber);
    appealVotedList.push({
      appealId,
      bank,
      support,
      currentVotesFor,
      blockNumber: ev.blockNumber,
      txHash: ev.transactionHash,
      timestamp: ts,
    });
  }

  const appealExecutedList = [];
  for (const ev of appealExecutedEvents) {
    const appealId = Number(ev.args[0]);
    const leaf = "0x" + BigInt(ev.args[1]).toString(16).padStart(64, "0");
    const slashedAmount = ev.args[2].toString();
    const ts = await getBlockTime(ev.blockNumber);
    appealExecutedList.push({
      appealId,
      leaf,
      slashedAmount,
      blockNumber: ev.blockNumber,
      txHash: ev.transactionHash,
      timestamp: ts,
    });
  }

  // Active Appeals state
  const appealCount = Number(await dao.appealCount().catch(() => 1n));
  const appealsState = [];
  for (let i = 1; i <= appealCount; i++) {
    try {
      const app = await dao.appeals(i);
      if (app && Number(app.createdAt) > 0) {
        appealsState.push({
          id: Number(app.id),
          leaf: "0x" + BigInt(app.leaf).toString(16).padStart(64, "0"),
          reportingBank: app.reportingBank,
          appellant: app.appellant,
          evidenceURI: app.evidenceURI,
          votesFor: Number(app.votesFor),
          votesAgainst: Number(app.votesAgainst),
          createdAt: Number(app.createdAt),
          deadline: Number(app.deadline),
          status: Number(app.status), // 0: Active, 1: ResolvedSlashed, 2: Rejected
        });
      }
    } catch {}
  }

  // Load seeds if available for rich demo metadata
  const seedsFile = path.resolve(__dirname, "../../web/src/generated/seeds.json");
  const seedsData = fs.existsSync(seedsFile) ? JSON.parse(fs.readFileSync(seedsFile, "utf-8")) : null;

  const snapshot = {
    version: "1.0.0",
    networkMode: "replay",
    exportedAt: new Date().toISOString(),
    chainId: Number(network.chainId),
    flagStake: deployments.flagStake || "50000000000000000",
    consortiumSalt: deployments.consortiumSalt || "888777666555444333222111000999",
    contracts: {
      FraudRegistry: registryAddress,
      AppealDAO: daoAddress,
      Groth16Verifier: verifierAddress,
    },
    memberBanks: deployments.memberBanks || [],
    tree: {
      depth: 20,
      root: currentRoot,
      numberOfLeaves,
      leaves: orderedLeaves,
    },
    rootHistory: ringRoots,
    events: {
      flags: flagsList,
      hits: hitsList,
      revocations: revocationsList,
      appealCreated: appealCreatedList,
      appealVoted: appealVotedList,
      appealExecuted: appealExecutedList,
    },
    appeals: appealsState,
    seedIdentities: seedsData ? seedsData.seedRecords : [],
  };

  // SAFETY VALIDATION & AUDIT
  console.log("\nRunning security and privacy audit on snapshot payload...");
  const snapshotJson = JSON.stringify(
    snapshot,
    (key, value) => (typeof value === "bigint" ? value.toString() : value),
    2
  );
  let warningsFound = 0;

  // 1. Private key check
  for (const key of KNOWN_HARDHAT_PRIVATE_KEYS) {
    if (snapshotJson.toLowerCase().includes(key.toLowerCase())) {
      console.warn(`[CRITICAL SECURITY WARNING] Known Hardhat private key found in snapshot: ${key}`);
      warningsFound++;
    }
  }

  // 2. Scan for unexpected PAN/Aadhaar formats that are NOT in synthetic set
  const panRegex = /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g;
  const panMatches = snapshotJson.match(panRegex) || [];
  for (const pan of panMatches) {
    if (!ALLOWED_SYNTHETIC_IDS.has(pan)) {
      console.warn(`[PRIVACY WARNING] Identifier ${pan} matches PAN format but is NOT in synthetic seed whitelist!`);
      warningsFound++;
    }
  }

  const aadhaarRegex = /\b[2-9]{1}[0-9]{11}\b/g;
  const aadhaarMatches = snapshotJson.match(aadhaarRegex) || [];
  for (const aadhaar of aadhaarMatches) {
    if (!ALLOWED_SYNTHETIC_IDS.has(aadhaar)) {
      console.warn(`[PRIVACY WARNING] Identifier ${aadhaar} matches Aadhaar format but is NOT in synthetic seed whitelist!`);
      warningsFound++;
    }
  }

  if (warningsFound === 0) {
    console.log("✓ Privacy Audit Passed: 100% synthetic demo data, 0 private keys detected.");
  } else {
    console.warn(`⚠️ Privacy Audit: ${warningsFound} warning(s) detected during export!`);
  }

  // Write snapshot to web/public/snapshot.json
  const targetDir = path.resolve(__dirname, "../../web/public");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const targetPath = path.join(targetDir, "snapshot.json");
  fs.writeFileSync(targetPath, snapshotJson);

  const stats = fs.statSync(targetPath);
  console.log(`\nSnapshot successfully written to: ${targetPath}`);
  console.log(`File size: ${(stats.size / 1024).toFixed(2)} KB`);
  console.log("==================================================");
}

if (require.main === module) {
  exportSnapshot()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Snapshot generation failed:", err);
      process.exit(1);
    });
}
