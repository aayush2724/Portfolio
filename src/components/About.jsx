import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import portfolioData from "../data/portfolioData.json";

const chapters = [
  {
    emoji: "🖥️",
    tag: "The Spark",
    title: "Code found me first",
    body: "It wasn't a plan. I just opened a browser, looked at a webpage, and wondered — what's behind this? One HTML file later, I was hooked. That curiosity never left.",
    color: "#f59e0b",
    side: "left",
  },
  {
    emoji: "🧠",
    tag: "The Grind",
    title: "DSA changed how I think",
    body: `LeetCode became my daily puzzle. Arrays, trees, graphs, and DP each forced me to slow down and think differently. ${portfolioData.leetcode.stats.totalSolved} solved, a ${portfolioData.leetcode.streak}-day streak, and still going.`,
    color: "#06b6d4",
    side: "right",
  },
  {
    emoji: "🏗️",
    tag: "The Builder",
    title: "I build things that matter",
    body: "From citizen issue resolution to visitor management and disaster relief coordination, I gravitate toward projects with real-world weight. If it solves an actual problem, I'm in.",
    color: "#a855f7",
    side: "left",
  },
  {
    emoji: "🎸",
    tag: "The Balance",
    title: "Stairway to Heaven keeps me grounded",
    body: "1–2 years in, learning one of the greatest guitar solos ever written. It's the one thing that pulls me completely away from the screen. Music and code both demand presence.",
    color: "#22c55e",
    side: "right",
  },
];

function Chapter({ c, i }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const left = c.side === "left";
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: left ? -40 : 40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`flex gap-5 items-start ${left ? "" : "flex-row-reverse"}`}
    >
      <motion.div
        whileHover={{ scale: 1.08, rotate: 4 }}
        className="flex-shrink-0 w-14 h-14 gc rounded-2xl flex items-center justify-center text-2xl border border-white/8"
        style={{ boxShadow: `0 0 24px ${c.color}20` }}
      >
        {c.emoji}
      </motion.div>
      <div
        className={`flex-1 gc rounded-2xl p-5 border border-white/7 relative overflow-hidden ${left ? "" : "text-right"}`}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${left ? "0%" : "100%"} 50%, ${c.color}08, transparent 60%)`,
          }}
        />
        <div className="relative z-10">
          <div
            className="font-mono text-xs tracking-widest mb-1"
            style={{ color: c.color }}
          >
            {c.tag}
          </div>
          <h3 className="font-display font-bold text-white text-base mb-2">
            {c.title}
          </h3>
          <p className="text-white/45 text-sm font-body leading-relaxed">
            {c.body}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <section id="about" className="py-28 px-6">
      <div className="max-w-4xl mx-auto">
        <div ref={ref} className="mb-16 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            className="font-mono text-xs text-amber-500 tracking-widest uppercase mb-3"
          >
            Chapter 01 — My Story
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display font-extrabold text-5xl md:text-6xl text-white leading-tight"
          >
            More than a <span className="gt">GitHub profile</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-white/35 mt-4 max-w-md mx-auto font-body text-base"
          >
            A 2nd-year CS student from India, building real things, solving
            real problems, and mastering classic rock on a six-string.
          </motion.p>
        </div>

        <div className="space-y-7">
          {chapters.map((c, i) => (
            <Chapter key={i} c={c} i={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-20 gc rounded-3xl p-10 border border-amber-500/10 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
          <div className="text-5xl opacity-20 font-display mb-3 relative z-10">
            "
          </div>
          <p className="relative z-10 font-display text-xl md:text-2xl text-white/75 italic leading-relaxed max-w-xl mx-auto">
            I don't wait to feel ready. I open a code editor, pick a problem, or
            pick up the guitar — and figure it out from there.
          </p>
          <div className="mt-5 relative z-10 flex items-center justify-center gap-3">
            <div className="w-7 h-px bg-amber-500/40" />
            <span className="font-mono text-xs text-amber-500/60">
              Aayush, 2nd year CS
            </span>
            <div className="w-7 h-px bg-amber-500/40" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
