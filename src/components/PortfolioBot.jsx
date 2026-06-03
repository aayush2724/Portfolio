import React, { useState, useEffect, useRef } from "react";
import portfolioData from "../data/portfolioData.json";
import { projects } from "../data/projects";

// Custom keywords mapped to each project to ensure accurate matching
const projectKeywords = {
  "LeadForge": ["leadforge", "lead forge", "lead-forge"],
  "Citizen Resolver System": ["citizen resolver", "citizen-resolver", "citizen", "resolver"],
  "Beatzy": ["beatzy"],
  "MindFlow": ["mindflow", "mind flow", "mind-flow"],
  "Chord Detector": ["chord detector", "chord-detector", "chord", "detector"],
  "Visitor Management System": ["visitor management", "visitor-management", "visitor"],
  "MedVerify": ["medverify", "med verify", "medical"],
  "Job Portal": ["job portal", "job-portal", "job"]
};

// ---------- Offline simulated AI engine ----------
function searchPortfolio(query) {
  const q = query.toLowerCase().trim();

  // 1. Greetings
  if (
    q === "hi" ||
    q === "hello" ||
    q === "hey" ||
    q === "hey there" ||
    q === "yo" ||
    q === "sup" ||
    q.includes("greet") ||
    q.includes("good morning") ||
    q.includes("good afternoon")
  ) {
    return "Hey there! I'm **PortfolioBot**. Ask me about my projects, hackathon achievements, tech stack, or LeetCode statistics!";
  }

  // 2. Specific Projects (Checked before general keywords like 'about')
  for (const p of projects) {
    const keywords = projectKeywords[p.name] || [p.name.toLowerCase()];
    if (keywords.some(kw => q.includes(kw))) {
      return `**${p.name}** ${p.badge ? `(${p.badge})` : ""}\n\n` +
        `${p.desc}\n\n` +
        `**Stack:** ${p.tags.join(", ")}\n` +
        `**Highlights:** ${p.highlight}\n\n` +
        `👉 [GitHub Repository](${p.gh}) ${p.demo ? `| [Live Demo](${p.demo})` : ""}`;
    }
  }

  // 3. LeetCode Stats
  if (
    q.includes("leetcode") ||
    q.includes("leet code") ||
    q.includes("ranking") ||
    q.includes("streak") ||
    q.includes("solved") ||
    q.includes("dsa") ||
    q.includes("rating") ||
    q.includes("problems")
  ) {
    const lc = portfolioData.leetcode;
    if (lc && lc.stats) {
      return `I have solved **${lc.stats.totalSolved}** problems on LeetCode (${lc.stats.easy} easy, ${lc.stats.medium} medium, ${lc.stats.hard} hard) with a current streak of **${lc.streak}** days and active days of **${lc.totalActiveDays}**. My global rank is **#${lc.ranking}** under username [aayush2717](https://leetcode.com/aayush2717).`;
    }
    return "I'm active on LeetCode as [aayush2717](https://leetcode.com/aayush2717), where I regularly solve data structures and algorithm problems.";
  }

  // 4. Hackathons
  if (
    q.includes("hackathon") ||
    q.includes("wins") ||
    q.includes("win") ||
    q.includes("competition") ||
    q.includes("thinkroot") ||
    q.includes("vortex") ||
    q.includes("goldman") ||
    q.includes("samsung") ||
    q.includes("ennovatex") ||
    q.includes("panic-at-the-deadline") ||
    q.includes("achievements")
  ) {
    return "I regularly compete in hackathons with my teammate **Kaki Harshita** under our team name **Panic-At-The-Deadline**:\n\n" +
      "- 🥉 **3rd Place** at ThinkRoot x Vortex'26 (NIT Trichy) with [LeadForge](https://github.com/aayush2724/LeadForge) (an AI B2B lead generation pipeline)\n" +
      "- 🚀 **Goldman Sachs India Hackathon 2026** — built a multi-agent drone routing optimization system in C++\n" +
      "- 📱 **Samsung ennovateX AX Hackathon** — built *Phantom Memory*, a 3-tier adaptive memory pipeline for mobile agents";
  }

  // 5. Tech Stack / Skills
  if (
    q.includes("stack") ||
    q.includes("tech") ||
    q.includes("skills") ||
    q.includes("languages") ||
    q.includes("frameworks") ||
    q.includes("tools") ||
    q.includes("python") ||
    q.includes("react") ||
    q.includes("javascript") ||
    q.includes("typescript") ||
    q.includes("c++") ||
    q.includes("databases") ||
    q.includes("database")
  ) {
    return "Here is my core developer toolkit:\n\n" +
      "- **Languages:** JavaScript, TypeScript, Python, C++\n" +
      "- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Three.js (3D web design)\n" +
      "- **Backend:** Node.js, Express, FastAPI\n" +
      "- **Databases & Services:** MongoDB, MySQL, Firebase, Redis, MinIO (S3-compatible storage)\n\n" +
      "I enjoy working on full-stack pipelines, civic tech, and AI/ML agents.";
  }

  // 6. Contact / Socials / Hire
  if (
    q.includes("contact") ||
    q.includes("hire") ||
    q.includes("email") ||
    q.includes("connect") ||
    q.includes("social") ||
    q.includes("linkedin") ||
    q.includes("instagram") ||
    q.includes("resume")
  ) {
    return "Let's get in touch! Here are my links:\n\n" +
      "- 📧 **Email:** [aayush2615@gmail.com](mailto:aayush2615@gmail.com)\n" +
      "- 💼 **LinkedIn:** [linkedin.com/in/aayush2724](https://linkedin.com/in/aayush2724)\n" +
      "- 💻 **GitHub:** [github.com/aayush2724](https://github.com/aayush2724)\n" +
      "- 📸 **Instagram:** [@aayussh.27](https://instagram.com/aayussh.27)";
  }

  // 7. Guitar / Music / Hobbies / Free Time
  if (
    q.includes("guitar") ||
    q.includes("music") ||
    q.includes("stairway") ||
    q.includes("hobbies") ||
    q.includes("hobby") ||
    q.includes("free time") ||
    q.includes("weekend")
  ) {
    return "Outside of coding and hackathons, I love music and am learning to play the guitar — I've been trying to master **Stairway to Heaven** for about 1-2 years now! 🎸";
  }

  // 8. General Projects
  if (
    q.includes("project") ||
    q.includes("shipped") ||
    q.includes("recent") ||
    q.includes("built") ||
    q.includes("work") ||
    q.includes("repos")
  ) {
    const sorted = [...projects].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    const latest = sorted[0];
    return `I've shipped several projects in AI pipelines, full-stack, and civic tech. My top featured works include **LeadForge**, **Beatzy**, **Citizen Resolver System**, and **MindFlow**.\n\n` +
      `My most recently updated project is **${latest.name}** (updated ${latest.updated}). You can ask me details about any project, or check out my [GitHub profile](https://github.com/aayush2724).`;
  }

  // 9. Learning
  if (q.includes("learning") || q.includes("learn") || q.includes("study") || q.includes("current")) {
    return "Right now, I am focusing on building reliable AI/ML pipelines, exploring multi-agent workflows (like Phantom Memory), and learning to play **Stairway to Heaven** on guitar!";
  }

  // 10. About Me / Bio / College / Location
  if (
    q.includes("about") ||
    q.includes("who is") ||
    q.includes("who are you") ||
    q.includes("yourself") ||
    q.includes("bio") ||
    q.includes("profile") ||
    q.includes("college") ||
    q.includes("nie") ||
    q.includes("mysore") ||
    q.includes("bengaluru") ||
    q.includes("bangalore") ||
    q.includes("where do you")
  ) {
    return "I'm a B.E. AI-ML student (Class of 2028) at **The National Institute of Engineering (NIE), Mysore**, currently based in Bengaluru, India. \n\n" +
      "I'm passionate about full-stack web apps, civic tech, and AI/ML pipeline engineering. I regularly participate in hackathons with my team **Panic-At-The-Deadline**.";
  }

  // 11. Default Witty Fallbacks
  const fallbacks = [
    "I'm not sure I have that specific detail in my memory bank. Try asking about my **projects** (like LeadForge or Beatzy), my **tech stack**, **hackathon wins**, or my **LeetCode rank**!",
    "That's outside my current scope! Ask me about my **projects**, what I'm **learning**, or how my **guitar** lessons are coming along.",
    "My local database doesn't have an answer for that. Ask me about **LeadForge**, **LeetCode**, or how to contact me!",
    "Hmm, I didn't quite catch that. Try asking about **skills**, **hackathons**, or specific projects like the **Citizen Resolver System**!"
  ];
  const randIndex = Math.floor(Math.random() * fallbacks.length);
  return fallbacks[randIndex];
}

// Helper to parse basic markdown bold and links into React elements
function formatMessageText(text) {
  if (!text) return "";
  const parts = [];
  let lastIndex = 0;
  
  // Match bold (**text**) or links ([label](url))
  const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index;
    const matchText = match[0];
    
    // Add text before match
    if (matchIndex > lastIndex) {
      parts.push(text.slice(lastIndex, matchIndex));
    }
    
    if (matchText.startsWith("**") && matchText.endsWith("**")) {
      parts.push(
        <strong key={matchIndex} className="font-semibold text-amber-400">
          {matchText.slice(2, -2)}
        </strong>
      );
    } else if (matchText.startsWith("[") && matchText.includes("](")) {
      const closingBracket = matchText.indexOf("]");
      const label = matchText.slice(1, closingBracket);
      const url = matchText.slice(closingBracket + 2, -1);
      parts.push(
        <a
          key={matchIndex}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-400 hover:text-amber-300 underline font-medium transition-colors"
        >
          {label}
        </a>
      );
    }
    
    lastIndex = regex.lastIndex;
  }
  
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return parts.length > 0 ? parts : text;
}

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

  const send = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput("");
    setShowSuggestions(false);
    const userMsg = { from: "user", text: trimmed, id: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);
    
    try {
      // Simulate natural typing delay based on query length (600ms to 1000ms)
      const delay = Math.min(1000, Math.max(600, trimmed.length * 12));
      await new Promise((resolve) => setTimeout(resolve, delay));
      const reply = searchPortfolio(trimmed);
      setMessages((m) => [...m, { from: "bot", text: reply, id: Date.now() + 1 }]);
    } catch (error) {
      setMessages((m) => [
        ...m,
        { from: "bot", text: "Something went wrong. Try again.", id: Date.now() + 1 },
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
                  Offline AI Assistant
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
                  <div className="whitespace-pre-wrap font-body text-sm leading-relaxed">
                    {formatMessageText(m.text)}
                  </div>
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