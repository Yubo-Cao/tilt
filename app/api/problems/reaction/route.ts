import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { recordReaction } from "@/lib/problems";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { interactionId, reaction } = body;

    if (!interactionId) {
      return NextResponse.json(
        { error: "Missing interactionId" },
        { status: 400 }
      );
    }

    const result = await recordReaction(interactionId, reaction);

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to record reaction" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error recording reaction:", error);
    return NextResponse.json(
      { error: "Failed to record reaction" },
      { status: 500 }
    );
  }
}
