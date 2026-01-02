"use client";

import { motion } from "framer-motion";
import { GoogleOneTap } from "./google-one-tap";

interface LoginFormProps {
  callbackUrl?: string;
}

export function LoginForm({ callbackUrl = "/feed" }: LoginFormProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <GoogleOneTap callbackUrl={callbackUrl} showButton={true} />

        <p className="text-center text-sm text-foreground-secondary">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
