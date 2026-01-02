import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { problems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireAdmin();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [problem] = await db
      .select()
      .from(problems)
      .where(eq(problems.id, id))
      .limit(1);

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    return NextResponse.json({ problem });
  } catch (error) {
    console.error("Error fetching problem:", error);
    return NextResponse.json(
      { error: "Failed to fetch problem" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireAdmin();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
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

    const [updatedProblem] = await db
      .update(problems)
      .set({
        title,
        questionBlocks,
        answerBlocks,
        backgroundVideoUrl,
        backgroundMusicUrl,
        effect,
        isPublished,
        updatedAt: new Date(),
      })
      .where(eq(problems.id, id))
      .returning();

    if (!updatedProblem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    return NextResponse.json({ problem: updatedProblem });
  } catch (error) {
    console.error("Error updating problem:", error);
    return NextResponse.json(
      { error: "Failed to update problem" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireAdmin();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const [updatedProblem] = await db
      .update(problems)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(problems.id, id))
      .returning();

    if (!updatedProblem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    return NextResponse.json({ problem: updatedProblem });
  } catch (error) {
    console.error("Error patching problem:", error);
    return NextResponse.json(
      { error: "Failed to update problem" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireAdmin();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [deletedProblem] = await db
      .delete(problems)
      .where(eq(problems.id, id))
      .returning();

    if (!deletedProblem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting problem:", error);
    return NextResponse.json(
      { error: "Failed to delete problem" },
      { status: 500 }
    );
  }
}
