import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const projects = [
  {
    name: "LeadForge",
    repo: "LeadForge",
    desc: "An AI-powered B2B lead generation and enrichment pipeline. Automates prospect sourcing, scoring, and multi-phase enrichment via Apollo, Crunchbase, and job-board scraping. Built for the ThinkRoot x Vortex'26 Hackathon at NIT Trichy, where it secured 3rd place.",
    tags: ["Python", "AI/ML", "Data Pipeline", "Automation"],
    color: "#f97316",
    grad: "from-orange-500/15 to-red-500/5",
    mark: "LF",
    gh: "https://github.com/aayush2724/LeadForge",
    media: {
      src: "/leadforge-hackathon-proof.svg",
      alt: "LeadForge - 3rd Place at ThinkRoot x Vortex'26 Hackathon, NIT Trichy",
      caption: "Hackathon Proof · ThinkRoot x Vortex'26",
    },
    highlight:
      "3rd Place - ThinkRoot x Vortex'26 | Lead scoring | SerpAPI + Apollo",
    featured: true,
    updated: "Apr 19, 2026",
  },
  {
    name: "Citizen Resolver System",
    repo: "Citizen-Resolver-System",
    desc: "A civic support portal for logging citizen issues, tracking resolution flow, and keeping helpline work organized from intake to action.",
    tags: ["React", "Vite", "Routing", "CivicTech"],
    color: "#06b6d4",
    grad: "from-cyan-500/15 to-blue-500/5",
    mark: "CR",
    gh: "https://github.com/aayush2724/Citizen-Resolver-System",
    highlight: "Citizen complaints | Status tracking | Resolver workflow",
    featured: true,
    updated: "Apr 16, 2026",
  },
  {
    name: "TaskFlow",
    repo: "TaskFlow",
    desc: "A MERN-stack productivity workspace with task management, Kanban boards, and a glassmorphism UI. Designed for clean workflow orchestration from planning to completion.",
    tags: ["React", "Node.js", "MongoDB", "Productivity"],
    color: "#22c55e",
    grad: "from-green-500/15 to-emerald-500/5",
    mark: "TF",
    gh: "https://github.com/aayush2724/TaskFlow",
    highlight: "Kanban board | MERN stack | Glassmorphism UI",
    featured: true,
    updated: "Apr 17, 2026",
  },
  {
    name: "Skillnest",
    repo: "Skillnest",
    desc: "A peer-to-peer learning platform where people can teach what they know and learn what they need without turning knowledge into a paywall.",
    tags: ["JavaScript", "EdTech", "Community"],
    color: "#a855f7",
    grad: "from-purple-500/15 to-pink-500/5",
    mark: "SN",
    gh: "https://github.com/aayush2724/Skillnest",
    highlight: "Skill exchange | Zero cost | Community learning",
    featured: true,
    updated: "Apr 12, 2026",
  },
  {
    name: "RSB Secure",
    repo: "RSB-Visitor-Management-System",
    desc: "A full-stack visitor management system for replacing paper logs with secure capture, admin dashboards, notifications, and JWT authentication.",
    tags: ["JavaScript", "Node.js", "JWT", "Full Stack"],
    color: "#f59e0b",
    grad: "from-amber-500/15 to-orange-500/5",
    mark: "RS",
    gh: "https://github.com/aayush2724/RSB-Visitor-Management-System",
    highlight: "Visitor logs | WhatsApp flow | Admin dashboard",
    featured: false,
    updated: "Apr 7, 2026",
  },
  {
    name: "Job Portal",
    repo: "Job-Portal",
    desc: "A TypeScript job portal with listings, application flow, authentication, filtering, and recruiter-facing dashboard patterns.",
    tags: ["TypeScript", "React", "Full Stack"],
    color: "#3b82f6",
    grad: "from-blue-500/15 to-indigo-500/5",
    mark: "JP",
    gh: "https://github.com/aayush2724/Job-Portal",
    highlight: "TypeScript | Auth | Recruiter dashboard",
    featured: false,
    updated: "Mar 15, 2026",
  },
  {
    name: "Disaster Relief System",
    repo: "Disaster-relief-system",
    desc: "A relief coordination platform for managing affected zones, dispatching resources, tracking supplies, and organizing response teams.",
    tags: ["JavaScript", "Full Stack", "Relief Ops"],
    color: "#ef4444",
    grad: "from-red-500/15 to-amber-500/5",
    mark: "DR",
    gh: "https://github.com/aayush2724/Disaster-relief-system",
    highlight: "Resource dispatch | Zone management | NGO workflow",
    featured: false,
    updated: "Mar 14, 2026",
  },
  {
    name: "HackFindo",
    repo: "HackFindo",
    desc: "A hackathon discovery and team-formation platform for finding events, building teams, and keeping submissions organized.",
    tags: ["JavaScript", "Community", "Hackathons"],
    color: "#14b8a6",
    grad: "from-teal-500/15 to-cyan-500/5",
    mark: "HF",
    gh: "https://github.com/aayush2724/HackFindo",
    highlight: "Event discovery | Team builder | Submissions",
    featured: false,
    updated: "Mar 5, 2026",
  },
  {
    name: "chatRoom",
    repo: "chatRoom",
    desc: "A lightweight real-time group chat app with rooms, live message broadcasting, and WebSocket-powered communication.",
    tags: ["HTML", "JavaScript", "WebSockets"],
    color: "#ec4899",
    grad: "from-pink-500/15 to-rose-500/5",
    mark: "CH",
    gh: "https://github.com/aayush2724/chatRoom",
    highlight: "Live chat | Rooms | WebSockets",
    featured: false,
    updated: "Feb 23, 2026",
  },
];

function Card({ p, i }) {
  const [hov, setHov] = useState(false);
  const [mediaFailed, setMediaFailed] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="gc rounded-lg border border-white/7 overflow-hidden relative transition-all duration-500 p-6 group"
      style={{ boxShadow: hov ? `0 20px 55px ${p.color}14` : "none" }}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${p.grad} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />
      <motion.div
        className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl pointer-events-none"
        style={{ background: p.color }}
        animate={{ opacity: hov ? 0.1 : 0 }}
        transition={{ duration: 0.4 }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center text-sm font-display font-bold border border-white/8"
              style={{ background: `${p.color}12`, color: p.color }}
            >
              {p.mark}
            </div>
            <div>
              <div className="font-display font-bold text-white text-sm">
                {p.name}
              </div>
              <div className="font-mono text-xs text-white/25 mt-1">
                Updated {p.updated}
              </div>
            </div>
          </div>
          {p.featured && (
            <span
              className="font-mono text-[10px] px-2 py-0.5 rounded-md"
              style={{ background: `${p.color}18`, color: p.color }}
            >
              Recent
            </span>
          )}
        </div>

        <p className="text-white/45 text-xs font-body leading-relaxed mb-3">
          {p.desc}
        </p>

        <div className="font-mono text-xs mb-4 px-2 py-1 rounded-lg border border-white/5 text-white/30 bg-white/2">
          {p.highlight}
        </div>

        {p.media && (
          <div className="mb-4 rounded-lg overflow-hidden border border-white/10 bg-black/25">
            {!mediaFailed ? (
              <img
                src={p.media.src}
                alt={p.media.alt}
                className="w-full h-28 object-cover"
                loading="lazy"
                onError={() => setMediaFailed(true)}
              />
            ) : (
              <div className="h-28 flex items-center justify-center bg-gradient-to-br from-amber-500/15 to-red-500/10 text-white/45 font-mono text-xs text-center px-3">
                Hackathon media unavailable
              </div>
            )}
            <div className="px-3 py-2 font-mono text-[10px] tracking-wider uppercase text-amber-300/80 border-t border-white/10">
              {p.media.caption}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 mb-5">
          {p.tags.map((t) => (
            <span
              key={t}
              className="text-xs font-mono px-2.5 py-0.5 rounded-full border border-white/8 text-white/35"
            >
              {t}
            </span>
          ))}
        </div>

        <a
          href={p.gh}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-mono text-xs text-amber-400/70 hover:text-amber-300 transition-colors"
        >
          Open repository
          <span aria-hidden="true">-&gt;</span>
        </a>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section id="projects" className="py-28 px-6 relative">
      <div className="absolute left-0 top-1/2 w-64 h-64 bg-cyan-500/4 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-6xl mx-auto">
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
            Recent GitHub work — AI pipelines, civic tools, peer learning, job
            workflows, real-time chat, and disaster response. Updated live from
            the latest pushes.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p, i) => (
            <Card key={p.repo} p={p} i={i} />
          ))}
        </div>

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
            See all repos - github.com/aayush2724
          </a>
        </motion.div>
      </div>
    </section>
  );
}
