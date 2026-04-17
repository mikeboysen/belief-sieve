import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Belief Sieve — Asymmetric Idea Engine",
  description: "Scrape forums, generate first-principles rebuttals, publish thought leadership",
};

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/beliefs", label: "Beliefs" },
  { href: "/sources", label: "Sources" },
  { href: "/posts", label: "Posts" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#1A1F2C] text-[#E8EAF0] min-h-screen">
        {/* Top nav */}
        <header className="border-b border-[#2A3040] bg-[#151921] sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-8">
            <span className="text-[#FB9224] font-bold text-lg tracking-tight">Belief Sieve</span>
            <nav className="flex items-center gap-1">
              {nav.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  className="px-3 py-1.5 rounded text-sm text-[#8B95A5] hover:text-[#E8EAF0] hover:bg-[#2A3040] transition-colors"
                >
                  {n.label}
                </a>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FB9224]" title="Auth bypass active" />
              <span className="text-xs text-[#4A5568]">bypass</span>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
