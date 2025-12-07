"use client";

import { motion } from "framer-motion";
import { ethers } from "ethers";
import { Shield, DollarSign, Users, TrendingUp, Eye, RefreshCw } from "lucide-react";
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
import { useVaults } from "@/hooks/useVaults";
import { EmptyState, ErrorState } from "@/components/states";
import { VaultSkeleton } from "@/components/skeletons";
import Link from "next/link";

export default function Vaults() {
  const { vaults, loading, error, refetch } = useVaults();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Active Vaults
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Explore bug bounty vaults from leading protocols
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={loading}
              className="mt-4"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </motion.div>

          {error ? (
            <ErrorState message={error} retry={refetch} />
          ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <VaultSkeleton key={i} />
              ))}
            </div>
          ) : vaults.length === 0 ? (
            <EmptyState
              icon={<Shield className="h-16 w-16 text-slate-400" />}
              title="No Vaults Yet"
              description="Be the first to create a bug bounty vault!"
              action={
                <Link href="/create">
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                    Create Vault
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vaults.map((vault, index) => (
                <motion.div
                  key={vault.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 hover:border-indigo-300 dark:hover:border-indigo-700 group">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          Vault #{vault.id}
                        </CardTitle>
                        <Badge 
                          variant={vault.active ? "default" : "secondary"}
                          className={vault.active ? "animate-pulse" : ""}
                        >
                          {vault.active ? "Active" : "Closed"}
                        </Badge>
                      </div>
                      <CardDescription className="font-mono text-xs">
                        {vault.protocol.slice(0, 8)}...
                        {vault.protocol.slice(-6)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/30 transition-colors">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <DollarSign className="h-4 w-4" />
                            <span className="text-sm font-medium">Total</span>
                          </div>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            {parseFloat(ethers.formatEther(vault.totalDeposit)).toFixed(2)} CELO
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 group-hover:bg-purple-50 dark:group-hover:bg-purple-950/30 transition-colors">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-sm font-medium">Remaining</span>
                          </div>
                          <span className="font-bold text-purple-600 dark:text-purple-400">
                            {parseFloat(ethers.formatEther(vault.remainingFunds)).toFixed(2)} CELO
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 group-hover:bg-pink-50 dark:group-hover:bg-pink-950/30 transition-colors">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <Users className="h-4 w-4" />
                            <span className="text-sm font-medium">Approvals</span>
                          </div>
                          <span className="font-bold text-pink-600 dark:text-pink-400">
                            {vault.requiredApprovals}
                          </span>
                        </div>
                      </div>
                      <Link href={`/vaults/${vault.id}`} className="block">
                        <Button 
                          className="w-full group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300" 
                          variant="outline"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
