"use client";

import { useAccount, usePublicClient } from "wagmi";
import { useEffect, useState } from "react";
import { VAULT_GUARD_ABI, VAULT_GUARD_ADDRESS } from "@/lib/contract";
import { formatEther } from "viem";
import { motion } from "framer-motion";
import { Shield, Target, Zap, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
    const { address, isConnected } = useAccount();
    const publicClient = usePublicClient();
    const [stats, setStats] = useState({
        totalEarnings: 0n,
        accepted: 0,
        rejected: 0,
        pending: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            if (!publicClient || !address) return;

            try {
                // In a real app, this should be an indexed query.
                // For now, we fetch ALL submission events and filter (inefficient but works for small hackathon demos)
                // Actually, contract has `getSubmissionDetails`. But we don't know IDs.
                // Wait, events: `SubmissionCreated(id, vault, researcher)`

                const createdLogs = await publicClient.getContractEvents({
                    address: VAULT_GUARD_ADDRESS,
                    abi: VAULT_GUARD_ABI,
                    eventName: "SubmissionCreated",
                    args: { researcher: address },
                    fromBlock: 0n,
                });

                let earned = 0n;
                let acceptedCount = 0;
                let rejectedCount = 0;
                let pendingCount = 0;

                // We have IDs, now check status of each
                // This causes N RPC calls, which is slow.
                // Better: Listen to PayoutSent (Paid/Approved) and SubmissionRejected events for these IDs?
                // Or just `getSubmissionDetails` for each.

                const promises = createdLogs.map(async (log: any) => {
                    const id = log.args.submissionId;
                    if (id === undefined) return;
                    const details = await publicClient.readContract({
                        address: VAULT_GUARD_ADDRESS,
                        abi: VAULT_GUARD_ABI,
                        functionName: "getSubmissionDetails",
                        args: [id]
                    }) as readonly [bigint, string, string, number, number, bigint, bigint];
                    // Status: 0=PENDING, 1=APPROVED, 2=REJECTED, 3=PAID
                    const status = details[4];
                    if (status === 0) pendingCount++;
                    if (status === 1 || status === 3) {
                        acceptedCount++;
                        earned += details[6]; // payoutAmount
                    }
                    if (status === 2) rejectedCount++;
                });

                await Promise.all(promises);

                setStats({
                    totalEarnings: earned,
                    accepted: acceptedCount,
                    rejected: rejectedCount,
                    pending: pendingCount
                });

            } catch (e) {
                console.error("Error fetching stats", e);
            } finally {
                setLoading(false);
            }
        }

        if (isConnected) {
            fetchStats();
        } else {
            setLoading(false);
        }
    }, [publicClient, address, isConnected]);

    if (!isConnected) {
        return (
            <div className="min-h-screen pt-32 text-center text-slate-500">
                Please connect your wallet to view your profile.
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-12"
            >
                <div className="flex items-center space-x-4 mb-6">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-3xl text-white font-bold shadow-xl">
                        {address?.slice(2, 4).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Researcher Profile</h1>
                        <p className="text-slate-500 font-mono">{address}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="glass border-indigo-500/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Earnings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? <Skeleton className="h-8 w-24" /> : (
                                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                    {formatEther(stats.totalEarnings)} CELO
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="glass border-green-500/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Accepted</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? <Skeleton className="h-8 w-12" /> : (
                                <div className="flex items-center space-x-2">
                                    <Target className="h-6 w-6 text-green-500" />
                                    <span className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.accepted}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="glass border-red-500/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rejected</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? <Skeleton className="h-8 w-12" /> : (
                                <div className="flex items-center space-x-2">
                                    <Shield className="h-6 w-6 text-red-500" />
                                    <span className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="glass border-yellow-500/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? <Skeleton className="h-8 w-12" /> : (
                                <div className="flex items-center space-x-2">
                                    <Zap className="h-6 w-6 text-yellow-500" />
                                    <span className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </motion.div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Award className="h-6 w-6 text-yellow-500" />
                    Badges & Achievements
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Example Badges */}
                    <Card className={`glass border-2 ${stats.accepted > 0 ? "border-yellow-500/50 bg-yellow-500/5" : "border-slate-200 dark:border-slate-800 opacity-50 grayscale"}`}>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <span className="text-4xl">🎩</span>
                                <span>First Blood</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600 dark:text-slate-300">Found your first valid vulnerability.</p>
                        </CardContent>
                    </Card>

                    <Card className={`glass border-2 ${Number(stats.totalEarnings) > 1000000000000000000n ? "border-purple-500/50 bg-purple-500/5" : "border-slate-200 dark:border-slate-800 opacity-50 grayscale"}`}>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <span className="text-4xl">💰</span>
                                <span>Bounty Hunter</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600 dark:text-slate-300">Earned over 1 CELO in bounties.</p>
                        </CardContent>
                    </Card>

                    <Card className={`glass border-2 ${stats.accepted >= 5 ? "border-blue-500/50 bg-blue-500/5" : "border-slate-200 dark:border-slate-800 opacity-50 grayscale"}`}>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <span className="text-4xl">🦅</span>
                                <span>Eagle Eye</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600 dark:text-slate-300">5+ accepted submissions.</p>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </div>
    );
}
