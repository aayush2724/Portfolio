import React, { useState, useEffect, useRef } from "react";
import portfolioData from "../data/portfolioData.json";
import { projects } from "./Projects";

// ---------- System prompt for Claude ----------
const SYSTEM_PROMPT = `You are PortfolioBot — the smart, concise assistant embedded in Aayush Sharma's developer portfolio. You speak in a direct, confident, slightly casual tone. Never be verbose; match the aesthetic of a dark, minimal portfolio site.

About Aayush:
- Full-stack & AI/ML developer, B.E. AI-ML student (2024–2028) at National Institute of Engineering, Mysore
- Based in Bengaluru, India
- Team: "Panic-At-The-Deadline" with Kaki Harshita — regular hackathon competitors
- GitHub: github.com/aayush2724 | LeetCode: aayush2717
- Stack: React, Vite, Tailwind, Node.js, Express, FastAPI, Python, MongoDB, MySQL, Firebase, Three.js, Framer Motion
- Interests: Civic tech, AI/ML pipelines, music (learning Stairway to Heaven on guitar ~1–2 years), competitive programming

LeetCode stats: ${portfolioData.leetcode.stats.totalSolved} solved (${portfolioData.leetcode.stats.easy} easy, ${portfolioData.leetcode.stats.medium} medium, ${portfolioData.leetcode.stats.hard} hard), ${portfolioData.leetcode.streak}-day streak, rank ${portfolioData.leetcode.ranking}.

Projects (most recent first):
${projects
  .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  .map(
    (p) =>
      `- ${p.name} (${p.updated}): ${p.desc} Tags: ${p.tags.join(", ")}. Repo: ${p.gh}${p.demo ? ` Demo: ${p.demo}` : ""}`
  )
  .join("\n")}

Hackathon achievements:
- 3rd Place, ThinkRoot x Vortex'26 @ NIT Trichy — LeadForge (AI B2B lead pipeline)
- Goldman Sachs India Hackathon 2026 — multi-agent drone routing (C++)
- Samsung ennovateX AX Hackathon — Phantom Memory (3-tier adaptive memory for mobile agents)

Rules:
1. Keep answers under 4 sentences unless a detailed breakdown is explicitly asked for
2. When mentioning a project, always include the GitHub link
3. If asked about tech stack for a project, list the key technologies concisely
4. If you don't know something specific, say so honestly — don't hallucinate
5. You can be slightly witty but stay professional
6. Format multi-item answers as short bullet lines, not prose walls
7. Never say "As an AI language model" — you are PortfolioBot, period`;

// ---------- Suggested prompts ----------
const SUGGESTIONS = [
  "What's your most recent project?",
  "Tell me about LeadForge",
  "What's your LeetCode rating?",
  "What's your tech stack?",
  "Any hackathon wins?",
  "What are you learning now?",
];

export default function PortfolioBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, loading]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const callClaude = async (userText, history) => {
    const apiMessages = [
      ...history.map((m) => ({
        role: m.from === "user" ? "user" : "assistant",
        content: m.text,
      })),
      { role: "user", content: userText },
    ];

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: apiMessages,
      }),
    });

    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    return data.content?.[0]?.text ?? "Something went wrong. Try again.";
  };

  const send = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput("");
    setShowSuggestions(false);
    const userMsg = { from: "user", text: trimmed, id: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);
    try {
      const reply = await callClaude(trimmed, messages);
      setMessages((m) => [...m, { from: "bot", text: reply, id: Date.now() + 1 }]);
    } catch {
      setMessages((m) => [
        ...m,
        { from: "bot", text: "Network hiccup — check connection and try again.", id: Date.now() + 1 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen((o) => !o);
  };

  const reset = () => {
    setMessages([]);
    setShowSuggestions(true);
    setInput("");
  };

  return (
    <div>
      {/* Floating trigger button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-display font-semibold text-black shadow-[0_0_0_1px_rgba(251,191,36,0.18),0_12px_40px_rgba(251,191,36,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(251,191,36,0.28),0_16px_48px_rgba(251,191,36,0.36)]"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-white/80 opacity-75 animate-ping" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
        </span>
        {open ? "Close" : "Ask me"}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed right-5 bottom-20 w-[400px] max-w-[92vw] z-50 rounded-2xl border border-white/8 bg-[#060b18] shadow-2xl shadow-black/60 overflow-hidden flex flex-col"
          style={{ maxHeight: "min(580px, 80vh)" }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/6 bg-white/[0.02] flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <span className="text-xs font-bold text-black">AI</span>
              </div>
              <div>
                <div className="font-display text-sm font-semibold text-white">PortfolioBot</div>
                <div className="font-mono text-[9px] text-amber-400/60 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />
                  Powered by Claude
                </div>
              </div>
            </div>
            <button
              onClick={reset}
              className="font-mono text-[10px] text-white/20 hover:text-white/50 transition-colors px-2 py-1 rounded border border-white/6 hover:border-white/15"
            >
              clear
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-body" style={{ scrollbarWidth: "none" }}>

            {/* Empty state */}
            {messages.length === 0 && (
              <div className="text-center py-6">
                <div className="text-3xl mb-3">👋</div>
                <p className="text-white/60 text-sm font-display font-medium">Hey, I'm PortfolioBot</p>
                <p className="text-white/25 text-xs mt-1">Ask me anything about Aayush's work</p>
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                {m.from === "bot" && (
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-500/30 to-orange-500/20 border border-amber-500/20 flex items-center justify-center text-[9px] font-bold text-amber-400 mr-2 flex-shrink-0 mt-0.5">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.from === "user"
                      ? "bg-amber-500/15 border border-amber-500/25 text-amber-50 rounded-br-sm"
                      : "bg-white/[0.04] border border-white/6 text-white/85 rounded-bl-sm"
                  }`}
                >
                  <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed">{m.text}</pre>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-500/30 to-orange-500/20 border border-amber-500/20 flex items-center justify-center text-[9px] font-bold text-amber-400 flex-shrink-0">
                  AI
                </div>
                <div className="bg-white/[0.04] border border-white/6 rounded-xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                  {[0, 0.15, 0.3].map((delay, i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-amber-400/60"
                      style={{ animation: `bounce 1s ${delay}s infinite` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Suggestions */}
          {showSuggestions && messages.length === 0 && (
            <div className="px-4 pb-3 flex-shrink-0">
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="font-mono text-[10px] px-2.5 py-1 rounded-full border border-white/8 text-white/35 hover:text-amber-400 hover:border-amber-500/30 transition-all bg-white/[0.02]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 flex-shrink-0 border-t border-white/5 pt-3">
            <div className="flex gap-2 items-center bg-white/[0.03] border border-white/8 rounded-xl px-3 py-2 focus-within:border-amber-500/30 focus-within:ring-1 focus-within:ring-amber-500/10 transition-all">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder="Ask about projects, stack, or hackathons…"
                disabled={loading}
                className="flex-1 bg-transparent font-body text-sm text-white caret-amber-400 outline-none placeholder:text-white/20 disabled:opacity-50"
              />
              <button
                onClick={() => send(input)}
                disabled={loading || !input.trim()}
                className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 6L11 6M6 1L11 6L6 11" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}