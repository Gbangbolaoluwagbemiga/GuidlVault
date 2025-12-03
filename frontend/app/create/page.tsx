"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useWeb3ModalAccount, useWeb3ModalProvider } from "@reown/appkit/react";
import { ethers } from "ethers";
import { Shield, Plus, Users, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/navbar";
import { VAULT_GUARD_ADDRESS, VAULT_GUARD_ABI } from "@/lib/contract";
import { toast } from "sonner";

export default function CreateVault() {
  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    deposit: "",
    judges: [""],
    requiredApprovals: "2",
    payouts: { low: "1", medium: "5", high: "20", critical: "50" },
  });

  const addJudge = () => {
    setFormData({
      ...formData,
      judges: [...formData.judges, ""],
    });
  };

  const updateJudge = (index: number, value: string) => {
    const newJudges = [...formData.judges];
    newJudges[index] = value;
    setFormData({ ...formData, judges: newJudges });
  };

  const createVault = async () => {
    if (!isConnected || !walletProvider) {
      toast.error("Please connect your wallet");
      return;
    }

    const validJudges = formData.judges.filter((j) => ethers.isAddress(j));
    if (validJudges.length === 0) {
      toast.error("Please add at least one valid judge address");
      return;
    }

    if (parseInt(formData.requiredApprovals) > validJudges.length) {
      toast.error("Required approvals cannot exceed number of judges");
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(VAULT_GUARD_ADDRESS, VAULT_GUARD_ABI, signer);

      const payouts = [
        parseInt(formData.payouts.low) * 100, // Convert to basis points
        parseInt(formData.payouts.medium) * 100,
        parseInt(formData.payouts.high) * 100,
        parseInt(formData.payouts.critical) * 100,
      ];

      const tx = await contract.createVault(
        validJudges,
        formData.requiredApprovals,
        payouts,
        { value: ethers.parseEther(formData.deposit) }
      );

      toast.success("Transaction submitted! Waiting for confirmation...");
      await tx.wait();
      toast.success("Vault created successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to create vault");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Create Bug Bounty Vault
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Set up your protocol's security bounty program
            </p>
          </motion.div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-indigo-600" />
                Vault Configuration
              </CardTitle>
              <CardDescription>
                Configure your bug bounty vault settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="deposit">Initial Deposit (CELO)</Label>
                <Input
                  id="deposit"
                  type="number"
                  placeholder="10"
                  value={formData.deposit}
                  onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Judges</Label>
                  <Button variant="outline" size="sm" onClick={addJudge}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Judge
                  </Button>
                </div>
                {formData.judges.map((judge, index) => (
                  <Input
                    key={index}
                    placeholder="0x..."
                    value={judge}
                    onChange={(e) => updateJudge(index, e.target.value)}
                    className="mb-2"
                  />
                ))}
              </div>

              <div>
                <Label htmlFor="approvals">Required Approvals</Label>
                <Input
                  id="approvals"
                  type="number"
                  value={formData.requiredApprovals}
                  onChange={(e) =>
                    setFormData({ ...formData, requiredApprovals: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { key: "low", label: "Low (%)" },
                  { key: "medium", label: "Medium (%)" },
                  { key: "high", label: "High (%)" },
                  { key: "critical", label: "Critical (%)" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <Label>{label}</Label>
                    <Input
                      type="number"
                      value={formData.payouts[key as keyof typeof formData.payouts]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          payouts: { ...formData.payouts, [key]: e.target.value },
                        })
                      }
                    />
                  </div>
                ))}
              </div>

              <Button
                onClick={createVault}
                disabled={loading || !isConnected}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                size="lg"
              >
                {loading ? "Creating..." : "Create Vault"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

