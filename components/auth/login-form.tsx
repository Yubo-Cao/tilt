"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { signInWithEmail } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { GoogleButton } from "./google-button";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LoginFormProps {
  callbackUrl?: string;
}

export function LoginForm({ callbackUrl = "/feed" }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { error } = await signInWithEmail(email, password);

      if (error) {
        setError(error.message || "Failed to sign in. Please try again.");
      } else {
        router.push(callbackUrl);
      }
    } catch {
      setError("Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <GoogleButton redirectTo={`${baseUrl}/auth/callback?next=${callbackUrl}`} />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-background text-foreground-secondary">
              or sign in with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 text-sm text-red-500 bg-red-500/10 rounded-[12px] border border-red-500/20"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-secondary" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className={cn(
                  "w-full pl-12 pr-4 py-3 rounded-[12px]",
                  "bg-zinc-50 dark:bg-zinc-900",
                  "border border-zinc-200 dark:border-zinc-800",
                  "focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500",
                  "placeholder:text-foreground-secondary/50",
                  "transition-all duration-200"
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-secondary" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className={cn(
                  "w-full pl-12 pr-12 py-3 rounded-[12px]",
                  "bg-zinc-50 dark:bg-zinc-900",
                  "border border-zinc-200 dark:border-zinc-800",
                  "focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500",
                  "placeholder:text-foreground-secondary/50",
                  "transition-all duration-200"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-secondary hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <ShimmerButton
            type="submit"
            disabled={isLoading}
            className="w-full py-3"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Sign In"
            )}
          </ShimmerButton>
        </form>

        <p className="text-center text-sm text-foreground-secondary">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-primary-500 hover:text-primary-400 font-medium transition-colors"
          >
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
