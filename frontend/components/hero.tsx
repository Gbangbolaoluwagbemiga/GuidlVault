"use client";

import { motion } from "framer-motion";
import { Shield, ArrowRight, Sparkles } from "lucide-react";
import { useAppKit } from "@reown/appkit/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
  const { open } = useAppKit();

  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-screen flex items-center">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-40 animate-float"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 150, 0],
            y: [0, -80, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-40 animate-float"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -150, 0],
            y: [0, 80, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-32 left-1/2 w-96 h-96 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-40 animate-float"
          animate={{
            scale: [1, 1.4, 1],
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {/* Additional smaller floating elements */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 bg-gradient-to-br from-indigo-200 to-purple-300 rounded-full opacity-20 blur-2xl"
            animate={{
              x: [0, Math.random() * 200 - 100],
              y: [0, Math.random() * 200 - 100],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 30}%`,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-md border border-indigo-200/50 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400 mb-8 shadow-lg animate-pulse-glow"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="h-5 w-5 text-indigo-500" />
          </motion.div>
          <span className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Decentralized Bug Bounty Platform
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-6xl md:text-8xl font-extrabold mb-6 leading-tight"
        >
          <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient drop-shadow-2xl">
            Secure Your Protocol
          </span>
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="block bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mt-2"
          >
            Reward Researchers
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl md:text-2xl text-slate-700 dark:text-slate-200 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          The first decentralized bug bounty platform on Celo. Protocols create
          vaults, researchers submit vulnerabilities, and trusted judges verify
          submissions.
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="block mt-4 text-lg font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
          >
            ✨ Only 2.5% platform fee • 🛡️ No censorship • 👁️ Fully transparent
          </motion.span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <Link href="/create">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white px-10 py-7 text-lg font-bold shadow-2xl animate-pulse-glow group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Create Vault
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                </span>
                <div className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </motion.div>
          </Link>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              variant="outline"
              onClick={() => open()}
              className="px-10 py-7 text-lg font-semibold border-2 border-indigo-300 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 backdrop-blur-sm glass transition-all"
            >
              <Shield className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Connect Wallet
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {[
            { label: "Active Vaults", value: "12+", icon: "🛡️", color: "from-blue-500 to-cyan-500" },
            { label: "Total Bounties", value: "$50K+", icon: "💰", color: "from-purple-500 to-pink-500" },
            { label: "Researchers", value: "200+", icon: "👥", color: "from-indigo-500 to-purple-500" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center p-6 rounded-2xl glass backdrop-blur-md border border-white/20 shadow-xl hover:shadow-2xl transition-all"
            >
              <div className={`text-4xl mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent font-extrabold`}>
                {stat.value}
              </div>
              <div className="text-lg font-semibold text-slate-700 dark:text-slate-300 mt-2">
                {stat.icon} {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
