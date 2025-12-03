"use client";

import { motion } from "framer-motion";
import { Shield, ArrowRight, Sparkles, Zap, TrendingUp } from "lucide-react";
import { useAppKit } from "@reown/appkit/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Particles } from "./particles";
import { MeshGradient } from "./mesh-gradient";
import { FloatingShapes } from "./floating-shapes";
import { MouseFollower } from "./mouse-follower";
import { Confetti } from "./confetti";
import { useState } from "react";

export function Hero() {
  const { open } = useAppKit();
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-screen flex items-center">
      <MeshGradient />
      <FloatingShapes />
      <Particles />
      <MouseFollower />
      <Confetti trigger={confettiTrigger > 0} />

      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-[500px] h-[500px] bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-40"
          animate={{
            scale: [1, 1.4, 1],
            x: [0, 200, 0],
            y: [0, -100, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-10 w-[500px] h-[500px] bg-gradient-to-br from-pink-400 via-rose-500 to-orange-500 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-40"
          animate={{
            scale: [1.3, 1, 1.3],
            x: [0, -200, 0],
            y: [0, 100, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-32 left-1/2 w-[500px] h-[500px] bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-500 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-40"
          animate={{
            scale: [1, 1.5, 1],
            x: [0, 150, 0],
            y: [0, -80, 0],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="inline-flex items-center space-x-3 px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-xl border-2 border-indigo-300/50 dark:border-indigo-700/50 text-indigo-600 dark:text-indigo-400 mb-10 shadow-2xl animate-pulse-glow"
        >
          <motion.div
            animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="h-6 w-6 text-indigo-500 drop-shadow-lg" />
          </motion.div>
          <span className="text-base font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-wide">
            DECENTRALIZED BUG BOUNTY PLATFORM
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.2,
            type: "spring",
            stiffness: 100,
          }}
          className="text-7xl md:text-9xl font-black mb-8 leading-tight tracking-tight"
        >
          <motion.span
            className="block bg-gradient-to-r from-indigo-600 via-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent drop-shadow-2xl"
            animate={{
              backgroundPosition: ["0%", "100%", "0%"],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              backgroundSize: "200% auto",
            }}
          >
            SECURE YOUR
          </motion.span>
          <motion.span
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4, type: "spring" }}
            className="block bg-gradient-to-r from-purple-600 via-pink-600 via-rose-600 to-orange-600 bg-clip-text text-transparent mt-2"
            animate={{
              backgroundPosition: ["100%", "0%", "100%"],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              backgroundSize: "200% auto",
            }}
          >
            PROTOCOL
          </motion.span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <Zap className="h-8 w-8 text-yellow-400 animate-pulse" />
          <span className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">
            REWARD RESEARCHERS
          </span>
          <TrendingUp className="h-8 w-8 text-green-400 animate-pulse" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-2xl md:text-3xl text-slate-700 dark:text-slate-200 mb-12 max-w-4xl mx-auto leading-relaxed font-medium"
        >
          The <span className="font-bold text-indigo-600">first</span>{" "}
          decentralized bug bounty platform on{" "}
          <span className="font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
            Celo
          </span>
          . Protocols create vaults, researchers submit vulnerabilities, and
          trusted judges verify submissions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-6 px-8 py-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-2 border-indigo-200/50 dark:border-indigo-800/50 shadow-xl">
            {[
              {
                icon: "✨",
                text: "2.5% Fee",
                color: "from-indigo-500 to-purple-500",
              },
              {
                icon: "🛡️",
                text: "No Censorship",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: "👁️",
                text: "Fully Transparent",
                color: "from-pink-500 to-rose-500",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="flex items-center gap-2"
              >
                <span className="text-2xl">{item.icon}</span>
                <span
                  className={`text-lg font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}
                >
                  {item.text}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
        >
          <Link href="/create">
            <motion.div
              whileHover={{ scale: 1.08, y: -3 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
              onClick={() => setConfettiTrigger((prev) => prev + 1)}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 via-pink-600 to-rose-600 rounded-2xl blur-lg opacity-75 animate-pulse" />
              <Button
                size="lg"
                className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white px-12 py-8 text-xl font-black shadow-2xl group overflow-hidden border-0"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Shield className="h-6 w-6" />
                  </motion.div>
                  Create Vault
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </Button>
            </motion.div>
          </Link>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              variant="outline"
              onClick={() => open()}
              className="px-12 py-8 text-xl font-bold border-2 border-indigo-400 dark:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 backdrop-blur-xl glass shadow-xl"
            >
              <Shield className="mr-3 h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              Connect Wallet
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          {[
            {
              label: "Active Vaults",
              value: "12+",
              icon: "🛡️",
              color: "from-blue-500 to-cyan-500",
              change: "+3 this month",
            },
            {
              label: "Total Bounties",
              value: "$50K+",
              icon: "💰",
              color: "from-purple-500 to-pink-500",
              change: "Locked & Secure",
            },
            {
              label: "Researchers",
              value: "200+",
              icon: "👥",
              color: "from-indigo-500 to-purple-500",
              change: "Active Community",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 40, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.6,
                delay: 1.1 + index * 0.15,
                type: "spring",
                stiffness: 100,
              }}
              whileHover={{ scale: 1.08, y: -8, rotate: [0, -2, 2, 0] }}
              className="text-center p-8 rounded-3xl glass backdrop-blur-xl border-2 border-white/30 dark:border-slate-700/50 shadow-2xl hover:shadow-[0_20px_50px_rgba(99,102,241,0.3)] transition-all relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-2xl"
              />
              <div className="relative z-10">
                <div className="text-5xl mb-3">{stat.icon}</div>
                <div
                  className={`text-5xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-3`}
                >
                  {stat.value}
                </div>
                <div className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                  {stat.label}
                </div>
                <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  {stat.change}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
