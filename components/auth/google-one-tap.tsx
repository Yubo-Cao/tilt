"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { signInWithIdToken, getSupabaseBrowserClient } from "@/lib/auth-client";

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
  callback: (response: GoogleCredentialResponse) => void;
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

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
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
  buttonText?: "signin_with" | "signup_with" | "continue_with" | "signin";
}

export function GoogleOneTap({
  callbackUrl = "/feed",
  showButton = true,
  buttonText = "continue_with",
}: GoogleOneTapProps) {
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  const handleCredentialResponse = useCallback(
    async (response: GoogleCredentialResponse) => {
      try {
        const { data, error } = await signInWithIdToken(response.credential);

        if (error) {
          console.error("Sign in error:", error);
          return;
        }

        if (data.user) {
          // Sync profile to our database
          const res = await fetch("/api/auth/sync-profile", {
            method: "POST",
          });
          if (!res.ok) {
            console.error("Failed to sync profile");
          }
          router.push(callbackUrl);
          router.refresh();
        }
      } catch (err) {
        console.error("Sign in error:", err);
      }
    },
    [callbackUrl, router]
  );

  useEffect(() => {
    if (initializedRef.current) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
      return;
    }

    // Check if user is already logged in
    const checkSession = async () => {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        // User is already logged in, don't show One Tap
        return true;
      }
      return false;
    };

    const initializeGoogleOneTap = async () => {
      const isLoggedIn = await checkSession();
      if (isLoggedIn) return;

      if (window.google?.accounts?.id) {
        initializedRef.current = true;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: true,
          cancel_on_tap_outside: true,
          context: "signin",
          itp_support: true,
          use_fedcm_for_prompt: true,
        });

        // Show the One Tap prompt
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            console.log("One Tap not displayed:", notification.getNotDisplayedReason());
          }
        });

        // Render the button if showButton is true and element exists
        if (showButton && buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: buttonText,
            shape: "pill",
            width: 320,
          });
        }
      }
    };

    // Load the Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleOneTap;
    document.body.appendChild(script);

    return () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
      // Clean up script if component unmounts before load
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [handleCredentialResponse, showButton, buttonText]);

  if (!showButton) {
    return null;
  }

  return (
    <div className="w-full flex justify-center">
      <div ref={buttonRef} className="google-signin-button" />
    </div>
  );
}
