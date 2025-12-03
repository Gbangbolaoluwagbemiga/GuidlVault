"use client";

import { motion } from "framer-motion";
import { TrendingUp, DollarSign, Users, Shield } from "lucide-react";

const stats = [
  {
    icon: Shield,
    label: "Active Vaults",
    value: "12",
    change: "+3 this month",
  },
  {
    icon: DollarSign,
    label: "Total Bounties",
    value: "$50K+",
    change: "Locked in contracts",
  },
  {
    icon: Users,
    label: "Researchers",
    value: "200+",
    change: "Active community",
  },
  {
    icon: TrendingUp,
    label: "Success Rate",
    value: "85%",
    change: "Approved submissions",
  },
];

export function Stats() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.7, y: 30, rotate: -10 }}
              whileInView={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.7, 
                delay: index * 0.15, 
                type: "spring", 
                stiffness: 150,
                damping: 12
              }}
              whileHover={{ 
                scale: 1.12, 
                y: -10, 
                rotate: [0, -3, 3, -3, 0],
                transition: { duration: 0.3 }
              }}
              className="text-center p-10 rounded-3xl glass backdrop-blur-xl border-2 border-white/40 dark:border-slate-700/60 shadow-2xl hover:shadow-[0_30px_60px_rgba(99,102,241,0.4)] transition-all relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-indigo-300/30 to-purple-300/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100"
              />
              <div className="relative z-10">
                <motion.div
                  whileHover={{ scale: 1.3, rotate: [0, 360] }}
                  transition={{ duration: 0.6 }}
                  className="mb-6"
                >
                  <stat.icon className="h-12 w-12 mx-auto text-indigo-600 dark:text-indigo-400 drop-shadow-2xl filter brightness-110" />
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 + 0.3, type: "spring" }}
                  className="text-5xl md:text-6xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mb-3 leading-none"
                >
                  {stat.value}
                </motion.div>
                <div className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
                  {stat.label}
                </div>
                <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1 rounded-full inline-block">
                  {stat.change}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


