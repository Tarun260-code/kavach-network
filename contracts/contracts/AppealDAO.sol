// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {FraudRegistry} from "./FraudRegistry.sol";

/**
 * @title AppealDAO
 * @author Kavach Network Consortium
 * @notice Consortium governance contract implementing one-bank-one-vote mechanics with a
 *         strict 2/3 quorum threshold to adjudicate disputed fraud flags, revoke commitments,
 *         and slash malicious or mistaken flaggers' stakes.
 */
contract AppealDAO {
    // --- Governance Constants ---
    uint48 public constant VOTING_PERIOD = 3 days;

    // --- State Variables ---
    FraudRegistry public fraudRegistry;
    address public consortiumAdmin;

    // Member bank registry
    address[] public memberBanks;
    mapping(address => bool) public isMemberBank;
    mapping(address => uint256) private _memberIndex;

    enum AppealStatus {
        Active,
        ResolvedSlashed,
        Rejected
    }

    struct Appeal {
        uint256 id;
        uint256 leaf;
        address initiatorBank;
        string evidenceURI;
        uint48 createdAt;
        uint48 deadline;
        uint32 votesFor;
        uint32 votesAgainst;
        AppealStatus status;
    }

    // Mapping appealId => Appeal
    mapping(uint256 => Appeal) public appeals;
    uint256 public appealCount;

    // Mapping appealId => bank address => hasVoted
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // --- Custom Errors ---
    error OnlyConsortiumAdmin();
    error OnlyMemberBank();
    error ZeroAddress();
    error BankAlreadyMember(address bank);
    error BankNotMember(address bank);
    error CannotRemoveLastBank();
    error AppealNotFound(uint256 appealId);
    error AppealNotActive(uint256 appealId);
    error VotingEnded(uint256 appealId, uint48 deadline);
    error VotingStillActive(uint256 appealId, uint48 deadline);
    error AlreadyVoted(uint256 appealId, address bank);
    error QuorumNotReached(uint256 votesFor, uint256 required);
    error AppealAlreadyExecuted();
    error FlagNotActiveInRegistry(uint256 leaf);
    error TransferFailed();

    // --- Events ---
    event MemberBankAdded(address indexed bank);
    event MemberBankRemoved(address indexed bank);
    event AppealCreated(
        uint256 indexed appealId,
        uint256 indexed leaf,
        address indexed initiator,
        string evidenceURI,
        uint48 deadline
    );
    event AppealVoted(uint256 indexed appealId, address indexed bank, bool support, uint32 currentVotesFor);
    event AppealExecuted(uint256 indexed appealId, uint256 indexed leaf, uint256 slashedAmount);
    event AppealRejected(uint256 indexed appealId, uint256 indexed leaf);
    event SlashedFundsReceived(uint256 amount, address indexed sender);

    modifier onlyAdmin() {
        if (msg.sender != consortiumAdmin) revert OnlyConsortiumAdmin();
        _;
    }

    modifier onlyBank() {
        if (!isMemberBank[msg.sender]) revert OnlyMemberBank();
        _;
    }

    /**
     * @notice Initializes AppealDAO with initial consortium member banks.
     * @param _fraudRegistry Address of the FraudRegistry contract.
     * @param _admin Consortium admin address.
     * @param _initialBanks Initial set of member bank addresses.
     */
    constructor(address payable _fraudRegistry, address _admin, address[] memory _initialBanks) {
        if (_fraudRegistry == address(0) || _admin == address(0)) revert ZeroAddress();

        fraudRegistry = FraudRegistry(_fraudRegistry);
        consortiumAdmin = _admin;

        for (uint256 i = 0; i < _initialBanks.length; ) {
            address bank = _initialBanks[i];
            if (bank == address(0)) revert ZeroAddress();
            if (isMemberBank[bank]) revert BankAlreadyMember(bank);

            isMemberBank[bank] = true;
            _memberIndex[bank] = memberBanks.length;
            memberBanks.push(bank);
            emit MemberBankAdded(bank);

            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Allows contract to receive slashed ETH stakes.
     */
    receive() external payable {
        emit SlashedFundsReceived(msg.value, msg.sender);
    }

    /**
     * @notice Enrolls a new member bank into the consortium DAO.
     * @param bank Address of the bank to enroll.
     */
    function addMemberBank(address bank) external onlyAdmin {
        if (bank == address(0)) revert ZeroAddress();
        if (isMemberBank[bank]) revert BankAlreadyMember(bank);

        isMemberBank[bank] = true;
        _memberIndex[bank] = memberBanks.length;
        memberBanks.push(bank);
        emit MemberBankAdded(bank);
    }

    /**
     * @notice Offboards a member bank from the consortium DAO.
     * @param bank Address of the bank to remove.
     */
    function removeMemberBank(address bank) external onlyAdmin {
        if (!isMemberBank[bank]) revert BankNotMember(bank);
        if (memberBanks.length <= 1) revert CannotRemoveLastBank();

        uint256 index = _memberIndex[bank];
        uint256 lastIndex = memberBanks.length - 1;

        if (index != lastIndex) {
            address lastBank = memberBanks[lastIndex];
            memberBanks[index] = lastBank;
            _memberIndex[lastBank] = index;
        }

        memberBanks.pop();
        delete isMemberBank[bank];
        delete _memberIndex[bank];

        emit MemberBankRemoved(bank);
    }

    /**
     * @notice Returns the total count of active member banks.
     */
    function totalMembers() public view returns (uint256) {
        return memberBanks.length;
    }

    /**
     * @notice Calculates the strict 2/3 supermajority threshold required to uphold an appeal.
     * @dev Uses ceiling formula: ceil(2 * N / 3) = (2 * N + 2) / 3.
     */
    function requiredQuorum() public view returns (uint256) {
        uint256 n = memberBanks.length;
        return (2 * n + 2) / 3;
    }

    /**
     * @notice Opens a formal dispute appeal against a flagged identity commitment.
     * @param leaf The commitment leaf to dispute.
     * @param evidenceURI IPFS or internal reference hash documenting why flag is disputed.
     * @return appealId The assigned dispute ID.
     */
    function createAppeal(uint256 leaf, string calldata evidenceURI) external onlyBank returns (uint256 appealId) {
        if (!fraudRegistry.isFlagActive(leaf)) revert FlagNotActiveInRegistry(leaf);

        appealCount += 1;
        appealId = appealCount;

        uint48 deadline = uint48(block.timestamp + VOTING_PERIOD);

        appeals[appealId] = Appeal({
            id: appealId,
            leaf: leaf,
            initiatorBank: msg.sender,
            evidenceURI: evidenceURI,
            createdAt: uint48(block.timestamp),
            deadline: deadline,
            votesFor: 0,
            votesAgainst: 0,
            status: AppealStatus.Active
        });

        emit AppealCreated(appealId, leaf, msg.sender, evidenceURI, deadline);
    }

    /**
     * @notice Casts a vote on an active appeal (one-bank-one-vote).
     * @param appealId Dispute appeal identifier.
     * @param support True to vote for revocation & slashing, false to uphold flag.
     */
    function voteAppeal(uint256 appealId, bool support) external onlyBank {
        Appeal storage appeal = appeals[appealId];
        if (appeal.createdAt == 0) revert AppealNotFound(appealId);
        if (appeal.status != AppealStatus.Active) revert AppealNotActive(appealId);
        if (block.timestamp > appeal.deadline) revert VotingEnded(appealId, appeal.deadline);
        if (hasVoted[appealId][msg.sender]) revert AlreadyVoted(appealId, msg.sender);

        hasVoted[appealId][msg.sender] = true;

        if (support) {
            appeal.votesFor += 1;
        } else {
            appeal.votesAgainst += 1;
        }

        emit AppealVoted(appealId, msg.sender, support, appeal.votesFor);
    }

    /**
     * @notice Executes an appeal once 2/3 supermajority quorum is achieved.
     *         Instructs FraudRegistry to zero the leaf and slash the flagger's stake.
     * @param appealId Dispute appeal identifier.
     * @param proofSiblings Merkle proof sibling hashes for the leaf to remove.
     * @param proofPathIndices Merkle proof binary path directions.
     */
    function executeAppeal(
        uint256 appealId,
        uint256[] calldata proofSiblings,
        uint8[] calldata proofPathIndices
    ) external {
        Appeal storage appeal = appeals[appealId];
        if (appeal.createdAt == 0) revert AppealNotFound(appealId);
        if (appeal.status != AppealStatus.Active) revert AppealNotActive(appealId);

        uint256 threshold = requiredQuorum();
        if (appeal.votesFor < threshold) {
            revert QuorumNotReached(appeal.votesFor, threshold);
        }

        appeal.status = AppealStatus.ResolvedSlashed;

        // Revoke leaf and slash stake to this DAO contract treasury
        uint256 slashedAmount = fraudRegistry.revokeLeaf(
            appeal.leaf,
            proofSiblings,
            proofPathIndices,
            address(this)
        );

        emit AppealExecuted(appealId, appeal.leaf, slashedAmount);
    }

    /**
     * @notice Rejects an appeal after voting deadline if 2/3 quorum was not achieved.
     * @param appealId Dispute appeal identifier.
     */
    function rejectAppeal(uint256 appealId) external {
        Appeal storage appeal = appeals[appealId];
        if (appeal.createdAt == 0) revert AppealNotFound(appealId);
        if (appeal.status != AppealStatus.Active) revert AppealNotActive(appealId);
        if (block.timestamp <= appeal.deadline) revert VotingStillActive(appealId, appeal.deadline);

        uint256 threshold = requiredQuorum();
        if (appeal.votesFor >= threshold) {
            revert AppealAlreadyExecuted();
        }

        appeal.status = AppealStatus.Rejected;
        emit AppealRejected(appealId, appeal.leaf);
    }

    /**
     * @notice Returns all enrolled member bank addresses.
     */
    function getMemberBanks() external view returns (address[] memory) {
        return memberBanks;
    }
}
