// Type definitions for VaultGuard

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

export interface Vault {
  id: number;
  protocol: string;
  totalDeposit: bigint;
  remainingFunds: bigint;
  active: boolean;
  requiredApprovals: number;
  judges?: string[];
  submissions?: number[];
}

export interface Submission {
  id: number;
  vaultId: number;
  researcher: string;
  reportHash: string;
  severity: Severity;
  status: SubmissionStatus;
  approvalCount: number;
  payoutAmount: bigint;
}

export interface CreateVaultForm {
  deposit: string;
  judges: string[];
  requiredApprovals: string;
  payouts: {
    low: string;
    medium: string;
    high: string;
    critical: string;
  };
}

export interface SubmitVulnerabilityForm {
  vaultId: string;
  reportHash: string;
  severity: Severity;
}

export const SEVERITY_LABELS: Record<Severity, string> = {
  [Severity.LOW]: "Low",
  [Severity.MEDIUM]: "Medium",
  [Severity.HIGH]: "High",
  [Severity.CRITICAL]: "Critical",
};

export const SEVERITY_COLORS: Record<Severity, string> = {
  [Severity.LOW]: "bg-blue-500",
  [Severity.MEDIUM]: "bg-yellow-500",
  [Severity.HIGH]: "bg-orange-500",
  [Severity.CRITICAL]: "bg-red-500",
};

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  [SubmissionStatus.PENDING]: "Pending",
  [SubmissionStatus.APPROVED]: "Approved",
  [SubmissionStatus.REJECTED]: "Rejected",
  [SubmissionStatus.PAID]: "Paid",
};

export const STATUS_COLORS: Record<SubmissionStatus, string> = {
  [SubmissionStatus.PENDING]: "bg-gray-500",
  [SubmissionStatus.APPROVED]: "bg-green-500",
  [SubmissionStatus.REJECTED]: "bg-red-500",
  [SubmissionStatus.PAID]: "bg-indigo-500",
};

