"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Singleton instance for client-side
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!supabaseClient) {
    supabaseClient = createSupabaseBrowserClient();
  }
  return supabaseClient;
}


export function getURL() {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ?? 
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 
    "http://localhost:3000/";
  url = url.startsWith("http") ? url : `https://${url}`;
  url = url.endsWith("/") ? url : `${url}/`;
  return url;
}

export async function signInWithGoogle(next?: string) {
  const supabase = getSupabaseBrowserClient();
  const baseUrl = getURL();
  const redirectTo = next
    ? `${baseUrl}auth/callback?next=${encodeURIComponent(next)}`
    : `${baseUrl}auth/callback`;

  console.log(redirectTo);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });
  return { data, error };
}

export async function signInWithIdToken(idToken: string, nonce?: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: idToken,
    nonce,
  });
  return { data, error };
}

export async function signOut() {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getSession() {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
