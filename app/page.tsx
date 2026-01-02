"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Share2 } from "lucide-react";
import Link from "next/link";
import { AnimatedLogo, AnimatedText } from "@/components/ui/animated-text";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { GridPattern } from "@/components/ui/grid-pattern";
import { GlowCard } from "@/components/ui/glow-card";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Sparkles,
    title: "Infinite Problems",
    description: "Scroll through problems like TikTok. Never ending, never repeating.",
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    description: "Reveal answers instantly with full LaTeX math rendering support.",
  },
  // {
  //   icon: Trophy,
  //   title: "Leaderboard",
  //   description: "Compete with friends. Track daily stats and maintain your streak.",
  // },
  {
    icon: Share2,
    title: "Social Sharing",
    description: "Share problems you solved and challenge your friends.",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-background via-background to-primary-950/20">
      {/* Background Effects */}
      <GridPattern className="opacity-50" />
      <FloatingParticles count={40} />
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/30 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-[120px] translate-y-1/2" />

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-400 bg-primary-500/10 rounded-full border border-primary-500/20">
            <Sparkles className="w-4 h-4" />
            A New Way to Study
          </span>
        </motion.div>

        <AnimatedLogo />

        <AnimatedText
          text="Scroll Smarter, Not Harder"
          className="mt-6 text-xl md:text-2xl text-foreground-secondary justify-center"
          delay={0.3}
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-6 max-w-lg text-center text-foreground-secondary/80"
        >
          Ditch the mindless social media scrolling. Turn your dopamine hits into
          productive learning. Solve problems like you scroll Reels.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-white",
                "bg-gradient-to-b from-primary-400 to-primary-500",
                "rounded-[12px] shadow-[0_4px_20px_rgba(59,130,246,0.4)]",
                "hover:shadow-[0_8px_30px_rgba(59,130,246,0.5)]",
                "transition-shadow duration-300"
              )}
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
          <Link href="#features">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold",
                "bg-background-secondary text-foreground",
                "rounded-[12px] border border-zinc-200 dark:border-zinc-800",
                "hover:border-primary-500/50 hover:bg-primary-500/5",
                "transition-all duration-200"
              )}
            >
              Learn More
            </motion.button>
          </Link>
        </motion.div>

        {/* Features Section */}
        <motion.div
          id="features"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + index * 0.1 }}
            >
              <GlowCard className="h-full">
                <feature.icon className="w-10 h-10 text-primary-500 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-foreground-secondary">
                  {feature.description}
                </p>
              </GlowCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-24 text-center text-sm text-foreground-secondary/60"
        >
          <p>© 2026 Tilt. All rights reserved.</p>
        </motion.footer>
      </main>
    </div>
  );
}
