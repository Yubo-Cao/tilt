import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { problems } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      questionBlocks,
      answerBlocks,
      backgroundVideoUrl,
      backgroundMusicUrl,
      effect,
      isPublished,
    } = body;

    if (!title || !questionBlocks || !answerBlocks) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [newProblem] = await db
      .insert(problems)
      .values({
        title,
        questionBlocks,
        answerBlocks,
        backgroundVideoUrl,
        backgroundMusicUrl,
        effect: effect || "none",
        isPublished: isPublished || false,
        createdBy: user.id,
      })
      .returning();

    return NextResponse.json({ problem: newProblem });
  } catch (error) {
    console.error("Error creating problem:", error);
    return NextResponse.json(
      { error: "Failed to create problem" },
      { status: 500 }
    );
  }
}
