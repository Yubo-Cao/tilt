"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, PartyPopper } from "lucide-react";
import { ProblemCard } from "@/components/problem/problem-card";
import type { ProblemWithInteraction } from "@/lib/problems";

interface InfiniteScrollProps {
  initialProblems: ProblemWithInteraction[];
  userId: string;
  onLoadMore: (seenIds: string[]) => Promise<ProblemWithInteraction[]>;
  onReaction: (interactionId: string, reaction: "like" | "dislike" | null) => Promise<void>;
  onToggleSolved: (interactionId: string, solved: boolean) => Promise<void>;
  onShare: (problem: ProblemWithInteraction) => void;
}

export function InfiniteScroll({
  initialProblems,
  userId,
  onLoadMore,
  onReaction,
  onToggleSolved,
  onShare,
}: InfiniteScrollProps) {
  const [problems, setProblems] = useState<ProblemWithInteraction[]>(initialProblems);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track seen problem IDs to avoid duplicates
  const seenProblemIds = useRef<Set<string>>(new Set(initialProblems.map(p => p.id)));

  // Track which problem is currently visible
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const itemHeight = window.innerHeight;
      const newIndex = Math.round(scrollTop / itemHeight);
      if (newIndex !== activeIndex && newIndex >= 0 && newIndex < problems.length) {
        setActiveIndex(newIndex);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [activeIndex, problems.length]);

  // Load more problems when approaching the end
  const loadMoreProblems = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    try {
      const seenIds = Array.from(seenProblemIds.current);
      const newProblems = await onLoadMore(seenIds);
      
      if (newProblems.length === 0) {
        setHasMore(false);
      } else {
        // Filter out any duplicates just in case
        const uniqueNewProblems = newProblems.filter(p => !seenProblemIds.current.has(p.id));
        
        if (uniqueNewProblems.length === 0) {
          setHasMore(false);
        } else {
          uniqueNewProblems.forEach(p => seenProblemIds.current.add(p.id));
          setProblems((prev) => [...prev, ...uniqueNewProblems]);
        }
      }
    } catch (error) {
      console.error("Error loading more problems:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, onLoadMore]);

  // Trigger load more when 2 problems away from the end
  useEffect(() => {
    if (activeIndex >= problems.length - 2 && !isLoading && hasMore) {
      loadMoreProblems();
    }
  }, [activeIndex, problems.length, isLoading, hasMore, loadMoreProblems]);

  const handleReaction = async (index: number, reaction: "like" | "dislike" | null) => {
    const problem = problems[index];
    if (problem.interactionId) {
      await onReaction(problem.interactionId, reaction);
      // Update local state
      setProblems((prev) =>
        prev.map((p, i) => (i === index ? { ...p, reaction } : p))
      );
    }
  };

  const handleToggleSolved = async (index: number, solved: boolean) => {
    const problem = problems[index];
    if (problem.interactionId) {
      await onToggleSolved(problem.interactionId, solved);
      // Update local state
      setProblems((prev) =>
        prev.map((p, i) => (i === index ? { ...p, solved } : p))
      );
    }
  };

  if (problems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary-500/20 flex items-center justify-center">
            <PartyPopper className="w-10 h-10 text-primary-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            No Problems Available
          </h2>
          <p className="text-white/60 max-w-sm">
            Check back soon for new problems to solve! In the meantime, why not take a break?
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="snap-container scrollbar-hide bg-black"
    >
      {problems.map((problem, index) => (
        <ProblemCard
          key={`${problem.id}-${index}`}
          problem={problem}
          isActive={index === activeIndex}
          onReaction={(reaction) => handleReaction(index, reaction)}
          onToggleSolved={(solved) => handleToggleSolved(index, solved)}
          onShare={() => onShare(problem)}
        />
      ))}

      {/* Loading indicator or end message */}
      {isLoading ? (
        <div className="snap-item flex items-center justify-center bg-black">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            <p className="text-white/60">Loading more problems...</p>
          </motion.div>
        </div>
      ) : !hasMore && problems.length > 0 ? (
        <div className="snap-item flex items-center justify-center bg-black px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <PartyPopper className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              You&apos;ve Seen Them All!
            </h2>
            <p className="text-white/60 max-w-sm">
              Great job! You&apos;ve gone through all available problems. Check back later for new ones.
            </p>
          </motion.div>
        </div>
      ) : null}
    </div>
  );
}
