"use client";
import { useCallback, useEffect, useState } from "react";

interface Post {
  id: string;
  belief_id: string | null;
  counter_argument_id: string | null;
  title: string;
  content: string;
  platform: string | null;
  published_at: string | null;
  status: string;
  created_at: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
    const res = await fetch(`/api/posts${params}`);
    setPosts(await res.json());
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    await fetch(`/api/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchPosts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    fetchPosts();
  };

  const statusColor = (s: string) =>
    s === "published" ? "bg-[#10B981]/20 text-[#10B981]" :
    s === "scheduled" ? "bg-[#1089FF]/20 text-[#1089FF]" :
    "bg-[#2A3040] text-[#8B95A5]";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#E8EAF0]">Posts</h1>
        <p className="text-[#6B7280] text-sm mt-1">Drafted and scheduled thought leadership posts</p>
      </div>

      <div className="flex gap-2">
        {["all", "draft", "scheduled", "published"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              statusFilter === s ? "bg-[#1089FF] text-white" : "bg-[#232838] text-[#8B95A5] hover:bg-[#2A3040]"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-[#232838] border border-[#2A3040] rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[#4A5568] text-sm">Loading…</div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-[#4A5568] text-sm">No posts yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2A3040] text-left text-[#6B7280] text-xs uppercase tracking-wide">
                <th className="px-5 py-3">Title</th>
                <th className="px-3 py-3">Platform</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Created</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p: Post) => (
                <tr key={p.id} className="border-b border-[#2A3040] hover:bg-[#2A3040]/50 transition-colors">
                  <td className="px-5 py-3 text-[#E8EAF0] max-w-md truncate">{p.title}</td>
                  <td className="px-3 py-3 text-[#6B7280]">{p.platform ?? "—"}</td>
                  <td className="px-3 py-3">
                    <select
                      value={p.status}
                      onChange={e => handleStatusChange(p.id, e.target.value)}
                      className={`px-2 py-0.5 rounded text-xs border-0 focus:outline-none focus:ring-1 focus:ring-[#1089FF] cursor-pointer ${statusColor(p.status)}`}
                    >
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="published">Published</option>
                    </select>
                  </td>
                  <td className="px-3 py-3 text-[#6B7280]">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="px-3 py-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(p.content);
                        }}
                        className="text-xs text-[#1089FF] hover:underline"
                        title="Copy content"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-xs text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
