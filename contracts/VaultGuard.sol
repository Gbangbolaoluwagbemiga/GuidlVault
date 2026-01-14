// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

interface IReputationSBT {
    function mintResearcher(address to) external;
    function mintJudge(address to) external;
}

import "./IYieldStrategy.sol";

/**
 * @title VaultGuard
 * @notice Decentralized bug bounty platform where protocols deposit funds
 * and security researchers submit vulnerabilities for review and automatic payout
 */
contract VaultGuard is ReentrancyGuard, EIP712 {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;
    
    // Enums
    enum Severity { LOW, MEDIUM, HIGH, CRITICAL }
    enum SubmissionStatus { PENDING, APPROVED, REJECTED, PAID }
    
    // Structs
    struct BountyVault {
        address protocol;
        uint256 totalDeposit;
        uint256 remainingFunds;
        bool active;
        address[] judges;
        uint256 requiredApprovals;
        mapping(Severity => uint256) payoutPercentages; // percentage of totalDeposit
        mapping(Severity => uint256) minPayouts;
        address yieldStrategy;
    }
    
    struct Submission {
        uint256 vaultId;
        address researcher;
        string reportHash; // IPFS hash of the encrypted report
        Severity severity;
        uint256 timestamp;
        SubmissionStatus status;
        uint256 approvalCount;
        uint256 payoutAmount;
        uint256 platformFeeAmount;
        // commit-reveal
        bytes32 commitHash;
        bool revealed;
        uint256 revealDeadline;
        uint256 votingDeadline;
        mapping(address => bool) voteApproved;
        mapping(address => bool) hasVoted;
    }
    
    // State variables
    uint256 public vaultCount;
    uint256 public submissionCount;
    uint256 public platformFee = 250; // 2.5% in basis points (out of 10000)
    address public platformWallet;
    
    mapping(uint256 => BountyVault) public vaults;
    mapping(uint256 => Submission) public submissions;
    mapping(uint256 => uint256[]) public vaultSubmissions; // vaultId => submissionIds[]
    struct VaultAsset { address token; bool isNative; }
    mapping(uint256 => VaultAsset) public vaultAssets;
    address public reputationSBT;
    bytes32 private constant VOTE_TYPEHASH = keccak256("Vote(uint256 submissionId,address judge,bool approved)");
    
    // Events
    event VaultCreated(uint256 indexed vaultId, address indexed protocol, uint256 deposit);
    event FundsDeposited(uint256 indexed vaultId, uint256 amount);
    event SubmissionCreated(uint256 indexed submissionId, uint256 indexed vaultId, address indexed researcher);
    event SubmissionVoted(uint256 indexed submissionId, address indexed judge, bool approved);
    event SubmissionApproved(uint256 indexed submissionId, uint256 payoutAmount);
    event SubmissionRejected(uint256 indexed submissionId);
    event PayoutSent(uint256 indexed submissionId, address indexed researcher, uint256 amount);
    event VaultClosed(uint256 indexed vaultId, uint256 remainingFunds);
    
    // Modifiers
    modifier onlyProtocol(uint256 _vaultId) {
        require(vaults[_vaultId].protocol == msg.sender, "Not vault owner");
        _;
    }
    
    modifier onlyJudge(uint256 _vaultId) {
        bool isJudge = false;
        for(uint i = 0; i < vaults[_vaultId].judges.length; i++) {
            if(vaults[_vaultId].judges[i] == msg.sender) {
                isJudge = true;
                break;
            }
        }
        require(isJudge, "Not a judge");
        _;
    }
    
    modifier vaultActive(uint256 _vaultId) {
        require(vaults[_vaultId].active, "Vault not active");
        _;
    }
    
    constructor(address _platformWallet) EIP712("VaultGuard", "1") {
        require(_platformWallet != address(0), "Invalid platform wallet");
        platformWallet = _platformWallet;
    }

    function setReputationSBT(address _sbt) external {
        require(msg.sender == platformWallet, "Not platform");
        reputationSBT = _sbt;
    }

    
    /**
     * @notice Create a new bug bounty vault
     * @param _judges Array of judge addresses who will verify submissions
     * @param _requiredApprovals Number of approvals needed for payout
     * @param _payouts Array of payout percentages [LOW, MEDIUM, HIGH, CRITICAL]
     */
    function createVault(
        address[] memory _judges,
        uint256 _requiredApprovals,
        uint256[4] memory _payouts
    ) external payable returns (uint256) {
        require(msg.value > 0, "Must deposit funds");
        require(_judges.length >= _requiredApprovals, "Invalid approval threshold");
        require(_requiredApprovals > 0, "Need at least 1 approval");
        require(_payouts[0] <= 1000 && _payouts[1] <= 2500 && _payouts[2] <= 5000 && _payouts[3] <= 10000, "Invalid payout percentages");
        
        uint256 vaultId = vaultCount++;
        BountyVault storage vault = vaults[vaultId];
        
        vault.protocol = msg.sender;
        vault.totalDeposit = msg.value;
        vault.remainingFunds = msg.value;
        vault.active = true;
        vault.judges = _judges;
        vault.requiredApprovals = _requiredApprovals;
        
        // Set payout percentages for each severity
        vault.payoutPercentages[Severity.LOW] = _payouts[0];
        vault.payoutPercentages[Severity.MEDIUM] = _payouts[1];
        vault.payoutPercentages[Severity.HIGH] = _payouts[2];
        vault.payoutPercentages[Severity.CRITICAL] = _payouts[3];
        
        vaultAssets[vaultId] = VaultAsset(address(0), true);
        emit VaultCreated(vaultId, msg.sender, msg.value);
        return vaultId;
    }

    function createERC20Vault(
        address _token,
        address[] memory _judges,
        uint256 _requiredApprovals,
        uint256[4] memory _payouts,
        uint256 _initialAmount
    ) external returns (uint256) {
        require(_token != address(0), "Invalid token");
        require(_initialAmount > 0, "Must deposit funds");
        require(_judges.length >= _requiredApprovals, "Invalid approval threshold");
        require(_requiredApprovals > 0, "Need at least 1 approval");
        require(_payouts[0] <= 1000 && _payouts[1] <= 2500 && _payouts[2] <= 5000 && _payouts[3] <= 10000, "Invalid payout percentages");

        uint256 vaultId = vaultCount++;
        BountyVault storage vault = vaults[vaultId];

        vault.protocol = msg.sender;
        vault.totalDeposit = _initialAmount;
        vault.remainingFunds = _initialAmount;
        vault.active = true;
        vault.judges = _judges;
        vault.requiredApprovals = _requiredApprovals;

        vault.payoutPercentages[Severity.LOW] = _payouts[0];
        vault.payoutPercentages[Severity.MEDIUM] = _payouts[1];
        vault.payoutPercentages[Severity.HIGH] = _payouts[2];
        vault.payoutPercentages[Severity.CRITICAL] = _payouts[3];

        vaultAssets[vaultId] = VaultAsset(_token, false);
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _initialAmount);

        emit VaultCreated(vaultId, msg.sender, _initialAmount);
        return vaultId;
    }
    
    /**
     * @notice Deposit additional funds to an existing vault
     */
    function depositFunds(uint256 _vaultId) external payable onlyProtocol(_vaultId) vaultActive(_vaultId) {
        require(msg.value > 0, "Must send funds");
        
        vaults[_vaultId].totalDeposit += msg.value;
        vaults[_vaultId].remainingFunds += msg.value;
        
        emit FundsDeposited(_vaultId, msg.value);
        emit FundsDeposited(_vaultId, msg.value);
    }
    
    function setYieldStrategy(uint256 _vaultId, address _strategy) external onlyProtocol(_vaultId) {
        BountyVault storage vault = vaults[_vaultId];
        VaultAsset memory asset = vaultAssets[_vaultId];
        require(!asset.isNative, "Native vaults not supported");
        
        // If there was a previous strategy, withdraw everything first
        if (vault.yieldStrategy != address(0)) {
            uint256 balance = IYieldStrategy(vault.yieldStrategy).balanceOf(address(this));
            if (balance > 0) {
                IYieldStrategy(vault.yieldStrategy).withdraw(balance, address(this));
            }
        }
        
        vault.yieldStrategy = _strategy;
        
        // Deposit existing funds into new strategy if set
        if (_strategy != address(0)) {
            require(IYieldStrategy(_strategy).asset() == asset.token, "Invalid strategy asset");
            IERC20(asset.token).approve(_strategy, vault.remainingFunds);
            IYieldStrategy(_strategy).deposit(vault.remainingFunds);
        }
    }

    function depositFundsERC20(uint256 _vaultId, uint256 _amount) external onlyProtocol(_vaultId) vaultActive(_vaultId) {
        require(_amount > 0, "Must send funds");
        VaultAsset memory asset = vaultAssets[_vaultId];
        require(!asset.isNative && asset.token != address(0), "Invalid vault asset");
        
        IERC20(asset.token).safeTransferFrom(msg.sender, address(this), _amount);
        
        BountyVault storage vault = vaults[_vaultId];
        vault.totalDeposit += _amount;
        vault.remainingFunds += _amount;
        
        // Auto-deposit to strategy if set
        if (vault.yieldStrategy != address(0)) {
            IERC20(asset.token).approve(vault.yieldStrategy, _amount);
            IYieldStrategy(vault.yieldStrategy).deposit(_amount);
        }
        
        emit FundsDeposited(_vaultId, _amount);
    }
    
    /**
     * @notice Submit a vulnerability report
     * @param _vaultId Target vault ID
     * @param _reportHash IPFS hash of encrypted vulnerability report
     * @param _severity Claimed severity level
     */
    function submitVulnerability(
        uint256 _vaultId,
        string memory _reportHash,
        Severity _severity
    ) external vaultActive(_vaultId) returns (uint256) {
        require(bytes(_reportHash).length > 0, "Report hash required");
        
        uint256 submissionId = submissionCount++;
        Submission storage submission = submissions[submissionId];
        
        submission.vaultId = _vaultId;
        submission.researcher = msg.sender;
        submission.reportHash = _reportHash;
        submission.severity = _severity;
        submission.timestamp = block.timestamp;
        submission.status = SubmissionStatus.PENDING;
        submission.votingDeadline = block.timestamp + 3 days;
        
        vaultSubmissions[_vaultId].push(submissionId);
        
        emit SubmissionCreated(submissionId, _vaultId, msg.sender);
        return submissionId;
    }

    event SubmissionCommitted(uint256 indexed submissionId, uint256 indexed vaultId, address indexed researcher);
    event SubmissionRevealed(uint256 indexed submissionId);
    event SubmissionExpired(uint256 indexed submissionId);

    function commitSubmission(uint256 _vaultId, bytes32 _commit) external vaultActive(_vaultId) returns (uint256) {
        require(_commit != bytes32(0), "Commit required");
        uint256 submissionId = submissionCount++;
        Submission storage submission = submissions[submissionId];
        submission.vaultId = _vaultId;
        submission.researcher = msg.sender;
        submission.commitHash = _commit;
        submission.timestamp = block.timestamp;
        submission.status = SubmissionStatus.PENDING;
        submission.revealDeadline = block.timestamp + 2 days;
        vaultSubmissions[_vaultId].push(submissionId);
        emit SubmissionCommitted(submissionId, _vaultId, msg.sender);
        return submissionId;
    }

    function revealSubmission(
        uint256 _submissionId,
        string memory _reportHash,
        Severity _severity,
        bytes32 _salt
    ) external {
        Submission storage submission = submissions[_submissionId];
        require(submission.researcher == msg.sender, "Not the researcher");
        require(!submission.revealed, "Already revealed");
        require(submission.revealDeadline >= block.timestamp, "Reveal expired");
        bytes32 computed = keccak256(abi.encode(submission.vaultId, submission.researcher, _reportHash, _severity, _salt));
        require(computed == submission.commitHash, "Invalid reveal");
        submission.reportHash = _reportHash;
        submission.severity = _severity;
        submission.revealed = true;
        submission.votingDeadline = block.timestamp + 3 days;
        emit SubmissionRevealed(_submissionId);
    }
    
    /**
     * @notice Judge votes on a submission
     * @param _submissionId Submission to vote on
     * @param _approved True to approve, false to reject
     */
    function voteOnSubmission(
        uint256 _submissionId,
        bool _approved
    ) external {
        Submission storage submission = submissions[_submissionId];
        require(submission.status == SubmissionStatus.PENDING, "Not pending");
        require(submission.votingDeadline == 0 || block.timestamp <= submission.votingDeadline, "Voting closed");
        
        uint256 vaultId = submission.vaultId;
        require(vaults[vaultId].active, "Vault not active");
        
        // Check if caller is a judge
        bool isJudge = false;
        for(uint i = 0; i < vaults[vaultId].judges.length; i++) {
            if(vaults[vaultId].judges[i] == msg.sender) {
                isJudge = true;
                break;
            }
        }
        require(isJudge, "Not a judge");
        require(!submission.hasVoted[msg.sender], "Already voted");
        
        submission.hasVoted[msg.sender] = true;
        submission.voteApproved[msg.sender] = _approved;
        
        if(_approved) {
            submission.approvalCount++;
            emit SubmissionVoted(_submissionId, msg.sender, true);
            
            // Check if threshold reached
            if(submission.approvalCount >= vaults[vaultId].requiredApprovals) {
                _approveSubmission(_submissionId);
            }
        } else {
            // If any judge rejects, submission is rejected
            submission.status = SubmissionStatus.REJECTED;
            emit SubmissionRejected(_submissionId);
        }
    }

    function _hashVote(uint256 _submissionId, address _judge) internal view returns (bytes32) {
        bytes32 structHash = keccak256(abi.encode(VOTE_TYPEHASH, _submissionId, _judge, true));
        return _hashTypedDataV4(structHash);
    }

    function submitAggregatedVotes(
        uint256 _submissionId,
        address[] calldata _judges,
        bytes[] calldata _signatures
    ) external {
        require(_judges.length == _signatures.length, "Length mismatch");
        Submission storage submission = submissions[_submissionId];
        require(submission.status == SubmissionStatus.PENDING, "Not pending");
        require(submission.votingDeadline == 0 || block.timestamp <= submission.votingDeadline, "Voting closed");
        uint256 vaultId = submission.vaultId;
        require(vaults[vaultId].active, "Vault not active");
        for (uint i = 0; i < _judges.length; i++) {
            address judge = _judges[i];
            bool isJudge = false;
            for(uint j = 0; j < vaults[vaultId].judges.length; j++) {
                if(vaults[vaultId].judges[j] == judge) { isJudge = true; break; }
            }
            require(isJudge, "Not a judge");
            require(!submission.hasVoted[judge], "Already voted");
            bytes32 digest = _hashVote(_submissionId, judge);
            address signer = ECDSA.recover(digest, _signatures[i]);
            require(signer == judge, "Bad signature");
            submission.hasVoted[judge] = true;
            submission.voteApproved[judge] = true;
            submission.approvalCount++;
            emit SubmissionVoted(_submissionId, judge, true);
        }
        if(submission.approvalCount >= vaults[vaultId].requiredApprovals && submission.status == SubmissionStatus.PENDING) {
            _approveSubmission(_submissionId);
        }
    }

    function finalizeSubmission(uint256 _submissionId) external {
        Submission storage submission = submissions[_submissionId];
        require(submission.status == SubmissionStatus.PENDING, "Not pending");
        require(submission.votingDeadline != 0 && block.timestamp > submission.votingDeadline, "Not expired");
        submission.status = SubmissionStatus.REJECTED;
        emit SubmissionExpired(_submissionId);
    }
    
    /**
     * @notice Internal function to approve submission and calculate payout
     */
    function _approveSubmission(uint256 _submissionId) internal {
        Submission storage submission = submissions[_submissionId];
        uint256 vaultId = submission.vaultId;
        BountyVault storage vault = vaults[vaultId];
        
        // Calculate payout based on severity
        uint256 baseAmount = (vault.remainingFunds * vault.payoutPercentages[submission.severity]) / 10000;
        uint256 minFloor = vault.minPayouts[submission.severity];
        if (baseAmount < minFloor) {
            require(vault.remainingFunds >= minFloor, "Insufficient vault funds");
            baseAmount = minFloor;
        }
        uint256 platformCut = (baseAmount * platformFee) / 10000;
        uint256 researcherPayout = baseAmount - platformCut;
        
        require(vault.remainingFunds >= baseAmount, "Insufficient vault funds");
        
        submission.status = SubmissionStatus.APPROVED;
        submission.payoutAmount = researcherPayout;
        submission.platformFeeAmount = platformCut;
        
        vault.remainingFunds -= baseAmount;
        
        emit SubmissionApproved(_submissionId, researcherPayout);

        if (reputationSBT != address(0)) {
            address[] memory js = vault.judges;
            for (uint i = 0; i < js.length; i++) {
                if (submission.voteApproved[js[i]]) {
                    IReputationSBT(reputationSBT).mintJudge(js[i]);
                }
            }
        }
    }
    
    /**
     * @notice Claim payout for approved submission
     */
    function claimPayout(uint256 _submissionId) external nonReentrant {
        Submission storage submission = submissions[_submissionId];
        require(submission.researcher == msg.sender, "Not the researcher");
        require(submission.status == SubmissionStatus.APPROVED, "Not approved");
        
        submission.status = SubmissionStatus.PAID;
        
        uint256 researcherPayout = submission.payoutAmount;
        uint256 vaultId = submission.vaultId;
        BountyVault storage vault = vaults[vaultId];
        VaultAsset memory asset = vaultAssets[vaultId];
        uint256 platformCut = submission.platformFeeAmount;
        uint256 totalNeeded = researcherPayout + platformCut;

        // If strategy exists, withdraw needed funds
        if (vault.yieldStrategy != address(0) && !asset.isNative) {
             IYieldStrategy(vault.yieldStrategy).withdraw(totalNeeded, address(this));
        }
        
        // Transfer funds
        if (asset.isNative) {
            (bool success1, ) = payable(msg.sender).call{value: researcherPayout}("");
            require(success1, "Transfer to researcher failed");
            (bool success2, ) = payable(platformWallet).call{value: platformCut}("");
            require(success2, "Transfer to platform failed");
        } else {
            IERC20(asset.token).safeTransfer(msg.sender, researcherPayout);
            IERC20(asset.token).safeTransfer(platformWallet, platformCut);
        }
        
        emit PayoutSent(_submissionId, msg.sender, researcherPayout);

        if (reputationSBT != address(0)) {
            IReputationSBT(reputationSBT).mintResearcher(msg.sender);
        }
    }
    
    /**
     * @notice Close vault and withdraw remaining funds
     */
    function closeVault(uint256 _vaultId) external onlyProtocol(_vaultId) nonReentrant {
        BountyVault storage vault = vaults[_vaultId];
        require(vault.active, "Already closed");
        
        vault.active = false;
        uint256 remaining = vault.remainingFunds;
        vault.remainingFunds = 0;
        VaultAsset memory asset = vaultAssets[_vaultId];
        if(remaining > 0) {
            if (asset.isNative) {
                (bool success, ) = payable(msg.sender).call{value: remaining}("");
                require(success, "Transfer failed");
            } else {
                IERC20(asset.token).safeTransfer(msg.sender, remaining);
            }
        }
        
        emit VaultClosed(_vaultId, remaining);
    }

    function setMinPayouts(uint256 _vaultId, uint256[4] memory _mins) external onlyProtocol(_vaultId) {
        BountyVault storage vault = vaults[_vaultId];
        vault.minPayouts[Severity.LOW] = _mins[0];
        vault.minPayouts[Severity.MEDIUM] = _mins[1];
        vault.minPayouts[Severity.HIGH] = _mins[2];
        vault.minPayouts[Severity.CRITICAL] = _mins[3];
    }
    
    // View functions
    function getVaultJudges(uint256 _vaultId) external view returns (address[] memory) {
        return vaults[_vaultId].judges;
    }
    
    function getVaultSubmissions(uint256 _vaultId) external view returns (uint256[] memory) {
        return vaultSubmissions[_vaultId];
    }
    
    function getPayoutPercentage(uint256 _vaultId, Severity _severity) external view returns (uint256) {
        return vaults[_vaultId].payoutPercentages[_severity];
    }
    
    function getSubmissionDetails(uint256 _submissionId) external view returns (
        uint256 vaultId,
        address researcher,
        string memory reportHash,
        Severity severity,
        SubmissionStatus status,
        uint256 approvalCount,
        uint256 payoutAmount
    ) {
        Submission storage sub = submissions[_submissionId];
        return (
            sub.vaultId,
            sub.researcher,
            sub.reportHash,
            sub.severity,
            sub.status,
            sub.approvalCount,
            sub.payoutAmount
        );
    }
}
