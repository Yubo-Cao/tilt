"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock, Trophy, User } from "lucide-react";
import Link from "next/link";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { GridPattern } from "@/components/ui/grid-pattern";
import { cn } from "@/lib/utils";

interface SharePageClientProps {
  code: string;
  problemTitle: string;
  userName: string;
  userAvatar: string | null;
  solved: boolean;
  timeSpentSeconds: number | null;
}

export function SharePageClient({
  code,
  problemTitle,
  userName,
  userAvatar,
  solved,
  timeSpentSeconds,
}: SharePageClientProps) {
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds} seconds`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes} minutes`;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-black to-primary-950/30">
      {/* Background Effects */}
      <GridPattern className="opacity-30" strokeColor="rgba(59, 130, 246, 0.1)" />
      <FloatingParticles count={30} />

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-600/15 rounded-full blur-[120px] translate-y-1/2" />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-24">
        {/* User Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-12 h-12 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center overflow-hidden">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-primary-400" />
            )}
          </div>
          <div>
            <p className="text-white/60 text-sm">Shared by</p>
            <p className="text-white font-medium">{userName}</p>
          </div>
        </motion.div>

        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6",
            solved
              ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
              : "bg-amber-500/20 border border-amber-500/30 text-amber-400"
          )}
        >
          {solved ? (
            <>
              <Trophy className="w-4 h-4" />
              <span className="font-medium">Solved!</span>
              {timeSpentSeconds && (
                <>
                  <Clock className="w-4 h-4 ml-2" />
                  <span>{formatTime(timeSpentSeconds)}</span>
                </>
              )}
            </>
          ) : (
            <span className="font-medium">Challenge Pending</span>
          )}
        </motion.div>

        {/* Problem Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-5xl font-bold text-white text-center mb-6 max-w-2xl"
        >
          {problemTitle}
        </motion.h1>

        {/* Challenge Text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-white/60 text-lg text-center mb-10 max-w-md"
        >
          {solved
            ? "Think you can solve it faster? Give it a try!"
            : "This one's a tough cookie. Can you crack it?"}
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link href="/login?callbackUrl=/feed">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white",
                "bg-gradient-to-b from-primary-400 to-primary-500",
                "rounded-[12px] shadow-[0_4px_20px_rgba(59,130,246,0.4)]",
                "hover:shadow-[0_8px_30px_rgba(59,130,246,0.5)]",
                "transition-shadow duration-300"
              )}
            >
              Try This Problem
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Tilt Branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16"
        >
          <Link href="/">
            <span className="text-4xl font-bold shimmer-text">Tilt</span>
          </Link>
          <p className="text-white/40 text-sm mt-2 text-center">
            Scroll Smarter, Not Harder
          </p>
        </motion.div>
      </main>
    </div>
  );
}
