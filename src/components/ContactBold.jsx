import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import emailjs from "@emailjs/browser"
import Reveal from "./Reveal"
import DownloadResumeButton from "./DownloadResumeButton"
import CommandLabel from "./CommandLabel"

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || ""
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || ""
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ""

const useEmailJS = SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY

export default function ContactBold() {
  const [time, setTime] = useState("")
  const [formState, setFormState] = useState({ name: "", email: "", message: "" })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const formRef = useRef(null)

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

  const handleChange = (e) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!formState.name.trim() || !formState.email.trim() || !formState.message.trim()) {
      setError("Please fill in all fields.")
      return
    }

    if (useEmailJS) {
      setSending(true)
      try {
        await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
          from_name: formState.name,
          from_email: formState.email,
          message: formState.message,
        }, PUBLIC_KEY)
        setSent(true)
        setFormState({ name: "", email: "", message: "" })
      } catch {
        setError("Failed to send. Try emailing directly.")
      } finally {
        setSending(false)
      }
    } else {
      const subject = encodeURIComponent(`Portfolio Contact from ${formState.name}`)
      const body = encodeURIComponent(`Name: ${formState.name}\nEmail: ${formState.email}\n\n${formState.message}`)
      window.open(`mailto:aayush2615@gmail.com?subject=${subject}&body=${body}`, "_blank")
      setSent(true)
    }
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

        {/* Contact Form */}
        <Reveal delay={0.1}>
          <div className="max-w-2xl mx-auto mb-20">
            <div className="rounded-3xl border p-8 md:p-10" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
              <div className="flex items-center gap-2 mb-8">
                <div className="w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />
                <span className="font-mono text-xs" style={{ color: "var(--muted)" }}>
                  {useEmailJS ? "Direct message" : "Opens mail client"}
                </span>
              </div>

              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center py-12"
                  >
                    <div className="text-5xl mb-4">✓</div>
                    <h3 className="font-display text-2xl mb-2" style={{ color: "var(--fg)" }}>
                      Message Sent
                    </h3>
                    <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
                      Thanks for reaching out! I'll get back to you soon.
                    </p>
                    <button
                      onClick={() => setSent(false)}
                      className="font-mono text-xs px-4 py-2 rounded-lg border transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      style={{ borderColor: "var(--line)", color: "var(--muted)" }}
                    >
                      Send another
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    ref={formRef}
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block font-mono text-xs mb-2" style={{ color: "var(--muted)" }}>
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formState.name}
                          onChange={handleChange}
                          placeholder="Your name"
                          className="w-full rounded-xl border px-4 py-3 text-sm font-body outline-none transition-colors focus:border-[var(--accent)]"
                          style={{
                            borderColor: "var(--line)",
                            background: "rgba(255,255,255,0.03)",
                            color: "var(--fg)",
                          }}
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs mb-2" style={{ color: "var(--muted)" }}>
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formState.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          className="w-full rounded-xl border px-4 py-3 text-sm font-body outline-none transition-colors focus:border-[var(--accent)]"
                          style={{
                            borderColor: "var(--line)",
                            background: "rgba(255,255,255,0.03)",
                            color: "var(--fg)",
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-mono text-xs mb-2" style={{ color: "var(--muted)" }}>
                        Message
                      </label>
                      <textarea
                        name="message"
                        value={formState.message}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Tell me about your project, idea, or just say hi..."
                        className="w-full rounded-xl border px-4 py-3 text-sm font-body outline-none transition-colors focus:border-[var(--accent)] resize-none"
                        style={{
                          borderColor: "var(--line)",
                          background: "rgba(255,255,255,0.03)",
                          color: "var(--fg)",
                        }}
                      />
                    </div>

                    {error && (
                      <p className="text-xs font-mono" style={{ color: "#ef4444" }}>{error}</p>
                    )}

                    <motion.button
                      type="submit"
                      disabled={sending}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full rounded-xl px-6 py-3.5 text-sm font-semibold uppercase tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: "var(--accent)",
                        color: "var(--accent-ink)",
                      }}
                    >
                      {sending ? "Sending..." : "Send Message"}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Reveal>

        {/* Social Links */}
        <Reveal delay={0.2}>
          <div className="flex flex-wrap justify-center gap-8 mb-20">
            <a
              href="https://github.com/aayush2724"
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-xl uppercase transition-colors link-underline"
              style={{ color: "var(--muted)" }}
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/aayush2724"
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-xl uppercase transition-colors link-underline"
              style={{ color: "var(--muted)" }}
            >
              LinkedIn
            </a>
            <a
              href="https://leetcode.com/aayush2724"
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-xl uppercase transition-colors link-underline"
              style={{ color: "var(--muted)" }}
            >
              LeetCode
            </a>
            <a
              href="https://instagram.com/aayussh.27"
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-xl uppercase transition-colors link-underline"
              style={{ color: "var(--muted)" }}
            >
              Instagram
            </a>
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
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
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
                animate={{ y: [-3, 0, -3] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
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
