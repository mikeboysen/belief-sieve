import { NextRequest, NextResponse } from "next/server";
import { getDb, type Source } from "@/lib/db";
import { randomUUID } from "crypto";

export async function GET() {
  try {
    const db = getDb();
    const sources = db.prepare("SELECT * FROM sources ORDER BY created_at DESC").all() as Source[];
    return NextResponse.json(sources);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const { name, url, type = "forum" } = await req.json();
    if (!name || !url) return NextResponse.json({ error: "name and url required" }, { status: 400 });

    const id = randomUUID();
    db.prepare("INSERT INTO sources (id, name, url, type) VALUES (?, ?, ?, ?)").run(id, name, url, type);

    const source = db.prepare("SELECT * FROM sources WHERE id = ?").get(id) as Source;
    return NextResponse.json(source, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
