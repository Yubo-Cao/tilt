"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Problem } from "@/lib/db/schema";

interface ProblemListClientProps {
  problems: Problem[];
}

export function ProblemListClient({ problems: initialProblems }: ProblemListClientProps) {
  const [problems, setProblems] = useState(initialProblems);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this problem?")) return;

    try {
      const response = await fetch(`/api/admin/problems/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProblems((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Error deleting problem:", error);
    }
  };

  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    try {
      const response = await fetch(`/api/admin/problems/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !isPublished }),
      });

      if (response.ok) {
        setProblems((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, isPublished: !isPublished } : p
          )
        );
      }
    } catch (error) {
      console.error("Error toggling publish:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary-950/20 px-6 py-8">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-8">
        <Link href="/feed">
          <motion.button
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Feed
          </motion.button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Problem Manager
            </h1>
            <p className="text-foreground-secondary mt-2">
              Create and manage problems for the feed
            </p>
          </div>
          <Link href="/problems/new">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex items-center gap-2 px-6 py-3 font-semibold text-white",
                "bg-gradient-to-b from-primary-400 to-primary-500",
                "rounded-[12px] shadow-[0_4px_20px_rgba(59,130,246,0.4)]"
              )}
            >
              <Plus className="w-5 h-5" />
              New Problem
            </motion.button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {problems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-foreground-secondary text-lg mb-4">
              No problems yet. Create your first one!
            </p>
            <Link href="/problems/new">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "inline-flex items-center gap-2 px-6 py-3 font-semibold text-white",
                  "bg-gradient-to-b from-primary-400 to-primary-500",
                  "rounded-[12px]"
                )}
              >
                <Plus className="w-5 h-5" />
                Create Problem
              </motion.button>
            </Link>
          </div>
        ) : (
          <div className="bg-background-secondary rounded-[20px] border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {problems.map((problem, index) => (
                <motion.div
                  key={problem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-6"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-foreground truncate">
                        {problem.title}
                      </h3>
                      <span
                        className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full",
                          problem.isPublished
                            ? "bg-emerald-500/20 text-emerald-500"
                            : "bg-zinc-500/20 text-zinc-500"
                        )}
                      >
                        {problem.isPublished ? "Published" : "Draft"}
                      </span>
                      {problem.effect && problem.effect !== "none" && (
                        <span className="px-2 py-1 text-xs font-medium bg-primary-500/20 text-primary-500 rounded-full">
                          {problem.effect}
                        </span>
                      )}
                    </div>
                    <p className="text-foreground-secondary text-sm mt-1">
                      Created{" "}
                      {new Date(problem.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        handleTogglePublish(problem.id, problem.isPublished)
                      }
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        problem.isPublished
                          ? "text-emerald-500 hover:bg-emerald-500/10"
                          : "text-zinc-500 hover:bg-zinc-500/10"
                      )}
                      title={problem.isPublished ? "Unpublish" : "Publish"}
                    >
                      {problem.isPublished ? (
                        <Eye className="w-5 h-5" />
                      ) : (
                        <EyeOff className="w-5 h-5" />
                      )}
                    </motion.button>
                    <Link href={`/problems/${problem.id}`}>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-lg text-primary-500 hover:bg-primary-500/10 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </motion.button>
                    </Link>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(problem.id)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
