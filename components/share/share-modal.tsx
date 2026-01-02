"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Twitter, MessageCircle, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProblemWithInteraction } from "@/lib/problems";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: ProblemWithInteraction;
}

export function ShareModal({ isOpen, onClose, problem }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/share/${problem.visibleId}`
    : "";

  const shareMessages = {
    solved: `I just solved "${problem.title}" on Tilt! Can you beat my time? 🧠`,
    unsolved: `This problem on Tilt has me stumped! Think you can solve it? 🤔`,
    challenge: `I challenge you to solve this problem on Tilt! 💪`,
  };

  const currentMessage = problem.solved 
    ? shareMessages.solved 
    : shareMessages.unsolved;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${currentMessage}\n\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(currentMessage);
    const url = encodeURIComponent(shareUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank"
    );
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`${currentMessage}\n\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="glass rounded-[20px] p-6 mx-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  Share This Problem
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              {/* Problem Preview */}
              <div className="bg-white/5 rounded-[12px] p-4 mb-6">
                <p className="text-sm text-white/60 mb-1">Problem</p>
                <p className="text-white font-medium">{problem.title}</p>
                {problem.solved && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs font-medium text-emerald-400 bg-emerald-500/20 rounded-full">
                    ✓ Solved
                  </span>
                )}
              </div>

              {/* Share Message */}
              <div className="bg-white/5 rounded-[12px] p-4 mb-6">
                <p className="text-sm text-white/60 mb-2">Message</p>
                <p className="text-white text-sm">{currentMessage}</p>
              </div>

              {/* Share Options */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <ShareButton
                  icon={Twitter}
                  label="Twitter"
                  onClick={handleTwitterShare}
                  className="bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30"
                />
                <ShareButton
                  icon={MessageCircle}
                  label="WhatsApp"
                  onClick={handleWhatsAppShare}
                  className="bg-[#25D366]/20 hover:bg-[#25D366]/30"
                />
                <ShareButton
                  icon={copied ? Check : Copy}
                  label={copied ? "Copied!" : "Copy Link"}
                  onClick={handleCopy}
                  className="bg-primary-500/20 hover:bg-primary-500/30"
                />
              </div>

              {/* URL Display */}
              <div className="flex items-center gap-2 bg-white/5 rounded-[12px] p-3">
                <Link2 className="w-4 h-4 text-white/40 flex-shrink-0" />
                <p className="text-sm text-white/60 truncate">{shareUrl}</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface ShareButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  className?: string;
}

function ShareButton({ icon: Icon, label, onClick, className }: ShareButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-4 rounded-[12px] transition-colors",
        className
      )}
    >
      <Icon className="w-6 h-6 text-white" />
      <span className="text-xs text-white/80">{label}</span>
    </motion.button>
  );
}
