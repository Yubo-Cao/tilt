import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { userProblemInteractions, problems, profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { SharePageClient } from "./share-page-client";

interface SharePageProps {
  params: Promise<{ code: string }>;
}

async function getShareData(code: string) {
  try {
    const [interaction] = await db
      .select({
        visibleId: userProblemInteractions.visibleId,
        solved: userProblemInteractions.solved,
        timeSpentSeconds: userProblemInteractions.timeSpentSeconds,
        problem: {
          id: problems.id,
          title: problems.title,
          questionBlocks: problems.questionBlocks,
        },
        user: {
          name: profiles.name,
          avatarUrl: profiles.avatarUrl,
        },
      })
      .from(userProblemInteractions)
      .innerJoin(problems, eq(problems.id, userProblemInteractions.problemId))
      .innerJoin(profiles, eq(profiles.id, userProblemInteractions.userId))
      .where(eq(userProblemInteractions.visibleId, code))
      .limit(1);

    return interaction;
  } catch (error) {
    console.error("Error fetching share data:", error);
    return null;
  }
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { code } = await params;
  const data = await getShareData(code);

  if (!data) {
    return {
      title: "Problem Not Found - Tilt",
    };
  }

  const statusText = data.solved
    ? data.timeSpentSeconds && data.timeSpentSeconds < 60
      ? `Solved in ${data.timeSpentSeconds} seconds!`
      : `Solved!`
    : "Can you solve this?";

  const title = `${data.problem.title} - Tilt`;
  const description = `${data.user.name || "Someone"} shared a problem: "${data.problem.title}". ${statusText}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Tilt",
      images: [
        {
          url: `/api/og?code=${code}`,
          width: 1200,
          height: 630,
          alt: data.problem.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og?code=${code}`],
    },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { code } = await params;
  const data = await getShareData(code);

  if (!data) {
    notFound();
  }

  return (
    <SharePageClient
      code={code}
      problemTitle={data.problem.title}
      userName={data.user.name || "Someone"}
      userAvatar={data.user.avatarUrl}
      solved={data.solved}
      timeSpentSeconds={data.timeSpentSeconds}
    />
  );
}
