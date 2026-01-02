"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

export function GlowCard({
  children,
  className,
  glowColor = "rgba(59, 130, 246, 0.3)",
}: GlowCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative rounded-ios-lg p-px",
        "bg-gradient-to-b from-primary-400/50 to-primary-600/50",
        className
      )}
      style={{
        boxShadow: `0 0 40px ${glowColor}, 0 0 80px ${glowColor}`,
      }}
    >
      <div className="rounded-[19px] bg-background p-6 h-full">
        {children}
      </div>
    </motion.div>
  );
}
