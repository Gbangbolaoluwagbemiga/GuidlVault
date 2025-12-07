"use client";

import { motion } from "framer-motion";
import { ethers } from "ethers";
import {
  Shield,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Award,
  Target,
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
import { useUserSubmissions } from "@/hooks/useSubmissions";
import { useVaultGuard } from "@/hooks/useVaultGuard";
import { EmptyState, ErrorState } from "@/components/states";
import { SubmissionSkeleton } from "@/components/skeletons";
import {
  SEVERITY_LABELS,
  STATUS_LABELS,
  Severity,
  SubmissionStatus,
} from "@/lib/types";
import Link from "next/link";

export default function Dashboard() {
  const { submissions, loading, error, refetch } = useUserSubmissions();
  const { claimPayout, loading: claiming, address } = useVaultGuard();

  const handleClaim = async (submissionId: number) => {
    try {
      await claimPayout(submissionId);
      refetch();
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const stats = {
    total: submissions.length,
    pending: submissions.filter((s) => s.status === SubmissionStatus.PENDING)
      .length,
    approved: submissions.filter((s) => s.status === SubmissionStatus.APPROVED)
      .length,
    paid: submissions.filter((s) => s.status === SubmissionStatus.PAID).length,
    rejected: submissions.filter((s) => s.status === SubmissionStatus.REJECTED)
      .length,
    totalEarned: submissions
      .filter((s) => s.status === SubmissionStatus.PAID)
      .reduce((acc, s) => acc + s.payoutAmount, BigInt(0)),
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
        return <Clock className="h-4 w-4" />;
      case SubmissionStatus.APPROVED:
        return <CheckCircle2 className="h-4 w-4" />;
      case SubmissionStatus.REJECTED:
        return <XCircle className="h-4 w-4" />;
      case SubmissionStatus.PAID:
        return <Award className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: SubmissionStatus) => {
    switch (status) {
      case SubmissionStatus.PENDING:
        return "bg-gray-500";
      case SubmissionStatus.APPROVED:
        return "bg-green-500";
      case SubmissionStatus.REJECTED:
        return "bg-red-500";
      case SubmissionStatus.PAID:
        return "bg-indigo-500";
      default:
        return "bg-gray-500";
    }
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <Navbar />
        <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
          <EmptyState
            icon={<Shield className="h-16 w-16 text-slate-400" />}
            title="Connect Your Wallet"
            description="Please connect your wallet to view your submissions"
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
              Researcher Dashboard
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Track your vulnerability submissions and earnings
            </p>
          </motion.div>

          {error ? (
            <ErrorState message={error} retry={refetch} />
          ) : loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {[
                  {
                    icon: Target,
                    label: "Total Submissions",
                    value: stats.total,
                    color: "from-blue-500 to-cyan-500",
                  },
                  {
                    icon: Clock,
                    label: "Pending",
                    value: stats.pending,
                    color: "from-gray-500 to-slate-500",
                  },
                  {
                    icon: CheckCircle2,
                    label: "Approved",
                    value: stats.approved,
                    color: "from-green-500 to-emerald-500",
                  },
                  {
                    icon: Award,
                    label: "Paid",
                    value: stats.paid,
                    color: "from-indigo-500 to-purple-500",
                  },
                  {
                    icon: DollarSign,
                    label: "Total Earned",
                    value: `${parseFloat(ethers.formatEther(stats.totalEarned)).toFixed(2)} CELO`,
                    color: "from-purple-500 to-pink-500",
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

              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Your Submissions</CardTitle>
                      <CardDescription>
                        All your vulnerability submissions across vaults
                      </CardDescription>
                    </div>
                    <Link href="/submit">
                      <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                        <Shield className="h-4 w-4 mr-2" />
                        New Submission
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {submissions.length === 0 ? (
                    <EmptyState
                      icon={<Target className="h-12 w-12 text-slate-400" />}
                      title="No Submissions Yet"
                      description="Start earning by submitting your first vulnerability"
                      action={
                        <Link href="/submit">
                          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
                            Submit Vulnerability
                          </Button>
                        </Link>
                      }
                    />
                  ) : (
                    <div className="space-y-4">
                      {submissions.map((submission, index) => (
                        <motion.div
                          key={submission.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ x: 5 }}
                        >
                          <Card className="border hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group">
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
                                    className={getSeverityColor(
                                      submission.severity
                                    )}
                                  >
                                    {SEVERITY_LABELS[submission.severity]}
                                  </Badge>
                                  <Badge
                                    className={getStatusColor(submission.status)}
                                  >
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

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
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

                              <div className="flex gap-3">
                                {submission.status === SubmissionStatus.APPROVED && (
                                  <Button
                                    onClick={() => handleClaim(submission.id)}
                                    disabled={claiming}
                                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                  >
                                    <Award className="h-4 w-4 mr-2" />
                                    Claim Payout
                                  </Button>
                                )}
                                <Link
                                  href={`/vaults/${submission.vaultId}`}
                                  className="flex-1"
                                >
                                  <Button variant="outline" className="w-full">
                                    View Vault
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                  </Button>
                                </Link>
                              </div>
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

