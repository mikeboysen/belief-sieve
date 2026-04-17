import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const { source_id } = await req.json();
    if (!source_id) return NextResponse.json({ error: "source_id required" }, { status: 400 });

    const source = db.prepare("SELECT * FROM sources WHERE id = ?").get(source_id);
    if (!source) return NextResponse.json({ error: "Source not found" }, { status: 404 });

    // Stub: real scraping needs Playwright + forum-specific selectors
    db.prepare('UPDATE sources SET last_scraped = datetime("now") WHERE id = ?').run(source_id);

    return NextResponse.json({
      success: true,
      message: "Scraping not yet implemented — add Playwright selectors for this source type",
      source,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
