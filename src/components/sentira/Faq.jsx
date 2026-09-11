import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X } from "lucide-react"
import Reveal from "../Reveal"
import { Card, Pill, SectionHead } from "./ui"
import { EASE, DUR } from "../../context/ease"
import { usePrefersReducedMotion } from "../../context/motion"

/**
 * Standard disclosure list, then a gradient catch-all card for anything the
 * list missed. The card is the only saturated surface on the page besides the
 * terrain, which is why it works as the last thing before the closing CTA — it
 * breaks the monochrome right when the page needs a lift.
 */

const FAQS = [
  {
    q: "What are you actually looking for right now?",
    a: "Internships and freelance work in full-stack or AI engineering. I'm currently an AI engineering intern building LLM features and RAG pipelines, and I'm open to roles starting after my current term.",
  },
  {
    q: "What does your stack usually look like?",
    a: "React and TypeScript on the front end; Node or FastAPI behind it; MongoDB or Postgres for storage. For AI work, LangChain and vector stores over a FastAPI service. I pick from what a project needs rather than defaulting to one stack.",
  },
  {
    q: "How fast can you turn something around?",
    a: "A working slice inside a week for most scoped features. Hackathon pace when it has to be — the LeadForge backend went from nothing to demo-ready in about eight hours and placed 3rd at NIT Trichy.",
  },
  {
    q: "Do you only do the code, or the design too?",
    a: "Both. This site, AlgoVision and MindFlow are all designed and built by me. I'm comfortable taking a rough brief through interface decisions and into production.",
  },
  {
    q: "What's the OWASP thing about?",
    a: "I'm President of the OWASP student chapter at NIE, where I run security workshops and organise sessions for the chapter. It's also why security review is a habit rather than a checklist item for me.",
  },
  {
    q: "How do I get in touch?",
    a: "Email is fastest, and everything else is linked in the footer. I read everything and reply to anything that isn't a bulk template.",
  },
]

function Item({ item, open, onToggle, id }) {
  const reduced = usePrefersReducedMotion()

  return (
    <Card
      className="overflow-hidden transition-colors duration-300"
      style={{ background: open ? "var(--surface-2)" : "var(--surface)" }}
    >
      <button
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        className="flex w-full items-center gap-6 px-6 py-5 text-left"
      >
        <span className="text-[15px] font-medium">{item.q}</span>
        <span className="ml-auto shrink-0" style={{ color: "var(--muted)" }}>
          {open ? <X size={18} /> : <Plus size={18} />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: DUR.enter, ease: EASE.ENTER }}
            className="overflow-hidden"
          >
            {/* pr-14 keeps the answer clear of the icon column above it */}
            <p
              className="px-6 pb-6 pr-14 text-[15px] leading-[1.65]"
              style={{ color: "var(--muted)" }}
            >
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

export default function Faq() {
  const [openIdx, setOpenIdx] = useState(null)

  return (
    <section id="faq" className="relative px-5 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-[860px]">
        <Reveal>
          <SectionHead
            className="mb-14"
            label="FAQ"
            lines={["Answers to what you're", "probably wondering."]}
          />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="flex flex-col gap-2.5">
            {FAQS.map((f, i) => (
              <Item
                key={f.q}
                id={`faq-${i}`}
                item={f}
                open={openIdx === i}
                onToggle={() => setOpenIdx((cur) => (cur === i ? null : i))}
              />
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div
            className="mt-2.5 flex flex-col gap-6 overflow-hidden rounded-card p-7 sm:flex-row sm:items-center sm:justify-between md:p-8"
            style={{
              background:
                "linear-gradient(105deg, #2f6b52 0%, #4c8f6a 22%, #7c9a64 46%, #b98b4a 74%, #c98f4e 100%)",
            }}
          >
            <div>
              <h3 className="font-display text-[26px] leading-none md:text-[30px]">
                Still have a question
              </h3>
              <p
                className="mt-2 max-w-sm text-sm leading-[1.55]"
                style={{ color: "rgba(255,255,255,0.82)" }}
              >
                Anything I didn't cover here — send it over and I'll get back to
                you quickly.
              </p>
            </div>
            <Pill as="a" href="#contact" className="shrink-0">
              Get in touch
            </Pill>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
