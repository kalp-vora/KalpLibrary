import { NextRequest, NextResponse } from "next/server";
import { searchOnlineBooks, searchOnlineMovies } from "@/lib/onlineResources";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type") || "all"; // 'book' | 'movie' | 'all'

    if (!query.trim()) {
      return NextResponse.json({ success: true, results: [] });
    }

    if (type === "book") {
      const results = await searchOnlineBooks(query);
      return NextResponse.json({ success: true, results });
    }

    if (type === "tv" || type === "anime") {
      const results = await searchOnlineMovies(query);
      const tagged = results.map((r) => ({ ...r, type: type as any }));
      return NextResponse.json({ success: true, results: tagged });
    }

    // If 'all', search both in parallel
    const [books, movies] = await Promise.all([
      searchOnlineBooks(query),
      searchOnlineMovies(query)
    ]);

    return NextResponse.json({ success: true, results: [...books, ...movies] });
  } catch (error: any) {
    console.error("Search API route error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to search online resources" },
      { status: 500 }
    );
  }
}

