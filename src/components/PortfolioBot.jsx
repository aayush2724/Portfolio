import React, { useState, useEffect, useRef } from "react";
import portfolioData from "../data/portfolioData.json";

const projectsData = [
  {
    name: "LeadForge",
    repo: "LeadForge",
    desc: "An AI-powered B2B lead generation and enrichment pipeline. Automates prospect sourcing, scoring, and multi-phase enrichment via Apollo, Crunchbase, and job-board scraping. Built for the ThinkRoot x Vortex'26 Hackathon at NIT Trichy, where it secured 3rd place.",
    tags: ["Python", "AI/ML", "Data Pipeline", "Automation"],
    gh: "https://github.com/aayush2724/LeadForge",
  },
  {
    name: "Chord Detector",
    repo: "Chord-Detector",
    desc: "A chord intelligence project currently being rebuilt with a new direction. Focus now is cleaner signal pipelines, stronger feature extraction, and more reliable real-time recognition.",
    tags: ["Python", "Computer Vision", "ML", "OpenCV"],
    gh: "https://github.com/aayush2724/Chord-Detector",
  },
  {
    name: "Citizen Resolver System",
    repo: "Citizen-Resolver-System",
    desc: "A civic support portal for logging citizen issues, tracking resolution flow, and keeping helpline work organized from intake to action.",
    tags: ["React", "Vite", "Routing", "CivicTech"],
    gh: "https://github.com/aayush2724/Citizen-Resolver-System",
  },
  {
    name: "Skillnest",
    repo: "Skillnest",
    desc: "A peer-to-peer learning platform where people can teach what they know and learn what they need without turning knowledge into a paywall.",
    tags: ["JavaScript", "EdTech", "Community"],
    gh: "https://github.com/aayush2724/Skillnest",
  },
  {
    name: "Job Portal",
    repo: "Job-Portal",
    desc: "A TypeScript job portal with listings, application flow, authentication, filtering, and recruiter-facing dashboard patterns.",
    tags: ["TypeScript", "React", "Full Stack"],
    gh: "https://github.com/aayush2724/Job-Portal",
  },
  {
    name: "Disaster Relief System",
    repo: "Disaster-relief-system",
    desc: "A relief coordination platform for managing affected zones, dispatching resources, tracking supplies, and organizing response teams.",
    tags: ["JavaScript", "Full Stack", "Relief Ops"],
    gh: "https://github.com/aayush2724/Disaster-relief-system",
  },
  {
    name: "chatRoom",
    repo: "chatRoom",
    desc: "A lightweight real-time group chat app with rooms, live message broadcasting, and WebSocket-powered communication.",
    tags: ["HTML", "JavaScript", "WebSockets"],
    gh: "https://github.com/aayush2724/chatRoom",
  },
];

function findBestProjectMatch(query) {
  const q = query.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const p of projectsData) {
    let score = 0;
    const pNameLower = p.name.toLowerCase();
    const pRepoLower = p.repo ? p.repo.toLowerCase() : "";
    const pDescLower = (p.desc || "").toLowerCase();
    if (pNameLower.includes(q) || q.includes(pNameLower)) score += 10;
    if (pRepoLower && (pRepoLower.includes(q) || q.includes(pRepoLower))) score += 8;
    if (pDescLower.includes(q)) score += 5;
    for (const t of p.tags || []) if (q.includes(t.toLowerCase())) score += 3;
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
