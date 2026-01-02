# Tilt - Doom Scroll Problem Solving Platform

A Next.js website that allows users to doom scroll problems and check answers as an alternative to scrolling Instagram. Uses blue-500 as the theme color, supports dark/light mode, and conforms with iOS HIG.

## Features

1. ✅ **User Authentication** - Supabase Auth with Google OAuth
2. ✅ **Leaderboard** - Compare problems solved with friends
3. ✅ **Social Sharing** - Share problems with OG image generation
4. ✅ **Dynamic Problems** - Modular block-based content (markdown/video/image)
5. ✅ **Role Authorization** - Admin-only problem editor
6. ✅ **Magic UI Landing Page** - Shimmer effects, glow cards, particles

---

## Environment Variables (.env.example)

```env
# Supabase (from your Supabase project settings)
NEXT_PUBLIC_SUPABASE_URL=    # https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # anon/public key
DATABASE_URL=                # PostgreSQL connection string (postgres://...)

# Note: OAuth providers (Google, GitHub, etc.) are configured directly
# in Supabase Dashboard > Authentication > Providers
# No need for separate GOOGLE_CLIENT_ID/SECRET in the app
```

---

## Project Structure

```
app/
├── (auth)/
│   ├── login/page.tsx           # Login page
│   └── register/page.tsx        # Registration page
├── (main)/
│   ├── feed/
│   │   ├── page.tsx             # Feed server component
│   │   └── feed-client.tsx      # Feed client component
│   └── stats/
│       ├── page.tsx             # Stats server component
│       └── stats-page-client.tsx # Stats client component
├── (admin)/
│   └── problems/
│       ├── page.tsx             # Problem list
│       ├── problem-list-client.tsx
│       └── [id]/
│           ├── page.tsx         # Problem editor
│           └── problem-editor-client.tsx
├── api/
│   ├── problems/
│   │   ├── route.ts             # Get problems for feed
│   │   ├── reaction/route.ts    # Record like/dislike
│   │   └── solved/route.ts      # Mark as solved
│   ├── admin/
│   │   └── problems/
│   │       ├── route.ts         # Create problem
│   │       └── [id]/route.ts    # CRUD operations
│   └── og/route.tsx             # OG image generation
├── auth/
│   └── callback/route.ts        # Supabase OAuth callback
├── share/
│   └── [code]/
│       ├── page.tsx             # Share page with OG meta
│       └── share-page-client.tsx
├── layout.tsx
├── page.tsx                     # Landing page
├── globals.css                  # Theme + styles
└── manifest.ts                  # PWA manifest

lib/
├── auth.ts                      # Supabase server auth helpers
├── auth-client.ts               # Supabase client auth helpers
├── problems.ts                  # Problem fetching & stats logic
├── utils.ts                     # cn() helper
├── supabase.ts                  # Supabase client
└── db/
    ├── index.ts                 # Drizzle client
    ├── schema.ts                # Database schema
    └── migrations/
        └── 0001_initial.sql     # SQL migration

components/
├── ui/
│   ├── shimmer-button.tsx       # Magic UI button
│   ├── glow-card.tsx            # Glowing card
│   ├── floating-particles.tsx   # Background particles
│   ├── grid-pattern.tsx         # Grid background
│   └── animated-text.tsx        # Animated text + logo
├── problem/
│   ├── problem-card.tsx         # Full-screen problem display
│   ├── problem-content.tsx      # Markdown/LaTeX/video renderer
│   ├── problem-controls.tsx     # Like/dislike/share buttons
│   └── problem-effects.tsx      # Confetti, jitter effects
├── feed/
│   └── infinite-scroll.tsx      # TikTok-style scroll
├── auth/
│   ├── login-form.tsx           # Login form
│   ├── register-form.tsx        # Registration form
│   └── google-button.tsx        # Google OAuth button
└── share/
    └── share-modal.tsx          # Share modal with social options
```

---

## Database Schema

Uses Supabase for authentication (auth.users managed by Supabase) and Drizzle ORM for app data.

### Tables

- **profiles** - User profiles linked to Supabase auth.users (id, email, name, avatar_url, role)
- **problems** - Problem content with modular blocks (questionBlocks, answerBlocks as JSON)
- **user_problem_interactions** - Track user progress, reactions, solve times
- **daily_stats** - Daily solve counts and streaks
- **shares** - Social share records with rage-bait messages
- **media_files** - Track uploaded media for cleanup
- **bookmarks** - Future: remind-me-later feature

### Block-Based Content Design

Instead of separate question/answer types, problems use a modular block system:
```typescript
type ContentBlock = {
  type: "markdown" | "video" | "image";
  content: string; // markdown text or URL
};
```

This allows mixing content types (e.g., markdown explanation + video + image).

---

## Authentication (Supabase Auth)

- **Google OAuth** configured in Supabase Dashboard
- **Email/Password** authentication supported
- **Role-based access**: "user" | "admin" stored in profiles.role
- **Server-side auth** via `@supabase/ssr`
- **Client-side auth** via browser client

### Auth Flow

1. User clicks "Continue with Google" or enters email/password
2. Supabase handles OAuth flow
3. Callback route creates profile in profiles table
4. Session stored in cookies

---

## Problem Feed System

### Fetching Strategy (Placeholder for AI)

```typescript
// Current: Random selection from published problems
// Future: ChromaDB similarity search with user preference vectors
export async function getNextProblems(userId, cursor?, limit = 5) {
  // Random published problems for now
  // Future: Use like/dislike data to build preference vector
  // and query similar problems via ChromaDB
}
```

### Infinite Scroll

- TikTok/Reels-style full-screen snap scrolling
- Preloads next 2 problems for smooth experience
- Tracks active problem for video/audio playback
- Desktop: Centered content, controls on right
- Mobile: Full-screen edge-to-edge

---

## Social Sharing

### Share Flow

1. User clicks share on a problem
2. Modal shows share options (Twitter, WhatsApp, Copy Link)
3. Share link: `/share/[visibleId]`
4. OG image generated at `/api/og?code=[visibleId]`

### Rage-Bait Messages

Based on solve status:
- **solved_fast** (< 1 min): "I just solved this in X seconds!"
- **solved**: "I just solved this! Can you?"
- **gave_up**: "This one stumped me..."
- **unsolved**: "Think you can crack this?"

---

## Admin System

### Access Control

- Only users with `role = "admin"` can access /problems routes
- `requireAdmin()` helper checks role in profiles table
- RLS policies enforce this at database level

### Problem Editor Features

- Add/remove content blocks (markdown, video, image)
- Live preview with LaTeX rendering
- Background video/music URLs
- Effect selector (none, jitter, confetti)
- Publish/unpublish toggle

---

## Setup Instructions

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Supabase

1. Create a Supabase project
2. Go to Authentication > Providers > Google
3. Add Google OAuth credentials
4. Copy project URL and anon key to .env

### 3. Run Migration

```bash
# Apply the SQL migration in Supabase SQL Editor
# or use drizzle-kit:
bunx drizzle-kit generate
bunx drizzle-kit migrate
```

### 4. Set Initial Admin

In Supabase SQL Editor:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

### 5. Start Development

```bash
bun dev
```

---

## Future Enhancements

1. **AI Recommendations** - ChromaDB + LLM embeddings for personalized feed
2. **Bookmarks/Remind-me-later** - Save content for later review
3. **Media Upload** - Direct upload to Supabase Storage
4. **Orphan Media Cleanup** - Cron job to clean unused uploads
5. **Push Notifications** - Daily streak reminders
