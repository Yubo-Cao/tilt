"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, Loader2 } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  className?: string;
  variant?: "icon" | "full";
}

export function LogoutButton({
  className,
  variant = "icon",
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const { error } = await signOut();
      if (error) {
        console.error("Error signing out:", error);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "full") {
    return (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleLogout}
        disabled={isLoading}
        className={cn(
          "w-11 h-11 rounded-full flex items-center justify-center",
          "bg-black/40 backdrop-blur-md border border-white/20",
          "transition-all duration-200",
          "hover:bg-black/60",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "text-white"
        )}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <LogOut className="w-4 h-4" />
            Sign Out
          </>
        )}
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleLogout}
      disabled={isLoading}
      className={cn(
        "w-11 h-11 rounded-full flex items-center justify-center",
        "bg-black/40 backdrop-blur-md border border-white/20",
        "transition-all duration-200 glass",
        "hover:bg-black/60",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "text-white",
        className
      )}
      title="Sign Out"
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <LogOut className="w-5 h-5" />
      )}
    </motion.button>
  );
}
