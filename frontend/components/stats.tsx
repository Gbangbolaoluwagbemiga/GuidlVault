"use client";

import { motion } from "framer-motion";
import { TrendingUp, DollarSign, Users, Shield } from "lucide-react";

const stats = [
  { icon: Shield, label: "Active Vaults", value: "12", change: "+3 this month" },
  { icon: DollarSign, label: "Total Bounties", value: "$50K+", change: "Locked in contracts" },
  { icon: Users, label: "Researchers", value: "200+", change: "Active community" },
  { icon: TrendingUp, label: "Success Rate", value: "85%", change: "Approved submissions" },
];

export function Stats() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="text-center p-6 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700"
            >
              <stat.icon className="h-8 w-8 mx-auto mb-3 text-indigo-600 dark:text-indigo-400" />
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                {stat.label}
              </div>
              <div className="text-xs text-indigo-600 dark:text-indigo-400">
                {stat.change}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

