"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Belief {
  id: string;
  content: string;
  verbatim: string | null;
  author: string | null;
  url: string | null;
  category: string;
  confidence: number;
  reasoning: string | null;
  industry: string | null;
  status: string;
  created_at: string;
  counter_arguments?: CounterArgument[];
}

interface CounterArgument {
  id: string;
  belief_id: string;
  counter_argument: string;
  first_principle: string | null;
  disruption_score: number;
  status: string;
  created_at: string;
}

export default function BeliefDetailPage() {
  const { id } = useParams();
  const [belief, setBelief] = useState<Belief | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [showPostForm, setShowPostForm] = useState(false);

  const fetchBelief = useCallback(async () => {
    const res = await fetch(`/api/beliefs/${id}`);
    if (res.ok) setBelief(await res.json());
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchBelief(); }, [fetchBelief]);

  const handleGenerate = async () => {
    setGenerating(true);
    await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ belief_id: id }),
    });
    await fetchBelief();
    setGenerating(false);
  };

  const handleCreatePost = async (counterArgId?: string) => {
    const content = newPostContent || `Counter to: ${belief?.content}\n\n${counterArgId ? belief?.counter_arguments?.find(c => c.id === counterArgId)?.counter_argument : ""}`;
    const title = newPostTitle || `Rebuttal: ${belief?.content?.slice(0, 60)}`;

    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        belief_id: id,
        counter_argument_id: counterArgId ?? null,
        title,
        content,
        status: "draft",
      }),
    });
    setNewPostTitle("");
    setNewPostContent("");
    setShowPostForm(false);
  };

  if (loading) return <div className="text-[#4A5568] text-sm">Loading…</div>;
  if (!belief) return <div className="text-red-400 text-sm">Belief not found.</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 rounded text-xs bg-[#2A3040] text-[#8B95A5]">{belief.category}</span>
            <span className={`px-2 py-0.5 rounded text-xs ${
              belief.status === "reviewed" ? "bg-[#10B981]/20 text-[#10B981]" :
              belief.status === "rejected" ? "bg-red-900/20 text-red-400" :
              "bg-[#2A3040] text-[#8B95A5]"
            }`}>{belief.status}</span>
            {belief.industry && <span className="text-xs text-[#6B7280]">{belief.industry}</span>}
          </div>
          <h1 className="text-xl font-bold text-[#E8EAF0] leading-snug">{belief.content}</h1>
          {belief.verbatim && (
            <p className="mt-2 text-sm text-[#6B7280] italic border-l-2 border-[#2A3040] pl-3">
              Verbatim: {belief.verbatim}
            </p>
          )}
          {belief.reasoning && (
            <p className="mt-2 text-sm text-[#6B7280]">Reasoning: {belief.reasoning}</p>
          )}
          <div className="mt-3 flex gap-3 text-xs text-[#4A5568]">
            {belief.author && <span>Author: {belief.author}</span>}
            {belief.url && <a href={belief.url} target="_blank" rel="noopener noreferrer" className="text-[#1089FF] hover:underline">Source ↗</a>}
            <span>Confidence: {belief.confidence?.toFixed(2)}</span>
            <span>Added: {new Date(belief.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-2 bg-[#FB9224] hover:bg-[#e07d15] text-white text-sm font-medium rounded transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {generating ? "Generating…" : "⚡ Generate Rebuttal"}
          </button>
          <button
            onClick={() => setShowPostForm(!showPostForm)}
            className="px-4 py-2 bg-[#2A3040] hover:bg-[#3A4050] text-[#E8EAF0] text-sm rounded transition-colors whitespace-nowrap"
          >
            + Draft Post
          </button>
        </div>
      </div>

      {showPostForm && (
        <div className="bg-[#232838] border border-[#2A3040] rounded-lg p-5 space-y-3">
          <h3 className="text-sm font-semibold text-[#E8EAF0]">Draft Post</h3>
          <input
            value={newPostTitle}
            onChange={e => setNewPostTitle(e.target.value)}
            placeholder="Post title…"
            className="w-full bg-[#1A1F2C] border border-[#2A3040] rounded px-3 py-2 text-sm text-[#E8EAF0] placeholder-[#4A5568] focus:outline-none focus:border-[#1089FF]"
          />
          <textarea
            value={newPostContent}
            onChange={e => setNewPostContent(e.target.value)}
            placeholder="Post content…"
            rows={5}
            className="w-full bg-[#1A1F2C] border border-[#2A3040] rounded px-3 py-2 text-sm text-[#E8EAF0] placeholder-[#4A5568] focus:outline-none focus:border-[#1089FF]"
          />
          <button
            onClick={() => handleCreatePost()}
            className="px-4 py-2 bg-[#1089FF] hover:bg-[#0d6edb] text-white text-sm font-medium rounded transition-colors"
          >
            Save Draft
          </button>
        </div>
      )}

      {/* Counter-Arguments */}
      <div>
        <h2 className="text-sm font-semibold text-[#E8EAF0] uppercase tracking-wide mb-4">
          Counter-Arguments ({belief.counter_arguments?.length ?? 0})
        </h2>
        {!belief.counter_arguments?.length ? (
          <div className="bg-[#232838] border border-[#2A3040] rounded-lg p-8 text-center text-[#4A5568] text-sm">
            No counter-arguments yet. Click "Generate Rebuttal" to create one.
          </div>
        ) : (
          <div className="space-y-4">
            {belief.counter_arguments.map((arg: CounterArgument) => (
              <div key={arg.id} className="bg-[#232838] border border-[#2A3040] rounded-lg p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-[#FB9224]">
                      ⚡ {arg.disruption_score?.toFixed(2) ?? "—"}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      arg.status === "published" ? "bg-[#10B981]/20 text-[#10B981]" :
                      arg.status === "generated" ? "bg-[#1089FF]/20 text-[#1089FF]" :
                      "bg-[#2A3040] text-[#8B95A5]"
                    }`}>{arg.status}</span>
                  </div>
                  <button
                    onClick={() => handleCreatePost(arg.id)}
                    className="text-xs text-[#1089FF] hover:underline whitespace-nowrap"
                  >
                    → Draft Post
                  </button>
                </div>
                <div className="prose prose-sm prose-invert max-w-none text-[#C8CAD4] whitespace-pre-wrap leading-relaxed">
                  {arg.counter_argument}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
