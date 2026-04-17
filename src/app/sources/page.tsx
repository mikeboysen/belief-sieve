"use client";
import { useCallback, useEffect, useState } from "react";

interface Source {
  id: string;
  name: string;
  url: string;
  type: string;
  last_scraped: string | null;
  created_at: string;
}

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", type: "forum" });
  const [scraping, setScraping] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchSources = useCallback(async () => {
    const res = await fetch("/api/sources");
    setSources(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchSources(); }, [fetchSources]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await fetch("/api/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", url: "", type: "forum" });
    setShowAdd(false);
    fetchSources();
    setSubmitting(false);
  };

  const handleScrape = async (id: string) => {
    setScraping(id);
    await fetch("/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source_id: id }),
    });
    fetchSources();
    setScraping(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#E8EAF0]">Sources</h1>
          <p className="text-[#6B7280] text-sm mt-1">Forums and sites to scrape for beliefs</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-[#1089FF] hover:bg-[#0d6edb] text-white text-sm font-medium rounded transition-colors"
        >
          {showAdd ? "Cancel" : "+ Add Source"}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-[#232838] border border-[#2A3040] rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[#E8EAF0]">Add Source</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-[#6B7280] mb-1">Name *</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-[#1A1F2C] border border-[#2A3040] rounded px-3 py-2 text-sm text-[#E8EAF0] placeholder-[#4A5568] focus:outline-none focus:border-[#1089FF]"
                placeholder="Hacker News"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-[#6B7280] mb-1">URL *</label>
              <input
                value={form.url}
                onChange={e => setForm({ ...form, url: e.target.value })}
                className="w-full bg-[#1A1F2C] border border-[#2A3040] rounded px-3 py-2 text-sm text-[#E8EAF0] placeholder-[#4A5568] focus:outline-none focus:border-[#1089FF]"
                placeholder="https://news.ycombinator.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-[#6B7280] mb-1">Type</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full bg-[#1A1F2C] border border-[#2A3040] rounded px-3 py-2 text-sm text-[#E8EAF0] focus:outline-none focus:border-[#1089FF]"
              >
                <option value="forum">Forum</option>
                <option value="news">News</option>
                <option value="social">Social</option>
                <option value="blog">Blog</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-[#FB9224] hover:bg-[#e07d15] text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
          >
            {submitting ? "Adding…" : "Add Source"}
          </button>
        </form>
      )}

      <div className="bg-[#232838] border border-[#2A3040] rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[#4A5568] text-sm">Loading…</div>
        ) : sources.length === 0 ? (
          <div className="p-8 text-center text-[#4A5568] text-sm">No sources yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2A3040] text-left text-[#6B7280] text-xs uppercase tracking-wide">
                <th className="px-5 py-3">Name</th>
                <th className="px-3 py-3">URL</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Last Scraped</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s: Source) => (
                <tr key={s.id} className="border-b border-[#2A3040] hover:bg-[#2A3040]/50 transition-colors">
                  <td className="px-5 py-3 text-[#E8EAF0] font-medium">{s.name}</td>
                  <td className="px-3 py-3">
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1089FF] hover:underline">
                      {s.url.slice(0, 50)}{s.url.length > 50 ? "…" : ""}
                    </a>
                  </td>
                  <td className="px-3 py-3">
                    <span className="px-2 py-0.5 rounded text-xs bg-[#2A3040] text-[#8B95A5]">{s.type}</span>
                  </td>
                  <td className="px-3 py-3 text-[#6B7280]">
                    {s.last_scraped ? new Date(s.last_scraped).toLocaleString() : "Never"}
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => handleScrape(s.id)}
                      disabled={scraping === s.id}
                      className="text-xs text-[#FB9224] hover:underline disabled:opacity-50"
                    >
                      {scraping === s.id ? "Scraping…" : "Scrape"}
                    </button>
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
