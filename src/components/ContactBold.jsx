import { motion } from "framer-motion"
import Reveal from "./Reveal"
import DownloadResumeButton from "./DownloadResumeButton"
import SectionHead from "./SectionHead"
import { useIstClock } from "../context/useIstClock"
import AnimatedHeading from "./AnimatedHeading"

/**
 * Ghost signature: the name, huge and barely-there, rising and brightening as
 * the page bottoms out — the site signs itself off. Transform + opacity only.
 */

const LINKS = [
  { name: "GitHub", url: "https://github.com/aayush2724" },
  { name: "LinkedIn", url: "https://linkedin.com/in/aayush2724" },
  { name: "Instagram", url: "https://instagram.com/aayussh.27" },
]

function Row({ label, children }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] items-baseline gap-4 border-b py-4 md:grid-cols-[7.5rem_1fr]" style={{ borderColor: "var(--line)" }}>
      <dt className="font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: "var(--muted)" }}>
        {label}
      </dt>
      <dd style={{ color: "var(--fg)" }}>{children}</dd>
    </div>
  )
}

export default function ContactBold() {
  const time = useIstClock()
  return (
    <section id="contact" className="relative py-32 px-6 md:px-16">
      <div className="mx-auto max-w-6xl 2xl:max-w-[88vw]">
        
        <SectionHead id="contact" path="~/contact" meta="say hello" className="!mb-10" />

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

            <div className="relative z-10 grid gap-14 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-end md:gap-16">
              <div>
                <h2 className="font-display text-5xl md:text-7xl uppercase leading-[1.05] mb-10">
                  <AnimatedHeading text="Every *great* build" as="span" cinematic className="block" />
                  <AnimatedHeading text="starts with a *hello*" as="span" cinematic className="block text-[var(--accent)]" />
                </h2>

                {/* Email */}
                <motion.a
                  href="mailto:aayush2615@gmail.com"
                  className="inline-block font-display text-2xl md:text-4xl relative group break-all"
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

              {/* The particulars, ruled like About's facts */}
              <dl className="border-t text-[15px]" style={{ borderColor: "var(--line)" }}>
                <Row label="Open to">Internships, full-time roles, freelance</Row>
                <Row label="Based in">
                  Mysore, India <span style={{ color: "var(--muted)" }}>· {time} IST</span>
                </Row>
                <Row label="Currently">Backend & AI intern, HSH Technologies</Row>
                <Row label="Elsewhere">
                  <span className="flex flex-wrap gap-x-5 gap-y-1">
                    {LINKS.map((link) => (
                      <a
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-underline transition-colors hover:text-[var(--accent)]"
                      >
                        {link.name} ↗
                      </a>
                    ))}
                  </span>
                </Row>
              </dl>
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  )
}
