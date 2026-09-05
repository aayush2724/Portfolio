import { useState, useEffect } from "react"
import { motion, useMotionValue, useMotionTemplate, useSpring, useTransform } from "framer-motion"
import AnimatedHeading from "./AnimatedHeading"
import { EASE } from "../context/ease"
import { useLowPower, usePrefersReducedMotion } from "../context/motion"

/**
 * Tech stack as a scattered deck of tilted glass cards — the yaros.me
 * credential-card register. Each card is a discipline with three layers of
 * interaction:
 *   1. cursor-follow 3D tilt + spotlight (desktop),
 *   2. a domain-themed micro-demo that plays on hover — a UI toggle springs
 *      on, an API call types itself, bars sort, an agent pipeline streams,
 *      a deploy sequence goes live,
 *   3. every tool is a button that filters the projects grid (same window
 *      events the old marquee chips used).
 *
 * On low-power devices the tilt/spotlight are dropped and each demo
 * auto-plays once as its card scrolls into view, so touch users still see
 * the show. Scatter offsets live on wrapper divs because Framer owns the
 * card's inline transform and would clobber a Tailwind translate.
 */

const STACK = [
  {
    label: "frontend",
    headline: "Interfaces",
    demo: "ui",
    skills: [
      "React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion",
      "Three.js", "Vite", "Zustand", "GSAP", "Responsive Design",
    ],
    rot: -2.5,
    lift: "",
  },
  {
    label: "backend",
    headline: "Systems",
    demo: "api",
    skills: [
      "Node.js", "Express", "FastAPI", "GraphQL", "MongoDB", "PostgreSQL",
      "Redis", "Prisma", "Supabase", "WebSockets", "Socket.io", "Nginx",
    ],
    rot: 1.8,
    lift: "lg:translate-y-10",
  },
  {
    label: "languages",
    headline: "Foundations",
    demo: "sort",
    skills: [
      "Python", "C++", "JavaScript", "SQL", "Bash", "DSA",
      "System Design", "OOP", "Linux",
    ],
    rot: -1.6,
    lift: "lg:translate-y-3",
  },
  {
    label: "ai / ml",
    headline: "Intelligence",
    demo: "agent",
    skills: [
      "LangChain", "LangGraph", "RAG", "Agentic AI", "Fine-tuning",
      "Quantization", "PyTorch", "Hugging Face", "Vector DBs",
      "Prompt Engineering", "OpenCV", "LLM Evals",
    ],
    rot: 2.2,
    lift: "lg:translate-y-6 lg:translate-x-6",
  },
  {
    label: "tooling",
    headline: "Shipping",
    demo: "deploy",
    skills: [
      "Docker", "Git", "GitHub Actions", "CI/CD", "Vercel", "Firebase",
      "Cloudflare", "Bun", "Postman", "REST APIs", "JWT", "OAuth",
    ],
    rot: -2,
    lift: "lg:-translate-y-4",
  },
]

/* ── Micro-demos ──────────────────────────────────────────────────────────
   Each is a 40px strip. `active` drives play/rewind; colors switch via
   inline style + CSS transitions rather than animating var() values, which
   Framer can't interpolate. */

function DemoUI({ active }) {
  return (
    <div className="flex items-center gap-4 h-full">
      <div
        className="relative w-10 h-6 rounded-full border shrink-0 transition-colors duration-300"
        style={{
          borderColor: "rgba(255,255,255,0.15)",
          background: active ? "rgba(212,255,63,0.15)" : "rgba(255,255,255,0.04)",
        }}
      >
        <motion.div
          className="absolute top-1 left-1 w-4 h-4 rounded-full transition-colors duration-300"
          style={{ background: active ? "var(--accent)" : "#6b6b73" }}
          animate={{ x: active ? 16 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 26 }}
        />
      </div>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: "var(--accent)" }}
          animate={{ width: active ? "100%" : "12%" }}
          transition={{ type: "spring", stiffness: 130, damping: 19 }}
        />
      </div>
      <span className="font-mono text-[10px] shrink-0" style={{ color: "var(--muted)" }}>
        {active ? "60fps" : "idle"}
      </span>
    </div>
  )
}

const API_LINE = "GET /api/health → 200 OK · 38ms"

function DemoApi({ active }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!active) {
      setN(0)
      return
    }
    const t = setInterval(() => {
      setN((v) => {
        if (v >= API_LINE.length) {
          clearInterval(t)
          return v
        }
        return v + 1
      })
    }, 26)
    return () => clearInterval(t)
  }, [active])
  return (
    <div className="font-mono text-xs h-full flex items-center whitespace-nowrap overflow-hidden" style={{ color: "var(--muted)" }}>
      <span style={{ color: "var(--accent)" }}>$</span>
      <span className="ml-2">{API_LINE.slice(0, n)}</span>
      <span className="animate-pulse" style={{ color: "var(--accent)" }}>▍</span>
    </div>
  )
}

const UNSORTED = [3, 7, 2, 8, 5, 1, 6, 4]
const SORTED = [...UNSORTED].sort((a, b) => a - b)

function DemoSort({ active }) {
  const vals = active ? SORTED : UNSORTED
  return (
    <div className="flex items-end gap-1.5 h-full pb-0.5">
      {vals.map((v, i) => (
        <motion.div
          key={i}
          className="w-2 rounded-sm transition-colors duration-300"
          style={{ background: active ? "var(--accent)" : "rgba(255,255,255,0.25)" }}
          animate={{ height: `${v * 9 + 16}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 24, delay: i * 0.045 }}
        />
      ))}
      <span className="font-mono text-[10px] ml-3 self-center" style={{ color: "var(--muted)" }}>
        {active ? "O(n log n)" : "unsorted"}
      </span>
    </div>
  )
}

const AGENT_STEPS = ["plan", "retrieve", "rerank", "generate"]

function DemoAgent({ active }) {
  return (
    <div className="font-mono text-xs h-full flex items-center gap-x-2 whitespace-nowrap overflow-hidden" style={{ color: "var(--muted)" }}>
      <span style={{ color: "var(--accent)" }}>&gt;</span>
      {AGENT_STEPS.map((s, i) => (
        <motion.span
          key={s}
          className="inline-flex items-center gap-x-2"
          initial={false}
          animate={{ opacity: active ? 1 : 0.22 }}
          transition={{ delay: active ? i * 0.32 : 0, duration: 0.25 }}
        >
          {s}
          {i < AGENT_STEPS.length - 1 && <span style={{ color: "rgba(255,255,255,0.25)" }}>→</span>}
        </motion.span>
      ))}
      <motion.span
        initial={false}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ delay: active ? AGENT_STEPS.length * 0.32 : 0, duration: 0.25 }}
        style={{ color: "var(--accent)" }}
      >
        ✓
      </motion.span>
    </div>
  )
}

const DEPLOY_STAGES = ["build", "test", "deploy"]

function DemoDeploy({ active }) {
  return (
    <div className="font-mono text-xs h-full flex items-center gap-3 whitespace-nowrap overflow-hidden" style={{ color: "var(--muted)" }}>
      {DEPLOY_STAGES.map((s, i) => (
        <motion.span
          key={s}
          className="inline-flex items-center gap-1.5"
          initial={false}
          animate={{ opacity: active ? 1 : 0.3 }}
          transition={{ delay: active ? i * 0.38 : 0, duration: 0.25 }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full inline-block transition-colors duration-300"
            style={{ background: active ? "var(--accent)" : "rgba(255,255,255,0.2)", transitionDelay: active ? `${i * 0.38}s` : "0s" }}
          />
          {s}
        </motion.span>
      ))}
      <motion.span
        initial={false}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ delay: active ? DEPLOY_STAGES.length * 0.38 : 0, duration: 0.3 }}
        className="inline-flex items-center gap-1.5"
        style={{ color: "var(--accent)" }}
      >
        <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ background: "var(--accent)" }} />
        live
      </motion.span>
    </div>
  )
}

const DEMOS = { ui: DemoUI, api: DemoApi, sort: DemoSort, agent: DemoAgent, deploy: DemoDeploy }

/* ── Cards ──────────────────────────────────────────────────────────────── */

function SkillButton({ skill, isActive }) {
  const toggle = () => {
    if (isActive) {
      window.dispatchEvent(new CustomEvent("clear-filter"))
    } else {
      window.dispatchEvent(new CustomEvent("filter-projects", { detail: { skill } }))
      document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      data-cursor="Filter"
      className="text-sm transition-colors duration-200 cursor-pointer"
      style={{ color: isActive ? "var(--accent)" : "var(--muted)" }}
      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = "var(--fg)" }}
      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "var(--muted)" }}
    >
      {isActive ? `[ ${skill} ]` : skill}
    </button>
  )
}

function StackCard({ cat, i, activeFilter, lowPower, reduced }) {
  const [hovered, setHovered] = useState(false)
  const [seen, setSeen] = useState(false)

  // Cursor-follow tilt + spotlight (desktop only). rotate / rotateX /
  // rotateY are separate transform channels to Framer, so the resting
  // scatter tilt and the cursor tilt compose instead of fighting.
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(my, [0, 1], [5, -5]), { stiffness: 220, damping: 22 })
  const rotateY = useSpring(useTransform(mx, [0, 1], [-5, 5]), { stiffness: 220, damping: 22 })
  const glareX = useTransform(mx, [0, 1], ["0%", "100%"])
  const glareY = useTransform(my, [0, 1], ["0%", "100%"])
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(190,215,240,0.13), transparent 55%)`

  const handleMove = (e) => {
    if (lowPower || reduced) return
    const rect = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - rect.left) / rect.width)
    my.set((e.clientY - rect.top) / rect.height)
  }
  const resetTilt = () => {
    mx.set(0.5)
    my.set(0.5)
  }

  // Desktop: demo plays while hovered, rewinds on leave. Touch/low-power:
  // plays once when the card scrolls into view. Reduced motion: end state.
  const demoActive = reduced ? true : lowPower ? seen : hovered
  const Demo = DEMOS[cat.demo]

  return (
    <div className={cat.lift}>
      <motion.div
        initial={{ opacity: 0, y: 48, rotate: 0 }}
        whileInView={{ opacity: 1, y: 0, rotate: lowPower ? 0 : cat.rot }}
        viewport={{ once: true, amount: 0.3 }}
        onViewportEnter={() => setSeen(true)}
        transition={{ duration: 0.7, delay: i * 0.08, ease: EASE.ENTER }}
        whileHover={lowPower ? undefined : { rotate: 0, y: -8 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onMouseMove={handleMove}
        onMouseLeave={resetTilt}
        style={
          lowPower || reduced
            ? {}
            : { rotateX, rotateY, transformStyle: "preserve-3d", transformPerspective: 900 }
        }
        className="relative h-full rounded-3xl p-7 md:p-8 overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            border: "1px solid rgba(255,255,255,0.10)",
            background: "linear-gradient(165deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))",
          }}
        />
        {!lowPower && !reduced && (
          <motion.div
            aria-hidden="true"
            style={{ background: glare, opacity: hovered ? 1 : 0 }}
            className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-300"
          />
        )}

        <div className="relative">
          <p className="font-mono text-xs tracking-widest mb-3" style={{ color: "var(--muted)" }}>
            <span style={{ color: "var(--accent)" }}>//</span> {cat.label}
          </p>
          <h3 className="serif-accent text-4xl md:text-5xl" style={{ color: "var(--fg)" }}>
            {cat.headline}
          </h3>

          {/* Micro-demo strip */}
          <div className="h-10 my-6">
            <Demo active={demoActive} />
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2.5">
            {cat.skills.map((skill) => (
              <SkillButton
                key={skill}
                skill={skill}
                isActive={!!activeFilter && activeFilter.toLowerCase() === skill.toLowerCase()}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function SkillsMarquee() {
  const lowPower = useLowPower()
  const reduced = usePrefersReducedMotion()
  const [activeFilter, setActiveFilter] = useState(null)

  useEffect(() => {
    const handleFilter = (e) => setActiveFilter(e.detail.skill)
    const handleClear = () => setActiveFilter(null)
    window.addEventListener("filter-projects", handleFilter)
    window.addEventListener("clear-filter", handleClear)
    return () => {
      window.removeEventListener("filter-projects", handleFilter)
      window.removeEventListener("clear-filter", handleClear)
    }
  }, [])

  return (
    <section id="skills" className="relative py-32 px-6 md:px-16 overflow-hidden">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16">
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "var(--accent)" }}>
            Tech Stack
          </p>
          <AnimatedHeading
            text="The *stack*"
            as="h2"
            cinematic
            className="font-display text-5xl md:text-7xl uppercase leading-none"
          />
          <p className="mt-4 font-mono text-sm" style={{ color: "var(--muted)" }}>
            <span style={{ color: "var(--accent)" }}>//</span> hover a card · click any tool to filter the projects
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-start">
          {STACK.map((cat, i) => (
            <StackCard
              key={cat.label}
              cat={cat}
              i={i}
              activeFilter={activeFilter}
              lowPower={lowPower}
              reduced={reduced}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
