"use client";

import { usePublicClient } from "wagmi";
import { useEffect, useState } from "react";
import { VAULT_GUARD_ABI, VAULT_GUARD_ADDRESS } from "@/lib/contract";
import { formatEther } from "viem";
import { motion } from "framer-motion";
import { Trophy, Medal, Award } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type LeaderboardEntry = {
    address: string;
    totalPayout: bigint;
    submissionCount: number;
};

export default function LeaderboardPage() {
    const publicClient = usePublicClient();
    const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLeaderboard() {
            if (!publicClient) return;
            try {
                // Fetch PayoutSent events to calculate total earnings
                // Note: In production, this should be indexed by a subgraph
                // For hackathon/demo, we scan from block 0 (or recent deployment block) is okay if not too many events
                // Or better, just get recent events

                const logs = await publicClient.getContractEvents({
                    address: VAULT_GUARD_ADDRESS,
                    abi: VAULT_GUARD_ABI,
                    eventName: "PayoutSent",
                    fromBlock: 0n, // Scan from beginning
                });

                const stats: Record<string, { total: bigint; count: number }> = {};

                logs.forEach((log: any) => {
                    const { researcher, amount } = log.args;
                    if (researcher && amount) {
                        const amountBi = BigInt(amount);
                        if (!stats[researcher]) {
                            stats[researcher] = { total: 0n, count: 0 };
                        }
                        stats[researcher].total += amountBi;
                        stats[researcher].count += 1;
                    }
                });

                const sorted = Object.entries(stats)
                    .map(([address, data]) => ({
                        address,
                        totalPayout: data.total,
                        submissionCount: data.count,
                    }))
                    .sort((a, b) => (Number(b.totalPayout) - Number(a.totalPayout))); // Sort by total payout descending

                setLeaders(sorted);
            } catch (e) {
                console.error("Failed to fetch leaderboard", e);
            } finally {
                setLoading(false);
            }
        }

        fetchLeaderboard();
    }, [publicClient]);

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mb-12"
            >
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-4">
                    Hall of Fame
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-300">
                    Top security researchers securing the ecosystem.
                </p>
            </motion.div>

            <Card className="glass border-0 shadow-2xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
                    <div className="grid grid-cols-12 gap-4 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <div className="col-span-1 text-center">Rank</div>
                        <div className="col-span-6 md:col-span-7">Researcher</div>
                        <div className="col-span-2 text-center">Submissions</div>
                        <div className="col-span-3 md:col-span-2 text-right">Earnings</div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-8 text-center text-slate-500">Scanning blockchain history...</div>
                    ) : leaders.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No payouts recorded yet. Be the first!</div>
                    ) : (
                        leaders.map((leader, index) => (
                            <motion.div
                                key={leader.address}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`grid grid-cols-12 gap-4 p-4 items-center border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${index < 3 ? "bg-gradient-to-r from-yellow-500/5 to-transparent" : ""
                                    }`}
                            >
                                <div className="col-span-1 flex justify-center">
                                    {index === 0 ? (
                                        <Trophy className="h-6 w-6 text-yellow-500" />
                                    ) : index === 1 ? (
                                        <Medal className="h-6 w-6 text-slate-400" />
                                    ) : index === 2 ? (
                                        <Award className="h-6 w-6 text-orange-500" />
                                    ) : (
                                        <span className="font-mono text-slate-500">#{index + 1}</span>
                                    )}
                                </div>
                                <div className="col-span-6 md:col-span-7 font-mono text-sm md:text-base truncate">
                                    <span className={index === 0 ? "font-bold text-yellow-600 dark:text-yellow-400" : "text-slate-700 dark:text-slate-200"}>
                                        {leader.address}
                                    </span>
                                </div>
                                <div className="col-span-2 text-center font-bold text-slate-600 dark:text-slate-400">
                                    {leader.submissionCount}
                                </div>
                                <div className="col-span-3 md:col-span-2 text-right font-bold text-green-600 dark:text-green-400">
                                    {formatEther(leader.totalPayout)} CELO
                                </div>
                            </motion.div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
