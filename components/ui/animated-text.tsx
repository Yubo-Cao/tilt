"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedTextProps {
  text: string;
  className?: string;
  shimmer?: boolean;
  delay?: number;
}

export function AnimatedText({
  text,
  className,
  shimmer = false,
  delay = 0,
}: AnimatedTextProps) {
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: delay },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      className={cn("flex flex-wrap", className)}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <motion.span
          variants={child}
          key={index}
          className={cn("mr-2", shimmer && "shimmer-text")}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}

export function AnimatedLogo({ className }: { className?: string }) {
  return (
    <motion.h1
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn(
        "text-8xl md:text-9xl font-bold tracking-tight shimmer-text glow-text",
        className
      )}
    >
      Tilt
    </motion.h1>
  );
}
