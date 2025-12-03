// VaultGuard Contract ABI and Address
export const VAULT_GUARD_ADDRESS = "0x7C1486c50A729DDbf5a812C490a075053522EE43";

export const VAULT_GUARD_ABI = [
  "function createVault(address[] memory _judges, uint256 _requiredApprovals, uint256[4] memory _payouts) external payable returns (uint256)",
  "function depositFunds(uint256 _vaultId) external payable",
  "function submitVulnerability(uint256 _vaultId, string memory _reportHash, uint8 _severity) external returns (uint256)",
  "function voteOnSubmission(uint256 _submissionId, bool _approved) external",
  "function claimPayout(uint256 _submissionId) external",
  "function closeVault(uint256 _vaultId) external",
  "function getVaultJudges(uint256 _vaultId) external view returns (address[])",
  "function getVaultSubmissions(uint256 _vaultId) external view returns (uint256[])",
  "function getSubmissionDetails(uint256 _submissionId) external view returns (uint256 vaultId, address researcher, string memory reportHash, uint8 severity, uint8 status, uint256 approvalCount, uint256 payoutAmount)",
  "function getPayoutPercentage(uint256 _vaultId, uint8 _severity) external view returns (uint256)",
  "function vaults(uint256) external view returns (address protocol, uint256 totalDeposit, uint256 remainingFunds, bool active, uint256 requiredApprovals)",
  "function vaultCount() external view returns (uint256)",
  "function submissionCount() external view returns (uint256)",
  "function platformFee() external view returns (uint256)",
  "event VaultCreated(uint256 indexed vaultId, address indexed protocol, uint256 deposit)",
  "event SubmissionCreated(uint256 indexed submissionId, uint256 indexed vaultId, address indexed researcher)",
  "event SubmissionApproved(uint256 indexed submissionId, uint256 payoutAmount)",
  "event SubmissionRejected(uint256 indexed submissionId)",
  "event PayoutSent(uint256 indexed submissionId, address indexed researcher, uint256 amount)",
] as const;

export enum Severity {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
  CRITICAL = 3,
}

export enum SubmissionStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
  PAID = 3,
}

export const SEVERITY_LABELS = ["Low", "Medium", "High", "Critical"];
export const SEVERITY_COLORS = {
  [Severity.LOW]: "bg-blue-500",
  [Severity.MEDIUM]: "bg-yellow-500",
  [Severity.HIGH]: "bg-orange-500",
  [Severity.CRITICAL]: "bg-red-500",
};

