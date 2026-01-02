import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { toggleProblemSolved } from "@/lib/problems";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { interactionId, solved } = body;

    if (!interactionId) {
      return NextResponse.json(
        { error: "Missing interactionId" },
        { status: 400 }
      );
    }

    const result = await toggleProblemSolved(interactionId, user.id, solved);

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to update solved status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      solved: result.solved,
      timeSpentSeconds: result.timeSpentSeconds 
    });
  } catch (error) {
    console.error("Error toggling solved:", error);
    return NextResponse.json(
      { error: "Failed to update solved status" },
      { status: 500 }
    );
  }
}
