// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title GuidlVault
 * @dev A secure vault contract for managing guild/DAO funds with role-based access control
 * @notice Supports both native ETH and ERC20 token deposits/withdrawals
 */
contract GuidlVault is ReentrancyGuard, Pausable, AccessControl {
    using SafeERC20 for IERC20;

    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant TREASURER_ROLE = keccak256("TREASURER_ROLE");
    bytes32 public constant MEMBER_ROLE = keccak256("MEMBER_ROLE");

    // Vault configuration
    uint256 public minDepositAmount;
    uint256 public maxWithdrawalAmount;
    uint256 public totalDeposits;
    uint256 public totalWithdrawals;

    // Multi-sig threshold (if needed)
    uint256 public requiredApprovals;

    // Token tracking
    mapping(address => uint256) public tokenBalances;
    mapping(address => mapping(address => uint256)) public memberTokenDeposits;
    mapping(address => uint256) public memberNativeDeposits;

    // Withdrawal requests (for multi-sig)
    struct WithdrawalRequest {
        address token; // address(0) for native ETH
        address recipient;
        uint256 amount;
        string reason;
        uint256 approvals;
        bool executed;
        uint256 createdAt;
    }

    mapping(uint256 => WithdrawalRequest) public withdrawalRequests;
    mapping(uint256 => mapping(address => bool)) public requestApprovals;
    uint256 public requestCounter;

    // Events
    event Deposit(
        address indexed depositor,
        address indexed token,
        uint256 amount,
        uint256 timestamp
    );
    event Withdrawal(
        address indexed recipient,
        address indexed token,
        uint256 amount,
        string reason,
        uint256 timestamp
    );
    event WithdrawalRequestCreated(
        uint256 indexed requestId,
        address indexed token,
        address indexed recipient,
        uint256 amount,
        string reason
    );
    event WithdrawalRequestApproved(
        uint256 indexed requestId,
        address indexed approver
    );
    event WithdrawalRequestExecuted(
        uint256 indexed requestId,
        address indexed recipient,
        uint256 amount
    );
    event MinDepositAmountUpdated(uint256 oldAmount, uint256 newAmount);
    event MaxWithdrawalAmountUpdated(uint256 oldAmount, uint256 newAmount);
    event RequiredApprovalsUpdated(uint256 oldApprovals, uint256 newApprovals);
    event EmergencyWithdrawal(
        address indexed token,
        address indexed recipient,
        uint256 amount
    );

    /**
     * @dev Constructor sets up roles and initial configuration
     * @param _admin Address to grant admin role
     * @param _treasurer Address to grant treasurer role
     * @param _minDeposit Minimum deposit amount
     * @param _maxWithdrawal Maximum withdrawal amount per transaction
     * @param _requiredApprovals Number of approvals needed for withdrawals
     */
    constructor(
        address _admin,
        address _treasurer,
        uint256 _minDeposit,
        uint256 _maxWithdrawal,
        uint256 _requiredApprovals
    ) {
        require(_admin != address(0), "GuidlVault: Invalid admin address");
        require(_treasurer != address(0), "GuidlVault: Invalid treasurer address");
        require(_requiredApprovals > 0, "GuidlVault: Required approvals must be > 0");

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(TREASURER_ROLE, _treasurer);

        minDepositAmount = _minDeposit;
        maxWithdrawalAmount = _maxWithdrawal;
        requiredApprovals = _requiredApprovals;
    }

    /**
     * @dev Receive function to accept native ETH deposits
     */
    receive() external payable {
        depositNative();
    }

    /**
     * @dev Fallback function
     */
    fallback() external payable {
        depositNative();
    }

    /**
     * @dev Deposit native ETH into the vault
     */
    function depositNative() public payable whenNotPaused nonReentrant {
        require(msg.value >= minDepositAmount, "GuidlVault: Amount below minimum");
        
        totalDeposits += msg.value;
        tokenBalances[address(0)] += msg.value;
        memberNativeDeposits[msg.sender] += msg.value;

        emit Deposit(msg.sender, address(0), msg.value, block.timestamp);
    }

    /**
     * @dev Deposit ERC20 tokens into the vault
     * @param _token Address of the ERC20 token
     * @param _amount Amount of tokens to deposit
     */
    function depositToken(address _token, uint256 _amount) 
        external 
        whenNotPaused 
        nonReentrant 
    {
        require(_token != address(0), "GuidlVault: Invalid token address");
        require(_amount >= minDepositAmount, "GuidlVault: Amount below minimum");
        require(
            IERC20(_token).balanceOf(msg.sender) >= _amount,
            "GuidlVault: Insufficient balance"
        );

        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        
        totalDeposits += _amount;
        tokenBalances[_token] += _amount;
        memberTokenDeposits[_token][msg.sender] += _amount;

        emit Deposit(msg.sender, _token, _amount, block.timestamp);
    }

    /**
     * @dev Create a withdrawal request (requires approvals)
     * @param _token Address of the token (address(0) for native ETH)
     * @param _recipient Address to receive the funds
     * @param _amount Amount to withdraw
     * @param _reason Reason for withdrawal
     */
    function createWithdrawalRequest(
        address _token,
        address _recipient,
        uint256 _amount,
        string memory _reason
    ) external onlyRole(TREASURER_ROLE) whenNotPaused returns (uint256) {
        require(_recipient != address(0), "GuidlVault: Invalid recipient");
        require(_amount > 0, "GuidlVault: Amount must be > 0");
        require(_amount <= maxWithdrawalAmount, "GuidlVault: Amount exceeds maximum");
        
        if (_token == address(0)) {
            require(
                address(this).balance >= _amount,
                "GuidlVault: Insufficient native balance"
            );
        } else {
            require(
                tokenBalances[_token] >= _amount,
                "GuidlVault: Insufficient token balance"
            );
        }

        uint256 requestId = requestCounter++;
        withdrawalRequests[requestId] = WithdrawalRequest({
            token: _token,
            recipient: _recipient,
            amount: _amount,
            reason: _reason,
            approvals: 0,
            executed: false,
            createdAt: block.timestamp
        });

        emit WithdrawalRequestCreated(requestId, _token, _recipient, _amount, _reason);
        return requestId;
    }

    /**
     * @dev Approve a withdrawal request
     * @param _requestId ID of the withdrawal request
     */
    function approveWithdrawalRequest(uint256 _requestId) 
        external 
        onlyRole(TREASURER_ROLE) 
        whenNotPaused 
    {
        WithdrawalRequest storage request = withdrawalRequests[_requestId];
        require(request.recipient != address(0), "GuidlVault: Request does not exist");
        require(!request.executed, "GuidlVault: Request already executed");
        require(
            !requestApprovals[_requestId][msg.sender],
            "GuidlVault: Already approved"
        );

        requestApprovals[_requestId][msg.sender] = true;
        request.approvals++;

        emit WithdrawalRequestApproved(_requestId, msg.sender);

        // Auto-execute if threshold is met
        if (request.approvals >= requiredApprovals) {
            _executeWithdrawal(_requestId);
        }
    }

    /**
     * @dev Execute a withdrawal request (internal)
     * @param _requestId ID of the withdrawal request
     */
    function _executeWithdrawal(uint256 _requestId) internal nonReentrant {
        WithdrawalRequest storage request = withdrawalRequests[_requestId];
        require(
            request.approvals >= requiredApprovals,
            "GuidlVault: Insufficient approvals"
        );
        require(!request.executed, "GuidlVault: Already executed");

        request.executed = true;

        if (request.token == address(0)) {
            // Native ETH withdrawal
            require(
                address(this).balance >= request.amount,
                "GuidlVault: Insufficient balance"
            );
            tokenBalances[address(0)] -= request.amount;
            (bool success, ) = request.recipient.call{value: request.amount}("");
            require(success, "GuidlVault: Transfer failed");
        } else {
            // ERC20 token withdrawal
            require(
                tokenBalances[request.token] >= request.amount,
                "GuidlVault: Insufficient balance"
            );
            tokenBalances[request.token] -= request.amount;
            IERC20(request.token).safeTransfer(request.recipient, request.amount);
        }

        totalWithdrawals += request.amount;

        emit WithdrawalRequestExecuted(_requestId, request.recipient, request.amount);
        emit Withdrawal(
            request.recipient,
            request.token,
            request.amount,
            request.reason,
            block.timestamp
        );
    }

    /**
     * @dev Direct withdrawal (admin only, for emergencies)
     * @param _token Address of the token (address(0) for native ETH)
     * @param _recipient Address to receive the funds
     * @param _amount Amount to withdraw
     */
    function emergencyWithdraw(
        address _token,
        address _recipient,
        uint256 _amount
    ) external onlyRole(ADMIN_ROLE) {
        require(_recipient != address(0), "GuidlVault: Invalid recipient");
        require(_amount > 0, "GuidlVault: Amount must be > 0");

        if (_token == address(0)) {
            require(
                address(this).balance >= _amount,
                "GuidlVault: Insufficient native balance"
            );
            tokenBalances[address(0)] -= _amount;
            (bool success, ) = _recipient.call{value: _amount}("");
            require(success, "GuidlVault: Transfer failed");
        } else {
            require(
                tokenBalances[_token] >= _amount,
                "GuidlVault: Insufficient token balance"
            );
            tokenBalances[_token] -= _amount;
            IERC20(_token).safeTransfer(_recipient, _amount);
        }

        totalWithdrawals += _amount;

        emit EmergencyWithdrawal(_token, _recipient, _amount);
        emit Withdrawal(_recipient, _token, _amount, "Emergency withdrawal", block.timestamp);
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Update minimum deposit amount
     * @param _newAmount New minimum deposit amount
     */
    function setMinDepositAmount(uint256 _newAmount) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        uint256 oldAmount = minDepositAmount;
        minDepositAmount = _newAmount;
        emit MinDepositAmountUpdated(oldAmount, _newAmount);
    }

    /**
     * @dev Update maximum withdrawal amount
     * @param _newAmount New maximum withdrawal amount
     */
    function setMaxWithdrawalAmount(uint256 _newAmount) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        uint256 oldAmount = maxWithdrawalAmount;
        maxWithdrawalAmount = _newAmount;
        emit MaxWithdrawalAmountUpdated(oldAmount, _newAmount);
    }

    /**
     * @dev Update required approvals for withdrawals
     * @param _newApprovals New number of required approvals
     */
    function setRequiredApprovals(uint256 _newApprovals) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(_newApprovals > 0, "GuidlVault: Approvals must be > 0");
        uint256 oldApprovals = requiredApprovals;
        requiredApprovals = _newApprovals;
        emit RequiredApprovalsUpdated(oldApprovals, _newApprovals);
    }

    /**
     * @dev Grant member role to an address
     * @param _member Address to grant member role
     */
    function addMember(address _member) external onlyRole(ADMIN_ROLE) {
        require(_member != address(0), "GuidlVault: Invalid address");
        _grantRole(MEMBER_ROLE, _member);
    }

    /**
     * @dev Revoke member role from an address
     * @param _member Address to revoke member role
     */
    function removeMember(address _member) external onlyRole(ADMIN_ROLE) {
        _revokeRole(MEMBER_ROLE, _member);
    }

    /**
     * @dev Pause the contract
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Get vault balance for a specific token
     * @param _token Address of the token (address(0) for native ETH)
     * @return Balance of the token in the vault
     */
    function getBalance(address _token) external view returns (uint256) {
        if (_token == address(0)) {
            return address(this).balance;
        }
        return tokenBalances[_token];
    }

    /**
     * @dev Get member's total deposits for a token
     * @param _token Address of the token (address(0) for native ETH)
     * @param _member Address of the member
     * @return Total deposits by the member
     */
    function getMemberDeposits(address _token, address _member) 
        external 
        view 
        returns (uint256) 
    {
        if (_token == address(0)) {
            return memberNativeDeposits[_member];
        }
        return memberTokenDeposits[_token][_member];
    }

    /**
     * @dev Get withdrawal request details
     * @param _requestId ID of the withdrawal request
     * @return Withdrawal request struct
     */
    function getWithdrawalRequest(uint256 _requestId)
        external
        view
        returns (WithdrawalRequest memory)
    {
        return withdrawalRequests[_requestId];
    }

    /**
     * @dev Check if an address has approved a request
     * @param _requestId ID of the withdrawal request
     * @param _approver Address to check
     * @return True if approved, false otherwise
     */
    function hasApproved(uint256 _requestId, address _approver)
        external
        view
        returns (bool)
    {
        return requestApprovals[_requestId][_approver];
    }
}


