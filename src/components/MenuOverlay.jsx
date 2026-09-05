import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePrefersReducedMotion } from "../context/motion"
import { EASE, DUR } from "../context/ease"

const SOCIALS = [
  { label: "GitHub", url: "https://github.com/aayush2724" },
  { label: "LinkedIn", url: "https://linkedin.com/in/aayush2724" },
  { label: "LeetCode", url: "https://leetcode.com/aayush2724" },
  { label: "Instagram", url: "https://instagram.com/aayussh.27" },
]

/**
 * Full-screen menu: a dark panel wipes down over the page, then the links rise
 * out of overflow-hidden clips one by one — the theatre-curtain register.
 * Numbered like an index, socials and email pinned to the bottom edge.
 *
 * Scroll is frozen while open (Lenis pause + overflow lock) so the page can't
 * drift behind the panel.
 */
export default function MenuOverlay({ open, onClose, links, activeSection }) {
  const reduced = usePrefersReducedMotion()

  // Escape closes; scroll locks while open.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    window.__lenis?.stop()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      window.__lenis?.start()
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={reduced ? { opacity: 0 } : { y: "-100%" }}
          animate={reduced ? { opacity: 1 } : { y: 0 }}
          exit={reduced ? { opacity: 0 } : { y: "-100%" }}
          transition={{ duration: DUR.wipe, ease: EASE.WIPE }}
          className="fixed inset-0 z-[70] flex flex-col"
          style={{ background: "var(--bg)" }}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          {/* Faint accent bloom, top-right — depth without a repaint cost */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 40% at 85% 0%, rgba(212, 255, 63, 0.07), transparent 70%)",
            }}
          />

          {/* Top bar */}
          <div className="flex items-center justify-between px-6 md:px-16 py-4">
            <span className="font-display font-bold text-xl" style={{ color: "var(--fg)" }}>
              Aayush
            </span>
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="relative w-9 h-9 flex items-center justify-center transition-colors hover:text-[var(--accent)]"
              style={{ color: "var(--fg)" }}
            >
              <span className="absolute w-5 h-0.5 rounded-full rotate-45" style={{ background: "currentColor" }} />
              <span className="absolute w-5 h-0.5 rounded-full -rotate-45" style={{ background: "currentColor" }} />
            </button>
          </div>

          {/* Links */}
          <nav className="flex-1 flex flex-col justify-center px-6 md:px-16 gap-1 md:gap-2">
            {links.map((l, i) => (
              <div key={l.label} className="overflow-hidden">
                <motion.a
                  href={l.href}
                  onClick={onClose}
                  initial={reduced ? { opacity: 0 } : { y: "110%" }}
                  animate={reduced ? { opacity: 1 } : { y: 0 }}
                  exit={reduced ? { opacity: 0 } : { y: "110%", transition: { duration: DUR.exit, ease: EASE.EXIT } }}
                  transition={{ duration: 0.7, delay: 0.15 + i * 0.06, ease: EASE.ENTER }}
                  className="group flex items-baseline gap-4 md:gap-6 font-display uppercase leading-[1.05] text-5xl md:text-7xl transition-colors duration-300"
                  style={{
                    color: activeSection === l.href ? "var(--accent)" : "var(--fg)",
                  }}
                >
                  <span
                    className="font-mono text-xs md:text-sm tracking-widest transition-colors duration-300 group-hover:text-[var(--accent)]"
                    style={{ color: "var(--muted)" }}
                  >
                    0{i + 1}
                  </span>
                  <span className="transition-transform duration-300 group-hover:translate-x-3 group-hover:text-[var(--accent)]">
                    {l.label}
                  </span>
                </motion.a>
              </div>
            ))}
          </nav>

          {/* Bottom edge: socials + email */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: DUR.exit } }}
            transition={{ duration: DUR.enter, delay: 0.15 + links.length * 0.06, ease: EASE.ENTER }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-6 md:px-16 py-6 border-t"
            style={{ borderColor: "var(--line)" }}
          >
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs uppercase tracking-widest link-underline transition-colors hover:text-[var(--accent)]"
                  style={{ color: "var(--muted)" }}
                >
                  {s.label}
                </a>
              ))}
            </div>
            <a
              href="mailto:aayush2615@gmail.com"
              className="font-mono text-xs tracking-widest transition-colors hover:text-[var(--accent)]"
              style={{ color: "var(--muted)" }}
            >
              aayush2615@gmail.com
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
