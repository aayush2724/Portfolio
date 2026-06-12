import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const cmds = [
  {
    id: "home",
    label: "Go to Home",
    icon: "🏠",
    cat: "Navigate",
    fn: () =>
      document.querySelector("#hero")?.scrollIntoView({ behavior: "smooth" }),
  },
  {
    id: "about",
    label: "Read My Story",
    icon: "📖",
    cat: "Navigate",
    fn: () =>
      document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" }),
  },
  {
    id: "skills",
    label: "See My Skills",
    icon: "⚡",
    cat: "Navigate",
    fn: () =>
      document.querySelector("#skills")?.scrollIntoView({ behavior: "smooth" }),
  },
  {
    id: "proj",
    label: "View Projects",
    icon: "🚀",
    cat: "Navigate",
    fn: () =>
      document
        .querySelector("#projects")
        ?.scrollIntoView({ behavior: "smooth" }),
  },
  {
    id: "life",
    label: "Beyond Code",
    icon: "🎸",
    cat: "Navigate",
    fn: () =>
      document.querySelector("#life")?.scrollIntoView({ behavior: "smooth" }),
  },
  {
    id: "timeline",
    label: "My Journey",
    icon: "⏱️",
    cat: "Navigate",
    fn: () =>
      document
        .querySelector("#timeline")
        ?.scrollIntoView({ behavior: "smooth" }),
  },
  {
    id: "contact",
    label: "Contact Me",
    icon: "✉️",
    cat: "Navigate",
    fn: () =>
      document
        .querySelector("#contact")
        ?.scrollIntoView({ behavior: "smooth" }),
  },
  {
    id: "gh",
    label: "GitHub → aayush2724",
    icon: "🐙",
    cat: "Social",
    fn: () => window.open("https://github.com/aayush2724", "_blank"),
  },
  {
    id: "li",
    label: "LinkedIn → aayush2724",
    icon: "💼",
    cat: "Social",
    fn: () => window.open("https://linkedin.com/in/aayush2724", "_blank"),
  },
  {
    id: "lc",
    label: "LeetCode → aayush2724",
    icon: "🧩",
    cat: "Social",
    fn: () => window.open("https://leetcode.com/aayush2724", "_blank"),
  },
  {
    id: "ig",
    label: "Instagram → aayussh.27",
    icon: "📸",
    cat: "Social",
    fn: () => window.open("https://instagram.com/aayussh.27", "_blank"),
  },
  {
    id: "email",
    label: "Copy Email",
    icon: "📧",
    cat: "Action",
    fn: (toast) => {
      navigator.clipboard.writeText("aayush2615@gmail.com");
      toast("✓ aayush2615@gmail.com copied!");
    },
  },
  {
    id: "resume",
    label: "Open Resume PDF",
    icon: "📄",
    cat: "Action",
    fn: () => window.open("/resume.pdf", "_blank"),
  },
  {
    id: "beatzy",
    label: "Open Beatzy on GitHub",
    icon: "🎵",
    cat: "Project",
    fn: () =>
      window.open(
        "https://github.com/aayush2724/Beatzy",
        "_blank",
      ),
  },
  {
    id: "crs",
    label: "Open Citizen Resolver on GitHub",
    icon: "🏛️",
    cat: "Project",
    fn: () => window.open("https://github.com/aayush2724/Citizen-Resolver-System", "_blank"),
  },
  {
    id: "cd",
    label: "Open Chord Detector on GitHub",
    icon: "🎸",
    cat: "Project",
    fn: () =>
      window.open(
        "https://github.com/aayush2724/Chord-Detector",
        "_blank",
      ),
  },
];

export default function CommandPalette({ isOpen, onClose }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const [toast, setToast] = useState(null);
  const inp = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  useEffect(() => {
    if (isOpen) {
      setQ("");
      setSel(0);
      setTimeout(() => inp.current?.focus(), 80);
    }
  }, [isOpen]);
  useEffect(() => setSel(0), [q]);

  const filtered = q
    ? cmds.filter(
        (c) =>
          c.label.toLowerCase().includes(q.toLowerCase()) ||
          c.cat.toLowerCase().includes(q.toLowerCase()),
      )
    : cmds;

  const run = (c) => {
    c.fn(showToast);
    onClose();
  };

  const onKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((s) => Math.min(s + 1, filtered.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => Math.max(s - 1, 0));
    }
    if (e.key === "Enter" && filtered[sel]) run(filtered[sel]);
    if (e.key === "Escape") onClose();
  };

  const grouped = filtered.reduce((a, c) => {
    (a[c.cat] || (a[c.cat] = [])).push(c);
    return a;
  }, {});

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-32"
            style={{
              background: "rgba(10, 10, 11, 0.85)",
              backdropFilter: "blur(12px)",
            }}
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: -18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -18 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg mx-5 rounded-2xl overflow-hidden border"
              style={{
                background: "var(--surface)",
                borderColor: "var(--line)",
                boxShadow: "0 40px 100px rgba(0,0,0,.85)",
              }}
            >
              <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: "var(--line)" }}>
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: "var(--muted)" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  ref={inp}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="Search commands, projects, socials..."
                  className="flex-1 bg-transparent outline-none font-mono text-sm"
                  style={{ color: "var(--fg)", caretColor: "var(--accent)" }}
                />
                <kbd className="font-mono text-xs border rounded px-1.5 py-0.5" style={{ color: "var(--muted)", borderColor: "var(--line)" }}>
                  esc
                </kbd>
              </div>

              <div className="max-h-80 overflow-y-auto py-2">
                {Object.entries(grouped).map(([cat, items]) => (
                  <div key={cat}>
                    <div className="px-4 py-2 text-xs font-mono tracking-widest uppercase" style={{ color: "var(--muted)", opacity: 0.5 }}>
                      {cat}
                    </div>
                    {items.map((cmd) => {
                      const gi = filtered.indexOf(cmd);
                      const isS = gi === sel;
                      return (
                        <button
                          key={cmd.id}
                          onClick={() => run(cmd)}
                          onMouseEnter={() => setSel(gi)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                          style={{
                            background: isS ? "rgba(212, 255, 63, 0.08)" : "transparent",
                          }}
                        >
                          <span className="text-lg w-7 text-center flex-shrink-0">
                            {cmd.icon}
                          </span>
                          <span
                            className="font-body text-sm flex-1"
                            style={{ color: isS ? "var(--accent)" : "var(--muted)" }}
                          >
                            {cmd.label}
                          </span>
                          {isS && (
                            <kbd className="font-mono text-xs border rounded px-1.5 py-0.5" style={{ color: "var(--muted)", borderColor: "var(--line)" }}>
                              ↵
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
                {!filtered.length && (
                  <div className="px-4 py-8 text-center font-mono text-xs" style={{ color: "var(--muted)", opacity: 0.5 }}>
                    No results for "{q}"
                  </div>
                )}
              </div>

              <div className="px-4 py-3 border-t flex gap-4 text-xs font-mono" style={{ borderColor: "var(--line)", color: "var(--muted)" }}>
                <span>
                  <kbd className="border rounded px-1" style={{ borderColor: "var(--line)" }}>↑↓</kbd>{" "}
                  navigate
                </span>
                <span>
                  <kbd className="border rounded px-1" style={{ borderColor: "var(--line)" }}>↵</kbd>{" "}
                  select
                </span>
                <span>
                  <kbd className="border rounded px-1" style={{ borderColor: "var(--line)" }}>esc</kbd>{" "}
                  close
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.92 }}
            className="fixed bottom-6 right-6 z-[200] border rounded-xl px-5 py-3 font-mono text-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--accent)",
              color: "var(--accent)",
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
