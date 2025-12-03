"use client";

import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="w-10 h-10 rounded-full"
        aria-label="Toggle theme"
      >
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="relative"
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 border border-indigo-200/50 dark:border-indigo-800/50 backdrop-blur-sm transition-all duration-300 relative overflow-hidden group"
        aria-label="Toggle theme"
      >
        <motion.div
          initial={false}
          animate={{
            rotate: theme === "dark" ? 0 : 360,
            scale: theme === "dark" ? 0 : 1,
          }}
          transition={{ duration: 0.5, type: "spring" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sun className="h-5 w-5 text-yellow-500" />
        </motion.div>
        <motion.div
          initial={false}
          animate={{
            rotate: theme === "light" ? 0 : 360,
            scale: theme === "light" ? 0 : 1,
          }}
          transition={{ duration: 0.5, type: "spring" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Moon className="h-5 w-5 text-indigo-400" />
        </motion.div>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </Button>
    </motion.div>
  );
}

