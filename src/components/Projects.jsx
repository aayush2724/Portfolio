import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import ProjectCard3D from "../three/ProjectCard3D";

export const projects = [
  {
    name: "LeadForge",
    repo: "LeadForge",
    desc: "An AI-powered B2B lead generation and enrichment pipeline. Automates prospect sourcing, scoring, and multi-phase enrichment via Apollo, Crunchbase, and job-board scraping. 3rd place at ThinkRoot x Vortex'26 Hackathon, NIT Trichy.",
    tags: ["Python", "AI/ML", "Data Pipeline", "Automation"],
    color: "#f97316",
    grad: "from-orange-500/15 to-red-500/5",
    mark: "LF",
    gh: "https://github.com/aayush2724/LeadForge",
    demo: "https://lead-forge-rust.vercel.app",
    badge: "3rd Place Winner",
    highlight: "3rd Place - ThinkRoot x Vortex'26 | Lead scoring | SerpAPI + Apollo",
    featured: true,
    updatedAt: "2026-04-19",
    updated: "Apr 19, 2026",
  },
  {
    name: "Citizen Resolver System",
    repo: "Citizen-Resolver-System",
    desc: "A full-scale civic support portal for logging citizen issues, tracking resolution flow, and keeping helpline work organized from intake to action. One of the largest codebases in the portfolio.",
    tags: ["React", "Vite", "Full Stack", "CivicTech"],
    color: "#06b6d4",
    grad: "from-cyan-500/15 to-blue-500/5",
    mark: "CR",
    gh: "https://github.com/aayush2724/Citizen-Resolver-System",
    badge: "Largest Codebase",
    highlight: "Citizen complaints | Status tracking | Resolver workflow",
    featured: true,
    updatedAt: "2026-05-21",
    updated: "May 21, 2026",
  },
  {
    name: "Beatzy",
    repo: "Beatzy",
    desc: "A full-stack music analysis platform with AI-powered audio intelligence. Features real-time audio visualization, ML-driven genre classification, and a cinematic 'Sonic Singularity' results interface. Deployed across Vercel, Render, and Hugging Face.",
    tags: ["JavaScript", "React", "AI/ML", "Full Stack"],
    color: "#f43f5e",
    grad: "from-rose-500/15 to-pink-500/5",
    mark: "BZ",
    gh: "https://github.com/aayush2724/Beatzy",
    demo: "https://beatzy-zeta.vercel.app",
    badge: "Deployed Live",
    highlight: "Audio ML pipeline | Sonic Singularity UI | Vercel + Render + HF",
    featured: true,
    updatedAt: "2026-05-28",
    updated: "May 28, 2026",
  },
  {
    name: "MindFlow",
    repo: "MindFlow",
    desc: "A student and counselor portal for mental health and hackathon demonstration. Features persistent database-backed test credentials, full authentication, and dashboard flows.",
    tags: ["React", "Full Stack", "Authentication"],
    color: "#eab308",
    grad: "from-yellow-500/15 to-amber-500/5",
    mark: "MF",
    gh: "https://github.com/aayush2724/MindFlow",
    highlight: "Auth flows | Student portal | Dashboard",
    featured: true,
    updatedAt: "2026-05-17",
    updated: "May 17, 2026",
  },
  {
    name: "Chord Detector",
    repo: "Chord-Detector",
    desc: "A chord intelligence project with cleaner signal pipelines, stronger feature extraction, and reliable real-time recognition. Built with Python, OpenCV, and custom ML models for audio analysis.",
    tags: ["Python", "Computer Vision", "ML", "OpenCV"],
    color: "#3b82f6",
    grad: "from-blue-500/15 to-cyan-500/5",
    mark: "CD",
    gh: "https://github.com/aayush2724/Chord-Detector",
    badge: "ML Project",
    highlight: "Signal pipeline | Feature extraction | Real-time recognition",
    featured: true,
    updatedAt: "2026-05-05",
    updated: "May 5, 2026",
  },
  {
    name: "Visitor Management System",
    repo: "Visitor-Management-System",
    desc: "A visitor management project with secure digital records, check-in/check-out flows, and admin-side workflow controls for campus and office environments.",
    tags: ["JavaScript", "Full Stack", "Workflow"],
    color: "#8b5cf6",
    grad: "from-violet-500/15 to-purple-500/5",
    mark: "VM",
    gh: "https://github.com/aayush2724/Visitor-Management-System",
    highlight: "Secure records | Check-in flow | Admin dashboard",
    featured: true,
    updatedAt: "2026-04-28",
    updated: "Apr 28, 2026",
  },
  {
    name: "MedVerify",
    repo: "MedVerify",
    desc: "A medical verification platform for validating prescriptions, cross-checking drug interactions, and streamlining pharmacy workflows with intelligent document processing.",
    tags: ["JavaScript", "React", "HealthTech"],
    color: "#10b981",
    grad: "from-emerald-500/15 to-green-500/5",
    mark: "MV",
    gh: "https://github.com/aayush2724/MedVerify",
    highlight: "Prescription validation | Drug interaction | Smart workflows",
    featured: true,
    updatedAt: "2026-05-18",
    updated: "May 18, 2026",
  },
  {
    name: "Job Portal",
    repo: "Job-Portal",
    desc: "A TypeScript job portal with listings, application flow, authentication, filtering, and recruiter-facing dashboard patterns.",
    tags: ["TypeScript", "React", "Full Stack"],
    color: "#6366f1",
    grad: "from-indigo-500/15 to-blue-500/5",
    mark: "JP",
    gh: "https://github.com/aayush2724/Job-Portal",
    highlight: "TypeScript | Auth | Recruiter dashboard",
    featured: true,
    updatedAt: "2026-04-29",
    updated: "Apr 29, 2026",
  },
];

// Sort by most recently updated
const sortedByRecent = [...projects].sort(
  (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
);
const recentProjects = sortedByRecent.slice(0, 3);

function timeAgo(dateStr) {
  const now = new Date("2026-06-02");
  const then = new Date(dateStr);
  const diffDays = Math.floor((now - then) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

function RecentBadge({ dateStr }) {
  return (
    <span className="inline-flex items-center gap-1 font-mono text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/12 text-amber-400/80 border border-amber-500/20">
      <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />
      {timeAgo(dateStr)}
    </span>
  );
}

function Card({ p, i }) {
  return (
    <ProjectCard3D p={p} i={i}>
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center text-sm font-display font-bold border border-white/8"
              style={{
                background: `${p.color}18`,
                color: p.color,
                boxShadow: `inset 0 0 18px ${p.color}25, 0 6px 14px ${p.color}25`,
              }}
            >
              {p.mark}
            </div>
            <div>
              <div className="underline-grow font-display font-bold text-white text-sm">
                {p.name}
              </div>
              <div className="font-mono text-xs text-white/30 mt-1 flex items-center gap-1.5">
                <span>Updated {p.updated}</span>
              </div>
            </div>
          </div>
          {p.featured && (
            <span
              className="font-mono text-[10px] px-2 py-0.5 rounded-md"
              style={{ background: `${p.color}22`, color: p.color }}
            >
              {p.badge || "Active"}
            </span>
          )}
        </div>

        <p className="text-white/55 text-xs font-body leading-relaxed mb-3">
          {p.desc}
        </p>

        <div
          className="font-mono text-xs mb-4 px-2 py-1 rounded-lg border border-white/8 text-white/45 bg-white/3"
          style={{ borderColor: `${p.color}30` }}
        >
          {p.highlight}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {p.tags.map((t) => (
            <span
              key={t}
              className="text-xs font-mono px-2.5 py-0.5 rounded-full border border-white/10 text-white/50"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href={p.gh}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-mono text-xs text-amber-400 hover:text-amber-200 transition-colors"
          >
            Open repository
            <span aria-hidden="true">-&gt;</span>
          </a>
          {p.demo && (
            <a
              href={p.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Live demo
              <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </div>
    </ProjectCard3D>
  );
}

function RecentCard({ p, i }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: i * 0.08 }}
      className="flex items-center gap-4 p-3.5 rounded-xl border border-white/6 bg-white/[0.025] hover:bg-white/[0.04] hover:border-white/10 transition-all group"
    >
      <div
        className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-xs font-display font-bold border border-white/8"
        style={{
          background: `${p.color}18`,
          color: p.color,
          boxShadow: `inset 0 0 12px ${p.color}20`,
        }}
      >
        {p.mark}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-display font-semibold text-white text-xs truncate">{p.name}</span>
          <RecentBadge dateStr={p.updatedAt} />
        </div>
        <div className="font-mono text-[10px] text-white/30 truncate">{p.highlight}</div>
      </div>
      <a
        href={p.gh}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 font-mono text-[10px] text-white/25 group-hover:text-amber-400 transition-colors"
        aria-label={`Open ${p.name} repo`}
      >
        →
      </a>
    </motion.div>
  );
}

const FILTERS = ["All", "AI/ML", "Full Stack", "Python", "React", "TypeScript"];

export default function Projects() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [filter, setFilter] = useState("All");

  const filtered =
    filter === "All"
      ? projects
      : projects.filter((p) => p.tags.some((t) => t === filter));

  return (
    <section id="projects" className="py-28 px-6 relative">
      <div className="absolute left-0 top-1/2 w-64 h-64 bg-cyan-500/4 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div ref={ref} className="mb-14">
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            className="font-mono text-xs text-amber-500 tracking-widest uppercase mb-3"
          >
            Chapter 03 - Projects
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display font-extrabold text-5xl md:text-6xl text-white"
          >
            Things I've <span className="gt">shipped</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-white/35 mt-3 font-body max-w-lg"
          >
            Recent GitHub work — AI pipelines, civic tools, music analysis platforms, health verification, and job workflows.
          </motion.p>
        </div>

        {/* Recently Updated strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-mono text-xs text-amber-500/70 tracking-widest uppercase">Recently Updated</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recentProjects.map((p, i) => (
              <RecentCard key={p.repo} p={p} i={i} />
            ))}
          </div>
        </motion.div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`font-mono text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                filter === f
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                  : "border-white/8 text-white/35 hover:text-white/60 hover:border-white/15"
              }`}
            >
              {f}
              {f !== "All" && (
                <span className="ml-1.5 text-white/20">
                  {projects.filter((p) => p.tags.includes(f)).length}
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {/* Cards grid */}
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p, i) => (
              <motion.div
                key={p.repo}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <Card p={p} i={i} />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-10 text-center"
        >
          <a
            href="https://github.com/aayush2724"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 gc border border-white/10 rounded-lg px-7 py-3.5 font-mono text-sm text-white/40 hover:text-white hover:border-white/20 transition-all"
          >
            See all repos — github.com/aayush2724
          </a>
        </motion.div>
      </div>
    </section>
  );
}