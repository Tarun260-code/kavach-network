import { expect } from "chai";
import { ethers } from "hardhat";
import { AppealDAO, FraudRegistry, MockVerifier } from "../typechain-types";
import { KavachMerkleTree, computeLeaf, normaliseId } from "@kavach/prover";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

// --- Category enum values (must match FraudRegistry.sol) ---
const Category = {
  SYNTHETIC_ID: 0,
  MULE_ACCOUNT: 1,
  LOAN_STACKING: 2,
  DOC_FORGERY: 3,
} as const;

describe("AppealDAO", () => {
  let verifier: MockVerifier;
  let registry: FraudRegistry;
  let appealDAO: AppealDAO;

  let admin: SignerWithAddress;
  let sbiBank: SignerWithAddress;
  let hdfcBank: SignerWithAddress;
  let iciciBank: SignerWithAddress;
  let axisBank: SignerWithAddress;
  let pnbBank: SignerWithAddress;
  let unauthorizedUser: SignerWithAddress;

  const FLAG_STAKE = ethers.parseEther("0.05");
  const CONSORTIUM_SALT = 112233445566778899001122334455n;
  const DISPUTED_PAN = "FGHIJ5678K";

  beforeEach(async () => {
    [admin, sbiBank, hdfcBank, iciciBank, axisBank, pnbBank, unauthorizedUser] =
      await ethers.getSigners();

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

    // Deploy AppealDAO with 5 consortium banks
    const initialBanks = [
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
      initialBanks
    );
    await appealDAO.waitForDeployment();

    // Link AppealDAO in registry and authorize member banks
    await registry.connect(admin).setAppealDAO(await appealDAO.getAddress());
    for (const bank of initialBanks) {
      await registry.connect(admin).setBankAuthorization(bank, true);
    }
  });

  // ---------------------------------------------------------------------------
  describe("Governance Parameters & Membership", () => {
    it("initializes with 5 member banks and computes 2/3 quorum correctly", async () => {
      expect(await appealDAO.totalMembers()).to.equal(5n);
      // ceil(2 * 5 / 3) = ceil(10/3) = 4
      expect(await appealDAO.requiredQuorum()).to.equal(4n);

      expect(await appealDAO.isMemberBank(sbiBank.address)).to.be.true;
      expect(await appealDAO.isMemberBank(unauthorizedUser.address)).to.be.false;
    });

    it("allows admin to add and remove member banks", async () => {
      await appealDAO.connect(admin).addMemberBank(unauthorizedUser.address);
      expect(await appealDAO.isMemberBank(unauthorizedUser.address)).to.be.true;
      expect(await appealDAO.totalMembers()).to.equal(6n);

      await appealDAO.connect(admin).removeMemberBank(unauthorizedUser.address);
      expect(await appealDAO.isMemberBank(unauthorizedUser.address)).to.be.false;
      expect(await appealDAO.totalMembers()).to.equal(5n);
    });

    it("computes correct quorum for various member counts", async () => {
      // 3 members: ceil(6/3) = 2
      await appealDAO.connect(admin).removeMemberBank(axisBank.address);
      await appealDAO.connect(admin).removeMemberBank(pnbBank.address);
      expect(await appealDAO.totalMembers()).to.equal(3n);
      expect(await appealDAO.requiredQuorum()).to.equal(2n);

      // 4 members: ceil(8/3) = 3
      await appealDAO.connect(admin).addMemberBank(axisBank.address);
      expect(await appealDAO.totalMembers()).to.equal(4n);
      expect(await appealDAO.requiredQuorum()).to.equal(3n);
    });
  });

  // ---------------------------------------------------------------------------
  describe("Dispute Creation", () => {
    it("reverts if non-member bank attempts to open an appeal", async () => {
      await expect(
        appealDAO.connect(unauthorizedUser).createAppeal(12345n, "ipfs://evidence-hash")
      ).to.be.revertedWithCustomError(appealDAO, "OnlyMemberBank");
    });

    it("reverts if target leaf is not actively flagged in FraudRegistry", async () => {
      const nonExistentLeaf = 999999999n;
      await expect(
        appealDAO.connect(hdfcBank).createAppeal(nonExistentLeaf, "ipfs://false-positive")
      ).to.be.revertedWithCustomError(appealDAO, "FlagNotActiveInRegistry");
    });

    it("allows a member bank to create an appeal for a flagged commitment", async () => {
      const leaf = await computeLeaf(normaliseId(DISPUTED_PAN), CONSORTIUM_SALT);
      await registry.connect(sbiBank).flagIdentity(leaf, Category.LOAN_STACKING, 30n, { value: FLAG_STAKE });

      const tx = await appealDAO.connect(hdfcBank).createAppeal(leaf, "ipfs://disputed-identity-kyc");
      await expect(tx)
        .to.emit(appealDAO, "AppealCreated")
        .withArgs(1n, leaf, hdfcBank.address, "ipfs://disputed-identity-kyc", (d: bigint) => d > 0n);

      const appeal = await appealDAO.appeals(1n);
      expect(appeal.id).to.equal(1n);
      expect(appeal.leaf).to.equal(leaf);
      expect(appeal.initiatorBank).to.equal(hdfcBank.address);
      expect(appeal.votesFor).to.equal(0n);
      expect(appeal.votesAgainst).to.equal(0n);
      expect(appeal.status).to.equal(0n); // Active
    });
  });

  // ---------------------------------------------------------------------------
  describe("Voting & 2/3 Quorum Slashing Execution", () => {
    let disputedLeaf: bigint;
    let offchainTree: KavachMerkleTree;

    beforeEach(async () => {
      offchainTree = new KavachMerkleTree(20);
      disputedLeaf = await computeLeaf(normaliseId(DISPUTED_PAN), CONSORTIUM_SALT);

      await offchainTree.insert(disputedLeaf);
      await registry.connect(sbiBank).flagIdentity(disputedLeaf, Category.SYNTHETIC_ID, 30n, { value: FLAG_STAKE });

      // HDFC opens appeal
      await appealDAO.connect(hdfcBank).createAppeal(disputedLeaf, "ipfs://dispute-evidence");
    });

    it("enforces one-bank-one-vote mechanics", async () => {
      await appealDAO.connect(hdfcBank).voteAppeal(1n, true);

      // Same bank voting again should revert
      await expect(
        appealDAO.connect(hdfcBank).voteAppeal(1n, true)
      ).to.be.revertedWithCustomError(appealDAO, "AlreadyVoted");

      // Non-member voting should revert
      await expect(
        appealDAO.connect(unauthorizedUser).voteAppeal(1n, true)
      ).to.be.revertedWithCustomError(appealDAO, "OnlyMemberBank");
    });

    it("reverts execution when 2/3 quorum is not yet met (3 of 5 is insufficient)", async () => {
      const proof = await offchainTree.generateProof(0);

      // Only 3 banks vote yes (threshold for 5 banks is 4)
      await appealDAO.connect(hdfcBank).voteAppeal(1n, true);
      await appealDAO.connect(iciciBank).voteAppeal(1n, true);
      await appealDAO.connect(axisBank).voteAppeal(1n, true);

      await expect(
        appealDAO.executeAppeal(1n, proof.pathElements, proof.pathIndices)
      ).to.be.revertedWithCustomError(appealDAO, "QuorumNotReached");
    });

    it("executes appeal on 4/5 votes, revokes leaf via revokeLeaf, and slashes stake to DAO treasury", async () => {
      const proof = await offchainTree.generateProof(0);

      // 4 banks cast supporting votes (meeting 2/3 quorum threshold of 4)
      await appealDAO.connect(hdfcBank).voteAppeal(1n, true);
      await appealDAO.connect(iciciBank).voteAppeal(1n, true);
      await appealDAO.connect(axisBank).voteAppeal(1n, true);
      await appealDAO.connect(pnbBank).voteAppeal(1n, true);

      const daoBalanceBefore = await ethers.provider.getBalance(await appealDAO.getAddress());

      const tx = await appealDAO.executeAppeal(1n, proof.pathElements, proof.pathIndices);
      await expect(tx)
        .to.emit(appealDAO, "AppealExecuted")
        .withArgs(1n, disputedLeaf, FLAG_STAKE);

      // LeafRevoked event from FraudRegistry
      await expect(tx)
        .to.emit(registry, "LeafRevoked");

      const daoBalanceAfter = await ethers.provider.getBalance(await appealDAO.getAddress());
      expect(daoBalanceAfter - daoBalanceBefore).to.equal(FLAG_STAKE);

      // Verify flag is now revoked in registry
      const flag = await registry.flags(disputedLeaf);
      expect(flag.revoked).to.be.true;
      expect(await registry.isFlagActive(disputedLeaf)).to.be.false;

      // Status in DAO is now ResolvedSlashed
      const appeal = await appealDAO.appeals(1n);
      expect(appeal.status).to.equal(1n); // ResolvedSlashed
    });

    it("allows voting against (defend flag) and tracks votesAgainst", async () => {
      await appealDAO.connect(sbiBank).voteAppeal(1n, false); // SBI defends its flag
      await appealDAO.connect(hdfcBank).voteAppeal(1n, true);

      const appeal = await appealDAO.appeals(1n);
      expect(appeal.votesFor).to.equal(1n);
      expect(appeal.votesAgainst).to.equal(1n);
    });

    it("rejects appeal after deadline when quorum is not met", async () => {
      const proof = await offchainTree.generateProof(0);

      // Only 1 vote cast – not enough for quorum
      await appealDAO.connect(hdfcBank).voteAppeal(1n, true);

      // Fast-forward past voting period (3 days)
      await ethers.provider.send("evm_increaseTime", [3 * 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine", []);

      // executeAppeal should still revert due to insufficient votes
      await expect(
        appealDAO.executeAppeal(1n, proof.pathElements, proof.pathIndices)
      ).to.be.revertedWithCustomError(appealDAO, "QuorumNotReached");

      // rejectAppeal should succeed
      const tx = await appealDAO.rejectAppeal(1n);
      await expect(tx).to.emit(appealDAO, "AppealRejected").withArgs(1n, disputedLeaf);

      const appeal = await appealDAO.appeals(1n);
      expect(appeal.status).to.equal(2n); // Rejected
    });

    it("reverts voting after the voting window closes", async () => {
      // Fast-forward past voting period
      await ethers.provider.send("evm_increaseTime", [3 * 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        appealDAO.connect(sbiBank).voteAppeal(1n, true)
      ).to.be.revertedWithCustomError(appealDAO, "VotingEnded");
    });
  });
});
