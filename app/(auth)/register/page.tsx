"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { GridPattern } from "@/components/ui/grid-pattern";

function RegisterContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/feed";

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-background via-background to-primary-950/20">
      {/* Background Effects */}
      <GridPattern className="opacity-30" />
      <FloatingParticles count={30} />

      {/* Gradient Orb */}
      <div className="absolute top-1/4 left-1/2 w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6">
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </motion.button>
          </Link>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <h1 className="text-4xl font-bold shimmer-text mb-2">Join Tilt</h1>
            <p className="text-foreground-secondary">Start your productive scrolling journey</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="glass rounded-[20px] p-8">
              <RegisterForm callbackUrl={callbackUrl} />
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <RegisterContent />
    </Suspense>
  );
}
