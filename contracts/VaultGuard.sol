// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VaultGuard
 * @notice Decentralized bug bounty platform where protocols deposit funds
 * and security researchers submit vulnerabilities for review and automatic payout
 */
contract VaultGuard {
    
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
    
    constructor(address _platformWallet) {
        require(_platformWallet != address(0), "Invalid platform wallet");
        platformWallet = _platformWallet;
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
        
        emit VaultCreated(vaultId, msg.sender, msg.value);
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
        
        vaultSubmissions[_vaultId].push(submissionId);
        
        emit SubmissionCreated(submissionId, _vaultId, msg.sender);
        return submissionId;
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
    
    /**
     * @notice Internal function to approve submission and calculate payout
     */
    function _approveSubmission(uint256 _submissionId) internal {
        Submission storage submission = submissions[_submissionId];
        uint256 vaultId = submission.vaultId;
        BountyVault storage vault = vaults[vaultId];
        
        // Calculate payout based on severity
        uint256 baseAmount = (vault.totalDeposit * vault.payoutPercentages[submission.severity]) / 10000;
        uint256 platformCut = (baseAmount * platformFee) / 10000;
        uint256 researcherPayout = baseAmount - platformCut;
        
        require(vault.remainingFunds >= baseAmount, "Insufficient vault funds");
        
        submission.status = SubmissionStatus.APPROVED;
        submission.payoutAmount = researcherPayout;
        
        vault.remainingFunds -= baseAmount;
        
        emit SubmissionApproved(_submissionId, researcherPayout);
    }
    
    /**
     * @notice Claim payout for approved submission
     */
    function claimPayout(uint256 _submissionId) external {
        Submission storage submission = submissions[_submissionId];
        require(submission.researcher == msg.sender, "Not the researcher");
        require(submission.status == SubmissionStatus.APPROVED, "Not approved");
        
        submission.status = SubmissionStatus.PAID;
        
        uint256 researcherPayout = submission.payoutAmount;
        uint256 vaultId = submission.vaultId;
        BountyVault storage vault = vaults[vaultId];
        
        // Recalculate platform cut from the base amount
        uint256 baseAmount = (vault.totalDeposit * vault.payoutPercentages[submission.severity]) / 10000;
        uint256 platformCut = (baseAmount * platformFee) / 10000;
        
        // Transfer funds
        (bool success1, ) = payable(msg.sender).call{value: researcherPayout}("");
        require(success1, "Transfer to researcher failed");
        
        (bool success2, ) = payable(platformWallet).call{value: platformCut}("");
        require(success2, "Transfer to platform failed");
        
        emit PayoutSent(_submissionId, msg.sender, researcherPayout);
    }
    
    /**
     * @notice Close vault and withdraw remaining funds
     */
    function closeVault(uint256 _vaultId) external onlyProtocol(_vaultId) {
        BountyVault storage vault = vaults[_vaultId];
        require(vault.active, "Already closed");
        
        vault.active = false;
        uint256 remaining = vault.remainingFunds;
        vault.remainingFunds = 0;
        
        if(remaining > 0) {
            (bool success, ) = payable(msg.sender).call{value: remaining}("");
            require(success, "Transfer failed");
        }
        
        emit VaultClosed(_vaultId, remaining);
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

