"use client";

import { motion } from "framer-motion";
import { Shield, Menu, X } from "lucide-react";
import { useAppKit } from "@reown/appkit/react";
import { useAccount, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 w-full z-50 glass backdrop-blur-2xl border-b-2 border-white/30 dark:border-slate-800/70 shadow-2xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-indigo-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <Shield className="h-9 w-9 text-indigo-600 dark:text-indigo-400 relative z-10 drop-shadow-lg" />
            </motion.div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              VaultGuard
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/vaults"
              className="text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium hover:scale-105 relative group"
            >
              Vaults
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              href="/dashboard"
              className="text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium hover:scale-105 relative group"
            >
              Dashboard
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              href="/judge"
              className="text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium hover:scale-105 relative group"
            >
              Judge Portal
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              href="/create"
              className="text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium hover:scale-105 relative group"
            >
              Create Vault
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              href="/submit"
              className="text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium hover:scale-105 relative group"
            >
              Submit
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300" />
            </Link>
            <ThemeToggle />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => open()}
                variant={isConnected ? "outline" : "default"}
                className={`font-semibold shadow-lg ${
                  isConnected
                    ? "border-2 border-indigo-300 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                    : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 animate-pulse-glow"
                }`}
              >
                {isConnected
                  ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
                  : "Connect Wallet"}
              </Button>
            </motion.div>
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-slate-200 dark:border-slate-800"
        >
          <div className="px-4 py-4 space-y-4">
            <Link
              href="/vaults"
              className="block text-slate-600 dark:text-slate-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              Vaults
            </Link>
            <Link
              href="/dashboard"
              className="block text-slate-600 dark:text-slate-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/judge"
              className="block text-slate-600 dark:text-slate-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              Judge Portal
            </Link>
            <Link
              href="/create"
              className="block text-slate-600 dark:text-slate-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              Create Vault
            </Link>
            <Link
              href="/submit"
              className="block text-slate-600 dark:text-slate-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              Submit
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button onClick={() => open()} className="flex-1">
                {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : "Connect Wallet"}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
