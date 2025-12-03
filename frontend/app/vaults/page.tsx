"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useWeb3ModalAccount, useWeb3ModalProvider } from "@reown/appkit/react";
import { ethers } from "ethers";
import { Shield, DollarSign, Users, TrendingUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { VAULT_GUARD_ADDRESS, VAULT_GUARD_ABI } from "@/lib/contract";
import Link from "next/link";

export default function Vaults() {
  const { walletProvider } = useWeb3ModalProvider();
  const [vaults, setVaults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVaults();
  }, [walletProvider]);

  const loadVaults = async () => {
    if (!walletProvider) return;
    try {
      const provider = new ethers.BrowserProvider(walletProvider);
      const contract = new ethers.Contract(VAULT_GUARD_ADDRESS, VAULT_GUARD_ABI, provider);
      const count = await contract.vaultCount();
      const vaultList = [];
      for (let i = 0; i < count; i++) {
        const vault = await contract.vaults(i);
        vaultList.push({ id: i, ...vault });
      }
      setVaults(vaultList);
    } catch (error) {
      console.error("Error loading vaults:", error);
    } finally {
      setLoading(false);
    }
  };

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
          </motion.div>

          {loading ? (
            <div className="text-center py-20">Loading vaults...</div>
          ) : vaults.length === 0 ? (
            <Card className="text-center py-20">
              <CardContent>
                <Shield className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                <h3 className="text-2xl font-bold mb-2">No Vaults Yet</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Be the first to create a bug bounty vault!
                </p>
                <Link href="/create">
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
                    Create Vault
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vaults.map((vault, index) => (
                <motion.div
                  key={vault.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-xl transition-shadow border-2 hover:border-indigo-300">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle>Vault #{vault.id}</CardTitle>
                        <Badge variant={vault.active ? "default" : "secondary"}>
                          {vault.active ? "Active" : "Closed"}
                        </Badge>
                      </div>
                      <CardDescription>
                        {vault.protocol.slice(0, 6)}...{vault.protocol.slice(-4)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-sm">Total</span>
                        </div>
                        <span className="font-bold">
                          {ethers.formatEther(vault.totalDeposit)} CELO
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-sm">Remaining</span>
                        </div>
                        <span className="font-bold">
                          {ethers.formatEther(vault.remainingFunds)} CELO
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Users className="h-4 w-4" />
                          <span className="text-sm">Approvals</span>
                        </div>
                        <span className="font-bold">{vault.requiredApprovals.toString()}</span>
                      </div>
                      <Link href={`/vaults/${vault.id}`}>
                        <Button className="w-full" variant="outline">
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

