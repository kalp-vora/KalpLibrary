import { NextRequest, NextResponse } from "next/server";
import { matchItemByMood } from "@/lib/moodMatcher";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { moodDescription, items, userApiKey, aiProvider } = body;

    if (!moodDescription || typeof moodDescription !== "string") {
      return NextResponse.json({ error: "Mood description is required" }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "A list of items is required for matching" }, { status: 400 });
    }

    const result = await matchItemByMood({
      moodDescription: moodDescription.trim(),
      items,
      userApiKey,
      aiProvider
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Mood match error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to match mood" },
      { status: 500 }
    );
  }
}

