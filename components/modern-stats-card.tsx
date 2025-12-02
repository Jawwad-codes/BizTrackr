/** @format */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ModernStatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  gradient?: string;
  delay?: number;
}

export function ModernStatsCard({
  title,
  value,
  change,
  icon: Icon,
  trend = "neutral",
  gradient = "from-blue-500/20 to-purple-500/20",
  delay = 0,
}: ModernStatsCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-500";
      case "down":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getTrendBg = () => {
    switch (trend) {
      case "up":
        return "bg-green-500/10 border-green-500/20";
      case "down":
        return "bg-red-500/10 border-red-500/20";
      default:
        return "bg-muted/50 border-border/20";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="group relative overflow-hidden"
    >
      {/* Gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      {/* Card content */}
      <div className="relative p-6 border border-border/40 bg-card/80 backdrop-blur-sm rounded-xl hover:border-border/60 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <motion.h3
              className="text-3xl font-bold text-foreground"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: delay + 0.2 }}
            >
              {value}
            </motion.h3>
          </div>

          {/* Icon with animated background */}
          <motion.div
            className={`p-3 rounded-xl ${getTrendBg()} border`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Icon className={`h-6 w-6 ${getTrendColor()}`} />
          </motion.div>
        </div>

        {/* Change indicator */}
        {change !== undefined && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: delay + 0.3 }}
            className="flex items-center gap-2"
          >
            <span
              className={`text-sm font-medium ${getTrendColor()} flex items-center gap-1`}
            >
              {trend === "up" && "↑"}
              {trend === "down" && "↓"}
              {Math.abs(change)}%
            </span>
            <span className="text-xs text-muted-foreground">
              vs last period
            </span>
          </motion.div>
        )}

        {/* Animated border on hover */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-border animate-gradient" />
        </div>
      </div>
    </motion.div>
  );
}

export default ModernStatsCard;
