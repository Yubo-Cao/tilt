import { redirect, notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { problems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ProblemEditorClient } from "./problem-editor-client";

interface ProblemEditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProblemEditorPage({ params }: ProblemEditorPageProps) {
  const user = await requireAdmin();

  if (!user) {
    redirect("/login?callbackUrl=/problems");
  }

  const { id } = await params;

  // Handle "new" as a special case
  if (id === "new") {
    return <ProblemEditorClient problem={null} />;
  }

  const [problem] = await db
    .select()
    .from(problems)
    .where(eq(problems.id, id))
    .limit(1);

  if (!problem) {
    notFound();
  }

  return <ProblemEditorClient problem={problem} />;
}
