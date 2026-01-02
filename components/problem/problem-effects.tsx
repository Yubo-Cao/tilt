"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
}

const CONFETTI_COLORS = [
  "#3b82f6", // blue
  "#60a5fa", // light blue
  "#93c5fd", // lighter blue
  "#f59e0b", // amber
  "#10b981", // emerald
  "#8b5cf6", // violet
  "#ec4899", // pink
];

export function ConfettiEffect({
  trigger,
  duration = 3000,
}: {
  trigger: boolean;
  duration?: number;
}) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  const generateConfetti = useCallback(() => {
    const newPieces: ConfettiPiece[] = [];
    for (let i = 0; i < 100; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * 100,
        y: -10,
        rotation: Math.random() * 360,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: Math.random() * 10 + 5,
      });
    }
    setPieces(newPieces);
  }, []);

  useEffect(() => {
    if (trigger) {
      generateConfetti();
      const timer = setTimeout(() => {
        setPieces([]);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [trigger, duration, generateConfetti]);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{
            left: `${piece.x}%`,
            top: "-5%",
            rotate: piece.rotation,
            opacity: 1,
          }}
          animate={{
            top: "105%",
            rotate: piece.rotation + Math.random() * 720,
            opacity: 0,
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            ease: "easeOut",
          }}
          className="absolute"
          style={{
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}

export function JitterWrapper({
  children,
  active,
  className,
}: {
  children: React.ReactNode;
  active: boolean;
  className?: string;
}) {
  return (
    <div className={cn(active && "jitter", className)}>
      {children}
    </div>
  );
}
