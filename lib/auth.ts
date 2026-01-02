import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db } from "./db";
import { profiles } from "./db/schema";
import { eq } from "drizzle-orm";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}

export async function getSession() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(userId: string) {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);
  return profile;
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    return null;
  }
  return user;
}

export async function requireAdmin() {
  const user = await getUser();
  if (!user) {
    return null;
  }
  
  const profile = await getProfile(user.id);
  
  if (!profile || profile.role !== "admin") {
    return null;
  }
  
  return user;
}

export async function getUserWithProfile() {
  const user = await getUser();
  if (!user) {
    return null;
  }
  
  const profile = await getProfile(user.id);
  return { user, profile };
}
