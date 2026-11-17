import { expect } from "chai";
import { ethers } from "hardhat";
import { AppealDAO, FraudRegistry, MockVerifier } from "../typechain-types";
import {
  KavachMerkleTree,
  computeLeaf,
  computeNullifier,
  createProofFromWitness,
  normaliseId,
} from "@kavach/prover";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

// --- Category enum values (must match FraudRegistry.sol) ---
const Category = {
  SYNTHETIC_ID: 0,
  MULE_ACCOUNT: 1,
  LOAN_STACKING: 2,
  DOC_FORGERY: 3,
} as const;

describe("E2E Protocol Lifecycle: Syndicate Alert & AppealDAO", () => {
  let verifier: MockVerifier;
  let registry: FraudRegistry;
  let appealDAO: AppealDAO;

  let admin: SignerWithAddress;
  let sbiBank: SignerWithAddress;
  let hdfcBank: SignerWithAddress;
  let iciciBank: SignerWithAddress;
  let axisBank: SignerWithAddress;
  let pnbBank: SignerWithAddress;

  const FLAG_STAKE = ethers.parseEther("0.05");
  const CONSORTIUM_SALT = 888777666555444333222111000999n;

  // Real Indian ID test cases (demo seed data)
  const FRAUD_SYNDICATE_PAN = "BKUPG8492Q";
  const FALSE_POSITIVE_PAN = "ABCDE9999Z";

  beforeEach(async () => {
    [admin, sbiBank, hdfcBank, iciciBank, axisBank, pnbBank] = await ethers.getSigners();

    const VerifierFactory = await ethers.getContractFactory("MockVerifier");
    verifier = await VerifierFactory.deploy();
    await verifier.waitForDeployment();

    const PoseidonFactory = await ethers.getContractFactory("PoseidonT3");
    const poseidonT3 = await PoseidonFactory.deploy();
    await poseidonT3.waitForDeployment();

    const RegistryFactory = await ethers.getContractFactory("FraudRegistry", {
      libraries: {
        PoseidonT3: await poseidonT3.getAddress(),
      },
    });
    registry = await RegistryFactory.deploy(
      await verifier.getAddress(),
      FLAG_STAKE,
      admin.address
    );
    await registry.waitForDeployment();

    const memberBankAddresses = [
      sbiBank.address,
      hdfcBank.address,
      iciciBank.address,
      axisBank.address,
      pnbBank.address,
    ];

    const DAOFactory = await ethers.getContractFactory("AppealDAO");
    appealDAO = await DAOFactory.deploy(
      await registry.getAddress(),
      admin.address,
      memberBankAddresses
    );
    await appealDAO.waitForDeployment();

    await registry.connect(admin).setAppealDAO(await appealDAO.getAddress());
    for (const bank of memberBankAddresses) {
      await registry.connect(admin).setBankAuthorization(bank, true);
    }
  });

  it("Executes full syndicate fraud detection and Ring Velocity acceleration across banks", async () => {
    const offchainTree = new KavachMerkleTree(20);
    await offchainTree.init();

    // 1. SBI identifies loan-stacking fraud on PAN BKUPG8492Q and flags it
    const leaf = await computeLeaf(normaliseId(FRAUD_SYNDICATE_PAN), CONSORTIUM_SALT);
    const { leafIndex } = await offchainTree.insert(leaf);

    const flagTx = await registry.connect(sbiBank).flagIdentity(
      leaf,
      Category.LOAN_STACKING,
      30n,
      { value: FLAG_STAKE }
    );
    await flagTx.wait();

    const onchainRoot = await registry.getRoot();
    const nullifier = await computeNullifier(leaf);

    // Initial Ring Velocity should be 0 before any bank queries
    expect(await registry.distinctBankHits(nullifier)).to.equal(0n);

    // 2. Fraudster attempts to originate a loan at HDFC Bank
    //    HDFC computes ZK proof from local applicant data without seeing SBI's flag identity
    const merkleProofHdfc = await offchainTree.generateProof(leafIndex);
    const zkProofHdfc = await createProofFromWitness(
      FRAUD_SYNDICATE_PAN,
      CONSORTIUM_SALT,
      merkleProofHdfc,
      { forceMock: true }
    );

    const hdfcQueryTx = await registry.connect(hdfcBank).recordHit(
      nullifier,
      zkProofHdfc.a,
      zkProofHdfc.b,
      zkProofHdfc.c,
      onchainRoot
    );
    await hdfcQueryTx.wait();

    // Ring Velocity is now 1
    expect(await registry.distinctBankHits(nullifier)).to.equal(1n);

    // 3. Fraudster immediately attempts an unsecured loan at ICICI Bank → Velocity 2
    const iciciQueryTx = await registry.connect(iciciBank).recordHit(
      nullifier,
      zkProofHdfc.a,
      zkProofHdfc.b,
      zkProofHdfc.c,
      onchainRoot
    );
    await iciciQueryTx.wait();

    // Ring Velocity escalates to 2 (Syndicate Alert threshold)
    expect(await registry.distinctBankHits(nullifier)).to.equal(2n);

    // 4. Fraudster hits Axis Bank → Velocity 3
    const axisQueryTx = await registry.connect(axisBank).recordHit(
      nullifier,
      zkProofHdfc.a,
      zkProofHdfc.b,
      zkProofHdfc.c,
      onchainRoot
    );
    await axisQueryTx.wait();

    expect(await registry.distinctBankHits(nullifier)).to.equal(3n);
  });

  it("Executes false-positive dispute, 2/3 consortium vote, and stake slashing via AppealDAO", async () => {
    const offchainTree = new KavachMerkleTree(20);
    await offchainTree.init();

    // 1. Axis Bank erroneously flags innocent citizen PAN ABCDE9999Z as doc forgery
    const leaf = await computeLeaf(normaliseId(FALSE_POSITIVE_PAN), CONSORTIUM_SALT);
    const { leafIndex } = await offchainTree.insert(leaf);

    await registry.connect(axisBank).flagIdentity(leaf, Category.DOC_FORGERY, 30n, { value: FLAG_STAKE });
    expect(await registry.isFlagActive(leaf)).to.be.true;

    // 2. PNB discovers false positive (confirmed by police FIR + fresh Aadhaar KYC) → Appeal
    const appealTx = await appealDAO
      .connect(pnbBank)
      .createAppeal(leaf, "ipfs://police-fir-and-aadhaar-kyc-verification");
    await appealTx.wait();

    const appealId = 1n;

    // 3. Consortium voting: 4 banks vote YES (SBI, HDFC, ICICI, PNB)
    await appealDAO.connect(sbiBank).voteAppeal(appealId, true);
    await appealDAO.connect(hdfcBank).voteAppeal(appealId, true);
    await appealDAO.connect(iciciBank).voteAppeal(appealId, true);
    await appealDAO.connect(pnbBank).voteAppeal(appealId, true);

    // 4. Execute appeal: revokes leaf and slashes Axis Bank's 0.05 ETH stake
    const proof = await offchainTree.generateProof(leafIndex);
    const daoBalBefore = await ethers.provider.getBalance(await appealDAO.getAddress());

    const execTx = await appealDAO.executeAppeal(appealId, proof.pathElements, proof.pathIndices);
    await execTx.wait();

    const daoBalAfter = await ethers.provider.getBalance(await appealDAO.getAddress());
    expect(daoBalAfter - daoBalBefore).to.equal(FLAG_STAKE);

    // Leaf is revoked in FraudRegistry
    const flag = await registry.flags(leaf);
    expect(flag.revoked).to.be.true;
    expect(await registry.isFlagActive(leaf)).to.be.false;

    // Off-chain tree mirrors the revocation – roots must match
    await offchainTree.remove(leafIndex);
    expect(await offchainTree.getRoot()).to.equal(await registry.getRoot());
  });
});
