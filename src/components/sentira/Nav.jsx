import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import { Mark, Pill } from "./ui"
import { EASE, DUR } from "../../context/ease"

/**
 * The floating bar. Three things define it in the reference and all three are
 * load-bearing: the wordmark is centred rather than leading, the links sit far
 * left with no container of their own, and the only filled element on the whole
 * bar is the white CTA pill.
 *
 * The centred mark is absolutely positioned instead of living in a 3-column
 * grid — a grid would centre it between the links and the pill, which are
 * different widths, and the mark would sit visibly off-axis.
 */

const LINKS = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Journey", href: "#journey" },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // The mobile sheet takes over the viewport, so the page behind it must not
  // keep scrolling under the user's finger.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 transition-colors duration-500"
        style={{
          background: scrolled ? "rgba(6,6,6,0.82)" : "transparent",
          backdropFilter: scrolled ? "blur(14px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
          borderBottom: `1px solid ${scrolled ? "var(--line)" : "transparent"}`,
        }}
      >
        <div className="relative mx-auto flex h-[68px] max-w-[1400px] items-center px-5 md:px-10">
          {/* Left — links */}
          <nav className="hidden items-center gap-7 md:flex">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="link-underline text-sm transition-opacity duration-300 hover:opacity-100"
                style={{ color: "var(--fg)" }}
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Centre — wordmark, pinned to the true centre of the bar */}
          <a
            href="#hero"
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2"
            aria-label="Aayush Kumar — home"
          >
            <Mark size={21} />
            <span className="font-display text-[26px] leading-none">Aayush</span>
          </a>

          {/* Right — the bar's only filled element */}
          <div className="ml-auto flex items-center gap-3">
            <Pill
              as="a"
              href="#contact"
              className="hidden md:inline-flex !px-4 !py-2 !text-sm"
            >
              Get in touch
            </Pill>

            <button
              onClick={() => setOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full md:hidden"
              style={{ background: "var(--surface-2)", color: "var(--fg)" }}
              aria-label="Open menu"
            >
              <Menu size={17} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: DUR.exit, ease: EASE.EXIT } }}
            transition={{ duration: DUR.enter, ease: EASE.ENTER }}
            className="fixed inset-0 z-[60] flex flex-col px-6 py-6 md:hidden"
            style={{ background: "var(--bg)" }}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Mark size={21} />
                <span className="font-display text-[26px] leading-none">Aayush</span>
              </span>
              <button
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{ background: "var(--surface-2)", color: "var(--fg)" }}
                aria-label="Close menu"
              >
                <X size={17} />
              </button>
            </div>

            <nav className="mt-16 flex flex-col gap-2">
              {[...LINKS, { label: "Contact", href: "#contact" }].map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 + i * 0.05, duration: DUR.enter, ease: EASE.ENTER }}
                  className="font-display text-5xl leading-[1.15]"
                >
                  {l.label}
                </motion.a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
