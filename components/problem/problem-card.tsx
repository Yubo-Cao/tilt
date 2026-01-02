"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ProblemContent } from "./problem-content";
import { ProblemControls } from "./problem-controls";
import { ConfettiEffect, JitterWrapper } from "./problem-effects";
import type { ProblemWithInteraction } from "@/lib/problems";

interface ProblemCardProps {
  problem: ProblemWithInteraction;
  onReaction: (reaction: "like" | "dislike" | null) => void;
  onToggleSolved: (solved: boolean) => void;
  onShare: () => void;
  isActive: boolean;
}

export function ProblemCard({
  problem,
  onReaction,
  onToggleSolved,
  onShare,
  isActive,
}: ProblemCardProps) {
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentReaction, setCurrentReaction] = useState(problem.reaction || null);
  const [isSolved, setIsSolved] = useState(problem.solved || false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Sync solved state from props when problem changes
  useEffect(() => {
    setIsSolved(problem.solved || false);
    setCurrentReaction(problem.reaction || null);
    setIsAnswerRevealed(false);
  }, [problem.id, problem.solved, problem.reaction]);

  // Handle background media
  useEffect(() => {
    if (isActive) {
      if (problem.backgroundMusicUrl && audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
      if (problem.backgroundVideoUrl && videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
  }, [isActive, problem.backgroundMusicUrl, problem.backgroundVideoUrl]);

  const handleLike = () => {
    const newReaction = currentReaction === "like" ? null : "like";
    setCurrentReaction(newReaction);
    onReaction(newReaction);
  };

  const handleDislike = () => {
    const newReaction = currentReaction === "dislike" ? null : "dislike";
    setCurrentReaction(newReaction);
    onReaction(newReaction);
  };

  const handleRevealAnswer = () => {
    setIsAnswerRevealed(!isAnswerRevealed);
  };

  const handleToggleSolved = () => {
    const newSolved = !isSolved;
    setIsSolved(newSolved);
    onToggleSolved(newSolved);
    
    if (newSolved && problem.effect === "confetti") {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const shouldJitter = problem.effect === "jitter" && !isSolved;

  return (
    <div className="snap-item relative w-full h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background Video */}
      {problem.backgroundVideoUrl && (
        <video
          ref={videoRef}
          src={problem.backgroundVideoUrl}
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          loop
          muted
          playsInline
        />
      )}

      {/* Background Music */}
      {problem.backgroundMusicUrl && (
        <audio ref={audioRef} src={problem.backgroundMusicUrl} loop />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />

      {/* Confetti Effect */}
      <ConfettiEffect trigger={showConfetti} />

      {/* Solved Badge */}
      <AnimatePresence>
        {isSolved && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-medium text-sm z-20"
          >
            ✓ Solved
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 md:px-6 py-16 md:py-12">
        <JitterWrapper active={shouldJitter}>
          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 text-center md:text-left"
          >
            {problem.title}
          </motion.h2>

          {/* Question - Tappable on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => setIsAnswerRevealed(!isAnswerRevealed)}
            className={cn(
              "glass rounded-[16px] md:rounded-[20px] p-4 md:p-6 mb-4 cursor-pointer",
              "transition-all duration-200",
              "active:scale-[0.98]",
              isAnswerRevealed && "border-2 border-primary-500/30"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs md:text-sm font-medium text-white/60">Question</h3>
              <span className="text-xs text-white/40 md:hidden">
                {isAnswerRevealed ? "Tap to hide" : "Tap to reveal"}
              </span>
            </div>
            <ProblemContent blocks={problem.questionBlocks} />
          </motion.div>

          {/* Answer */}
          <AnimatePresence>
            {isAnswerRevealed && (
              <motion.div
                initial={{ opacity: 0, y: 20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="glass rounded-[16px] md:rounded-[20px] p-4 md:p-6 border-2 border-primary-500/30">
                  <h3 className="text-xs md:text-sm font-medium text-primary-400 mb-3">Answer</h3>
                  <ProblemContent blocks={problem.answerBlocks} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </JitterWrapper>
      </div>

      {/* Controls - Desktop (Right Side) */}
      <div className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 hidden md:block z-20">
        <ProblemControls
          onLike={handleLike}
          onDislike={handleDislike}
          onShare={onShare}
          onRevealAnswer={handleRevealAnswer}
          onToggleSolved={handleToggleSolved}
          reaction={currentReaction}
          isAnswerRevealed={isAnswerRevealed}
          isSolved={isSolved}
          layout="vertical"
        />
      </div>

      {/* Controls - Mobile (Bottom) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:hidden z-20">
        <div className="bg-black/60 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
          <ProblemControls
            onLike={handleLike}
            onDislike={handleDislike}
            onShare={onShare}
            onRevealAnswer={handleRevealAnswer}
            onToggleSolved={handleToggleSolved}
            reaction={currentReaction}
            isAnswerRevealed={isAnswerRevealed}
            isSolved={isSolved}
            layout="horizontal"
          />
        </div>
      </div>
    </div>
  );
}
