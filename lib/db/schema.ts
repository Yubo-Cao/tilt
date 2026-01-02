import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
  date,
  uniqueIndex,
  pgEnum,
} from "drizzle-orm/pg-core";

// ================================
// User Profiles (linked to Supabase auth.users)
// Supabase manages auth.users internally - we create a profiles table for app data
// ================================

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // Same as Supabase auth.users.id
  email: text("email").notNull(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  role: text("role").notNull().default("user"), // "user" | "admin"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ================================
// App-Specific Tables
// ================================

// Block types for modular content (as per TODO in plan.md)
// Instead of separate question/answer types, we use blocks for more modular design
export const blockTypeEnum = pgEnum("block_type", ["markdown", "video", "image"]);
export const effectEnum = pgEnum("effect", ["none", "jitter", "confetti"]);
export const reactionEnum = pgEnum("reaction", ["like", "dislike"]);
export const shareStatusEnum = pgEnum("share_status", [
  "solved_fast",
  "solved",
  "gave_up",
  "unsolved",
]);

// Problems table - each problem has question blocks and answer blocks
export const problems = pgTable("problems", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  // Question and answer are JSON arrays of blocks
  // Each block: { type: "markdown" | "video" | "image", content: string }
  // This modular design allows mixing different content types
  questionBlocks: text("question_blocks").notNull(), // JSON string
  answerBlocks: text("answer_blocks").notNull(), // JSON string
  backgroundVideoUrl: text("background_video_url"),
  backgroundMusicUrl: text("background_music_url"),
  effect: effectEnum("effect").default("none"),
  createdBy: uuid("created_by").references(() => profiles.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  isPublished: boolean("is_published").notNull().default(false),
});

// User interactions with problems
export const userProblemInteractions = pgTable("user_problem_interactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  visibleId: text("visible_id").notNull().unique(), // Unique share ID
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  problemId: uuid("problem_id")
    .notNull()
    .references(() => problems.id, { onDelete: "cascade" }),
  reaction: reactionEnum("reaction"),
  solved: boolean("solved").notNull().default(false),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  solvedAt: timestamp("solved_at"),
  timeSpentSeconds: integer("time_spent_seconds").default(0),
});

// Daily statistics for users
export const dailyStats = pgTable(
  "daily_stats",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    problemsSolved: integer("problems_solved").notNull().default(0),
    problemsAttempted: integer("problems_attempted").notNull().default(0),
    streak: integer("streak").notNull().default(0),
  },
  (table) => [
    uniqueIndex("daily_stats_user_date_idx").on(table.userId, table.date),
  ]
);

// Shares for social sharing with rage-bait messages
export const shares = pgTable("shares", {
  id: uuid("id").primaryKey().defaultRandom(),
  shareCode: text("share_code").notNull().unique(),
  interactionId: uuid("interaction_id")
    .notNull()
    .references(() => userProblemInteractions.id, { onDelete: "cascade" }),
  status: shareStatusEnum("status").notNull(),
  shareMessage: text("share_message"), // Auto-generated rage-bait message
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Media files for tracking uploads and cleanup
export const mediaFiles = pgTable("media_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  storageUrl: text("storage_url").notNull(),
  storagePath: text("storage_path").notNull(),
  problemId: uuid("problem_id").references(() => problems.id, { onDelete: "set null" }),
  fileType: text("file_type").notNull(), // "video" | "audio" | "image"
  uploadedBy: uuid("uploaded_by").references(() => profiles.id, { onDelete: "set null" }),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

// ================================
// Future: Bookmarks/Remind-me-later feature (as per TODO in plan.md)
// This allows users to save any content for later, not just problems
// ================================
export const bookmarks = pgTable("bookmarks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  // Can reference a problem or be a standalone note
  problemId: uuid("problem_id").references(() => problems.id, { onDelete: "cascade" }),
  // For future: standalone notes/content
  noteContent: text("note_content"),
  noteType: text("note_type"), // "problem" | "note" | "pdf" | etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
  remindAt: timestamp("remind_at"), // Optional reminder time
});

// ================================
// Type exports for use in the app
// ================================
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Problem = typeof problems.$inferSelect;
export type NewProblem = typeof problems.$inferInsert;
export type UserProblemInteraction = typeof userProblemInteractions.$inferSelect;
export type DailyStat = typeof dailyStats.$inferSelect;
export type Share = typeof shares.$inferSelect;
export type Bookmark = typeof bookmarks.$inferSelect;