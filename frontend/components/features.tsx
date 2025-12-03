"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Users, TrendingUp, Lock, Eye } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Protocol-Friendly",
    description:
      "Create vaults with custom payout tiers. Choose your own judges and set approval thresholds.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Zap,
    title: "Researcher-Friendly",
    description:
      "Only 2.5% platform fee. Submit via IPFS for privacy. Trustless and censorship-resistant.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Users,
    title: "Decentralized Judges",
    description:
      "Multisig voting by trusted security firms, auditors, or community members.",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: Lock,
    title: "Funds Locked",
    description:
      "All funds are locked in smart contracts until submissions are approved.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Eye,
    title: "Fully Transparent",
    description:
      "All submissions, votes, and payouts are recorded on-chain for complete transparency.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: TrendingUp,
    title: "Composable",
    description:
      "Other protocols can query past submissions to build researcher reputation systems.",
    color: "from-pink-500 to-rose-500",
  },
];

export function Features() {
  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-50/30 to-transparent dark:via-indigo-950/20" />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, type: "spring" }}
            className="inline-block mb-6"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shadow-2xl">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </motion.div>
          <h2 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Why Choose VaultGuard?
          </h2>
          <p className="text-2xl text-slate-700 dark:text-slate-200 max-w-3xl mx-auto font-semibold">
            Built for protocols, researchers, and the entire{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Web3 security ecosystem
            </span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
                type: "spring",
                stiffness: 100,
              }}
              whileHover={{ y: -12, scale: 1.02 }}
              className="group"
            >
              <Card className="h-full hover:shadow-[0_25px_50px_-12px_rgba(99,102,241,0.4)] transition-all duration-500 border-2 hover:border-indigo-400 dark:hover:border-indigo-600 glass backdrop-blur-xl overflow-hidden relative">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
                />
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <CardHeader className="relative z-10 pb-4">
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: [0, -15, 15, -15, 0] }}
                    transition={{ duration: 0.6 }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 shadow-2xl group-hover:shadow-[0_0_30px_rgba(99,102,241,0.6)]`}
                  >
                    <feature.icon className="h-8 w-8 text-white drop-shadow-lg" />
                  </motion.div>
                  <CardTitle className="text-3xl font-black bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-100 dark:via-slate-200 dark:to-slate-100 bg-clip-text text-transparent mb-2">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
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
