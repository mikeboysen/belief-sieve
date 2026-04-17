import { NextRequest, NextResponse } from "next/server";
import { getDb, type CounterArgument } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const beliefId = searchParams.get("belief_id");
    const minScore = searchParams.get("minScore");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") ?? "20");

    let sql = "SELECT ca.*, b.content as belief_content FROM counter_arguments ca JOIN beliefs b ON ca.belief_id = b.id WHERE 1=1";
    const params: unknown[] = [];

    if (beliefId) { sql += " AND ca.belief_id = ?"; params.push(beliefId); }
    if (minScore) { sql += " AND ca.disruption_score >= ?"; params.push(parseFloat(minScore)); }
    if (status) { sql += " AND ca.status = ?"; params.push(status); }

    sql += " ORDER BY ca.disruption_score DESC LIMIT ?";
    params.push(limit);

    const args = db.prepare(sql).all(...params) as (CounterArgument & { belief_content: string })[];
    return NextResponse.json(args);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
