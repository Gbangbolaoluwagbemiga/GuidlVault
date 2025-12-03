"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import { FileText, Upload, AlertCircle } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navbar } from "@/components/navbar";
import {
  VAULT_GUARD_ADDRESS,
  VAULT_GUARD_ABI,
  Severity,
  SEVERITY_LABELS,
} from "@/lib/contract";
import { toast } from "sonner";

export default function Submit() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vaultId: "",
    reportHash: "",
    severity: Severity.MEDIUM.toString(),
  });

  const submitVulnerability = async () => {
    if (!isConnected || !walletClient) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!formData.vaultId || !formData.reportHash) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      if (!publicClient || !walletClient) {
        toast.error("Wallet not available");
        return;
      }
      const provider = new ethers.BrowserProvider(walletClient as any);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        VAULT_GUARD_ADDRESS,
        VAULT_GUARD_ABI,
        signer
      );

      const tx = await contract.submitVulnerability(
        formData.vaultId,
        formData.reportHash,
        parseInt(formData.severity)
      );

      toast.success("Submission submitted! Waiting for confirmation...");
      await tx.wait();
      toast.success("Vulnerability submitted successfully!");
      setFormData({
        vaultId: "",
        reportHash: "",
        severity: Severity.MEDIUM.toString(),
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to submit vulnerability");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Submit Vulnerability
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Report a security issue and earn rewards
            </p>
          </motion.div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-indigo-600" />
                Vulnerability Report
              </CardTitle>
              <CardDescription>
                Submit your vulnerability report via IPFS hash
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-semibold mb-1">Privacy First</p>
                    <p>
                      Upload your report to IPFS and paste the hash here. This
                      keeps your findings private until approved.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="vaultId">Vault ID</Label>
                <Input
                  id="vaultId"
                  type="number"
                  placeholder="0"
                  value={formData.vaultId}
                  onChange={(e) =>
                    setFormData({ ...formData, vaultId: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="reportHash">IPFS Report Hash</Label>
                <Input
                  id="reportHash"
                  placeholder="Qm..."
                  value={formData.reportHash}
                  onChange={(e) =>
                    setFormData({ ...formData, reportHash: e.target.value })
                  }
                />
                <p className="text-xs text-slate-500 mt-1">
                  Upload your report to IPFS and paste the hash here
                </p>
              </div>

              <div>
                <Label htmlFor="severity">Severity Level</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) =>
                    setFormData({ ...formData, severity: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEVERITY_LABELS.map((label, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={submitVulnerability}
                disabled={loading || !isConnected}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                size="lg"
              >
                {loading ? "Submitting..." : "Submit Vulnerability"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
