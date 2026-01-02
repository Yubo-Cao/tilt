"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface ShimmerButtonProps {
  children: ReactNode;
  className?: string;
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function ShimmerButton({
  children,
  className,
  shimmerColor = "rgba(255, 255, 255, 0.3)",
  shimmerSize = "0.1em",
  borderRadius = "12px",
  shimmerDuration = "2s",
  background = "linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)",
  onClick,
  disabled,
  type = "button",
}: ShimmerButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative overflow-hidden px-8 py-4 font-semibold text-white",
        "shadow-[0_4px_20px_rgba(59,130,246,0.4)]",
        "hover:shadow-[0_8px_30px_rgba(59,130,246,0.5)]",
        "transition-shadow duration-300",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      style={{
        background,
        borderRadius,
      }}
    >
      {/* Shimmer effect */}
      <span
        className="absolute inset-0 overflow-hidden"
        style={{ borderRadius }}
      >
        <span
          className="absolute inset-0 animate-shimmer"
          style={{
            background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
            backgroundSize: "200% 100%",
            animation: `shimmer ${shimmerDuration} infinite`,
          }}
        />
      </span>

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}
