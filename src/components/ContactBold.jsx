import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Reveal from "./Reveal"
import DownloadResumeButton from "./DownloadResumeButton"
import CommandLabel from "./CommandLabel"
import AnimatedHeading from "./AnimatedHeading"
import { useLowPower, usePrefersReducedMotion } from "../context/motion"

/**
 * Ghost signature: the name, huge and barely-there, rising and brightening as
 * the page bottoms out — the site signs itself off. Transform + opacity only.
 */
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

export default function ContactBold() {
  // Decorative pulses/spins run forever; a phone should not pay for them.
  const lowPower = useLowPower()
  const [time, setTime] = useState("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const indiaTime = now.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Calcutta",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      setTime(indiaTime)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <section id="contact" className="relative py-32 px-6 md:px-16">
      <div className="mx-auto max-w-6xl">
        
        {/* Command Label */}
        <Reveal>
          <CommandLabel className="mb-8">./contact --open</CommandLabel>
        </Reveal>

        {/* Framed closing card — the page's single "reach out" moment:
            heading, email, resume and socials on one yaros-style stage. */}
        <Reveal>
          <div
            className="relative overflow-hidden rounded-[2rem] border px-8 py-14 md:px-16 md:py-20 mb-20"
            style={{ borderColor: "var(--line)", background: "#0c0d10" }}
          >
            {/* Light streaks — blur baked into the gradients */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background: [
                  "radial-gradient(40% 130% at 78% 50%, rgba(150,185,220,0.16), transparent 70%)",
                  "radial-gradient(18% 120% at 62% 40%, rgba(190,215,240,0.10), transparent 75%)",
                  "radial-gradient(22% 140% at 90% 60%, rgba(120,155,195,0.12), transparent 70%)",
                ].join(", "),
              }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
              style={{
                background:
                  "radial-gradient(60% 90% at 30% 100%, rgba(165,195,225,0.08), transparent 70%)",
              }}
            />

            <div className="relative z-10">
              <h2 className="font-display text-5xl md:text-7xl uppercase leading-[1.05] mb-10">
                <AnimatedHeading text="Every *great* build" as="span" cinematic className="block" />
                <AnimatedHeading text="starts with a *hello*" as="span" cinematic className="block text-[var(--accent)]" />
              </h2>

              {/* Email */}
              <motion.a
                href="mailto:aayush2615@gmail.com"
                className="inline-block font-display text-2xl md:text-4xl relative group"
                style={{ color: "var(--fg)" }}
                whileHover={{ scale: 1.02 }}
              >
                aayush2615@gmail.com
                <motion.div
                  className="absolute bottom-0 left-0 h-1 rounded-full"
                  style={{ background: "var(--accent)" }}
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </motion.a>

              {/* Download Resume Button */}
              <div className="mt-8">
                <DownloadResumeButton />
              </div>

              {/* Social Links */}
              <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3">
                {[
                  { name: "GitHub", url: "https://github.com/aayush2724" },
                  { name: "LinkedIn", url: "https://linkedin.com/in/aayush2724" },
                  { name: "LeetCode", url: "https://leetcode.com/aayush2724" },
                  { name: "Instagram", url: "https://instagram.com/aayussh.27" }
                ].map((link, i) => (
                  <motion.a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display text-lg uppercase transition-colors link-underline"
                    style={{ color: "var(--muted)" }}
                    whileHover={{ color: "var(--fg)" }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  >
                    {link.name}
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Ghost signature sign-off */}
        <SignatureOutro />

        {/* Footer */}
        <Reveal delay={0.3}>
          <div className="border-t pt-12 flex flex-col md:flex-row items-center justify-between gap-6" style={{ borderColor: "var(--line)" }}>
            
            {/* Left */}
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm" style={{ color: "var(--muted)" }}>
              <span>© 2025 Aayush Kumar</span>
              <span className="hidden md:inline">•</span>
              <span>Built with React, Vite, Framer Motion & Three.js</span>
            </div>

            {/* Center - Live Clock */}
            <div className="flex items-center gap-2 font-mono text-sm" style={{ color: "var(--muted)" }}>
              <motion.div
                animate={lowPower ? undefined : { scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                transition={lowPower ? undefined : { duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full"
                style={{ background: "var(--accent)" }}
              />
              <span>India</span>
              <span style={{ color: "var(--accent)" }}>{time}</span>
            </div>

            {/* Right - Back to Top */}
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 text-sm font-display uppercase transition-all duration-300 hover:gap-3"
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
          </div>
        </Reveal>
      </div>
    </section>
  )
}
