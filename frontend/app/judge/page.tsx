"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ethers } from "ethers";
import { usePublicClient, useAccount } from "wagmi";
import {
  Shield,
  ThumbsUp,
  ThumbsDown,
  Eye,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { VAULT_GUARD_ADDRESS, VAULT_GUARD_ABI } from "@/lib/contract";
import { useVaultGuard } from "@/hooks/useVaultGuard";
import { EmptyState, ErrorState } from "@/components/states";
import { SubmissionSkeleton } from "@/components/skeletons";
import {
  SEVERITY_LABELS,
  STATUS_LABELS,
  Severity,
  SubmissionStatus,
  Submission,
} from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function JudgePortal() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { voteOnSubmission, loading: voting } = useVaultGuard();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");

  const loadSubmissions = useCallback(async () => {
    if (!publicClient || !address) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const provider = new ethers.BrowserProvider(publicClient as any);
      const contract = new ethers.Contract(
        VAULT_GUARD_ADDRESS,
        VAULT_GUARD_ABI,
        provider
      );

      // Get all vaults
      const vaultCount = await contract.vaultCount();
      const myVaults: number[] = [];

      // Find vaults where user is a judge
      for (let i = 0; i < vaultCount; i++) {
        const judges = await contract.getVaultJudges(i);
        if (judges.map((j: string) => j.toLowerCase()).includes(address.toLowerCase())) {
          myVaults.push(i);
        }
      }

      // Get all submissions for those vaults
      const allSubmissions: Submission[] = [];
      for (const vaultId of myVaults) {
        const submissionIds = await contract.getVaultSubmissions(vaultId);
        for (const id of submissionIds) {
          const details = await contract.getSubmissionDetails(id);
          allSubmissions.push({
            id: Number(id),
            vaultId: Number(details.vaultId),
            researcher: details.researcher,
            reportHash: details.reportHash,
            severity: Number(details.severity),
            status: Number(details.status),
            approvalCount: Number(details.approvalCount),
            payoutAmount: details.payoutAmount,
          });
        }
      }

      setSubmissions(allSubmissions);
    } catch (err: any) {
      console.error("Error loading submissions:", err);
      setError(err.message || "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }, [publicClient, address]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const handleVote = async (submissionId: number, approved: boolean) => {
    try {
      await voteOnSubmission(submissionId, approved);
      await loadSubmissions();
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case Severity.LOW:
        return "bg-blue-500";
      case Severity.MEDIUM:
        return "bg-yellow-500";
      case Severity.HIGH:
        return "bg-orange-500";
      case Severity.CRITICAL:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: SubmissionStatus) => {
    switch (status) {
      case SubmissionStatus.PENDING:
        return <AlertTriangle className="h-4 w-4" />;
      case SubmissionStatus.APPROVED:
        return <CheckCircle2 className="h-4 w-4" />;
      case SubmissionStatus.REJECTED:
        return <XCircle className="h-4 w-4" />;
      case SubmissionStatus.PAID:
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (filterStatus !== "all" && sub.status.toString() !== filterStatus) {
      return false;
    }
    if (filterSeverity !== "all" && sub.severity.toString() !== filterSeverity) {
      return false;
    }
    return true;
  });

  const stats = {
    total: submissions.length,
    pending: submissions.filter((s) => s.status === SubmissionStatus.PENDING).length,
    approved: submissions.filter((s) => s.status === SubmissionStatus.APPROVED).length,
    rejected: submissions.filter((s) => s.status === SubmissionStatus.REJECTED).length,
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <Navbar />
        <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
          <EmptyState
            icon={<Shield className="h-16 w-16 text-slate-400" />}
            title="Connect Your Wallet"
            description="Please connect your wallet to access the judge portal"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Judge Portal
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Review and vote on vulnerability submissions
            </p>
          </motion.div>

          {error ? (
            <ErrorState message={error} retry={loadSubmissions} />
          ) : loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"
                  />
                ))}
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <SubmissionSkeleton key={i} />
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[
                  {
                    icon: Shield,
                    label: "Total Submissions",
                    value: stats.total,
                    color: "from-blue-500 to-cyan-500",
                  },
                  {
                    icon: AlertTriangle,
                    label: "Pending Review",
                    value: stats.pending,
                    color: "from-yellow-500 to-orange-500",
                  },
                  {
                    icon: CheckCircle2,
                    label: "Approved",
                    value: stats.approved,
                    color: "from-green-500 to-emerald-500",
                  },
                  {
                    icon: XCircle,
                    label: "Rejected",
                    value: stats.rejected,
                    color: "from-red-500 to-rose-500",
                  },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <Card className="border-2 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}
                          >
                            <stat.icon className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <p className="text-2xl font-bold mb-1">{stat.value}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {stat.label}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Card className="border-2 mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Status</label>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="0">Pending</SelectItem>
                          <SelectItem value="1">Approved</SelectItem>
                          <SelectItem value="2">Rejected</SelectItem>
                          <SelectItem value="3">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Severity
                      </label>
                      <Select
                        value={filterSeverity}
                        onValueChange={setFilterSeverity}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Severities</SelectItem>
                          <SelectItem value="0">Low</SelectItem>
                          <SelectItem value="1">Medium</SelectItem>
                          <SelectItem value="2">High</SelectItem>
                          <SelectItem value="3">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Submissions Awaiting Your Review</CardTitle>
                  <CardDescription>
                    Review vulnerability reports and cast your vote
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredSubmissions.length === 0 ? (
                    <EmptyState
                      icon={<CheckCircle2 className="h-12 w-12 text-green-400" />}
                      title="No Submissions to Review"
                      description={
                        submissions.length === 0
                          ? "There are no submissions in vaults where you are a judge"
                          : "All submissions have been filtered out"
                      }
                    />
                  ) : (
                    <div className="space-y-4">
                      {filteredSubmissions.map((submission, index) => (
                        <motion.div
                          key={submission.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ x: 5 }}
                        >
                          <Card className="border hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(submission.status)}
                                    <span className="font-bold">
                                      Submission #{submission.id}
                                    </span>
                                  </div>
                                  <Badge
                                    className={getSeverityColor(submission.severity)}
                                  >
                                    {SEVERITY_LABELS[submission.severity]}
                                  </Badge>
                                  <Badge variant="outline">
                                    {STATUS_LABELS[submission.status]}
                                  </Badge>
                                  <Badge variant="outline">
                                    Vault #{submission.vaultId}
                                  </Badge>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Payout
                                  </p>
                                  <p className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    {parseFloat(
                                      ethers.formatEther(submission.payoutAmount)
                                    ).toFixed(4)}{" "}
                                    CELO
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-4">
                                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                  <span className="text-slate-600 dark:text-slate-400">
                                    Researcher
                                  </span>
                                  <span className="font-mono text-xs">
                                    {submission.researcher.slice(0, 6)}...
                                    {submission.researcher.slice(-4)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                  <span className="text-slate-600 dark:text-slate-400">
                                    Report Hash
                                  </span>
                                  <span className="font-mono text-xs">
                                    {submission.reportHash.slice(0, 8)}...
                                  </span>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                  <span className="text-slate-600 dark:text-slate-400">
                                    Approvals
                                  </span>
                                  <span className="font-bold">
                                    {submission.approvalCount}
                                  </span>
                                </div>
                              </div>

                              {submission.status === SubmissionStatus.PENDING && (
                                <div className="flex gap-3">
                                  <Button
                                    onClick={() => handleVote(submission.id, true)}
                                    disabled={voting}
                                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                  >
                                    <ThumbsUp className="h-4 w-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button
                                    onClick={() => handleVote(submission.id, false)}
                                    disabled={voting}
                                    variant="outline"
                                    className="flex-1 border-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
                                  >
                                    <ThumbsDown className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

