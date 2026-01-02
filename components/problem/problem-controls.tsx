"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, Share2, Eye, EyeOff, Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProblemControlsProps {
  onLike: () => void;
  onDislike: () => void;
  onShare: () => void;
  onRevealAnswer: () => void;
  onToggleSolved: () => void;
  reaction: "like" | "dislike" | null;
  isAnswerRevealed: boolean;
  isSolved: boolean;
  layout?: "vertical" | "horizontal";
}

export function ProblemControls({
  onLike,
  onDislike,
  onShare,
  onRevealAnswer,
  onToggleSolved,
  reaction,
  isAnswerRevealed,
  isSolved,
  layout = "vertical",
}: ProblemControlsProps) {
  const containerClass = layout === "vertical" 
    ? "flex flex-col gap-4 items-center" 
    : "flex flex-row gap-3 items-center";

  return (
    <div className={containerClass}>
      {/* Like Button */}
      <ControlButton
        onClick={onLike}
        active={reaction === "like"}
        activeColor="text-green-500"
        label="Like"
        layout={layout}
      >
        <ThumbsUp className="w-5 h-5" />
      </ControlButton>

      {/* Dislike Button */}
      <ControlButton
        onClick={onDislike}
        active={reaction === "dislike"}
        activeColor="text-red-500"
        label="Dislike"
        layout={layout}
      >
        <ThumbsDown className="w-5 h-5" />
      </ControlButton>

      {/* Reveal Answer Button */}
      <ControlButton
        onClick={onRevealAnswer}
        active={isAnswerRevealed}
        activeColor="text-primary-500"
        label={isAnswerRevealed ? "Hide Answer" : "Show Answer"}
        layout={layout}
      >
        {isAnswerRevealed ? (
          <EyeOff className="w-5 h-5" />
        ) : (
          <Eye className="w-5 h-5" />
        )}
      </ControlButton>

      {/* Toggle Solved Button */}
      <ControlButton
        onClick={onToggleSolved}
        active={isSolved}
        activeColor="text-emerald-500"
        label={isSolved ? "Mark Unsolved" : "Mark Solved"}
        layout={layout}
      >
        {isSolved ? (
          <RotateCcw className="w-5 h-5" />
        ) : (
          <Check className="w-5 h-5" />
        )}
      </ControlButton>

      {/* Share Button */}
      <ControlButton 
        onClick={onShare} 
        label="Share"
        layout={layout}
      >
        <Share2 className="w-5 h-5" />
      </ControlButton>
    </div>
  );
}

interface ControlButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  activeColor?: string;
  label: string;
  disabled?: boolean;
  layout?: "vertical" | "horizontal";
}

function ControlButton({
  children,
  onClick,
  active,
  activeColor = "text-primary-500",
  label,
  disabled,
  layout = "vertical",
}: ControlButtonProps) {
  const [showLabel, setShowLabel] = useState(false);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setShowLabel(true)}
        onMouseLeave={() => setShowLabel(false)}
        className={cn(
          "w-11 h-11 rounded-full flex items-center justify-center",
          "bg-black/40 backdrop-blur-md border border-white/20",
          "transition-all duration-200",
          "hover:bg-black/60",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          active ? activeColor : "text-white"
        )}
      >
        {children}
      </motion.button>

      {/* Label tooltip - only show on desktop vertical layout */}
      {showLabel && layout === "vertical" && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap hidden md:block"
        >
          <span className="px-3 py-1.5 rounded-lg bg-black/80 text-white text-sm">
            {label}
          </span>
        </motion.div>
      )}
    </div>
  );
}
