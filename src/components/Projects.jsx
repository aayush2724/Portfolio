import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import ProjectCard3D from "../three/ProjectCard3D";

export const projects = [
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
    highlight:
      "Audio ML pipeline | Sonic Singularity UI | Vercel + Render + HF",
    featured: true,
    updated: "May 28, 2026",
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
    updated: "May 21, 2026",
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
    updated: "May 5, 2026",
  },
];

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
              <div className="font-mono text-xs text-white/30 mt-1">
                Updated {p.updated}
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

        <a
          href={p.gh}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-mono text-xs text-amber-400 hover:text-amber-200 transition-colors"
          data-testid={`project-link-${p.repo}`}
        >
          Open repository
          <span aria-hidden="true">-&gt;</span>
        </a>
      </div>
    </ProjectCard3D>
  );
}

export default function Projects() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const activeProjects = projects;

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
            Recent GitHub work — Audio ML pipelines, civic tools, and real-time chord recognition. Updated live from the latest pushes.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeProjects.map((p, i) => (
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
