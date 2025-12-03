"use client";

import { motion } from "framer-motion";
import { Shield, Menu, X } from "lucide-react";
import { useWeb3Modal } from "@reown/appkit/react";
import { useWeb3ModalAccount } from "@reown/appkit/react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";

export function Navbar() {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useWeb3ModalAccount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Shield className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              VaultGuard
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/vaults" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Vaults
            </Link>
            <Link href="/create" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Create Vault
            </Link>
            <Link href="/submit" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Submit
            </Link>
            <Button
              onClick={() => open()}
              variant={isConnected ? "outline" : "default"}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {isConnected
                ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
                : "Connect Wallet"}
            </Button>
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
            <Link href="/vaults" className="block text-slate-600 dark:text-slate-300">
              Vaults
            </Link>
            <Link href="/create" className="block text-slate-600 dark:text-slate-300">
              Create Vault
            </Link>
            <Link href="/submit" className="block text-slate-600 dark:text-slate-300">
              Submit
            </Link>
            <Button onClick={() => open()} className="w-full">
              {isConnected ? "Disconnect" : "Connect Wallet"}
            </Button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

