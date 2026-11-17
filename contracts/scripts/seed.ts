import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import { deployContracts } from "./deploy";
import {
  KavachMerkleTree,
  computeLeaf,
  computeNullifier,
  normaliseId,
  generateMembershipProof,
} from "@kavach/prover";

export interface DemoSeedRecord {
  id: string;
  type: "PAN" | "AADHAAR";
  bankName: string;
  bankCode: string;
  bankAddress: string;
  category: number;
  categoryName: string;
  reason: string;
  leaf: string;
  nullifier: string;
  leafIndex: number;
  ringVelocity: number;
  status: "Active" | "Disputed" | "Revoked";
  isDemoSeed: true;
}

const CATEGORY_NAMES: Record<number, string> = {
  0: "Synthetic ID",
  1: "Mule Account",
  2: "Loan Stacking",
  3: "Document Forgery",
};

export async function seedDemoData() {
  const { registry, appealDAO, deployments } = await deployContracts();
  const [, sbiBank, hdfcBank, iciciBank, axisBank, pnbBank] = await ethers.getSigners();

  console.log("==================================================");
  console.log("          KAVACH NETWORK SEED PIPELINE            ");
  console.log("==================================================");

  const consortiumSalt = BigInt(deployments.consortiumSalt);
  const flagStake = BigInt(deployments.flagStake);
  const offchainTree = new KavachMerkleTree(20);
  await offchainTree.init();

  const wasmPath = path.resolve(__dirname, "../../web/public/zk/membership.wasm");
  const zkeyPath = path.resolve(__dirname, "../../web/public/zk/membership_final.zkey");

  const seedRecords: DemoSeedRecord[] = [];

  // 12 Realistic Synthetic Identities across 4 categories by 3 banks (SBI, HDFC, ICICI + 1 Axis dispute)
  const seedDefinitions = [
    // --- 1. SBI: Synthetic Identity with 3-BANK RING VELOCITY ---
    {
      id: "BKUPG8492Q",
      type: "PAN" as const,
      bank: sbiBank,
      bankName: "State Bank of India",
      bankCode: "SBI",
      category: 0,
      ttl: 30n,
      reason: "Synthetic Identity Ring - Multiple Unsecured Personal Loan Stacking across Lenders",
      isRingVelocity3: true,
      status: "Active" as const,
    },
    // --- 2. HDFC: Mule Account with 1-BANK QUERY HIT ---
    {
      id: "987654321012",
      type: "AADHAAR" as const,
      bank: hdfcBank,
      bankName: "HDFC Bank",
      bankCode: "HDFC",
      category: 1,
      ttl: 60n,
      reason: "Mule Account Funnel - Cross-Border Cyberfraud & UPI Smurfing Infiltration",
      isRingVelocity1: true,
      status: "Active" as const,
    },
    // --- 3. ICICI: Loan Stacking Circular Invoicing ---
    {
      id: "XYZAB5678M",
      type: "PAN" as const,
      bank: iciciBank,
      bankName: "ICICI Bank",
      bankCode: "ICICI",
      category: 2,
      ttl: 45n,
      reason: "Circular Invoice Round-Tripping & Fabricated GST Input Tax Credit Fraud",
      status: "Active" as const,
    },
    // --- 4. SBI: Document Forgery Tampered QR Code ---
    {
      id: "829301928374",
      type: "AADHAAR" as const,
      bank: sbiBank,
      bankName: "State Bank of India",
      bankCode: "SBI",
      category: 3,
      ttl: 90n,
      reason: "Tampered Aadhaar Offline e-KYC XML with Mismatched Name & Biometric Age",
      status: "Active" as const,
    },
    // --- 5. HDFC: Synthetic ID Ghost Borrower ---
    {
      id: "ABCDE1234F",
      type: "PAN" as const,
      bank: hdfcBank,
      bankName: "HDFC Bank",
      bankCode: "HDFC",
      category: 0,
      ttl: 30n,
      reason: "Algorithmically Generated PAN with Fabricated Tier-1 Employer Payroll Slips",
      status: "Active" as const,
    },
    // --- 6. ICICI: Mule Account Dormant Funnel ---
    {
      id: "456789012345",
      type: "AADHAAR" as const,
      bank: iciciBank,
      bankName: "ICICI Bank",
      bankCode: "ICICI",
      category: 1,
      ttl: 60n,
      reason: "Dormant Rural Savings Account Converted to Offshore Betting Payment Gateway",
      status: "Active" as const,
    },
    // --- 7. SBI: Loan Stacking Personal Loan Blast ---
    {
      id: "LMNOP9876Q",
      type: "PAN" as const,
      bank: sbiBank,
      bankName: "State Bank of India",
      bankCode: "SBI",
      category: 2,
      ttl: 30n,
      reason: "Simultaneous 8-Bank Digital Personal Loan Application Blast within 2 Hours",
      status: "Active" as const,
    },
    // --- 8. HDFC: Document Forgery Utility Scam ---
    {
      id: "234567890123",
      type: "AADHAAR" as const,
      bank: hdfcBank,
      bankName: "HDFC Bank",
      bankCode: "HDFC",
      category: 3,
      ttl: 45n,
      reason: "Counterfeit Electricity Bill & Registered Rent Agreement Address Fabrication",
      status: "Active" as const,
    },
    // --- 9. ICICI: Synthetic ID Ghost Director ---
    {
      id: "QRSTU5432V",
      type: "PAN" as const,
      bank: iciciBank,
      bankName: "ICICI Bank",
      bankCode: "ICICI",
      category: 0,
      ttl: 90n,
      reason: "Ghost Director Profile with Non-Existent MCA Incorporation Records",
      status: "Active" as const,
    },
    // --- 10. SBI: Mule Account Student Funnel ---
    {
      id: "678901234567",
      type: "AADHAAR" as const,
      bank: sbiBank,
      bankName: "State Bank of India",
      bankCode: "SBI",
      category: 1,
      ttl: 60n,
      reason: "College Student Account Used for Rapid High-Volume Crypto P2P Smurfing",
      status: "Active" as const,
    },
    // --- 11. HDFC: Loan Stacking SME Revolving Credit ---
    {
      id: "WXYZK8765T",
      type: "PAN" as const,
      bank: hdfcBank,
      bankName: "HDFC Bank",
      bankCode: "HDFC",
      category: 2,
      ttl: 30n,
      reason: "Cross-Lender Working Capital Revolving Credit Over-Leverage Scheme",
      status: "Active" as const,
    },
    // --- 12. Axis / PNB: IN-FLIGHT APPEAL in AppealDAO (Disputed) ---
    {
      id: "DISP99999P",
      type: "PAN" as const,
      bank: axisBank,
      bankName: "Axis Bank",
      bankCode: "AXIS",
      category: 3,
      ttl: 30n,
      reason: "Disputed Identity Theft - Stolen PAN Used for Fraudulent Credit Card Issuance",
      isAppeal: true,
      status: "Disputed" as const,
    },
  ];

  // Insert all 12 leaves on-chain and in offchain tree
  for (let i = 0; i < seedDefinitions.length; i++) {
    const s = seedDefinitions[i];
    const norm = normaliseId(s.id);
    const leaf = await computeLeaf(norm, consortiumSalt);
    const { leafIndex } = await offchainTree.insert(leaf);
    const nullifier = await computeNullifier(leaf);

    // Flag identity on-chain with 0.05 ETH collateral stake
    const tx = await registry
      .connect(s.bank)
      .flagIdentity(leaf, s.category, s.ttl, { value: flagStake });
    await tx.wait();

    let velocity = 0;

    // Handle Seed 1: Accelerate to 3-Bank Ring Velocity (SBI, HDFC, ICICI)
    if (s.isRingVelocity3) {
      console.log(`[Seed ${i + 1}] Computing Groth16 proof for 3-bank Ring Velocity on ${s.id}...`);
      const proofResult = await generateMembershipProof(s.id, consortiumSalt, offchainTree, {
        wasmPath,
        zkeyPath,
      });

      if (proofResult.proof) {
        const p = proofResult.proof;
        const proofA: [bigint, bigint] = [BigInt(p.a[0]), BigInt(p.a[1])];
        const proofB: [[bigint, bigint], [bigint, bigint]] = [
          [BigInt(p.b[0][0]), BigInt(p.b[0][1])],
          [BigInt(p.b[1][0]), BigInt(p.b[1][1])],
        ];
        const proofC: [bigint, bigint] = [BigInt(p.c[0]), BigInt(p.c[1])];
        const pubInputs: [bigint, bigint] = [BigInt(p.input[0]), BigInt(p.input[1])];

        // 1st query: SBI
        await (await registry.connect(sbiBank).verifyAndRecordHit(proofA, proofB, proofC, pubInputs)).wait();
        // 2nd query: HDFC
        await (await registry.connect(hdfcBank).verifyAndRecordHit(proofA, proofB, proofC, pubInputs)).wait();
        // 3rd query: ICICI (Ring Velocity = 3)
        await (await registry.connect(iciciBank).verifyAndRecordHit(proofA, proofB, proofC, pubInputs)).wait();

        velocity = 3;
      }
    }

    // Handle Seed 2: Accelerate to 1-Bank Query Hit (HDFC)
    if (s.isRingVelocity1) {
      console.log(`[Seed ${i + 1}] Computing Groth16 proof for query hit on ${s.id}...`);
      const proofResult = await generateMembershipProof(s.id, consortiumSalt, offchainTree, {
        wasmPath,
        zkeyPath,
      });

      if (proofResult.proof) {
        const p = proofResult.proof;
        const proofA: [bigint, bigint] = [BigInt(p.a[0]), BigInt(p.a[1])];
        const proofB: [[bigint, bigint], [bigint, bigint]] = [
          [BigInt(p.b[0][0]), BigInt(p.b[0][1])],
          [BigInt(p.b[1][0]), BigInt(p.b[1][1])],
        ];
        const proofC: [bigint, bigint] = [BigInt(p.c[0]), BigInt(p.c[1])];
        const pubInputs: [bigint, bigint] = [BigInt(p.input[0]), BigInt(p.input[1])];

        await (await registry.connect(hdfcBank).verifyAndRecordHit(proofA, proofB, proofC, pubInputs)).wait();
        velocity = 1;
      }
    }

    // Handle Seed 12: In-flight Appeal in AppealDAO
    if (s.isAppeal) {
      console.log(`[Seed ${i + 1}] Creating in-flight Appeal for ${s.id} in AppealDAO...`);
      // PNB creates Appeal with formal defense evidence CID
      const appealTx = await appealDAO
        .connect(pnbBank)
        .createAppeal(leaf, "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi");
      await appealTx.wait();

      // SBI and ICICI cast supporting votes (2 of 4 votes towards 4/5 supermajority quorum)
      await (await appealDAO.connect(sbiBank).voteAppeal(1n, true)).wait();
      await (await appealDAO.connect(iciciBank).voteAppeal(1n, true)).wait();
    }

    seedRecords.push({
      id: s.id,
      type: s.type,
      bankName: s.bankName,
      bankCode: s.bankCode,
      bankAddress: s.bank.address,
      category: s.category,
      categoryName: CATEGORY_NAMES[s.category],
      reason: s.reason,
      leaf: leaf.toString(),
      nullifier: nullifier.toString(),
      leafIndex,
      ringVelocity: velocity,
      status: s.status,
      isDemoSeed: true,
    });

    console.log(
      `[Seed ${String(i + 1).padStart(2, " ")}/12] Flagged ${s.type} ${s.id} (${s.bankCode}) [Cat ${s.category}: ${CATEGORY_NAMES[s.category]}] -> Ring Velocity: ${velocity}`
    );
  }

  // Write seeds manifest for web client
  const seedManifest = {
    seedRecords,
    activeAppeals: [
      {
        appealId: 1,
        leaf: seedRecords[11].leaf,
        disputedId: seedRecords[11].id,
        initiator: "Punjab National Bank",
        flagger: "Axis Bank",
        evidenceURI: "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
        votesFor: 2,
        votesAgainst: 0,
        requiredQuorum: 4,
        status: "Active",
      },
    ],
    lastUpdated: new Date().toISOString(),
  };

  const seedPath = path.resolve(__dirname, "../../web/src/generated/seeds.json");
  fs.writeFileSync(seedPath, JSON.stringify(seedManifest, null, 2));
  console.log("Seed manifest written to web/src/generated/seeds.json");
  console.log("Kavach Network seed successfully finished (12 synthetic identities ready).");
}

if (require.main === module) {
  seedDemoData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
