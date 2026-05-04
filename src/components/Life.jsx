import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import portfolioData from "../data/portfolioData.json";

/* ── Guitar Visual: strum-able strings ── */
function GuitarViz({ color }) {
  const [vib, setVib] = useState(false);
  const strings = [0, 1, 2, 3, 4, 5];
  return (
    <div
      className="flex flex-col items-center gap-3 py-4 cursor-pointer select-none"
      onClick={() => {
        setVib(true);
        setTimeout(() => setVib(false), 900);
      }}
    >
      <div className="font-mono text-xs text-white/15 mb-1">
        tap to strum 🎸
      </div>
      <div className="relative w-48 h-24">
        {/* frets */}
        {[0, 25, 50, 75, 100].map((x) => (
          <div
            key={x}
            className="absolute top-0 bottom-0 border-l border-white/5"
            style={{ left: `${x}%` }}
          />
        ))}
        {strings.map((s, i) => (
          <motion.div
            key={s}
            className="absolute w-full rounded-full"
            style={{
              top: `${6 + i * 17}%`,
              height: `${1 + i * 0.25}px`,
              background: `rgba(255,255,255,${0.12 + i * 0.025})`,
            }}
            animate={
              vib
                ? {
                    scaleY: [1, 4, 0.4, 3, 1],
                    skewX: [0, 3, -3, 1.5, 0],
                    transition: { duration: 0.55, delay: i * 0.06 },
                  }
                : {}
            }
          />
        ))}
        <div className="absolute left-0 top-0 bottom-0 w-3 rounded-sm border border-white/10 bg-white/4" />
        <div className="absolute right-0 top-0 bottom-0 w-4 rounded-sm border border-white/10 bg-white/4" />
      </div>
      <div className="font-mono text-xs text-white/20 italic">
        currently learning: Mere Bina
      </div>
    </div>
  );
}

/* ── DSA Visual: animated LeetCode-style heatmap ── */
function DSAViz() {
  const weeks = 35;
  const cols = Array.from({ length: weeks }, (_, wi) =>
    Array.from({ length: 7 }, (_, di) => ({
      active: Math.random() > 0.28,
      lvl: Math.floor(Math.random() * 4) + 1,
    })),
  );
  return (
    <div className="flex flex-col items-center gap-2 py-3">
      <div className="font-mono text-xs text-white/20 mb-1">
        LeetCode activity · aayush2717
      </div>
      <div className="flex gap-0.5 overflow-hidden">
        {cols.map((col, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {col.map((cell, di) => (
              <motion.div
                key={di}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: (wi * 7 + di) * 0.004,
                  type: "spring",
                  stiffness: 300,
                }}
                className="w-2.5 h-2.5 rounded-sm"
                style={{
                  background: cell.active
                    ? `rgba(245,158,11,${0.15 * cell.lvl + 0.1})`
                    : "rgba(255,255,255,0.04)",
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 font-mono text-xs text-white/20 mt-1">
        <span>less</span>
        {[0.15, 0.3, 0.5, 0.75, 1].map((o, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-sm"
            style={{ background: `rgba(245,158,11,${o})` }}
          />
        ))}
        <span>more</span>
      </div>
    </div>
  );
}

/* ── Learning Visual: book stack ── */
function LearningViz() {
  const books = [
    { title: "You Don't Know JS", color: "#f59e0b" },
    { title: "CLRS Algorithms", color: "#06b6d4" },
    { title: "Clean Code", color: "#a855f7" },
    { title: "The Pragmatic Programmer", color: "#22c55e" },
  ];
  return (
    <div className="flex flex-col gap-2 py-3 px-2">
      <div className="font-mono text-xs text-white/20 mb-1">
        currently on the shelf
      </div>
      {books.map((b, i) => (
        <motion.div
          key={b.title}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: i * 0.1 + 0.2, duration: 0.5 }}
          className="flex items-center gap-2 gc rounded-lg px-3 py-2 border border-white/5"
        >
          <div
            className="w-1 h-8 rounded-full flex-shrink-0"
            style={{ background: b.color }}
          />
          <span className="text-xs text-white/50 font-body">{b.title}</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Achievements Visual ── */
function AchieveViz() {
  const totalSolved = portfolioData.leetcode.stats.totalSolved;
  const totalRepos = portfolioData.github.length;
  const milestones = [
    { icon: "🥉", text: "3rd place - ThinkRoot x Vortex'26 (LeadForge)" },
    { icon: "💻", text: `${totalRepos}+ repos on GitHub` },
    { icon: "🧩", text: `${totalSolved}+ LeetCode solved` },
    { icon: "🏗️", text: "Full-stack apps shipped" },
    { icon: "🐍", text: "Python · AI/ML exploration" },
    { icon: "🤝", text: "OSS contributor" },
  ];
  return (
    <div className="flex flex-col gap-2 py-3 px-1">
      {milestones.map((m, i) => (
        <motion.div
          key={i}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: i * 0.1 + 0.15, duration: 0.45 }}
          className="flex items-center gap-3 text-xs font-mono text-white/40 hover:text-white/70 transition-colors"
        >
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.8, delay: i * 0.3, repeat: Infinity }}
          >
            {m.icon}
          </motion.span>
          {m.text}
        </motion.div>
      ))}
    </div>
  );
}

const cards = [
  {
    id: "guitar",
    emoji: "🎸",
    title: "Guitar",
    sub: "1–2 years · Classic Rock",
    color: "#a855f7",
    grad: "from-purple-500/12 to-pink-500/4",
    desc: "Self-taught for 1–2 years, learning Stairway to Heaven — one of the greatest guitar solos ever written. Music and code share the same thing — both need you to be fully present. Still chasing that perfect run through the solo.",
    Viz: GuitarViz,
  },
  {
    id: "dsa",
    emoji: "⚡",
    title: "Problem Solving",
    sub: `LeetCode · ${portfolioData.leetcode.stats.totalSolved}+ solved`,
    color: "#f59e0b",
    grad: "from-amber-500/12 to-orange-500/4",
    desc: "DSA on LeetCode is my daily habit. Trees, graphs, dynamic programming — each problem rewires how I think. Not grinding for a badge, grinding to actually think better.",
    Viz: DSAViz,
  },
  {
    id: "learning",
    emoji: "📚",
    title: "Consistent Learning",
    sub: "Building every day",
    color: "#06b6d4",
    grad: "from-cyan-500/12 to-blue-500/4",
    desc: 'I build something every week — a project, a concept, a side experiment. Reading CLRS and "You Don\'t Know JS" back to back. Consistency beats intensity, always.',
    Viz: LearningViz,
  },
  {
    id: "achieve",
    emoji: "🏆",
    title: "Milestones",
    sub: "2nd year · momentum building",
    color: "#22c55e",
    grad: "from-green-500/12 to-emerald-500/4",
    desc: "Still early in the journey — but the GitHub is growing, the LeetCode count is climbing, and the projects are getting more ambitious. The best ones are still in progress.",
    Viz: AchieveViz,
  },
];

function Card({ c, i }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="gc rounded-3xl border border-white/7 overflow-hidden group relative transition-all duration-400"
      style={{ boxShadow: open ? `0 24px 55px ${c.color}14` : "none" }}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${c.grad} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      <div className="relative z-10 p-6 pb-3">
        <div className="flex items-start justify-between mb-3">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 5 }}
            className="text-3xl"
          >
            {c.emoji}
          </motion.div>
          <div className="font-mono text-xs text-white/20 text-right leading-5">
            {c.sub}
          </div>
        </div>
        <h3 className="font-display font-bold text-white text-lg mb-1">
          {c.title}
        </h3>
        <p className="text-white/40 text-xs leading-relaxed">{c.desc}</p>
      </div>

      <div className="relative z-10 px-5">
        <c.Viz color={c.color} />
      </div>

      <div className="relative z-10 px-5 pb-5">
        <div className="h-px bg-white/5 mb-4" />
        <div className="font-mono text-xs text-white/20 text-center">
          hover to explore
        </div>
      </div>
    </motion.div>
  );
}

export default function Life() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <section id="life" className="py-28 px-6 relative">
      <div className="absolute top-1/3 right-0 w-72 h-72 bg-purple-500/4 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-0 w-64 h-64 bg-cyan-500/4 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-6xl mx-auto">
        <div ref={ref} className="mb-16 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            className="font-mono text-xs text-amber-500 tracking-widest uppercase mb-3"
          >
            Chapter 04 — Beyond Code
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display font-extrabold text-5xl md:text-6xl text-white leading-tight"
          >
            Life outside <span className="gt">the terminal</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="text-white/35 mt-4 max-w-md mx-auto font-body"
          >
            A 2nd year CS student who plays guitar, grinds LeetCode, reads
            algorithms books, and builds things that matter.
          </motion.p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((c, i) => (
            <Card key={c.id} c={c} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
