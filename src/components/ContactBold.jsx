import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Reveal from "./Reveal"
import DownloadResumeButton from "./DownloadResumeButton"
import CommandLabel from "./CommandLabel"
import AnimatedHeading from "./AnimatedHeading"
import { useLowPower } from "../context/motion"

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

        {/* Main CTA */}
        <Reveal>
          <div className="text-center mb-20">
            <h2 className="font-display text-6xl md:text-8xl lg:text-9xl uppercase leading-none mb-8">
              Let's Build{" "}
              <span style={{ color: "var(--accent)" }}>Something</span>
            </h2>
            
            {/* Email */}
            <motion.a
              href="mailto:aayush2615@gmail.com"
              className="inline-block font-display text-3xl md:text-5xl relative group mb-8"
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
          </div>
        </Reveal>

        {/* Social Links */}
        <Reveal delay={0.2}>
          <div className="flex flex-wrap justify-center gap-8 mb-20">
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
                className="font-display text-xl uppercase transition-colors link-underline px-4 py-2 rounded-xl relative overflow-hidden group"
                style={{ color: "var(--muted)" }}
                whileHover={{ scale: 1.1, color: "var(--fg)" }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <motion.div 
                  className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10 rounded-xl"
                  layoutId={`hover-bg-${link.name}`}
                />
                {link.name}
              </motion.a>
            ))}
          </div>
        </Reveal>

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
