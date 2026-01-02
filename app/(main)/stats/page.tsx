import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getUserStats, getLeaderboard } from "@/lib/problems";
import { StatsPageClient } from "./stats-page-client";

export default async function StatsPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login?callbackUrl=/stats");
  }

  const [stats, leaderboard] = await Promise.all([
    getUserStats(user.id),
    getLeaderboard(10),
  ]);

  return (
    <StatsPageClient
      userId={user.id}
      userName={user.user_metadata?.name || user.email}
      stats={stats}
      leaderboard={leaderboard}
    />
  );
}
