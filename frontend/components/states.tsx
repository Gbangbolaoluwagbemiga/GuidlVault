"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-center min-h-[400px]"
    >
      <Card className="border-2 border-dashed">
        <CardContent className="text-center py-12 px-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-4 flex justify-center"
          >
            {icon || <Info className="h-16 w-16 text-slate-400" />}
          </motion.div>
          <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            {description}
          </p>
          {action && <div className="flex justify-center">{action}</div>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  retry?: () => void;
}

export function ErrorState({ title = "Error", message, retry }: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center min-h-[400px]"
    >
      <Card className="border-2 border-red-200 dark:border-red-800">
        <CardContent className="text-center py-12 px-6">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2 text-red-900 dark:text-red-100">
            {title}
          </h3>
          <p className="text-red-600 dark:text-red-400 mb-6">{message}</p>
          {retry && (
            <button
              onClick={retry}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface SuccessStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function SuccessState({ title, description, action }: SuccessStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="flex items-center justify-center min-h-[400px]"
    >
      <Card className="border-2 border-green-200 dark:border-green-800">
        <CardContent className="text-center py-12 px-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-2xl font-bold mb-2 text-green-900 dark:text-green-100">
            {title}
          </h3>
          <p className="text-green-600 dark:text-green-400 mb-6">{description}</p>
          {action && <div className="flex justify-center">{action}</div>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

