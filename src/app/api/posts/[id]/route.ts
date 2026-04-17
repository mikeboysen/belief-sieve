import { NextRequest, NextResponse } from "next/server";
import { getDb, type Post } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(id) as Post | undefined;
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(post);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const body = await req.json();
    const allowed = ["title", "content", "platform", "status", "published_at"];
    const updates: string[] = [];
    const values: unknown[] = [];

    for (const key of allowed) {
      if (key in body) { updates.push(`${key} = ?`); values.push(body[key]); }
    }

    if (updates.length === 0) return NextResponse.json({ error: "No valid fields" }, { status: 400 });
    values.push(id);

    db.prepare(`UPDATE posts SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    db.prepare("DELETE FROM posts WHERE id = ?").run(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
