import React, { useState, useEffect, useRef } from "react";
import portfolioData from "../data/portfolioData.json";
import { projects } from "../data/projects";

const projectKeywords = {
  "DeskGuard": ["deskguard", "desk guard", "security", "surveillance", "monitor"],
  "AlgoVision": ["algovision", "algo vision", "visualizer", "algorithm", "sorting"],
  "CheckMate": ["checkmate", "check mate", "chess"],
  "Disaster Relief System": ["disaster", "relief", "emergency"],
  "LeadForge": ["leadforge", "lead forge", "lead"],
  "Beatzy": ["beatzy", "beat", "music collab"],
  "Citizen Resolver System": ["citizen", "resolver", "civic", "complaint"],
  "MindFlow": ["mindflow", "mind flow", "notes", "note-taking"],
  "Chord Detector": ["chord", "detector", "guitar chord", "audio"],
  "Visitor Management System": ["visitor", "check-in", "qr code"],
  "MedVerify": ["medverify", "med verify", "medical", "healthcare"],
  "Job Portal": ["job", "portal", "hiring", "resume"],
};

function searchPortfolio(query) {
  const q = query.toLowerCase().trim();

  // 1. Greetings — varied, natural
  if (/^(hi|hello|hey|yo|sup|howdy|hii|heyy|good\s*(morning|afternoon|evening))/.test(q) || q === "hlo") {
    const greetings = [
      "Hey! I'm **PortfolioBot** — Aayush's AI assistant. I know everything about his projects, skills, hackathons, and LeetCode grind. What do you want to know?",
      "Hi there! 👋 Ask me about Aayush's **23 GitHub repos**, his **531 LeetCode problems**, or his **hackathon wins**. I've got all the details.",
      "Hello! I'm PortfolioBot. I can tell you about Aayush's **full-stack projects**, **tech stack**, **college life**, or even his **guitar skills**. What's up?",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // 2. Specific Projects
  for (const p of projects) {
    const keywords = projectKeywords[p.name] || [p.name.toLowerCase()];
    if (keywords.some(kw => q.includes(kw))) {
      return `**${p.name}** ${p.badge ? `(${p.badge})` : ""}\n\n` +
        `${p.desc}\n\n` +
        `**Stack:** ${p.tags.join(", ")}\n` +
        `**Highlights:** ${p.highlight}\n\n` +
        `👉 [GitHub](${p.gh}) ${p.demo ? `| [Live Demo](${p.demo})` : ""}`;
    }
  }

  // 3. LeetCode / DSA
  if (/leetcode|leet\s*code|dsa|problems?\s*solved|rating|ranking|streak|contest/.test(q)) {
    const lc = portfolioData.leetcode;
    if (lc?.stats) {
      return `Here's my LeetCode breakdown:\n\n` +
        `• **${lc.stats.totalSolved}** problems solved (${lc.stats.easy} easy, ${lc.stats.medium} medium, ${lc.stats.hard} hard)\n` +
        `• **${lc.streak}**-day current streak\n` +
        `• **${lc.totalActiveDays}** active days\n` +
        `• Global rank: **#${lc.ranking.toLocaleString()}**\n\n` +
        `I grind DSA daily in **C++** — mostly trees, graphs, DP, and binary search. Check my [profile](https://leetcode.com/aayush2724).`;
    }
    return "I'm active on LeetCode as [aayush2724](https://leetcode.com/aayush2724) — currently at 531+ problems and counting. I focus on C++ and aim for consistency over streaks.";
  }

  // 4. Hackathons
  if (/hackathon|win|won|competition|thinkroot|vortex|goldman|samsung|ennovatex|panic|deadline|trophy|prize/.test(q)) {
    return "I compete in hackathons with my teammate **Kaki Harshita** under our team **Panic-At-The-Deadline** 🏆\n\n" +
      "**Highlights:**\n" +
      "• 🥉 **3rd Place** at ThinkRoot x Vortex'26 (NIT Trichy) — built [LeadForge](https://github.com/aayush2724/LeadForge), an AI B2B lead generation pipeline\n" +
      "• 🚀 **Goldman Sachs India Hackathon 2026** — multi-agent drone routing optimization in C++\n" +
      "• 📱 **Samsung ennovateX AX Hackathon** — *Phantom Memory*, a 3-tier adaptive memory pipeline for mobile agents\n\n" +
      "We work well under pressure — hence the team name 😄";
  }

  // 5. Tech Stack
  if (/stack|tech|skill|language|framework|tool|python|react|javascript|typescript|c\+\+|node|database|docker|next/.test(q)) {
    return "Here's my full toolkit:\n\n" +
      "**Languages:** JavaScript, TypeScript, Python, C++\n\n" +
      "**Frontend:** React, Next.js, Vite, Tailwind CSS, Framer Motion, Three.js\n\n" +
      "**Backend:** Node.js, Express, Bun, FastAPI, Flask, JWT auth\n\n" +
      "**AI/ML:** Claude API, ACRCloud (audio fingerprinting), REST APIs\n\n" +
      "**Databases:** PostgreSQL, MongoDB, MySQL, Redis, SQLAlchemy\n\n" +
      "**DevOps:** Docker, Git, Vercel, Render\n\n" +
      "I'm a full-stack dev who can ship across the entire pipeline — frontend to infra.";
  }

  // 6. Contact / Socials / Hire
  if (/contact|hire|email|connect|social|linkedin|instagram|resume|reach|collab/.test(q)) {
    return "Let's connect!\n\n" +
      "• 📧 **Email:** [aayush2615@gmail.com](mailto:aayush2615@gmail.com)\n" +
      "• 💼 **LinkedIn:** [linkedin.com/in/aayush2724](https://linkedin.com/in/aayush2724)\n" +
      "• 💻 **GitHub:** [github.com/aayush2724](https://github.com/aayush2724) (23 repos)\n" +
      "• 📸 **Instagram:** [@aayussh.27](https://instagram.com/aayussh.27)\n" +
      "• 🧩 **LeetCode:** [aayush2724](https://leetcode.com/aayush2724)\n\n" +
      "Currently **open to remote internships and freelance projects**. Drop me an email!";
  }

  // 7. Guitar / Music / Hobbies
  if (/guitar|music|stairway|hobb|free\s*time|weekend|play|song|band/.test(q)) {
    return "Outside of code, I'm a **guitarist** 🎸 — been trying to master **Stairway to Heaven** for over a year now. It's humbling.\n\n" +
      "Music also shows up in my work: I built **Chord Detector** (ML-powered guitar chord recognition) and **Beatzy** (a music collaboration platform). " +
      "I'm currently building a **Music Intelligence Engine** with audio fingerprinting using ACRCloud — it's basically where my two worlds collide.";
  }

  // 8. General Projects
  if (/project|shipped|recent|built|work|repo|portfolio|made/.test(q)) {
    const sorted = [...projects].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    const latest = sorted[0];
    return `I've shipped **23 repos** spanning AI, full-stack, civic tech, and music tech.\n\n` +
      `**Recent work:**\n` +
      `• **${latest.name}** — ${latest.desc}\n` +
      `• **DeskGuard** — workspace security with real-time surveillance\n` +
      `• **AlgoVision** — interactive algorithm visualizer\n\n` +
      `**Proudest:** LeadForge (hackathon winner), Beatzy, Citizen Resolver System\n\n` +
      `Ask me about any specific project for details!`;
  }

  // 9. Learning / Current
  if (/learn|study|current|focus|building|working on|right now|next/.test(q)) {
    return "Currently I'm:\n\n" +
      "• 🔨 Building the **Music Intelligence Engine** — audio fingerprinting + full-stack SaaS with ACRCloud\n" +
      "• ⚔️ Grinding **DSA in C++** on LeetCode (531+ solved)\n" +
      "• 🎸 Still trying to nail **Stairway to Heaven** on guitar\n" +
      "• 🔍 Looking for **remote internships and freelance projects**\n\n" +
      "I'm a 2nd year CS student at **NIE, Mysore** — always shipping something.";
  }

  // 10. About / Bio / College
  if (/about|who|yourself|bio|profile|college|nie|mysore|bengaluru|bangalore|student|age|year|where/.test(q)) {
    return "I'm **Aayush Kumar** — a 2nd year B.E. CS student at **The National Institute of Engineering (NIE), Mysore**, based in **Bengaluru**.\n\n" +
      "I build things end-to-end: REST APIs, React UIs, AI integrations, async job queues — the full stack. " +
      "I've got **23 GitHub repos**, **531+ LeetCode problems**, and **GitHub Pro** with the YOLO and Pull Shark badges 🦈\n\n" +
      "I hack with my teammate **Kaki Harshita** as **Panic-At-The-Deadline** and I'm always looking for the next project to ship.";
  }

  // 11. Music Intelligence Engine (specific project focus)
  if (/music intelligence|intelligence engine|audio fingerprint|acrcloud|saas/.test(q)) {
    return "**Music Intelligence Engine** — my current main project 🎵\n\n" +
      "It's an audio fingerprinting + full-stack SaaS platform. Think Shazam-like capability but built as a developer tool.\n\n" +
      "**Tech:** Python, ACRCloud API, React, Node.js\n\n" +
      "This project sits at the intersection of my two biggest interests: **music** and **engineering**. It's still in active development.";
  }

  // 12. Goldman Sachs / Samsung specifics
  if (/goldman|sachs|drone|routing|phantom|memory|mobile agent/.test(q)) {
    return "Two notable hackathon builds:\n\n" +
      "**Goldman Sachs India Hackathon 2026:**\n" +
      "Built a **multi-agent drone routing optimization system** in C++. Tackled NP-hard path planning with heuristic solvers under time pressure.\n\n" +
      "**Samsung ennovateX AX Hackathon:**\n" +
      "Built **Phantom Memory** — a 3-tier adaptive memory pipeline for mobile agents. The idea was giving mobile AI context persistence across sessions.";
  }

  // 13. GitHub specifics
  if (/github|repos|repository|open source|contribution|star/.test(q)) {
    return "Here's my GitHub snapshot:\n\n" +
      "• **23 public repositories** across JavaScript, Python, TypeScript, HTML, CSS, C++\n" +
      "• **535+ contributions** this year\n" +
      "• **GitHub Pro** with YOLO 🪂 and Pull Shark 🦈 achievements\n" +
      "• **2 followers**, 2 following\n\n" +
      "**Popular repos:** Portfolio, Beatzy, Citizen-Resolver-System, LeadForge, Chord-Detector, CheckMate\n\n" +
      "Check it out: [github.com/aayush2724](https://github.com/aayush2724)";
  }

  // 14. Philosophy / Why code
  if (/why|passion|motiv|inspir|philosophy|love.*code|code.*love/.test(q)) {
    return "I code because I love building things that **work end-to-end**. From a React component to a REST API to an AI pipeline — I want to own the whole stack.\n\n" +
      "Music taught me that: every function a verse, every algorithm a rhythm. I write software the way I play guitar — **with passion, precision, and a bit of improvisation**.";
  }

  // 15. Default fallbacks — specific, not generic
  const fallbacks = [
    "Hmm, I don't have that exact detail. But I know a lot! Try asking about **projects**, **LeetCode stats**, **hackathon wins**, **tech stack**, or **how to contact Aayush**.",
    "That's outside my database. I'm great with **project details**, **DSA grind**, **hackathon stories**, and **career info**. Give me another shot!",
    "My neural nets didn't fire on that one 😅 Try asking about **Beatzy**, **LeadForge**, **LeetCode**, or **what Aayush is currently building**.",
    "I can't help with that, but I *can* tell you about **23 GitHub repos**, **3 hackathon competitions**, and **531 LeetCode problems**. Pick one!",
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

function formatMessageText(text) {
  if (!text) return "";
  const parts = [];
  let lastIndex = 0;
  const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index;
    const matchText = match[0];
    if (matchIndex > lastIndex) parts.push(text.slice(lastIndex, matchIndex));
    if (matchText.startsWith("**") && matchText.endsWith("**")) {
      parts.push(<strong key={matchIndex} className="font-semibold text-[var(--fg)]">{matchText.slice(2, -2)}</strong>);
    } else if (matchText.startsWith("[") && matchText.includes("](")) {
      const closingBracket = matchText.indexOf("]");
      const label = matchText.slice(1, closingBracket);
      const url = matchText.slice(closingBracket + 2, -1);
      parts.push(
        <a key={matchIndex} href={url} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline font-medium transition-colors hover:opacity-80">{label}</a>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length > 0 ? parts : text;
}

const SUGGESTIONS = [
  "What's your tech stack?",
  "Tell me about LeadForge",
  "Any hackathon wins?",
  "What are you building now?",
  "What's your LeetCode stats?",
  "How's the guitar going?",
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
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const send = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput("");
    setShowSuggestions(false);
    setMessages((m) => [...m, { from: "user", text: trimmed, id: Date.now() }]);
    setLoading(true);
    try {
      const delay = Math.min(1000, Math.max(600, trimmed.length * 12));
      await new Promise((r) => setTimeout(r, delay));
      const reply = searchPortfolio(trimmed);
      setMessages((m) => [...m, { from: "bot", text: reply, id: Date.now() + 1 }]);
    } catch {
      setMessages((m) => [...m, { from: "bot", text: "Something went wrong. Try again.", id: Date.now() + 1 }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-3 text-sm font-display font-semibold transition-all duration-300 hover:-translate-y-1 shadow-2xl"
        style={{ background: "var(--accent)", color: "var(--accent-ink)", boxShadow: "0 0 20px rgba(212, 255, 63, 0.2)" }}
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-black/40 opacity-75 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-black/60" />
        </span>
        {open ? "Close" : "Ask me"}
      </button>

      {open && (
        <div className="fixed right-5 bottom-20 w-[400px] max-w-[92vw] z-50 rounded-2xl border border-white/8 bg-[var(--bg)] shadow-2xl shadow-black/60 overflow-hidden flex flex-col" style={{ maxHeight: "min(580px, 80vh)" }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/6 bg-white/[0.02] flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--accent)" }}>
                <span className="text-[10px] font-bold" style={{ color: "var(--accent-ink)" }}>AI</span>
              </div>
              <div>
                <div className="font-display text-sm font-semibold" style={{ color: "var(--fg)" }}>PortfolioBot</div>
                <div className="font-mono text-[9px] flex items-center gap-1" style={{ color: "var(--muted)" }}>
                  <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: "var(--accent)" }} />
                  Aayush's assistant
                </div>
              </div>
            </div>
            <button onClick={() => { setMessages([]); setShowSuggestions(true); setInput(""); }} className="font-mono text-[10px] hover:opacity-70 transition-opacity px-2 py-1 rounded border border-white/6" style={{ color: "var(--muted)" }}>
              clear
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-body" style={{ scrollbarWidth: "none" }}>
            {messages.length === 0 && (
              <div className="text-center py-6">
                <div className="text-3xl mb-3">👋</div>
                <p className="text-sm font-display font-medium" style={{ color: "var(--fg)" }}>Hey, I'm PortfolioBot</p>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Ask me anything about Aayush's work</p>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                {m.from === "bot" && (
                  <div className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold mr-2 flex-shrink-0 mt-0.5" style={{ background: "rgba(212,255,63,0.1)", color: "var(--accent)" }}>AI</div>
                )}
                <div className={`max-w-[82%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.from === "user" ? "rounded-br-sm" : "rounded-bl-sm"
                }`} style={{
                  background: m.from === "user" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${m.from === "user" ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)"}`,
                  color: m.from === "user" ? "var(--fg)" : "var(--muted)",
                }}>
                  <div className="whitespace-pre-wrap font-body text-sm leading-relaxed">{formatMessageText(m.text)}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold flex-shrink-0" style={{ background: "rgba(212,255,63,0.1)", color: "var(--accent)" }}>AI</div>
                <div className="rounded-xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  {[0, 0.15, 0.3].map((d, i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--muted)", animation: `bounce 1s ${d}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {showSuggestions && messages.length === 0 && (
            <div className="px-4 pb-3 flex-shrink-0">
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="font-mono text-[10px] px-2.5 py-1 rounded-full transition-all" style={{ border: "1px solid rgba(255,255,255,0.08)", color: "var(--muted)" }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="px-3 pb-3 flex-shrink-0 border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <div className="flex gap-2 items-center rounded-xl px-3 py-2 transition-all" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }} placeholder="Ask something…" disabled={loading} className="flex-1 bg-transparent font-body text-sm outline-none placeholder:opacity-30 disabled:opacity-50" style={{ color: "var(--fg)" }} />
              <button onClick={() => send(input)} disabled={loading || !input.trim()} className="flex-shrink-0 w-7 h-7 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center" style={{ background: "rgba(255,255,255,0.1)" }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 6L11 6M6 1L11 6L6 11" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-5px); } }`}</style>
    </div>
  );
}
