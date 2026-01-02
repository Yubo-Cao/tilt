"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2, User } from "lucide-react";
import { signUpWithEmail } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { GoogleButton } from "./google-button";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface RegisterFormProps {
  callbackUrl?: string;
}

export function RegisterForm({ callbackUrl = "/feed" }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await signUpWithEmail(email, password, name);

      if (error) {
        setError(error.message || "Failed to sign up. Please try again.");
      } else if (data.user && !data.session) {
        // Email confirmation required
        setSuccess(true);
      } else {
        router.push(callbackUrl);
      }
    } catch {
      setError("Failed to sign up. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="w-16 h-16 mx-auto bg-primary-500/20 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Check your email</h2>
          <p className="text-foreground-secondary">
            We&apos;ve sent you a confirmation link. Please check your email to complete your registration.
          </p>
          <Link
            href="/login"
            className="inline-block text-primary-500 hover:text-primary-400 font-medium transition-colors"
          >
            Back to Sign In
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <GoogleButton callbackUrl={callbackUrl} />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-background text-foreground-secondary">
              or sign up with email
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
              htmlFor="name"
              className="block text-sm font-medium text-foreground"
            >
              Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-secondary" />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
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
                placeholder="At least 8 characters"
                required
                minLength={8}
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
              "Create Account"
            )}
          </ShimmerButton>
        </form>

        <p className="text-center text-sm text-foreground-secondary">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary-500 hover:text-primary-400 font-medium transition-colors"
          >
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
