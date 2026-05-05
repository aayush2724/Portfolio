import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import portfolioData from "../data/portfolioData.json";

const events = [
  {
    year: "Early Days",
    title: "First HTML file",
    desc: "Opened a browser inspector, saw the DOM, thought — I need to learn this. Wrote my first webpage. It was ugly. I loved it.",
    icon: "🌐",
    color: "#f59e0b",
  },
  {
    year: "Getting Serious",
    title: "JavaScript clicked",
    desc: "Moved from HTML to JS. The moment async/await made sense, something fundamentally changed in how I thought about computers.",
    icon: "⚡",
    color: "#facc15",
  },
  {
    year: "The Guitar Era",
    title: "Picked up the six-string",
    desc: "Started learning guitar during study breaks. Now tackling Stairway to Heaven — the ultimate challenge. Won't stop until that solo flows effortlessly.",
    icon: "🎸",
    color: "#a855f7",
  },
  {
    year: "DSA Journey",
    title: "LeetCode became daily",
    desc: `Started grinding LeetCode. Arrays -> Linked Lists -> Trees -> Graphs -> DP. ${portfolioData.leetcode.stats.totalSolved}+ problems in and still learning new patterns every week.`,
    icon: "🧠",
    color: "#06b6d4",
  },
  {
    year: "Building Era",
    title: "First real full-stack app",
    desc: "Built a visitor management platform with secure workflows, authentication, and dashboard-first UX. First time a project felt genuinely production-grade.",
    icon: "🛡️",
    color: "#22c55e",
  },
  {
    year: "Impact Projects",
    title: "Disaster Relief Platform",
    desc: "Coordinated with the idea of NGOs and agencies. Built a full-stack platform for disaster response management. Code that could matter in real emergencies.",
    icon: "🆘",
    color: "#ef4444",
  },
  {
    year: "Community",
    title: "Skillnest — learn anything, free",
    desc: "Built a peer-to-peer skill exchange platform. Teach what you know, learn what you need. No fees, any field. A project close to my heart.",
    icon: "🧩",
    color: "#f59e0b",
  },
  {
    year: "TypeScript Build",
    title: "Job Portal",
    desc: "Built a TypeScript job portal with authentication, listing filters, and recruiter-side dashboard workflows.",
    icon: "📋",
    color: "#06b6d4",
  },
  {
    year: "Civic Solutions",
    title: "Citizen Resolver System",
    desc: "Developed a civic support portal for logging citizen issues with automated resolution flows and admin dashboards.",
    icon: "🏛️",
    color: "#22c55e",
  },
  {
    year: "AI & Pipelines",
    title: "LeadForge",
    desc: "Expanding into AI. Built a Python-powered B2B lead generation pipeline integrating Apollo, Crunchbase, and SerpAPI for automated enrichment.",
    icon: "🤖",
    color: "#ef4444",
  },
  {
    year: "Computer Vision + Music",
    title: "Chord Detector via Camera",
    desc: "Shifted the chord project direction to computer vision. Building a model that detects guitar chords visually from a live camera feed while I play.",
    icon: "📷",
    color: "#22c55e",
  },
  {
    year: "Hackathon Win",
    title: "3rd Place at NIT Trichy",
    desc: "Secured 3rd place in the ThinkRoot x Vortex'26 Hackathon with LeadForge, competing among college teams and presenting a complete AI lead-generation workflow.",
    icon: "🥉",
    color: "#f59e0b",
  },
  {
    year: "Right Now →",
    title: "Building, solving, Chord Detector",
    desc: `2nd year CS student with ${portfolioData.github.length}+ GitHub repos, ${portfolioData.leetcode.stats.totalSolved}+ LC problems solved, and currently rebuilding Chord Detector with a new direction. Leveling up every single day.`,
    icon: "🚀",
    color: "#a855f7",
  },
];

function Item({ e, i }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const left = i % 2 === 0;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: left ? -50 : 50 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`flex items-start gap-6 ${left ? "" : "flex-row-reverse"}`}
    >
      <div className={`flex-1 ${left ? "text-right" : ""}`}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="gc rounded-2xl p-5 border border-white/7 inline-block max-w-xs relative overflow-hidden group"
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-400"
            style={{
              background: `radial-gradient(circle, ${e.color}08, transparent)`,
            }}
          />
          <div className="relative z-10">
            <div
              className="font-mono text-xs tracking-widest mb-1.5"
              style={{ color: e.color }}
            >
              {e.year}
            </div>
            <h3 className="font-display font-bold text-white mb-2 text-sm">
              {e.title}
            </h3>
            <p className="text-white/40 text-xs font-body leading-relaxed">
              {e.desc}
            </p>
          </div>
        </motion.div>
      </div>

      <div className="flex-shrink-0 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
          className="w-11 h-11 gc rounded-xl flex items-center justify-center text-lg border border-white/8 relative z-10"
          style={{ boxShadow: `0 0 18px ${e.color}22` }}
        >
          {e.icon}
        </motion.div>
      </div>
      <div className="flex-1" />
    </motion.div>
  );
}

export default function Timeline() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 0.85", "end 0.15"],
  });
  const lineH = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="timeline" className="py-28 px-6 relative">
      <div className="max-w-4xl mx-auto">
        <div ref={ref} className="mb-20 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            className="font-mono text-xs text-amber-500 tracking-widest uppercase mb-3"
          >
            Chapter 05 — Journey
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display font-extrabold text-5xl md:text-6xl text-white"
          >
            The <span className="ga">timeline</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="text-white/35 mt-3 font-body"
          >
            Every milestone that shaped me.
          </motion.p>
        </div>

        <div ref={container} className="relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-white/4">
            <motion.div
              className="w-full bg-gradient-to-b from-amber-500 via-purple-500 to-cyan-500 rounded-full"
              style={{ height: lineH }}
            />
          </div>
          <div className="space-y-10">
            {events.map((e, i) => (
              <Item key={i} e={e} i={i} />
            ))}
          </div>
          <div className="flex justify-center mt-10">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-sm font-bold text-black relative z-10"
            >
              ∞
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
