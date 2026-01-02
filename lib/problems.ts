import { db } from "./db";
import { problems, userProblemInteractions, dailyStats, profiles } from "./db/schema";
import { eq, and, desc, sql, notInArray } from "drizzle-orm";
import { nanoid } from "nanoid";

// Block type for modular content
export interface ContentBlock {
  type: "markdown" | "video" | "image";
  content: string; // For markdown: the content; for video/image: the URL
}

export interface Problem {
  id: string;
  title: string;
  questionBlocks: ContentBlock[];
  answerBlocks: ContentBlock[];
  backgroundVideoUrl?: string | null;
  backgroundMusicUrl?: string | null;
  effect: "none" | "jitter" | "confetti" | null;
}

export interface ProblemWithInteraction extends Problem {
  interactionId?: string;
  visibleId?: string;
  reaction?: "like" | "dislike" | null;
  solved?: boolean;
  startedAt?: Date;
}

/**
 * Get next problems for the user's feed
 * 
 * PLACEHOLDER: Currently returns random published problems
 * FUTURE: Will use ChromaDB similarity search with user preference vectors
 * for AI-powered recommendations based on user's like/dislike history
 */
export async function getNextProblems(
  userId: string,
  excludeIds: string[] = [],
  limit: number = 5
): Promise<ProblemWithInteraction[]> {
  try {
    // Get published problems, excluding ones already seen in this session
    let query = db
      .select()
      .from(problems)
      .where(eq(problems.isPublished, true));
    
    // Exclude already seen problems
    if (excludeIds.length > 0) {
      query = db
        .select()
        .from(problems)
        .where(
          and(
            eq(problems.isPublished, true),
            notInArray(problems.id, excludeIds)
          )
        );
    }
    
    const result = await query
      .orderBy(sql`RANDOM()`)
      .limit(limit);

    if (result.length === 0) {
      return [];
    }

    // Create or get interactions for each problem
    const problemsWithInteractions: ProblemWithInteraction[] = await Promise.all(
      result.map(async (p) => {
        // Check if user already has an interaction with this problem
        const existingInteraction = await db
          .select()
          .from(userProblemInteractions)
          .where(
            and(
              eq(userProblemInteractions.userId, userId),
              eq(userProblemInteractions.problemId, p.id)
            )
          )
          .limit(1);

        let interaction = existingInteraction[0];

        // Create new interaction if doesn't exist
        if (!interaction) {
          const visibleId = nanoid(10);
          const [newInteraction] = await db
            .insert(userProblemInteractions)
            .values({
              visibleId,
              userId,
              problemId: p.id,
              startedAt: new Date(),
            })
            .returning();
          interaction = newInteraction;

          // Update daily stats - problems attempted
          await updateDailyStats(userId, "attempted");
        }

        return {
          id: p.id,
          title: p.title,
          questionBlocks: JSON.parse(p.questionBlocks) as ContentBlock[],
          answerBlocks: JSON.parse(p.answerBlocks) as ContentBlock[],
          backgroundVideoUrl: p.backgroundVideoUrl,
          backgroundMusicUrl: p.backgroundMusicUrl,
          effect: p.effect,
          interactionId: interaction.id,
          visibleId: interaction.visibleId,
          reaction: interaction.reaction,
          solved: interaction.solved,
          startedAt: interaction.startedAt,
        };
      })
    );

    return problemsWithInteractions;
  } catch (error) {
    console.error("Error fetching problems:", error);
    return [];
  }
}

/**
 * Record user reaction (like/dislike) to a problem
 * This data will be used for future AI recommendations
 */
export async function recordReaction(
  interactionId: string,
  reaction: "like" | "dislike" | null
) {
  try {
    await db
      .update(userProblemInteractions)
      .set({ reaction })
      .where(eq(userProblemInteractions.id, interactionId));
    return { success: true };
  } catch (error) {
    console.error("Error recording reaction:", error);
    return { success: false, error };
  }
}

/**
 * Toggle problem solved status
 */
export async function toggleProblemSolved(interactionId: string, userId: string, solved: boolean) {
  try {
    const now = new Date();
    const [interaction] = await db
      .select()
      .from(userProblemInteractions)
      .where(eq(userProblemInteractions.id, interactionId))
      .limit(1);

    if (!interaction) {
      return { success: false, error: "Interaction not found" };
    }

    if (solved) {
      // Mark as solved
      const startedAt = new Date(interaction.startedAt);
      const timeSpentSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);

      await db
        .update(userProblemInteractions)
        .set({
          solved: true,
          solvedAt: now,
          timeSpentSeconds,
        })
        .where(eq(userProblemInteractions.id, interactionId));

      // Update daily stats - problems solved (only if not already solved)
      if (!interaction.solved) {
        await updateDailyStats(userId, "solved");
      }

      return { success: true, solved: true, timeSpentSeconds };
    } else {
      // Mark as unsolved
      await db
        .update(userProblemInteractions)
        .set({
          solved: false,
          solvedAt: null,
        })
        .where(eq(userProblemInteractions.id, interactionId));

      // Update daily stats - decrement solved count if was previously solved
      if (interaction.solved) {
        await updateDailyStats(userId, "unsolved");
      }

      return { success: true, solved: false };
    }
  } catch (error) {
    console.error("Error toggling problem solved:", error);
    return { success: false, error };
  }
}

/**
 * Update daily statistics for the user
 */
async function updateDailyStats(userId: string, type: "attempted" | "solved" | "unsolved") {
  const today = new Date().toISOString().split("T")[0];

  try {
    // Try to get existing stats for today
    const [existing] = await db
      .select()
      .from(dailyStats)
      .where(
        and(
          eq(dailyStats.userId, userId),
          eq(dailyStats.date, today)
        )
      )
      .limit(1);

    if (existing) {
      // Update existing record
      if (type === "attempted") {
        await db
          .update(dailyStats)
          .set({ problemsAttempted: existing.problemsAttempted + 1 })
          .where(eq(dailyStats.id, existing.id));
      } else if (type === "solved") {
        await db
          .update(dailyStats)
          .set({ problemsSolved: existing.problemsSolved + 1 })
          .where(eq(dailyStats.id, existing.id));
      } else if (type === "unsolved" && existing.problemsSolved > 0) {
        await db
          .update(dailyStats)
          .set({ problemsSolved: existing.problemsSolved - 1 })
          .where(eq(dailyStats.id, existing.id));
      }
    } else if (type !== "unsolved") {
      // Calculate streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const [yesterdayStats] = await db
        .select()
        .from(dailyStats)
        .where(
          and(
            eq(dailyStats.userId, userId),
            eq(dailyStats.date, yesterdayStr)
          )
        )
        .limit(1);

      const streak = yesterdayStats ? yesterdayStats.streak + 1 : 1;

      // Create new record for today
      await db.insert(dailyStats).values({
        userId,
        date: today,
        problemsAttempted: type === "attempted" ? 1 : 0,
        problemsSolved: type === "solved" ? 1 : 0,
        streak,
      });
    }
  } catch (error) {
    console.error("Error updating daily stats:", error);
  }
}

/**
 * Get user's statistics
 */
export async function getUserStats(userId: string) {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Get today's stats
    const [todayStats] = await db
      .select()
      .from(dailyStats)
      .where(
        and(
          eq(dailyStats.userId, userId),
          eq(dailyStats.date, today)
        )
      )
      .limit(1);

    // Get total stats
    const totalSolved = await db
      .select({ count: sql<number>`count(*)` })
      .from(userProblemInteractions)
      .where(
        and(
          eq(userProblemInteractions.userId, userId),
          eq(userProblemInteractions.solved, true)
        )
      );

    // Get recent activity (last 7 days)
    const recentStats = await db
      .select()
      .from(dailyStats)
      .where(eq(dailyStats.userId, userId))
      .orderBy(desc(dailyStats.date))
      .limit(7);

    return {
      today: todayStats || { problemsSolved: 0, problemsAttempted: 0, streak: 0 },
      totalSolved: totalSolved[0]?.count || 0,
      recentActivity: recentStats,
    };
  } catch (error) {
    console.error("Error getting user stats:", error);
    return {
      today: { problemsSolved: 0, problemsAttempted: 0, streak: 0 },
      totalSolved: 0,
      recentActivity: [],
    };
  }
}

/**
 * Get leaderboard data
 */
export async function getLeaderboard(limit: number = 10) {
  try {
    const leaderboard = await db
      .select({
        userId: profiles.id,
        name: profiles.name,
        avatarUrl: profiles.avatarUrl,
        totalSolved: sql<number>`count(${userProblemInteractions.id})`,
      })
      .from(profiles)
      .leftJoin(
        userProblemInteractions,
        and(
          eq(userProblemInteractions.userId, profiles.id),
          eq(userProblemInteractions.solved, true)
        )
      )
      .groupBy(profiles.id)
      .orderBy(desc(sql`count(${userProblemInteractions.id})`))
      .limit(limit);

    return leaderboard;
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    return [];
  }
}
