"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/auth-client";
import { useRef, useCallback } from "react";

interface CredentialResponse {
  credential: string;
  select_by: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleOneTapConfig) => void;
          prompt: (callback?: (notification: PromptNotification) => void) => void;
          cancel: () => void;
          renderButton: (
            element: HTMLElement,
            config: GoogleButtonConfig
          ) => void;
        };
      };
    };
  }
}

interface GoogleOneTapConfig {
  client_id: string;
  callback: (response: CredentialResponse) => void;
  nonce?: string;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: "signin" | "signup" | "use";
  itp_support?: boolean;
  use_fedcm_for_prompt?: boolean;
}

interface GoogleButtonConfig {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: number;
}

interface PromptNotification {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  isDismissedMoment: () => boolean;
  getNotDisplayedReason: () => string;
  getSkippedReason: () => string;
  getDismissedReason: () => string;
}

interface GoogleOneTapProps {
  callbackUrl?: string;
  showButton?: boolean;
}

// Generate nonce for Google ID token sign-in
const generateNonce = async (): Promise<[string, string]> => {
  const nonce = btoa(
    String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))
  );
  const encoder = new TextEncoder();
  const encodedNonce = encoder.encode(nonce);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encodedNonce);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedNonce = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return [nonce, hashedNonce];
};

export function GoogleOneTap({
  callbackUrl = "/feed",
  showButton = true,
}: GoogleOneTapProps) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const buttonRef = useRef<HTMLDivElement>(null);
  const nonceRef = useRef<string>("");

  const initializeGoogleOneTap = useCallback(async () => {
    console.log("Initializing Google One Tap");

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
      return;
    }

    // Generate nonce
    const [nonce, hashedNonce] = await generateNonce();
    nonceRef.current = nonce;
    console.log("Nonce generated");

    // Check if there's already an existing session before initializing
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error getting session", error);
    }
    if (data.session) {
      console.log("User already logged in, redirecting to feed");
      router.push(callbackUrl);
      return;
    }

    if (!window.google?.accounts?.id) {
      console.error("Google Identity Services not loaded");
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: CredentialResponse) => {
        try {
          console.log("Google One Tap callback received");
          // Send ID token to Supabase with the unhashed nonce
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: "google",
            token: response.credential,
            nonce: nonceRef.current,
          });

          if (error) throw error;

          console.log("Successfully logged in with Google One Tap");

          // Sync profile to our database
          const res = await fetch("/api/auth/sync-profile", {
            method: "POST",
          });
          if (!res.ok) {
            console.error("Failed to sync profile");
          }

          // Redirect to callback URL
          router.push(callbackUrl);
          router.refresh();
        } catch (error) {
          console.error("Error logging in with Google One Tap", error);
        }
      },
      nonce: hashedNonce, // Provide hashed nonce to Google
      auto_select: true,
      cancel_on_tap_outside: true,
      context: "signin",
      itp_support: true,
      use_fedcm_for_prompt: true,
    });

    // Display the One Tap UI
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        console.log(
          "One Tap not displayed:",
          notification.getNotDisplayedReason()
        );
      } else if (notification.isSkippedMoment()) {
        console.log("One Tap skipped:", notification.getSkippedReason());
      } else if (notification.isDismissedMoment()) {
        console.log("One Tap dismissed:", notification.getDismissedReason());
      }
    });

    // Render the button if showButton is true and element exists
    if (showButton && buttonRef.current) {
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        width: 320,
      });
    }
  }, [supabase, callbackUrl, router, showButton]);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        onReady={() => {
          initializeGoogleOneTap();
        }}
        strategy="afterInteractive"
      />
      {showButton && (
        <div className="w-full flex justify-center">
          <div ref={buttonRef} className="google-signin-button" />
        </div>
      )}
    </>
  );
}
