// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {InternalBinaryIMT, BinaryIMTData} from "@zk-kit/imt.sol/internal/InternalBinaryIMT.sol";
import {IVerifier} from "./interfaces/IVerifier.sol";

/**
 * @title FraudRegistry
 * @author Kavach Network Consortium
 * @notice Maintains an incremental Poseidon Merkle tree (depth 20) of confirmed fraud commitments,
 *         a 30-root historical ring buffer, Groth16 proof verification, economic staking,
 *         epoch TTL expiration, and cross-bank Ring Velocity nullifier tracking.
 *
 * @dev Leaf commitment scheme:
 *      leaf = Poseidon(idNumber, consortiumSalt)
 *
 *      Low-entropy vulnerability: Indian PAN (~41.5 bits) and Aadhaar-last-12 (~36.5 bits) are
 *      susceptible to brute-force rainbow-table attacks if committed naively as Poseidon(idNumber).
 *      A modern GPU can enumerate the entire PAN namespace in <72 hours. The consortiumSalt (256-bit
 *      uniform random scalar held off-chain by member banks via HSMs) raises attack complexity to
 *      2^254, defeating nation-state adversaries and quantum pre-image attacks.
 *
 *      Nullifier derivation: nullifier = Poseidon(leaf, 1)
 *      The domain separator constant 1 ensures nullifier != leaf and prevents linkage to tree position.
 *
 *      Ring Velocity = |{Bank_i : Bank_i has queried nullifier}|
 *      A velocity >= 2 indicates concurrent loan applications across banks using the same fraudulent identity.
 */
contract FraudRegistry {
    using InternalBinaryIMT for BinaryIMTData;

    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------

    /// @notice Depth of the incremental Poseidon Merkle tree (2^20 = 1,048,576 leaves).
    uint256 public constant TREE_DEPTH = 20;

    /// @notice Number of historical Merkle roots retained in the cyclic ring buffer.
    uint256 public constant ROOT_HISTORY_SIZE = 30;

    /// @notice Minimum economic stake required per fraud flag (0.05 ETH).
    uint256 public constant MIN_STAKE = 0.05 ether;

    uint48 public constant MIN_TTL = 1 days;
    uint48 public constant MAX_TTL = 365 days;

    // -------------------------------------------------------------------------
    // Enumerations
    // -------------------------------------------------------------------------

    /**
     * @notice Classification categories for flagged fraud commitments.
     * @dev Stored as uint8 to minimize gas. Values must remain stable across upgrades.
     */
    enum Category {
        SYNTHETIC_ID,   // 0 – Fabricated identity documents (fake PAN/Aadhaar)
        MULE_ACCOUNT,   // 1 – Account used to launder/receive fraudulent proceeds
        LOAN_STACKING,  // 2 – Simultaneous multi-lender unsecured loan applications
        DOC_FORGERY     // 3 – Tampered or forged KYC documentation
    }

    // -------------------------------------------------------------------------
    // Storage
    // -------------------------------------------------------------------------

    BinaryIMTData internal tree;
    IVerifier public verifier;
    address public appealDAO;
    address public consortiumAdmin;

    /// @notice Minimum stake that every flagIdentity call must supply.
    uint256 public immutable flagStake;

    // Cyclic ring buffer for the last ROOT_HISTORY_SIZE Merkle roots
    uint256[ROOT_HISTORY_SIZE] public roots;
    uint256 public rootIndex;

    /**
     * @notice Metadata stored for each fraud commitment leaf.
     * @param bank        Address of the member bank that filed the flag.
     * @param category    Fraud category enum value.
     * @param flaggedAt   Block timestamp when the flag was created.
     * @param expiresAt   Block timestamp when the flag epoch expires.
     * @param stake       ETH stake amount held in escrow (uint160 fits 2^128 ETH).
     * @param revoked     True if the AppealDAO has successfully revoked this flag.
     * @param pruned      True if the flag expired and was pruned by any caller.
     * @param leafIndex   Position in the Merkle tree where the commitment was inserted.
     */
    struct FlagRecord {
        address bank;
        Category category;
        uint48 flaggedAt;
        uint48 expiresAt;
        uint160 stake;
        bool revoked;
        bool pruned;
        uint256 leafIndex;
    }

    /// @notice Mapping from commitment leaf to its flag metadata.
    mapping(uint256 => FlagRecord) public flags;

    /// @notice nullifier => bank address => whether that bank has recorded a hit.
    mapping(uint256 => mapping(address => bool)) public hasBankQueried;

    /// @notice nullifier => number of distinct member banks that have recorded a hit (Ring Velocity).
    mapping(uint256 => uint256) public distinctBankHits;

    /// @notice Authorized consortium member bank addresses.
    mapping(address => bool) public isAuthorizedBank;

    // -------------------------------------------------------------------------
    // Custom Errors
    // -------------------------------------------------------------------------

    error OnlyConsortiumAdmin();
    error OnlyAppealDAO();
    error OnlyAuthorizedBank();
    error ZeroAddress();
    error InvalidStake(uint256 sent, uint256 required);
    error InvalidTTL(uint64 ttlDays, uint48 minDays, uint48 maxDays);
    error AlreadyFlagged(uint256 leaf);
    error FlagNotFound(uint256 leaf);
    error FlagAlreadyRevoked(uint256 leaf);
    error FlagAlreadyPruned(uint256 leaf);
    error FlagNotExpired(uint256 leaf, uint48 expiresAt);
    error UnknownRoot(uint256 root);
    error InvalidGroth16Proof();
    error TransferFailed();

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event VerifierUpdated(address indexed previousVerifier, address indexed newVerifier);
    event AppealDAOUpdated(address indexed previousDAO, address indexed newDAO);
    event BankAuthorizationUpdated(address indexed bank, bool authorized);

    /**
     * @notice Emitted when a fraud commitment is successfully inserted into the tree.
     * @param leaf     Poseidon(idNumber, consortiumSalt) commitment.
     * @param index    Leaf position in the Merkle tree.
     * @param bank     Member bank that submitted the flag.
     * @param category Fraud classification category.
     * @param newRoot  Updated Merkle root after insertion.
     */
    event IdentityFlagged(
        uint256 indexed leaf,
        uint256 index,
        address indexed bank,
        Category indexed category,
        uint256 newRoot
    );

    event LeafRevoked(uint256 indexed leaf, address indexed bank, uint256 slashedStake, address indexed recipient);
    event FlagPruned(uint256 indexed leaf, address indexed bank, uint256 refundedStake);

    /**
     * @notice Emitted when a member bank records a ZK membership proof hit for a nullifier.
     * @param nullifier      Poseidon(leaf, 1) deterministic public nullifier.
     * @param bank           Member bank that recorded the hit.
     * @param distinctBanks  Running total of distinct banks that have hit this nullifier (Ring Velocity).
     */
    event RingHit(
        uint256 indexed nullifier,
        address indexed bank,
        uint256 distinctBanks
    );

    event RootUpdated(uint256 indexed newRoot, uint256 ringBufferIndex);

    // -------------------------------------------------------------------------
    // Modifiers
    // -------------------------------------------------------------------------

    modifier onlyAdmin() {
        if (msg.sender != consortiumAdmin) revert OnlyConsortiumAdmin();
        _;
    }

    modifier onlyDAO() {
        if (msg.sender != appealDAO) revert OnlyAppealDAO();
        _;
    }

    modifier onlyBank() {
        if (!isAuthorizedBank[msg.sender]) revert OnlyAuthorizedBank();
        _;
    }

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    /**
     * @notice Initializes the FraudRegistry with a depth-20 Poseidon tree and ring buffer.
     * @param _verifier  Address of the Groth16 SnarkJS verifier contract.
     * @param _flagStake Amount in wei required to stake per fraud flag (must equal MIN_STAKE).
     * @param _admin     Consortium admin address.
     */
    constructor(address _verifier, uint256 _flagStake, address _admin) {
        if (_verifier == address(0) || _admin == address(0)) revert ZeroAddress();

        verifier = IVerifier(_verifier);
        flagStake = _flagStake;
        consortiumAdmin = _admin;

        tree._initWithDefaultZeroes(TREE_DEPTH);

        // Seed initial empty-tree root into ring buffer slot 0
        roots[0] = tree.root;
        rootIndex = 1;
        emit RootUpdated(tree.root, 0);
    }

    // -------------------------------------------------------------------------
    // Admin Configuration
    // -------------------------------------------------------------------------

    /**
     * @notice Sets the AppealDAO contract address.
     * @param _appealDAO Address of the AppealDAO contract.
     */
    function setAppealDAO(address _appealDAO) external onlyAdmin {
        if (_appealDAO == address(0)) revert ZeroAddress();
        address previous = appealDAO;
        appealDAO = _appealDAO;
        emit AppealDAOUpdated(previous, _appealDAO);
    }

    /**
     * @notice Updates the Groth16 verifier contract address.
     * @param _verifier New verifier contract address.
     */
    function setVerifier(address _verifier) external onlyAdmin {
        if (_verifier == address(0)) revert ZeroAddress();
        address previous = address(verifier);
        verifier = IVerifier(_verifier);
        emit VerifierUpdated(previous, _verifier);
    }

    /**
     * @notice Authorizes or deauthorizes a member bank.
     * @param bank       Address of the bank.
     * @param authorized True to authorize, false to deauthorize.
     */
    function setBankAuthorization(address bank, bool authorized) external onlyAdmin {
        if (bank == address(0)) revert ZeroAddress();
        isAuthorizedBank[bank] = authorized;
        emit BankAuthorizationUpdated(bank, authorized);
    }

    // -------------------------------------------------------------------------
    // Core: Flag Identity
    // -------------------------------------------------------------------------

    /**
     * @notice Flags a confirmed-fraud identity commitment. Requires ETH stake >= MIN_STAKE.
     * @dev    leaf = Poseidon(idNumber, consortiumSalt).
     *         Inserts the leaf into the depth-20 incremental Merkle tree,
     *         updates the 30-root ring buffer, and stores flag metadata.
     * @param leaf     The field element commitment (Poseidon hash of normalized ID + salt).
     * @param category Fraud classification as a {Category} enum value.
     * @param ttlDays  Flag epoch duration in days (1–365). Expired flags are ignored by consumers.
     * @return leafIndex Position of the inserted leaf in the Merkle tree.
     */
    function flagIdentity(
        uint256 leaf,
        uint8 category,
        uint64 ttlDays
    ) external payable onlyBank returns (uint256 leafIndex) {
        if (msg.value < MIN_STAKE) revert InvalidStake(msg.value, MIN_STAKE);
        if (ttlDays < 1 || ttlDays > 365) {
            revert InvalidTTL(ttlDays, 1, 365);
        }
        if (flags[leaf].flaggedAt != 0) revert AlreadyFlagged(leaf);

        Category cat = Category(category);

        leafIndex = tree.numberOfLeaves;
        uint256 newRoot = tree._insert(leaf);

        // Update ring buffer
        roots[rootIndex] = newRoot;
        emit RootUpdated(newRoot, rootIndex);
        rootIndex = (rootIndex + 1) % ROOT_HISTORY_SIZE;

        uint48 ttlSeconds = uint48(ttlDays) * 1 days;
        uint48 expiresAt = uint48(block.timestamp) + ttlSeconds;

        flags[leaf] = FlagRecord({
            bank: msg.sender,
            category: cat,
            flaggedAt: uint48(block.timestamp),
            expiresAt: expiresAt,
            stake: uint160(msg.value),
            revoked: false,
            pruned: false,
            leafIndex: leafIndex
        });

        emit IdentityFlagged(leaf, leafIndex, msg.sender, cat, newRoot);
    }

    // -------------------------------------------------------------------------
    // Core: Record ZK Hit (Ring Velocity)
    // -------------------------------------------------------------------------

    /**
     * @notice Verifies a Groth16 membership proof and records a distinct query hit for the nullifier.
     * @dev    Public inputs: input[0] = root, input[1] = nullifier.
     *         Duplicate hits from the same bank are idempotent and do not increment velocity.
     * @param nullifier The public nullifier (Poseidon(leaf, 1)) from the ZK proof.
     * @param a         Groth16 proof point a (G1).
     * @param b         Groth16 proof point b (G2).
     * @param c         Groth16 proof point c (G1).
     * @param root      The Merkle root the prover committed to (must be in the 30-root ring buffer).
     * @return velocity Current Ring Velocity for this nullifier (distinct querying bank count).
     */
    function recordHit(
        uint256 nullifier,
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256 root
    ) external onlyBank returns (uint256 velocity) {
        if (!isKnownRoot(root)) revert UnknownRoot(root);

        uint256[2] memory input = [root, nullifier];
        if (!verifier.verifyProof(a, b, c, input)) revert InvalidGroth16Proof();

        if (!hasBankQueried[nullifier][msg.sender]) {
            hasBankQueried[nullifier][msg.sender] = true;
            distinctBankHits[nullifier] += 1;
            emit RingHit(nullifier, msg.sender, distinctBankHits[nullifier]);
        }

        return distinctBankHits[nullifier];
    }

    /**
     * @notice Convenience overload matching the Groth16 verifier's packed input format.
     * @dev    input[0] = root, input[1] = nullifier.
     */
    function verifyAndRecordHit(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[2] calldata input
    ) external onlyBank returns (uint256 velocity) {
        uint256 root = input[0];
        uint256 nullifier = input[1];

        if (!isKnownRoot(root)) revert UnknownRoot(root);
        if (!verifier.verifyProof(a, b, c, input)) revert InvalidGroth16Proof();

        if (!hasBankQueried[nullifier][msg.sender]) {
            hasBankQueried[nullifier][msg.sender] = true;
            distinctBankHits[nullifier] += 1;
            emit RingHit(nullifier, msg.sender, distinctBankHits[nullifier]);
        }

        return distinctBankHits[nullifier];
    }

    // -------------------------------------------------------------------------
    // Core: Revoke Leaf (AppealDAO only)
    // -------------------------------------------------------------------------

    /**
     * @notice Revokes a flagged leaf (zeroes it in the tree) and slashes the flagger's stake.
     * @dev    Only callable by the AppealDAO contract upon successful 2/3 quorum vote.
     *         Zeroing the leaf invalidates any future ZK proofs that include the old leaf.
     * @param leaf              The commitment leaf to revoke.
     * @param proofSiblings     Merkle proof sibling hashes for removal.
     * @param proofPathIndices  Binary path direction flags for each tree level.
     * @param slashRecipient    Recipient of the slashed stake (DAO treasury).
     * @return slashedStake     The amount of stake transferred to slashRecipient.
     */
    function revokeLeaf(
        uint256 leaf,
        uint256[] calldata proofSiblings,
        uint8[] calldata proofPathIndices,
        address slashRecipient
    ) external onlyDAO returns (uint256 slashedStake) {
        FlagRecord storage record = flags[leaf];
        if (record.flaggedAt == 0) revert FlagNotFound(leaf);
        if (record.revoked) revert FlagAlreadyRevoked(leaf);
        if (record.pruned) revert FlagAlreadyPruned(leaf);

        record.revoked = true;
        slashedStake = record.stake;

        // Zero out the leaf in the Merkle tree; future proofs using the old leaf become invalid
        tree._remove(leaf, proofSiblings, proofPathIndices);

        roots[rootIndex] = tree.root;
        emit RootUpdated(tree.root, rootIndex);
        rootIndex = (rootIndex + 1) % ROOT_HISTORY_SIZE;

        emit LeafRevoked(leaf, record.bank, slashedStake, slashRecipient);

        (bool success, ) = slashRecipient.call{value: slashedStake}("");
        if (!success) revert TransferFailed();
    }

    // -------------------------------------------------------------------------
    // Epoch TTL: Prune Expired Flags
    // -------------------------------------------------------------------------

    /**
     * @notice Prunes an expired flag: zeroes the leaf and refunds stake to the original flagger.
     * @dev    Callable by any address after the flag epoch expires.
     * @param leaf             The commitment leaf to prune.
     * @param proofSiblings    Merkle proof sibling hashes.
     * @param proofPathIndices Binary path direction flags.
     */
    function pruneExpiredFlag(
        uint256 leaf,
        uint256[] calldata proofSiblings,
        uint8[] calldata proofPathIndices
    ) external {
        FlagRecord storage record = flags[leaf];
        if (record.flaggedAt == 0) revert FlagNotFound(leaf);
        if (record.revoked) revert FlagAlreadyRevoked(leaf);
        if (record.pruned) revert FlagAlreadyPruned(leaf);
        if (block.timestamp < record.expiresAt) revert FlagNotExpired(leaf, record.expiresAt);

        record.pruned = true;
        uint256 refund = record.stake;

        tree._remove(leaf, proofSiblings, proofPathIndices);

        roots[rootIndex] = tree.root;
        emit RootUpdated(tree.root, rootIndex);
        rootIndex = (rootIndex + 1) % ROOT_HISTORY_SIZE;

        emit FlagPruned(leaf, record.bank, refund);

        (bool success, ) = record.bank.call{value: refund}("");
        if (!success) revert TransferFailed();
    }

    // -------------------------------------------------------------------------
    // Views
    // -------------------------------------------------------------------------

    /**
     * @notice Checks whether a given Merkle root is in the last ROOT_HISTORY_SIZE roots.
     * @param root The root hash to verify.
     * @return True if known and valid.
     */
    function isKnownRoot(uint256 root) public view returns (bool) {
        if (root == 0) return false;
        if (root == tree.root) return true;
        for (uint256 i = 0; i < ROOT_HISTORY_SIZE; ) {
            if (roots[i] == root) return true;
            unchecked { ++i; }
        }
        return false;
    }

    /// @notice Returns the current active Merkle tree root.
    function getRoot() external view returns (uint256) {
        return tree.root;
    }

    /// @notice Returns the total number of leaves ever inserted.
    function getNumberOfLeaves() external view returns (uint256) {
        return tree.numberOfLeaves;
    }

    /// @notice Returns the full 30-root historical ring buffer.
    function getRingRoots() external view returns (uint256[ROOT_HISTORY_SIZE] memory) {
        return roots;
    }

    /**
     * @notice Returns true when a flag is active: exists, not revoked, not pruned, and not expired.
     * @param leaf The commitment leaf to check.
     */
    function isFlagActive(uint256 leaf) external view returns (bool) {
        FlagRecord memory record = flags[leaf];
        if (record.flaggedAt == 0) return false;
        if (record.revoked || record.pruned) return false;
        return block.timestamp <= record.expiresAt;
    }
}
