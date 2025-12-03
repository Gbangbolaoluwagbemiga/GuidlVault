"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Users, TrendingUp, Lock, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Protocol-Friendly",
    description: "Create vaults with custom payout tiers. Choose your own judges and set approval thresholds.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Zap,
    title: "Researcher-Friendly",
    description: "Only 2.5% platform fee. Submit via IPFS for privacy. Trustless and censorship-resistant.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Users,
    title: "Decentralized Judges",
    description: "Multisig voting by trusted security firms, auditors, or community members.",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: Lock,
    title: "Funds Locked",
    description: "All funds are locked in smart contracts until submissions are approved.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Eye,
    title: "Fully Transparent",
    description: "All submissions, votes, and payouts are recorded on-chain for complete transparency.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: TrendingUp,
    title: "Composable",
    description: "Other protocols can query past submissions to build researcher reputation systems.",
    color: "from-pink-500 to-rose-500",
  },
];

export function Features() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Why Choose VaultGuard?
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Built for protocols, researchers, and the entire Web3 security ecosystem
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-xl transition-shadow border-2 hover:border-indigo-300 dark:hover:border-indigo-700">
                <CardHeader>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </motion.div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

