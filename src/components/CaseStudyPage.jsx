import { useEffect } from "react"
import { motion } from "framer-motion"
import CaseStudyBody from "./CaseStudyBody"
import { caseStudies, getCaseStudyById } from "../data/caseStudies"
import { EASE, DUR } from "../context/ease"

/**
 * Standalone case-study page, served at #/work/:id.
 *
 * The twelve case studies in caseStudies.js are the strongest writing on the
 * site; until now they only existed inside a modal — unlinkable, unshareable,
 * invisible to search. This gives each one a URL that can go in an application
 * or a message, while the modal remains the in-page browsing experience.
 */
export default function CaseStudyPage({ id, onBack }) {
  const caseStudy = getCaseStudyById(id)

  // Title follows the study; restored on exit.
  useEffect(() => {
    if (caseStudy) document.title = `${caseStudy.name} — Aayush Kumar`
    return () => {
      document.title = "Aayush Kumar — Full-Stack Developer & CS Student"
    }
  }, [caseStudy])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  if (!caseStudy) {
    return (
      <main className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-start justify-center gap-6 px-6">
        <p className="font-mono text-sm text-[var(--muted)]">
          $ cat work/{id || "?"}.md
          <br />
          cat: no such case study
        </p>
        <div className="flex flex-wrap gap-2">
          {caseStudies.map((cs) => (
            <a
              key={cs.id}
              href={`#/work/${cs.id}`}
              className="rounded-full border border-[var(--line)] px-4 py-1.5 font-mono text-xs text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              {cs.id}
            </a>
          ))}
        </div>
        <button
          onClick={onBack}
          className="rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-[var(--accent-ink)]"
        >
          ← Back to portfolio
        </button>
      </main>
    )
  }

  return (
    <main className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-24 md:px-10">
      {/* Breadcrumb / back */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DUR.enter, ease: EASE.ENTER }}
        className="mb-10 flex flex-wrap items-center justify-between gap-4"
      >
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-2 font-mono text-sm text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          cd ~/projects
        </button>
        <span className="font-mono text-xs text-[var(--muted)]">
          ~/work/{caseStudy.id}.md
        </span>
      </motion.nav>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DUR.enter, delay: 0.08, ease: EASE.ENTER }}
      >
        <CaseStudyBody caseStudy={caseStudy} />
      </motion.div>

      {/* Prev / next: keep readers moving through the work */}
      <PrevNext currentId={caseStudy.id} />
    </main>
  )
}

function PrevNext({ currentId }) {
  const idx = caseStudies.findIndex((cs) => cs.id === currentId)
  const prev = caseStudies[(idx - 1 + caseStudies.length) % caseStudies.length]
  const next = caseStudies[(idx + 1) % caseStudies.length]

  return (
    <div className="mt-16 grid gap-4 border-t border-[var(--line)] pt-8 sm:grid-cols-2">
      <a
        href={`#/work/${prev.id}`}
        className="group rounded-2xl border border-[var(--line)] p-5 transition-colors hover:border-[var(--accent)]"
      >
        <span className="font-mono text-xs text-[var(--muted)]">← previous</span>
        <p className="mt-1 font-display text-xl uppercase transition-colors group-hover:text-[var(--accent)]">
          {prev.name}
        </p>
      </a>
      <a
        href={`#/work/${next.id}`}
        className="group rounded-2xl border border-[var(--line)] p-5 text-right transition-colors hover:border-[var(--accent)]"
      >
        <span className="font-mono text-xs text-[var(--muted)]">next →</span>
        <p className="mt-1 font-display text-xl uppercase transition-colors group-hover:text-[var(--accent)]">
          {next.name}
        </p>
      </a>
    </div>
  )
}
