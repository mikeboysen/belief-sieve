"use client";
import { useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface Belief {
  id: string;
  content: string;
  category: string;
  status: string;
  industry: string | null;
  author: string | null;
  confidence: number;
  created_at: string;
}

export default function BeliefsContent() {
  const searchParams = useSearchParams();
  const [beliefs, setBeliefs] = useState<Belief[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(searchParams.get("status") ?? "all");
  const [category, setCategory] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ content: "", industry: "", category: "ASSUMPTION" });
  const [submitting, setSubmitting] = useState(false);

  const fetchBeliefs = useCallback(async (s: string, cat: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (s !== "all") params.set("status", s);
    if (cat !== "all") params.set("category", cat);
    params.set("limit", "100");
    const res = await fetch(`/api/beliefs?${params}`);
    setBeliefs(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchBeliefs(status, category); }, [status, category, fetchBeliefs]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/beliefs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    if (res.ok) {
      setAddForm({ content: "", industry: "", category: "ASSUMPTION" });
      setShowAdd(false);
      fetchBeliefs(status, category);
    }
    setSubmitting(false);
  };

  const handleGenerate = async (id: string) => {
    await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ belief_id: id }),
    });
    fetchBeliefs(status, category);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#E8EAF0]">Beliefs</h1>
          <p className="text-[#6B7280] text-sm mt-1">Extracted beliefs from forum sources</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-[#1089FF] hover:bg-[#0d6edb] text-white text-sm font-medium rounded transition-colors"
        >
          {showAdd ? "Cancel" : "+ Add Belief"}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-[#232838] border border-[#2A3040] rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[#E8EAF0]">Add Belief</h2>
          <div>
            <label className="block text-xs text-[#6B7280] mb-1">Content *</label>
            <textarea
              value={addForm.content}
              onChange={e => setAddForm({ ...addForm, content: e.target.value })}
              className="w-full bg-[#1A1F2C] border border-[#2A3040] rounded px-3 py-2 text-sm text-[#E8EAF0] placeholder-[#4A5568] focus:outline-none focus:border-[#1089FF]"
              rows={3}
              placeholder="The belief to dismantle…"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#6B7280] mb-1">Industry</label>
              <input
                value={addForm.industry}
                onChange={e => setAddForm({ ...addForm, industry: e.target.value })}
                className="w-full bg-[#1A1F2C] border border-[#2A3040] rounded px-3 py-2 text-sm text-[#E8EAF0] placeholder-[#4A5568] focus:outline-none focus:border-[#1089FF]"
                placeholder="e.g. SaaS, Crypto"
              />
            </div>
            <div>
              <label className="block text-xs text-[#6B7280] mb-1">Category</label>
              <select
                value={addForm.category}
                onChange={e => setAddForm({ ...addForm, category: e.target.value })}
                className="w-full bg-[#1A1F2C] border border-[#2A3040] rounded px-3 py-2 text-sm text-[#E8EAF0] focus:outline-none focus:border-[#1089FF]"
              >
                <option value="ASSUMPTION">Assumption</option>
                <option value="AXIOM">Axiom</option>
                <option value="ORTHODOXY">Orthodoxy</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-[#FB9224] hover:bg-[#e07d15] text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
          >
            {submitting ? "Adding…" : "Add Belief"}
          </button>
        </form>
      )}

      <div className="flex gap-4 flex-wrap">
        <div className="flex gap-2">
          {["all", "new", "extracted", "reviewed", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                status === s ? "bg-[#1089FF] text-white" : "bg-[#232838] text-[#8B95A5] hover:bg-[#2A3040]"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="bg-[#232838] border border-[#2A3040] rounded px-3 py-1.5 text-xs text-[#8B95A5] focus:outline-none focus:border-[#1089FF]"
        >
          <option value="all">All Categories</option>
          <option value="ASSUMPTION">Assumption</option>
          <option value="AXIOM">Axiom</option>
          <option value="ORTHODOXY">Orthodoxy</option>
        </select>
      </div>

      <div className="bg-[#232838] border border-[#2A3040] rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[#4A5568] text-sm">Loading…</div>
        ) : beliefs.length === 0 ? (
          <div className="p-8 text-center text-[#4A5568] text-sm">No beliefs match the current filters.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2A3040] text-left text-[#6B7280] text-xs uppercase tracking-wide">
                <th className="px-5 py-3">Belief</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Industry</th>
                <th className="px-3 py-3">Confidence</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {beliefs.map((b: Belief) => (
                <tr key={b.id} className="border-b border-[#2A3040] hover:bg-[#2A3040]/50 transition-colors">
                  <td className="px-5 py-3 max-w-sm truncate text-[#E8EAF0]">
                    <a href={`/beliefs/${b.id}`} className="hover:text-[#1089FF]">{b.content}</a>
                  </td>
                  <td className="px-3 py-3">
                    <span className="px-2 py-0.5 rounded text-xs bg-[#2A3040] text-[#8B95A5]">{b.category}</span>
                  </td>
                  <td className="px-3 py-3 text-[#6B7280]">{b.industry ?? "—"}</td>
                  <td className="px-3 py-3 text-[#6B7280]">{b.confidence?.toFixed(2) ?? "—"}</td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      b.status === "reviewed" ? "bg-[#10B981]/20 text-[#10B981]" :
                      b.status === "rejected" ? "bg-red-900/20 text-red-400" :
                      b.status === "extracted" ? "bg-[#1089FF]/20 text-[#1089FF]" :
                      "bg-[#2A3040] text-[#8B95A5]"
                    }`}>{b.status}</span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <a href={`/beliefs/${b.id}`} className="text-xs text-[#1089FF] hover:underline">View</a>
                      {b.status !== "reviewed" && (
                        <button
                          onClick={() => handleGenerate(b.id)}
                          className="text-xs text-[#FB9224] hover:underline"
                        >
                          Generate
                        </button>
                      )}
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
