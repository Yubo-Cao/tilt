"use client";

import { useState, useEffect, useCallback } from "react";
import { InfiniteScroll } from "@/components/feed/infinite-scroll";
import { ShareModal } from "@/components/share/share-modal";
import type { ProblemWithInteraction } from "@/lib/problems";
import { Loader2 } from "lucide-react";

interface FeedClientProps {
  userId: string;
}

export function FeedClient({ userId }: FeedClientProps) {
  const [initialProblems, setInitialProblems] = useState<ProblemWithInteraction[] | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<ProblemWithInteraction | null>(null);
  const [seenIds, setSeenIds] = useState<string[]>([]);

  // Fetch initial problems
  useEffect(() => {
    async function fetchProblems() {
      try {
        const response = await fetch(`/api/problems?limit=5`);
        if (response.ok) {
          const data = await response.json();
          const problems = data.problems || [];
          setInitialProblems(problems);
          setSeenIds(problems.map((p: ProblemWithInteraction) => p.id));
        } else {
          setInitialProblems([]);
        }
      } catch (error) {
        console.error("Error fetching problems:", error);
        setInitialProblems([]);
      }
    }
    fetchProblems();
  }, []);

  const handleLoadMore = useCallback(async (currentSeenIds: string[]): Promise<ProblemWithInteraction[]> => {
    try {
      const response = await fetch(`/api/problems?limit=3&exclude=${currentSeenIds.join(",")}`);
      if (response.ok) {
        const data = await response.json();
        return data.problems || [];
      }
    } catch (error) {
      console.error("Error loading more problems:", error);
    }
    return [];
  }, []);

  const handleReaction = useCallback(async (interactionId: string, reaction: "like" | "dislike" | null) => {
    try {
      await fetch("/api/problems/reaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interactionId, reaction }),
      });
    } catch (error) {
      console.error("Error recording reaction:", error);
    }
  }, []);

  const handleToggleSolved = useCallback(async (interactionId: string, solved: boolean) => {
    try {
      await fetch("/api/problems/solved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interactionId, solved }),
      });
    } catch (error) {
      console.error("Error toggling solved:", error);
    }
  }, []);

  const handleShare = useCallback((problem: ProblemWithInteraction) => {
    setSelectedProblem(problem);
    setShareModalOpen(true);
  }, []);

  if (initialProblems === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <InfiniteScroll
        initialProblems={initialProblems}
        userId={userId}
        onLoadMore={handleLoadMore}
        onReaction={handleReaction}
        onToggleSolved={handleToggleSolved}
        onShare={handleShare}
      />

      {selectedProblem && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          problem={selectedProblem}
        />
      )}
    </>
  );
}
