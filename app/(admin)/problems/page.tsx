import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { problems } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { ProblemListClient } from "./problem-list-client";

export default async function AdminProblemsPage() {
  const user = await requireAdmin();

  if (!user) {
    redirect("/login?callbackUrl=/problems");
  }

  const allProblems = await db
    .select()
    .from(problems)
    .orderBy(desc(problems.createdAt))
    .limit(100);

  return <ProblemListClient problems={allProblems} />;
}
