"use client";

import { motion } from "framer-motion";
import { useWeb3ModalAccount } from "@reown/appkit/react";
import { Shield, Zap, Users, TrendingUp, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { Stats } from "@/components/stats";
import { CTA } from "@/components/cta";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <CTA />
    </div>
  );
}

