"use client";

import { motion } from "framer-motion";
import { signInWithGoogle } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface GoogleButtonProps {
  className?: string;
  callbackUrl?: string;
}

export function GoogleButton({ className, callbackUrl = "/feed" }: GoogleButtonProps) {
  const handleGoogleSignIn = async () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const redirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent(callbackUrl)}`;
    await signInWithGoogle(redirectTo);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleGoogleSignIn}
      className={cn(
        "w-full flex items-center justify-center gap-3 px-6 py-3",
        "bg-white dark:bg-zinc-900 text-foreground",
        "rounded-[12px] border border-zinc-200 dark:border-zinc-800",
        "font-medium transition-all duration-200",
        "hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10",
        className
      )}
    >
      <Image src="/google.svg" alt="Google" width={20} height={20} className="size-5" />
      Continue with Google
    </motion.button>
  );
}
