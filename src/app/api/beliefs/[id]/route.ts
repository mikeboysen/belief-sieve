import { NextRequest, NextResponse } from "next/server";
import { getDb, type Belief, type CounterArgument } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const belief = db.prepare("SELECT * FROM beliefs WHERE id = ?").get(id) as Belief | undefined;
    if (!belief) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const args = db.prepare("SELECT * FROM counter_arguments WHERE belief_id = ?").all(id) as CounterArgument[];
    return NextResponse.json({ ...belief, counter_arguments: args });
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
    const allowed = ["content", "verbatim", "author", "url", "industry", "category", "status", "confidence", "reasoning"];
    const updates: string[] = [];
    const values: unknown[] = [];

    for (const key of allowed) {
      if (key in body) { updates.push(`${key} = ?`); values.push(body[key]); }
    }

    if (updates.length === 0) return NextResponse.json({ error: "No valid fields" }, { status: 400 });
    values.push(id);

    db.prepare(`UPDATE beliefs SET ${updates.join(", ")} WHERE id = ?`).run(...values);
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
    db.prepare("DELETE FROM beliefs WHERE id = ?").run(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
