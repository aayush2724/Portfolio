import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Terminal, Block } from "./Terminal"
import AsciiBox from "./AsciiBox"

export default function CaseStudyModal({ caseStudy, isOpen, onClose }) {
  const modalRef = useRef(null)

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) onClose()
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  if (!caseStudy) return null

  const allTags = caseStudy.tags || []
  const hasDemo = caseStudy.links?.demo
  const hasGithub = caseStudy.links?.github

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] overflow-y-auto">
            <div className="min-h-screen px-4 py-8 md:py-16">
              <motion.div
                ref={modalRef}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.98 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative mx-auto max-w-5xl rounded-2xl border border-[var(--line)] bg-[var(--bg)] shadow-2xl"
              >
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute -top-3 -right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] transition-all duration-300 hover:border-[var(--accent)] hover:text-[var(--accent)] hover:rotate-90"
                  aria-label="Close modal"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>

                <div className="max-h-[85vh] overflow-y-auto p-6 md:p-10">
                  {/* Header */}
                  <div className="mb-8">
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <h2 className="font-display text-4xl md:text-5xl uppercase leading-tight">
                        {caseStudy.name}
                      </h2>
                      {caseStudy.badge && (
                        <span className="rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-1 text-xs font-mono text-[var(--accent)]">
                          {caseStudy.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-lg text-[var(--muted)] mb-4">{caseStudy.tagline}</p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {allTags.map((tag, i) => (
                        <span
                          key={i}
                          className="rounded-md border border-[var(--line)] bg-[var(--surface)]/50 px-2.5 py-1 text-xs font-mono text-[var(--muted)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-3">
                      {hasGithub && (
                        <a
                          href={caseStudy.links.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium transition-all duration-300 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                          </svg>
                          View Source
                        </a>
                      )}
                      {hasDemo && (
                        <a
                          href={caseStudy.links.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-ink)] transition-all duration-300 hover:bg-[var(--accent)]/90"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                          </svg>
                          Live Demo
                        </a>
                      )}
                      {!hasDemo && caseStudy.links?.demo_note && (
                        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)]/50 px-5 py-2.5 text-xs text-[var(--muted)] italic">
                          {caseStudy.links.demo_note}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Problem */}
                  <section className="mb-10">
                    <h3 className="mb-4 font-display text-2xl uppercase text-[var(--accent)]">
                      Problem
                    </h3>
                    <AsciiBox label="challenge">
                      <h4 className="mb-3 text-xl font-semibold">{caseStudy.problem.title}</h4>
                      <p className="mb-4 text-[var(--muted)] leading-relaxed">
                        {caseStudy.problem.description}
                      </p>
                      {caseStudy.problem.painPoints && (
                        <ul className="space-y-2">
                          {caseStudy.problem.painPoints.map((point, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-[var(--muted)]">
                              <span className="text-[var(--accent)] mt-1">▸</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </AsciiBox>
                  </section>

                  {/* Approach */}
                  <section className="mb-10">
                    <h3 className="mb-4 font-display text-2xl uppercase text-[var(--accent)]">
                      Solution
                    </h3>
                    <div className="space-y-4">
                      <p className="text-[var(--muted)] leading-relaxed">
                        {caseStudy.approach.description}
                      </p>
                      {caseStudy.approach.keyFeatures && (
                        <div>
                          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--fg)]">
                            Key Features
                          </h4>
                          <ul className="grid gap-2 md:grid-cols-2">
                            {caseStudy.approach.keyFeatures.map((feature, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-[var(--muted)]">
                                <span className="text-[var(--accent)] mt-1">✓</span>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Tech Stack as Terminal */}
                  <section className="mb-10">
                    <h3 className="mb-4 font-display text-2xl uppercase text-[var(--accent)]">
                      Tech Stack
                    </h3>
                    <Terminal title={`${caseStudy.name.toLowerCase().replace(/\s+/g, '-')}/package.json`}>
                      {caseStudy.stack.frontend?.length > 0 && (
                        <Block
                          cmd="cat frontend"
                          out={caseStudy.stack.frontend.join(" · ")}
                        />
                      )}
                      {caseStudy.stack.backend?.length > 0 && (
                        <Block
                          cmd="cat backend"
                          out={caseStudy.stack.backend.join(" · ")}
                        />
                      )}
                      {caseStudy.stack.database?.length > 0 && (
                        <Block
                          cmd="cat database"
                          out={caseStudy.stack.database.join(" · ")}
                        />
                      )}
                      {caseStudy.stack.infrastructure?.length > 0 && (
                        <Block
                          cmd="cat infrastructure"
                          out={caseStudy.stack.infrastructure.join(" · ")}
                        />
                      )}
                      {caseStudy.stack.tools?.length > 0 && (
                        <Block
                          cmd="cat tools"
                          out={caseStudy.stack.tools.join(" · ")}
                        />
                      )}
                    </Terminal>
                  </section>

                  {/* Role */}
                  <section className="mb-10">
                    <h3 className="mb-4 font-display text-2xl uppercase text-[var(--accent)]">
                      My Role
                    </h3>
                    <div className="mb-4 flex flex-wrap gap-6 text-sm">
                      <div>
                        <span className="font-mono text-xs uppercase tracking-wider text-[var(--muted)]">Role</span>
                        <p className="font-semibold">{caseStudy.role.title}</p>
                      </div>
                      <div>
                        <span className="font-mono text-xs uppercase tracking-wider text-[var(--muted)]">Team</span>
                        <p className="font-semibold">{caseStudy.role.teamSize}</p>
                      </div>
                      <div>
                        <span className="font-mono text-xs uppercase tracking-wider text-[var(--muted)]">Duration</span>
                        <p className="font-semibold">{caseStudy.role.duration}</p>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {caseStudy.role.responsibilities.map((resp, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[var(--muted)]">
                          <span className="text-[var(--accent)] mt-1">→</span>
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Outcomes */}
                  <section className="mb-10">
                    <h3 className="mb-4 font-display text-2xl uppercase text-[var(--accent)]">
                      Outcomes & Impact
                    </h3>
                    <AsciiBox label="metrics">
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
                        {caseStudy.outcomes.metrics.map((metric, i) => (
                          <div key={i} className="text-center">
                            <div className="mb-2 font-display text-4xl text-[var(--accent)]">
                              {metric.value}
                            </div>
                            <div className="mb-1 text-sm font-semibold">{metric.label}</div>
                            <div className="text-xs text-[var(--muted)]">{metric.description}</div>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-[var(--muted)] leading-relaxed border-t border-[var(--line)] pt-4">
                        {caseStudy.outcomes.impact}
                      </p>
                    </AsciiBox>
                  </section>

                  {/* Technical Challenges */}
                  {caseStudy.challenges && caseStudy.challenges.length > 0 && (
                    <section>
                      <h3 className="mb-4 font-display text-2xl uppercase text-[var(--accent)]">
                        Technical Challenges
                      </h3>
                      <div className="space-y-4">
                        {caseStudy.challenges.map((item, i) => (
                          <div key={i} className="rounded-lg border border-[var(--line)] bg-[var(--surface)]/30 p-5">
                            <h4 className="mb-2 font-semibold text-[var(--fg)]">
                              {item.challenge}
                            </h4>
                            <p className="text-sm text-[var(--muted)]">
                              <span className="font-mono text-[var(--accent)]">Solution:</span> {item.solution}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                {/* Footer hint */}
                <div className="border-t border-[var(--line)] bg-[var(--surface)]/30 px-6 py-3 text-center">
                  <span className="font-mono text-xs text-[var(--muted)]">
                    Press <kbd className="rounded border border-[var(--line)] px-1.5 py-0.5 font-mono text-[10px]">ESC</kbd> to close
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
