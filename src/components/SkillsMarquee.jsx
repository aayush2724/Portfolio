import { useState, useEffect, useRef, useCallback } from "react"
import TechWave from "./TechWave"
import { createPortal } from "react-dom"
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
} from "framer-motion"
import AnimatedHeading from "./AnimatedHeading"
import { EASE } from "../context/ease"
import { useLowPower, usePrefersReducedMotion } from "../context/motion"
import { filterProjectsBySkills, countProjectsForSkill } from "../data/featuredProjects"

/**
 * Tech stack as a scattered deck of tilted glass cards — the yaros.me
 * credential-card register. Each card is a discipline with three layers of
 * interaction:
 *   1. cursor-follow 3D tilt + spotlight (desktop),
 *   2. a domain-themed micro-demo that plays on hover — a UI toggle springs
 *      on, an API call types itself, bars sort, an agent pipeline streams,
 *      a deploy sequence goes live,
 *   3. click and the card *becomes* the panel — Framer's shared layout
 *      (`layoutId`) morphs the shell, eyebrow and headline out of the grid
 *      into a dialog holding every tool and the projects they built.
 *      Tools filter the projects carousel from in there.
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
      "LLMs", "RAG", "GenAI", "LangChain", "LangGraph", "Agentic AI",
      "Embeddings", "Vector DBs", "Prompt Engineering", "Fine-tuning",
      "Quantization", "PyTorch", "Hugging Face", "Transformers",
      "LLM Evals", "OpenCV",
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

/** Shared by the real card and the inert twin that holds its grid slot open. */
const CARD_SHELL = "relative block w-full text-left rounded-3xl p-7 md:p-8 overflow-hidden"

/* ── Cards ──────────────────────────────────────────────────────────────── */

/**
 * The collapsed card. It is a button: the whole surface opens the panel, so
 * the tools inside are plain text here and only become filter controls once
 * expanded — two competing click targets on one card read as a bug.
 */
function StackCard({ cat, i, lowPower, reduced, isOpen, onOpen, cardRef }) {
  const [hovered, setHovered] = useState(false)
  const [seen, setSeen] = useState(false)

  // Cursor-follow tilt + spotlight (desktop only). Framer measures the card's
  // rotated box when the panel morph starts, so the tilt is released the
  // moment a card opens — a rotated source box distorts the projection.
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(my, [0, 1], [5, -5]), { stiffness: 220, damping: 22 })
  const rotateY = useSpring(useTransform(mx, [0, 1], [-5, 5]), { stiffness: 220, damping: 22 })
  const glareX = useTransform(mx, [0, 1], ["0%", "100%"])
  const glareY = useTransform(my, [0, 1], ["0%", "100%"])
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(190,215,240,0.13), transparent 55%)`

  const flat = lowPower || reduced || isOpen

  const handleMove = (e) => {
    if (flat) return
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
  const shown = cat.skills.slice(0, 6)
  const rest = cat.skills.length - shown.length

  /**
   * `shared` gates the `layoutId`s: the inert twin renders the same markup,
   * and a second element claiming the same shared id would fight the panel
   * for the morph.
   */
  const renderBody = (shared) => {
    const Label = shared ? motion.p : "p"
    const Headline = shared ? motion.h3 : "h3"
    // Spread rather than `layoutId={shared ? id : undefined}`: React still
    // warns about the unknown attribute on the plain tags of the twin.
    const shareId = (id) => (shared ? { layoutId: id } : {})
    return (
      <>
        {!lowPower && !reduced && (
          <motion.div
            aria-hidden="true"
            style={{ background: glare, opacity: hovered ? 1 : 0 }}
            className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-300"
          />
        )}

        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <Label
              {...shareId(`stack-label-${cat.label}`)}
              className="font-mono text-xs tracking-widest mb-3"
              style={{ color: "var(--muted)" }}
            >
              <span style={{ color: "var(--accent)" }}>//</span> {cat.label}
            </Label>
            <span
              aria-hidden="true"
              className="font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ color: "var(--accent)" }}
            >
              open ↗
            </span>
          </div>

          <Headline
            {...shareId(`stack-headline-${cat.label}`)}
            className="serif-accent !text-4xl md:!text-5xl"
            style={{ color: "var(--fg)" }}
          >
            {cat.headline}
          </Headline>

          <div className="h-10 my-6">
            <Demo active={demoActive} />
          </div>

          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            {shown.join(" · ")}
            {rest > 0 && <span style={{ color: "var(--accent)" }}> +{rest}</span>}
          </p>
        </div>
      </>
    )
  }

  return (
    <motion.div
      className={cat.lift}
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay: i * 0.08, ease: EASE.ENTER }}
    >
      <motion.div
        animate={{ rotate: flat ? 0 : cat.rot }}
        whileHover={flat ? undefined : { rotate: 0, y: -8 }}
        transition={{ duration: 0.5, ease: EASE.ENTER }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onViewportEnter={() => setSeen(true)}
        onMouseMove={handleMove}
        onMouseLeave={resetTilt}
        style={flat ? {} : { rotateX, rotateY, transformStyle: "preserve-3d", transformPerspective: 900 }}
      >
        {/* While the panel is open the shared element must exist in exactly
            one place, or Framer keeps both visible and the morph reads as a
            copy growing out of a card that never left. Setting `visibility`
            on the card itself does not work — Framer owns its style
            attribute — so the grid slot is held open by an inert twin. */}
        {isOpen ? (
          <div aria-hidden="true" style={{ visibility: "hidden" }} className={CARD_SHELL}>
            {renderBody(false)}
          </div>
        ) : (
          <motion.button
            ref={cardRef}
            type="button"
            layoutId={`stack-card-${cat.label}`}
            onClick={() => onOpen(cat)}
            aria-expanded={false}
            aria-haspopup="dialog"
            data-cursor="Open"
            style={{
              border: "1px solid rgba(255,255,255,0.10)",
              background: "linear-gradient(165deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))",
            }}
            className={`group ${CARD_SHELL} cursor-pointer`}
          >
            {renderBody(true)}
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  )
}

/* ── Expanded panel ─────────────────────────────────────────────────────── */

const TOOLS_IN = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.028, delayChildren: 0.12 } },
}
const TOOL_IN = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE.ENTER } },
}

/**
 * The card, grown. Same `layoutId`s as the collapsed card, so Framer morphs
 * the shell, the eyebrow and the headline from wherever the card sat in the
 * grid — the panel is not a new element appearing, it is the card itself.
 *
 * Portalled to <body>: the section clips its overflow, and a fixed overlay
 * inside it would be cut off. The portal keeps React context, so the shared
 * layout still resolves.
 */
function ExpandedPanel({ cat, onClose, reduced }) {
  const panelRef = useRef(null)
  const closeRef = useRef(null)
  const Demo = DEMOS[cat.demo]
  const matches = filterProjectsBySkills(cat.skills)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose()
        return
      }
      if (e.key !== "Tab") return
      // Keep Tab inside the dialog — behind it sits the whole page.
      const focusable = panelRef.current?.querySelectorAll("button, [href], input, [tabindex]:not([tabindex='-1'])")
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    // The close button rather than the panel: focusing the container trips
    // the global :focus-visible ring and outlines the whole dialog in accent.
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener("keydown", onKey)
    }
  }, [onClose])

  const filterBy = (skills) => {
    window.dispatchEvent(new CustomEvent("filter-projects", { detail: { skills, skill: skills[0] } }))
    onClose()
    document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })
  }

  return createPortal(
    <>
      <motion.div
        className="fixed inset-0 z-[90] bg-black/75 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[91] grid place-items-center p-4 md:p-8 pointer-events-none">
        <motion.div
          layoutId={`stack-card-${cat.label}`}
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={`${cat.headline} — ${cat.label}`}
          style={{
            border: "1px solid rgba(255,255,255,0.14)",
            background: "linear-gradient(165deg, rgba(28,28,31,0.98), rgba(14,14,16,0.98))",
          }}
          className="pointer-events-auto w-full max-w-3xl max-h-[86vh] overflow-y-auto rounded-3xl p-7 md:p-10 outline-none"
        >
          <div className="flex items-start justify-between gap-6">
            <motion.p layoutId={`stack-label-${cat.label}`} className="font-mono text-xs tracking-widest" style={{ color: "var(--muted)" }}>
              <span style={{ color: "var(--accent)" }}>//</span> {cat.label}
            </motion.p>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              data-cursor="Close"
              className="shrink-0 h-9 w-9 rounded-full border grid place-items-center transition-colors"
              style={{ borderColor: "rgba(255,255,255,0.15)", color: "var(--muted)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--fg)" }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--muted)" }}
            >
              ✕
            </button>
          </div>

          <motion.h3 layoutId={`stack-headline-${cat.label}`} className="serif-accent !text-5xl md:!text-7xl mt-2" style={{ color: "var(--fg)" }}>
            {cat.headline}
          </motion.h3>

          <div className="h-12 my-8">
            <Demo active />
          </div>

          <motion.div
            variants={reduced ? undefined : TOOLS_IN}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap gap-2.5"
          >
            {cat.skills.map((skill) => {
              // A tool nothing in the deck is tagged with is shown, but not as
              // a filter: clicking it would land the visitor on an empty grid.
              const n = countProjectsForSkill(skill)
              if (!n) {
                return (
                  <motion.span
                    key={skill}
                    variants={reduced ? undefined : TOOL_IN}
                    className="rounded-full border border-dashed px-3.5 py-1.5 font-mono text-xs"
                    style={{ borderColor: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.35)" }}
                  >
                    {skill}
                  </motion.span>
                )
              }
              return (
                <motion.button
                  key={skill}
                  type="button"
                  variants={reduced ? undefined : TOOL_IN}
                  onClick={() => filterBy([skill])}
                  data-cursor="Filter"
                  title={`${n} project${n === 1 ? "" : "s"} built with ${skill}`}
                  className="rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors"
                  style={{ borderColor: "rgba(255,255,255,0.14)", color: "var(--muted)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--accent-ink)"
                    e.currentTarget.style.background = "var(--accent)"
                    e.currentTarget.style.borderColor = "var(--accent)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--muted)"
                    e.currentTarget.style.background = "transparent"
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"
                  }}
                >
                  {skill}
                  <span className="ml-2" style={{ color: "var(--accent)" }}>{n}</span>
                </motion.button>
              )
            })}
          </motion.div>

          {matches.length > 0 && (
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24, duration: 0.4, ease: EASE.ENTER }}
              className="mt-9 pt-7"
              style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
            >
              <p className="font-mono text-xs tracking-widest mb-4" style={{ color: "var(--muted)" }}>
                <span style={{ color: "var(--accent)" }}>//</span> built with this
              </p>
              <div className="flex flex-col divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                {matches.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => filterBy(p.tags)}
                    data-cursor="View"
                    className="group flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4 py-3 text-left"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <span className="text-lg transition-colors" style={{ color: "var(--fg)" }}>
                      {p.title}
                    </span>
                    <span className="font-mono text-xs sm:text-right" style={{ color: "var(--muted)" }}>
                      {p.tags.join(" · ")}
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => filterBy(cat.skills)}
                data-cursor="View"
                className="mt-6 rounded-full px-5 py-2 font-mono text-xs font-bold transition-transform hover:-translate-y-0.5"
                style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
              >
                see all {matches.length} projects →
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </>,
    document.body
  )
}

export default function SkillsMarquee() {
  const lowPower = useLowPower()
  const reduced = usePrefersReducedMotion()
  const [open, setOpen] = useState(null)
  const close = useCallback(() => setOpen(null), [])

  // Closing remounts the card as a new DOM node, so focus is handed back here
  // rather than from a reference the panel captured on open.
  const cardNodes = useRef({})
  const lastOpened = useRef(null)
  useEffect(() => {
    if (open) {
      lastOpened.current = open.label
      return
    }
    const el = lastOpened.current && cardNodes.current[lastOpened.current]
    lastOpened.current = null
    el?.focus()
  }, [open])

  return (
    <section id="skills" className="relative py-32 px-6 md:px-16 overflow-hidden">
      <LayoutGroup>
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
              <span style={{ color: "var(--accent)" }}>//</span> open a discipline to see every tool and what it built
            </p>
          </div>

          {/* Full-bleed: the wave should run edge to edge, but the section pads
              its content, so it cancels that padding with negative margins. */}
          <div className="-mx-6 mb-16 md:-mx-16">
            <TechWave />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-start">
            {STACK.map((cat, i) => (
              <StackCard
                key={cat.label}
                cat={cat}
                i={i}
                lowPower={lowPower}
                reduced={reduced}
                isOpen={open?.label === cat.label}
                onOpen={setOpen}
                cardRef={(node) => { cardNodes.current[cat.label] = node }}
              />
            ))}
          </div>
        </div>

        <AnimatePresence>
          {open && <ExpandedPanel key={open.label} cat={open} onClose={close} reduced={reduced} />}
        </AnimatePresence>
      </LayoutGroup>
    </section>
  )
}
