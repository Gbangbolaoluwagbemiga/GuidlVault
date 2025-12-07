"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ethers } from "ethers";
import { Shield, Plus, Users, Percent, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/navbar";
import { useVaultGuard } from "@/hooks/useVaultGuard";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CreateVault() {
  const router = useRouter();
  const { loading, createVault, isConnected } = useVaultGuard();
  const [formData, setFormData] = useState({
    deposit: "",
    judges: [""],
    requiredApprovals: "2",
    payouts: { low: "1", medium: "5", high: "20", critical: "50" },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const addJudge = () => {
    setFormData({
      ...formData,
      judges: [...formData.judges, ""],
    });
  };

  const removeJudge = (index: number) => {
    const newJudges = formData.judges.filter((_, i) => i !== index);
    setFormData({ ...formData, judges: newJudges.length ? newJudges : [""] });
  };

  const updateJudge = (index: number, value: string) => {
    const newJudges = [...formData.judges];
    newJudges[index] = value;
    setFormData({ ...formData, judges: newJudges });
    
    // Clear error for this judge
    if (errors[`judge-${index}`]) {
      const newErrors = { ...errors };
      delete newErrors[`judge-${index}`];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate deposit
    if (!formData.deposit || parseFloat(formData.deposit) <= 0) {
      newErrors.deposit = "Deposit must be greater than 0";
    }

    // Validate judges
    const validJudges = formData.judges.filter((j) => j && ethers.isAddress(j));
    formData.judges.forEach((judge, index) => {
      if (judge && !ethers.isAddress(judge)) {
        newErrors[`judge-${index}`] = "Invalid Ethereum address";
      }
    });

    if (validJudges.length === 0) {
      newErrors.judges = "Please add at least one valid judge address";
    }

    // Validate required approvals
    const approvals = parseInt(formData.requiredApprovals);
    if (isNaN(approvals) || approvals < 1) {
      newErrors.requiredApprovals = "Must be at least 1";
    } else if (approvals > validJudges.length) {
      newErrors.requiredApprovals = "Cannot exceed number of judges";
    }

    // Validate payouts
    const payoutSum = 
      parseInt(formData.payouts.low) +
      parseInt(formData.payouts.medium) +
      parseInt(formData.payouts.high) +
      parseInt(formData.payouts.critical);

    if (payoutSum > 100) {
      newErrors.payouts = "Total payouts cannot exceed 100%";
    }

    Object.entries(formData.payouts).forEach(([key, value]) => {
      const val = parseInt(value);
      if (isNaN(val) || val < 0 || val > 100) {
        newErrors[`payout-${key}`] = "Must be 0-100%";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    const validJudges = formData.judges.filter((j) => ethers.isAddress(j));

    const payouts: [number, number, number, number] = [
      parseInt(formData.payouts.low) * 100, // Convert to basis points
      parseInt(formData.payouts.medium) * 100,
      parseInt(formData.payouts.high) * 100,
      parseInt(formData.payouts.critical) * 100,
    ];

    try {
      await createVault(
        validJudges,
        parseInt(formData.requiredApprovals),
        payouts,
        formData.deposit
      );
      
      // Reset form
      setFormData({
        deposit: "",
        judges: [""],
        requiredApprovals: "2",
        payouts: { low: "1", medium: "5", high: "20", critical: "50" },
      });
      
      // Redirect to vaults page
      setTimeout(() => {
        router.push("/vaults");
      }, 2000);
    } catch (error) {
      // Error is already handled in the hook
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
                  onChange={(e) =>
                    setFormData({ ...formData, deposit: e.target.value })
                  }
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
                    setFormData({
                      ...formData,
                      requiredApprovals: e.target.value,
                    })
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
                      value={
                        formData.payouts[key as keyof typeof formData.payouts]
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          payouts: {
                            ...formData.payouts,
                            [key]: e.target.value,
                          },
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
