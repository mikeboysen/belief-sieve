import { NextRequest, NextResponse } from "next/server";
import { getDb, type Belief } from "@/lib/db";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const industry = searchParams.get("industry");
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") ?? "50");

    let sql = "SELECT * FROM beliefs WHERE 1=1";
    const params: unknown[] = [];

    if (status) { sql += " AND status = ?"; params.push(status); }
    if (industry) { sql += " AND industry = ?"; params.push(industry); }
    if (category) { sql += " AND category = ?"; params.push(category); }

    sql += " ORDER BY created_at DESC LIMIT ?";
    params.push(limit);

    const beliefs = db.prepare(sql).all(...params) as Belief[];
    return NextResponse.json(beliefs);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();
    const { source_id, content, verbatim, author, url, industry, category = "ASSUMPTION" } = body;

    if (!content) return NextResponse.json({ error: "content required" }, { status: 400 });

    const id = randomUUID();
    db.prepare(`
      INSERT INTO beliefs (id, source_id, content, verbatim, author, url, industry, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, source_id ?? null, content, verbatim ?? null, author ?? null, url ?? null, industry ?? null, category);

    const belief = db.prepare("SELECT * FROM beliefs WHERE id = ?").get(id) as Belief;
    return NextResponse.json(belief, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
