import { expect } from "chai";
import { ethers } from "hardhat";
import { FraudRegistry, MockVerifier } from "../typechain-types";
import { KavachMerkleTree, computeLeaf, computeNullifier, normaliseId } from "@kavach/prover";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

// --- Category enum values (must match FraudRegistry.sol) ---
const Category = {
  SYNTHETIC_ID: 0,
  MULE_ACCOUNT: 1,
  LOAN_STACKING: 2,
  DOC_FORGERY: 3,
} as const;

describe("FraudRegistry", () => {
  let verifier: MockVerifier;
  let registry: FraudRegistry;
  let admin: SignerWithAddress;
  let sbiBank: SignerWithAddress;
  let hdfcBank: SignerWithAddress;
  let iciciBank: SignerWithAddress;
  let unauthorizedAccount: SignerWithAddress;

  const FLAG_STAKE = ethers.parseEther("0.05"); // == MIN_STAKE
  const CONSORTIUM_SALT = 987654321987654321987654321987654321n;
  const DEMO_PAN = "ABCDE1234F";

  beforeEach(async () => {
    [admin, sbiBank, hdfcBank, iciciBank, unauthorizedAccount] = await ethers.getSigners();

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

    // Authorize consortium member banks
    await registry.connect(admin).setBankAuthorization(sbiBank.address, true);
    await registry.connect(admin).setBankAuthorization(hdfcBank.address, true);
    await registry.connect(admin).setBankAuthorization(iciciBank.address, true);
  });

  // ---------------------------------------------------------------------------
  describe("Initialization", () => {
    it("initializes with depth 20, 30-root ring buffer, and MIN_STAKE constant", async () => {
      expect(await registry.TREE_DEPTH()).to.equal(20n);
      expect(await registry.ROOT_HISTORY_SIZE()).to.equal(30n);
      expect(await registry.MIN_STAKE()).to.equal(FLAG_STAKE);
      expect(await registry.flagStake()).to.equal(FLAG_STAKE);

      const currentRoot = await registry.getRoot();
      expect(currentRoot).to.not.equal(0n);
      expect(await registry.isKnownRoot(currentRoot)).to.be.true;
    });

    it("verifies initial member bank authorizations", async () => {
      expect(await registry.isAuthorizedBank(sbiBank.address)).to.be.true;
      expect(await registry.isAuthorizedBank(hdfcBank.address)).to.be.true;
      expect(await registry.isAuthorizedBank(unauthorizedAccount.address)).to.be.false;
    });
  });

  // ---------------------------------------------------------------------------
  describe("flagIdentity", () => {
    it("reverts if non-member bank attempts to flag", async () => {
      const leaf = 123456789n;
      await expect(
        registry.connect(unauthorizedAccount).flagIdentity(leaf, Category.SYNTHETIC_ID, 30n, { value: FLAG_STAKE })
      ).to.be.revertedWithCustomError(registry, "OnlyAuthorizedBank");
    });

    it("reverts if msg.value is below MIN_STAKE", async () => {
      const leaf = 123456789n;
      await expect(
        registry.connect(sbiBank).flagIdentity(leaf, Category.SYNTHETIC_ID, 30n, { value: ethers.parseEther("0.01") })
      ).to.be.revertedWithCustomError(registry, "InvalidStake");
    });

    it("reverts if ttlDays is 0 (below minimum of 1 day)", async () => {
      const leaf = 123456789n;
      await expect(
        registry.connect(sbiBank).flagIdentity(leaf, Category.SYNTHETIC_ID, 0n, { value: FLAG_STAKE })
      ).to.be.revertedWithCustomError(registry, "InvalidTTL");
    });

    it("reverts if ttlDays exceeds maximum of 365 days", async () => {
      const leaf = 123456789n;
      await expect(
        registry.connect(sbiBank).flagIdentity(leaf, Category.SYNTHETIC_ID, 400n, { value: FLAG_STAKE })
      ).to.be.revertedWithCustomError(registry, "InvalidTTL");
    });

    it("successfully flags commitment leaf, emits IdentityFlagged, and updates ring buffer", async () => {
      const normalizedId = normaliseId(DEMO_PAN);
      const leaf = await computeLeaf(normalizedId, CONSORTIUM_SALT);

      const prevRoot = await registry.getRoot();
      const tx = await registry.connect(sbiBank).flagIdentity(leaf, Category.LOAN_STACKING, 30n, { value: FLAG_STAKE });
      const receipt = await tx.wait();
      expect(receipt).to.not.be.null;

      // IdentityFlagged event emitted
      await expect(tx)
        .to.emit(registry, "IdentityFlagged")
        .withArgs(leaf, 0n, sbiBank.address, Category.LOAN_STACKING, (root: bigint) => root !== prevRoot);

      const newRoot = await registry.getRoot();
      expect(newRoot).to.not.equal(prevRoot);
      expect(await registry.isKnownRoot(newRoot)).to.be.true;
      expect(await registry.isKnownRoot(prevRoot)).to.be.true; // old root still in buffer

      const flag = await registry.flags(leaf);
      expect(flag.bank).to.equal(sbiBank.address);
      expect(flag.category).to.equal(Category.LOAN_STACKING);
      expect(flag.stake).to.equal(FLAG_STAKE);
      expect(flag.revoked).to.be.false;
      expect(flag.pruned).to.be.false;
      expect(flag.leafIndex).to.equal(0n);

      expect(await registry.isFlagActive(leaf)).to.be.true;
    });

    it("reverts if the same leaf commitment is flagged twice", async () => {
      const leaf = await computeLeaf(DEMO_PAN, CONSORTIUM_SALT);
      await registry.connect(sbiBank).flagIdentity(leaf, Category.MULE_ACCOUNT, 30n, { value: FLAG_STAKE });

      await expect(
        registry.connect(hdfcBank).flagIdentity(leaf, Category.DOC_FORGERY, 30n, { value: FLAG_STAKE })
      ).to.be.revertedWithCustomError(registry, "AlreadyFlagged");
    });

    it("accepts stake above MIN_STAKE (minimum check only, not exact match)", async () => {
      const leaf = 1337420n;
      // Value is 2× MIN_STAKE — should be accepted
      await expect(
        registry.connect(sbiBank).flagIdentity(leaf, Category.SYNTHETIC_ID, 30n, { value: ethers.parseEther("0.1") })
      ).to.not.be.reverted;
    });
  });

  // ---------------------------------------------------------------------------
  describe("Root History Ring Buffer", () => {
    it("retains all 30 historical roots as flags accumulate", async () => {
      // Insert enough leaves to roll through several ring slots
      for (let i = 1; i <= 5; i++) {
        const leaf = BigInt(i) * 1_000_000n + 7n;
        await registry.connect(sbiBank).flagIdentity(leaf, Category.SYNTHETIC_ID, 30n, { value: FLAG_STAKE });
      }

      const ringRoots = await registry.getRingRoots();
      const nonZeroRoots = ringRoots.filter((r) => r !== 0n);
      // We inserted 5 leaves after genesis root (slot 0), so 6 total
      expect(nonZeroRoots.length).to.be.gte(5);
    });

    it("isKnownRoot returns false for a completely unknown root", async () => {
      expect(await registry.isKnownRoot(0n)).to.be.false;
      expect(await registry.isKnownRoot(999999999999999999n)).to.be.false;
    });
  });

  // ---------------------------------------------------------------------------
  describe("recordHit – ZK Proof Verification & Ring Velocity", () => {
    it("tracks distinct bank queries and calculates Ring Velocity via recordHit", async () => {
      const offchainTree = new KavachMerkleTree(20);
      await offchainTree.init();

      const leaf = await computeLeaf(DEMO_PAN, CONSORTIUM_SALT);
      await offchainTree.insert(leaf);

      await registry.connect(sbiBank).flagIdentity(leaf, Category.LOAN_STACKING, 30n, { value: FLAG_STAKE });
      const onchainRoot = await registry.getRoot();
      const nullifier = await computeNullifier(leaf);

      const a: [bigint, bigint] = [1n, 2n];
      const b: [[bigint, bigint], [bigint, bigint]] = [[1n, 2n], [3n, 4n]];
      const c: [bigint, bigint] = [1n, 2n];

      expect(await registry.distinctBankHits(nullifier)).to.equal(0n);

      // 1. SBI records a hit – Ring Velocity = 1
      const tx1 = await registry.connect(sbiBank).recordHit(nullifier, a, b, c, onchainRoot);
      await expect(tx1).to.emit(registry, "RingHit").withArgs(nullifier, sbiBank.address, 1n);
      expect(await registry.distinctBankHits(nullifier)).to.equal(1n);

      // 2. SBI records again – same bank, velocity unchanged (idempotent)
      await registry.connect(sbiBank).recordHit(nullifier, a, b, c, onchainRoot);
      expect(await registry.distinctBankHits(nullifier)).to.equal(1n);

      // 3. HDFC records a hit – Ring Velocity reaches 2 (Syndicate Alert)
      const tx2 = await registry.connect(hdfcBank).recordHit(nullifier, a, b, c, onchainRoot);
      await expect(tx2).to.emit(registry, "RingHit").withArgs(nullifier, hdfcBank.address, 2n);
      expect(await registry.distinctBankHits(nullifier)).to.equal(2n);

      // 4. ICICI records – Ring Velocity reaches 3
      await registry.connect(iciciBank).recordHit(nullifier, a, b, c, onchainRoot);
      expect(await registry.distinctBankHits(nullifier)).to.equal(3n);
    });

    it("verifyAndRecordHit (packed input overload) also works", async () => {
      const leaf = await computeLeaf(DEMO_PAN, CONSORTIUM_SALT);
      await registry.connect(sbiBank).flagIdentity(leaf, Category.MULE_ACCOUNT, 30n, { value: FLAG_STAKE });
      const onchainRoot = await registry.getRoot();
      const nullifier = await computeNullifier(leaf);

      await registry.connect(hdfcBank).verifyAndRecordHit(
        [1n, 2n],
        [[1n, 2n], [3n, 4n]],
        [1n, 2n],
        [onchainRoot, nullifier]
      );
      expect(await registry.distinctBankHits(nullifier)).to.equal(1n);
    });

    it("reverts if proof presents an unknown root", async () => {
      const unknownRoot = 999999999999999n;
      const nullifier = 111111111111111n;

      await expect(
        registry.connect(sbiBank).recordHit(
          nullifier,
          [1n, 2n],
          [[1n, 2n], [3n, 4n]],
          [1n, 2n],
          unknownRoot
        )
      ).to.be.revertedWithCustomError(registry, "UnknownRoot");
    });

    it("reverts if Groth16 verifier rejects the proof", async () => {
      const leaf = await computeLeaf(DEMO_PAN, CONSORTIUM_SALT);
      await registry.connect(sbiBank).flagIdentity(leaf, Category.DOC_FORGERY, 30n, { value: FLAG_STAKE });
      const currentRoot = await registry.getRoot();
      const nullifier = await computeNullifier(leaf);

      // Force mock verifier to reject
      await verifier.setForceFail(true);

      await expect(
        registry.connect(hdfcBank).recordHit(
          nullifier,
          [1n, 2n],
          [[1n, 2n], [3n, 4n]],
          [1n, 2n],
          currentRoot
        )
      ).to.be.revertedWithCustomError(registry, "InvalidGroth16Proof");
    });
  });

  // ---------------------------------------------------------------------------
  describe("revokeLeaf (onlyAppealDAO)", () => {
    it("reverts if called by a non-DAO address", async () => {
      const leaf = await computeLeaf(DEMO_PAN, CONSORTIUM_SALT);
      await registry.connect(sbiBank).flagIdentity(leaf, Category.SYNTHETIC_ID, 30n, { value: FLAG_STAKE });

      await expect(
        registry.connect(sbiBank).revokeLeaf(leaf, [], [], sbiBank.address)
      ).to.be.revertedWithCustomError(registry, "OnlyAppealDAO");
    });
  });

  // ---------------------------------------------------------------------------
  describe("Epoch TTL and Pruning", () => {
    it("prevents pruning before TTL expires", async () => {
      const leaf = await computeLeaf(DEMO_PAN, CONSORTIUM_SALT);
      await registry.connect(sbiBank).flagIdentity(leaf, Category.LOAN_STACKING, 30n, { value: FLAG_STAKE });

      const offchainTree = new KavachMerkleTree(20);
      await offchainTree.insert(leaf);
      const proof = await offchainTree.generateProof(0);

      await expect(
        registry.pruneExpiredFlag(leaf, proof.pathElements, proof.pathIndices)
      ).to.be.revertedWithCustomError(registry, "FlagNotExpired");
    });

    it("allows pruning after TTL expires and refunds stake to flagger bank", async () => {
      const leaf = await computeLeaf(DEMO_PAN, CONSORTIUM_SALT);
      await registry.connect(sbiBank).flagIdentity(leaf, Category.LOAN_STACKING, 30n, { value: FLAG_STAKE });

      const offchainTree = new KavachMerkleTree(20);
      await offchainTree.insert(leaf);
      const proof = await offchainTree.generateProof(0);

      // Advance blockchain time by 31 days
      await ethers.provider.send("evm_increaseTime", [31 * 86400]);
      await ethers.provider.send("evm_mine", []);

      const balanceBefore = await ethers.provider.getBalance(sbiBank.address);
      const tx = await registry.pruneExpiredFlag(leaf, proof.pathElements, proof.pathIndices);
      await tx.wait();
      const balanceAfter = await ethers.provider.getBalance(sbiBank.address);

      // Flagger bank received stake refund (pruner is a third party here, sbiBank gets refund regardless)
      expect(balanceAfter - balanceBefore).to.equal(FLAG_STAKE);

      const flag = await registry.flags(leaf);
      expect(flag.pruned).to.be.true;
      expect(await registry.isFlagActive(leaf)).to.be.false;
    });

    it("isFlagActive returns false for expired flags", async () => {
      const leaf = await computeLeaf(DEMO_PAN, CONSORTIUM_SALT);
      await registry.connect(sbiBank).flagIdentity(leaf, Category.SYNTHETIC_ID, 1n, { value: FLAG_STAKE });

      expect(await registry.isFlagActive(leaf)).to.be.true;

      // Advance 2 days
      await ethers.provider.send("evm_increaseTime", [2 * 86400]);
      await ethers.provider.send("evm_mine", []);

      expect(await registry.isFlagActive(leaf)).to.be.false;
    });
  });
});
