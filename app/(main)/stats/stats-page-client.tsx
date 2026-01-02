"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Flame, Trophy, Target, Calendar, Medal } from "lucide-react";
import Link from "next/link";
import { GlowCard } from "@/components/ui/glow-card";
import { cn } from "@/lib/utils";

interface StatsPageClientProps {
  userId: string;
  userName: string;
  stats: {
    today: { problemsSolved: number; problemsAttempted: number; streak: number };
    totalSolved: number;
    recentActivity: Array<{
      date: string;
      problemsSolved: number;
      problemsAttempted: number;
      streak: number;
    }>;
  };
  leaderboard: Array<{
    userId: string;
    name: string | null;
    avatarUrl: string | null;
    totalSolved: number;
  }>;
}

export function StatsPageClient({
  userId,
  userName,
  stats,
  leaderboard,
}: StatsPageClientProps) {
  const userRank = leaderboard.findIndex((u) => u.userId === userId) + 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary-950/20 px-6 py-8">
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-8">
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
        <h1 className="text-3xl font-bold text-foreground">Your Stats</h1>
        <p className="text-foreground-secondary mt-2">
          Track your progress and compete with friends
        </p>
      </header>

      <main className="max-w-4xl mx-auto space-y-8">
        {/* Today's Stats */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold text-foreground mb-4">Today</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              icon={Target}
              label="Problems Solved"
              value={stats.today.problemsSolved}
              color="text-emerald-500"
            />
            <StatCard
              icon={Calendar}
              label="Problems Attempted"
              value={stats.today.problemsAttempted}
              color="text-primary-500"
            />
            <StatCard
              icon={Flame}
              label="Current Streak"
              value={`${stats.today.streak} days`}
              color="text-orange-500"
            />
          </div>
        </motion.section>

        {/* Overall Stats */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold text-foreground mb-4">
            All Time
          </h2>
          <GlowCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground-secondary text-sm">
                  Total Problems Solved
                </p>
                <p className="text-4xl font-bold text-foreground mt-2">
                  {stats.totalSolved}
                </p>
              </div>
              <Trophy className="w-12 h-12 text-primary-500" />
            </div>
          </GlowCard>
        </motion.section>

        {/* Recent Activity */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Recent Activity
          </h2>
          <div className="bg-background-secondary rounded-[20px] border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {stats.recentActivity.length === 0 ? (
              <p className="text-foreground-secondary text-center py-8">
                No activity yet. Start solving problems!
              </p>
            ) : (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {stats.recentActivity.map((day, index) => (
                  <motion.div
                    key={day.date}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="flex items-center justify-between p-4"
                  >
                    <div>
                      <p className="text-foreground font-medium">
                        {new Date(day.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-foreground-secondary text-sm">
                        {day.problemsAttempted} attempted
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-emerald-500 font-semibold">
                          {day.problemsSolved} solved
                        </p>
                      </div>
                      {day.streak > 0 && (
                        <div className="flex items-center gap-1 text-orange-500">
                          <Flame className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {day.streak}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.section>

        {/* Leaderboard */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Leaderboard
          </h2>
          <div className="bg-background-secondary rounded-[20px] border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {leaderboard.length === 0 ? (
              <p className="text-foreground-secondary text-center py-8">
                No leaderboard data yet. Be the first!
              </p>
            ) : (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {leaderboard.map((user, index) => (
                  <motion.div
                    key={user.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className={cn(
                      "flex items-center gap-4 p-4",
                      user.userId === userId && "bg-primary-500/10"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                        index === 0
                          ? "bg-yellow-500/20 text-yellow-500"
                          : index === 1
                          ? "bg-gray-400/20 text-gray-400"
                          : index === 2
                          ? "bg-amber-600/20 text-amber-600"
                          : "bg-zinc-500/20 text-zinc-500"
                      )}
                    >
                      {index + 1}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center overflow-hidden">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name || "User"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-primary-500 font-semibold">
                          {(user.name || "U")[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={cn(
                          "font-medium",
                          user.userId === userId
                            ? "text-primary-500"
                            : "text-foreground"
                        )}
                      >
                        {user.name || "Anonymous"}
                        {user.userId === userId && " (You)"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Medal className="w-4 h-4 text-primary-500" />
                      <span className="font-semibold text-foreground">
                        {user.totalSolved}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.section>
      </main>
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: string;
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <div className="bg-background-secondary rounded-[16px] border border-zinc-200 dark:border-zinc-800 p-6">
      <div className="flex items-center gap-3 mb-3">
        <Icon className={cn("w-5 h-5", color)} />
        <p className="text-foreground-secondary text-sm">{label}</p>
      </div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
}
