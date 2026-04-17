"use client";
import { useEffect, useState } from "react";

interface Stats {
  total_beliefs: number;
  reviewed_beliefs: number;
  counter_arguments: number;
  posts: number;
}

interface Belief {
  id: string;
  content: string;
  category: string;
  status: string;
  industry: string | null;
  disruption_score: number | null;
  created_at: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ total_beliefs: 0, reviewed_beliefs: 0, counter_arguments: 0, posts: 0 });
  const [recent, setRecent] = useState<Belief[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/beliefs?limit=5").then(r => r.json()),
      fetch("/api/counter-arguments?limit=5").then(r => r.json()),
      fetch("/api/posts?limit=5").then(r => r.json()),
    ]).then(([beliefs, args, posts]) => {
      const beliefList: Belief[] = Array.isArray(beliefs) ? beliefs : [];
      setRecent(beliefList);
      setStats({
        total_beliefs: beliefList.length,
        reviewed_beliefs: beliefList.filter((b: Belief) => b.status === "reviewed").length,
        counter_arguments: Array.isArray(args) ? args.length : 0,
        posts: Array.isArray(posts) ? posts.length : 0,
      });
      setLoading(false);
    });
  }, []);

  const cards = [
    { label: "Beliefs Scraped", value: stats.total_beliefs, color: "#1089FF" },
    { label: "Reviewed", value: stats.reviewed_beliefs, color: "#FB9224" },
    { label: "Counter-Arguments", value: stats.counter_arguments, color: "#10B981" },
    { label: "Posts Drafted", value: stats.posts, color: "#8B5CF6" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#E8EAF0]">Dashboard</h1>
          <p className="text-[#6B7280] text-sm mt-1">Asymmetric idea engine — scrapes beliefs, generates rebuttals</p>
        </div>
        <div className="flex gap-2">
          <a href="/beliefs" className="px-4 py-2 bg-[#1089FF] hover:bg-[#0d6edb] text-white text-sm font-medium rounded transition-colors">
            + Add Belief
          </a>
          <a href="/sources" className="px-4 py-2 bg-[#2A3040] hover:bg-[#3A4050] text-[#E8EAF0] text-sm font-medium rounded transition-colors">
            + Add Source
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-[#232838] border border-[#2A3040] rounded-lg p-5">
            <p className="text-xs text-[#6B7280] uppercase tracking-wide mb-2">{c.label}</p>
            <p className="text-3xl font-bold" style={{ color: c.color }}>{loading ? "—" : c.value}</p>
          </div>
        ))}
      </div>

      {/* Quick generate */}
      <div className="bg-[#232838] border border-[#2A3040] rounded-lg p-5">
        <h2 className="text-sm font-semibold text-[#E8EAF0] uppercase tracking-wide mb-4">Quick Generate</h2>
        <p className="text-sm text-[#6B7280]">Select an unreviewed belief and generate a counter-argument.</p>
        <a href="/beliefs?status=new" className="inline-block mt-3 px-4 py-2 bg-[#FB9224] hover:bg-[#e07d15] text-white text-sm font-medium rounded transition-colors">
          Find Unreviewed Beliefs →
        </a>
      </div>

      {/* Recent beliefs */}
      <div className="bg-[#232838] border border-[#2A3040] rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A3040]">
          <h2 className="text-sm font-semibold text-[#E8EAF0] uppercase tracking-wide">Recent Beliefs</h2>
          <a href="/beliefs" className="text-xs text-[#1089FF] hover:text-[#0d6edb]">View all →</a>
        </div>
        {loading ? (
          <div className="p-8 text-center text-[#4A5568] text-sm">Loading…</div>
        ) : recent.length === 0 ? (
          <div className="p-8 text-center text-[#4A5568] text-sm">
            No beliefs yet.{" "}
            <a href="/beliefs" className="text-[#1089FF] hover:underline">Add your first belief.</a>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2A3040] text-left text-[#6B7280] text-xs uppercase tracking-wide">
                <th className="px-5 py-3">Belief</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Industry</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((b: Belief) => (
                <tr key={b.id} className="border-b border-[#2A3040] hover:bg-[#2A3040]/50 transition-colors">
                  <td className="px-5 py-3 max-w-md truncate text-[#E8EAF0]">
                    <a href={`/beliefs/${b.id}`} className="hover:text-[#1089FF]">{b.content}</a>
                  </td>
                  <td className="px-3 py-3">
                    <span className="px-2 py-0.5 rounded text-xs bg-[#2A3040] text-[#8B95A5]">{b.category}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      b.status === "reviewed" ? "bg-[#10B981]/20 text-[#10B981]" :
                      b.status === "rejected" ? "bg-red-900/20 text-red-400" :
                      "bg-[#2A3040] text-[#8B95A5]"
                    }`}>{b.status}</span>
                  </td>
                  <td className="px-3 py-3 text-[#6B7280]">{b.industry ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
