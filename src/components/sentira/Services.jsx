import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Code2, Sparkles, Radio, ShieldCheck, Plus, X } from "lucide-react"
import Reveal from "../Reveal"
import { Pill, SectionHead, Tag } from "./ui"
import { EASE, DUR } from "../../context/ease"
import { usePrefersReducedMotion } from "../../context/motion"

/**
 * The service accordion. One row is always open — this is a single-select
 * disclosure, not a set of independent toggles, which is what lets the closed
 * rows collapse to a bare line and keeps the section from doubling in height.
 *
 * Rows are edge-to-edge with full-bleed hairlines while the content inside them
 * stays on the page grid. That split is most of the reference's editorial feel.
 */

const SERVICES = [
  {
    id: "fullstack",
    icon: Code2,
    name: "Full-Stack Engineering",
    tags: ["React", "Node.js", "TypeScript"],
    image: "/civicresolve-800.jpg",
    body: "I build the whole slice — typed React front ends, Node and Python services behind them, and schemas that don't need rewriting in three months. Citizen Resolver and SkillNest both went from empty repo to deployed this way.",
  },
  {
    id: "ai",
    icon: Sparkles,
    name: "AI & LLM Systems",
    tags: ["RAG", "LangChain", "FastAPI"],
    image: "/auralis-800.jpg",
    body: "Retrieval pipelines, agentic workflows and LLM features that survive contact with real inputs. Auralis does audio intelligence end to end; LeadForge automates B2B prospect discovery and took 3rd at NIT Trichy.",
  },
  {
    id: "realtime",
    icon: Radio,
    name: "Real-Time & Systems",
    tags: ["WebSockets", "OpenCV", "Redis"],
    image: "/deskguard-800.jpg",
    body: "Low-latency work where the delay is the product. DeskGuard watches a workspace and alerts on intrusion in real time; CheckMate runs multiplayer chess over WebSockets with full FEN-based move validation.",
  },
  {
    id: "security",
    icon: ShieldCheck,
    name: "Security & Algorithms",
    tags: ["OWASP", "C++", "DSA"],
    image: "/mindflow-800.jpg",
    body: "President of the OWASP student chapter at NIE, running workshops and security initiatives. Underneath that, 726+ problems in C++ — the reason the systems above hold up when the input stops being friendly.",
  },
]

function Row({ service, index, open, onToggle }) {
  const Icon = service.icon
  const reduced = usePrefersReducedMotion()

  return (
    <div style={{ borderTop: "1px solid var(--line)" }}>
      <div className="mx-auto max-w-[1180px] px-5 md:px-10">
        {/* Header line — the whole line is the hit target */}
        <button
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`svc-${service.id}`}
          className="flex w-full items-center gap-4 py-6 text-left transition-opacity duration-300 md:py-7"
          style={{ opacity: open ? 1 : 0.55 }}
        >
          <Icon size={24} strokeWidth={1.5} className="shrink-0" />

          <span className="font-display text-[26px] leading-none md:text-[34px]">
            {service.name}
          </span>
          <span className="index-sup">{String(index + 1).padStart(2, "0")}</span>

          <span className="ml-auto hidden items-center gap-2 lg:flex">
            {service.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </span>

          <span
            className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-300 lg:ml-3"
            style={{
              background: open ? "var(--invert-bg)" : "var(--surface-2)",
              color: open ? "var(--invert-fg)" : "var(--fg)",
            }}
          >
            {open ? <X size={16} /> : <Plus size={16} />}
          </span>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={`svc-${service.id}`}
              initial={reduced ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: DUR.enter, ease: EASE.ENTER }}
              className="overflow-hidden"
            >
              <div className="grid gap-6 pb-10 md:grid-cols-[1.15fr_1fr] md:gap-10">
                <div
                  className="relative aspect-[16/10] overflow-hidden rounded-card"
                  style={{ background: "var(--surface)" }}
                >
                  <img
                    src={service.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Copy is bottom-aligned so it settles against the image's
                    lower edge rather than floating at the top of a tall cell. */}
                <div className="flex flex-col justify-end gap-6">
                  <p
                    className="max-w-md text-[15px] leading-[1.65]"
                    style={{ color: "var(--muted)" }}
                  >
                    {service.body}
                  </p>
                  <Pill as="a" href="#work" className="w-full justify-center">
                    See it in the work
                  </Pill>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function Services() {
  const [openId, setOpenId] = useState(SERVICES[0].id)

  return (
    <section id="services" className="relative py-28 md:py-36">
      <Reveal>
        <div className="mx-auto mb-16 max-w-[1180px] px-5 md:px-10">
          <SectionHead
            label="What I do"
            lines={["From rough idea to", "something that ships."]}
          />
        </div>
      </Reveal>

      <div style={{ borderBottom: "1px solid var(--line)" }}>
        {SERVICES.map((s, i) => (
          <Row
            key={s.id}
            service={s}
            index={i}
            open={openId === s.id}
            /* Clicking the open row closes it — collapsing every row is a valid
               state here, and forcing one open makes the control feel stuck. */
            onToggle={() => setOpenId((cur) => (cur === s.id ? null : s.id))}
          />
        ))}
      </div>
    </section>
  )
}
