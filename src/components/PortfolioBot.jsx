import React, { useState, useEffect, useRef } from "react";
import { projects } from "./Projects";
import portfolioData from "../data/portfolioData.json";

function findBestProjectMatch(query) {
  const q = query.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const p of projects) {
    let score = 0;
    if (p.name.toLowerCase().includes(q)) score += 10;
    if (p.repo && p.repo.toLowerCase().includes(q)) score += 8;
    if ((p.desc || "").toLowerCase().includes(q)) score += 5;
    for (const t of p.tags || []) if (t.toLowerCase().includes(q)) score += 3;
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }
  return bestScore >= 5 ? best : null;
}

function searchPortfolio(query) {
  const q = query.toLowerCase();
  // Check projects first
  const p = findBestProjectMatch(q);
  if (p) {
    return `Project: ${p.name}\n\n${p.desc}\n\nTags: ${p.tags.join(", ")}\n\nRepo: ${p.gh}`;
  }

  // Search GitHub repos list
  const gh = (portfolioData.github || []).find((r) =>
    r.name.toLowerCase().includes(q) || (r.description || "").toLowerCase().includes(q),
  );
  if (gh) {
    return `Repo: ${gh.name}\n\n${gh.description || "No description"}\n\n${gh.url}`;
  }

  // Search general keywords (about/skills)
  const skills = (portfolioData.skills || []).join(", ");
  if (skills && skills.toLowerCase().includes(q)) {
    return `Skills: ${skills}`;
  }

  // LeetCode stats
  if (q.includes("leetcode") || q.includes("dsa") || q.includes("solved")) {
    const lc = portfolioData.leetcode;
    if (lc) {
      return `LeetCode: ${lc.username} — ${lc.stats.totalSolved} solved (${lc.stats.easy} easy, ${lc.stats.medium} medium, ${lc.stats.hard} hard). Current streak: ${lc.streak}.`;
    }
  }

  return null;
}

export default function PortfolioBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi — I'm PortfolioBot. Ask me about projects, skills, or LeetCode stats." },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = (text) => {
    if (!text.trim()) return;
    const userMsg = { from: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    // Simple synchronous reply using local search
    const reply = searchPortfolio(text) || "Sorry — I couldn't find a direct answer. Try asking about a project name, skill, or 'LeetCode'.";
    setTimeout(() => {
      setMessages((m) => [...m, { from: "bot", text: reply }]);
    }, 300);
  };

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 gc border border-white/8 rounded-full px-4 py-3 text-sm font-mono text-white/90"
      >
        {open ? "Close" : "Chat"}
      </button>

      {open && (
        <div className="fixed right-5 bottom-20 w-96 max-w-[92vw] z-50 bg-[#071024] border border-white/6 rounded-xl shadow-lg p-3">
          <div className="h-64 overflow-auto p-2 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={m.from === "bot" ? "text-white/80 text-sm" : "text-amber-300 text-sm text-right"}>
                <pre className="whitespace-pre-wrap">{m.text}</pre>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="mt-2 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send(input);
              }}
              placeholder="Ask about a project, skill, or 'LeetCode'"
              className="flex-1 px-3 py-2 rounded-md bg-white/3 text-white placeholder-white/30 outline-none"
            />
            <button onClick={() => send(input)} className="px-3 py-2 rounded-md bg-amber-500 text-black font-bold">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
