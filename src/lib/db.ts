import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "belief_sieve.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = OFF");
  initSchema(_db);
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sources (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      type TEXT DEFAULT 'forum',
      last_scraped TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS beliefs (
      id TEXT PRIMARY KEY,
      source_id TEXT,
      content TEXT NOT NULL,
      verbatim TEXT,
      author TEXT,
      url TEXT,
      extracted_pattern TEXT,
      category TEXT DEFAULT 'ASSUMPTION',
      confidence REAL DEFAULT 0.5,
      reasoning TEXT,
      industry TEXT,
      status TEXT DEFAULT 'new',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS counter_arguments (
      id TEXT PRIMARY KEY,
      belief_id TEXT NOT NULL,
      counter_argument TEXT NOT NULL,
      first_principle TEXT,
      disruption_score REAL DEFAULT 0.5,
      status TEXT DEFAULT 'draft',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      belief_id TEXT,
      counter_argument_id TEXT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      platform TEXT,
      published_at TEXT,
      status TEXT DEFAULT 'draft',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface Source {
  id: string;
  name: string;
  url: string;
  type: string;
  last_scraped: string | null;
  created_at: string;
}

export interface Belief {
  id: string;
  source_id: string | null;
  content: string;
  verbatim: string | null;
  author: string | null;
  url: string | null;
  extracted_pattern: string | null;
  category: "ASSUMPTION" | "AXIOM" | "ORTHODOXY";
  confidence: number;
  reasoning: string | null;
  industry: string | null;
  status: "new" | "extracted" | "reviewed" | "rejected";
  created_at: string;
}

export interface CounterArgument {
  id: string;
  belief_id: string;
  counter_argument: string;
  first_principle: string | null;
  disruption_score: number;
  status: "draft" | "generated" | "published";
  created_at: string;
}

export interface Post {
  id: string;
  belief_id: string | null;
  counter_argument_id: string | null;
  title: string;
  content: string;
  platform: string | null;
  published_at: string | null;
  status: "draft" | "scheduled" | "published";
  created_at: string;
}
