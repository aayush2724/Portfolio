import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { EASE, DUR } from "../context/ease"
import CaseStudyBody from "./CaseStudyBody"

export default function CaseStudyModal({ caseStudy, isOpen, onClose, layoutId }) {
  const modalRef = useRef(null)

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) onClose()
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open. overflow:hidden alone is not
  // enough: Lenis drives page scroll from wheel events itself, so scrolling
  // inside the modal kept moving the page behind it. Pause it while open.
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      window.__lenis?.stop()
    } else {
      document.body.style.overflow = ""
      window.__lenis?.start()
    }
    return () => {
      document.body.style.overflow = ""
      window.__lenis?.start()
    }
  }, [isOpen])

  if (!caseStudy) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.exit, ease: EASE.SHARP }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] overflow-y-auto">
            <div className="min-h-screen px-4 py-8 md:py-16">
              {/* Clean fade + scale. A shared-element (layoutId) morph was tried
                  first, but collapsing a tall, scrollable README panel back into
                  a small card reflowed its contents and looked broken — a
                  predictable scale reads far better at this size. */}
              <motion.div
                ref={modalRef}
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: DUR.enter, ease: EASE.ENTER } }}
                exit={{ opacity: 0, y: 12, scale: 0.98, transition: { duration: DUR.exit, ease: EASE.EXIT } }}
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

                <div data-lenis-prevent className="max-h-[85vh] overflow-y-auto p-6 md:p-10">
                  <CaseStudyBody caseStudy={caseStudy} />
                </div>

                {/* Footer: permalink + close hint */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--line)] bg-[var(--surface)]/30 px-6 py-3">
                  {/* Raw project fallbacks (no case-study entry) have numeric
                      ids with no /work route — only real ids get a permalink. */}
                  {typeof caseStudy.id === "string" ? (
                    <a
                      href={`#/work/${caseStudy.id}`}
                      onClick={onClose}
                      className="font-mono text-xs text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
                    >
                      permalink → /work/{caseStudy.id}
                    </a>
                  ) : (
                    <span />
                  )}
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
