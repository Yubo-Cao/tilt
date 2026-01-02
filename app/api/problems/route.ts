import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getNextProblems } from "@/lib/problems";

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "5", 10);
    const excludeParam = searchParams.get("exclude");
    const excludeIds = excludeParam ? excludeParam.split(",").filter(Boolean) : [];

    const problems = await getNextProblems(user.id, excludeIds, limit);

    return NextResponse.json({ problems });
  } catch (error) {
    console.error("Error fetching problems:", error);
    return NextResponse.json(
      { error: "Failed to fetch problems" },
      { status: 500 }
    );
  }
}
