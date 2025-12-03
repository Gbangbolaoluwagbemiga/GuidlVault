"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  Users,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { Stats } from "@/components/stats";
import { CTA } from "@/components/cta";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 via-indigo-50/30 via-purple-50/30 to-pink-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 relative overflow-hidden">
      {/* Enhanced animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_50%)]" />
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <Stats />
        <Features />
        <CTA />
      </div>
    </div>
  );
}
