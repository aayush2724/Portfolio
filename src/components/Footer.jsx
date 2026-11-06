import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Reveal from "./Reveal"
import { useLowPower, usePrefersReducedMotion } from "../context/motion"

/**
 * Page end: the ghost "Aayush" signature, then the footer with copyright,
 * the live India clock and back-to-top. Both used to sit inside the Contact
 * section; they live here so Achievements can come after Contact and the
 * signature still reads as the last thing on the page.
 */

/** Giant ghosted name that fades and settles in as the page bottoms out. */
function SignatureOutro() {
  const ref = useRef(null)
  const reduced = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  })
  const opacity = useTransform(scrollYProgress, [0, 0.9], [0, 1])
  const y = useTransform(scrollYProgress, [0, 1], [90, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1])

  return (
    <div ref={ref} aria-hidden="true" className="relative overflow-hidden select-none pointer-events-none -mx-6 md:-mx-16">
      <motion.div
        style={reduced ? undefined : { opacity, y, scale }}
        className="font-display font-extrabold uppercase leading-none text-center whitespace-nowrap text-[14vw] tracking-tighter"
      >
        <span
          style={{
            background: "linear-gradient(180deg, rgba(244,244,245,0.14), rgba(244,244,245,0.015))",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Aayush
        </span>
      </motion.div>
    </div>
  )
}

export default function Footer() {
  // Decorative pulses run forever; a phone should not pay for them.
  const lowPower = useLowPower()
  const [time, setTime] = useState("")

  useEffect(() => {
    const updateTime = () => {
      setTime(
        new Date().toLocaleTimeString("en-IN", {
          timeZone: "Asia/Calcutta",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      )
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="relative z-10 px-6 pb-10 md:px-16">
      <div className="mx-auto max-w-6xl 2xl:max-w-[88vw]">
        <SignatureOutro />
        <Reveal delay={0.1}>
          <footer className="flex flex-col items-center justify-between gap-6 border-t pt-12 md:flex-row" style={{ borderColor: "var(--line)" }}>
            {/* Left */}
            <div className="flex flex-col items-center gap-4 text-sm md:flex-row" style={{ color: "var(--muted)" }}>
              <span>© {new Date().getFullYear()} Aayush Kumar</span>
              <span className="hidden md:inline">•</span>
              <span>Built with React, Vite, Framer Motion & Three.js</span>
              <span className="hidden md:inline">•</span>
              <a href="/privacy" className="link-underline transition-colors hover:text-[var(--fg)]">
                Privacy
              </a>
            </div>

            {/* Center - Live Clock */}
            <div className="flex items-center gap-2 font-mono text-sm" style={{ color: "var(--muted)" }}>
              <motion.div
                animate={lowPower ? undefined : { scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                transition={lowPower ? undefined : { duration: 2, repeat: Infinity }}
                className="h-2 w-2 rounded-full"
                style={{ background: "var(--ok)" }}
              />
              <span>India</span>
              <span style={{ color: "var(--accent)" }}>{time}</span>
            </div>

            {/* Right - Back to Top */}
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 font-display text-sm uppercase transition-all duration-300 hover:gap-3"
              style={{ color: "var(--muted)" }}
            >
              Back to Top
              <motion.span
                animate={lowPower ? undefined : { y: [-3, 0, -3] }}
                transition={lowPower ? undefined : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                ↑
              </motion.span>
            </button>
          </footer>
        </Reveal>
      </div>
    </div>
  )
}
