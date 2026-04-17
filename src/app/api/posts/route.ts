import { NextRequest, NextResponse } from "next/server";
import { getDb, type Post } from "@/lib/db";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") ?? "50");

    let sql = "SELECT * FROM posts WHERE 1=1";
    const params: unknown[] = [];
    if (status) { sql += " AND status = ?"; params.push(status); }
    sql += " ORDER BY created_at DESC LIMIT ?";
    params.push(limit);

    const posts = db.prepare(sql).all(...params) as Post[];
    return NextResponse.json(posts);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const { belief_id, counter_argument_id, title, content, platform, status = "draft" } = await req.json();
    if (!title || !content) return NextResponse.json({ error: "title and content required" }, { status: 400 });

    const id = randomUUID();
    db.prepare(`
      INSERT INTO posts (id, belief_id, counter_argument_id, title, content, platform, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, belief_id ?? null, counter_argument_id ?? null, title, content, platform ?? null, status);

    const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(id) as Post;
    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
