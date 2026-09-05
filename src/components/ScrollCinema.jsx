import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { usePrefersReducedMotion, useLowPower } from "../context/motion"
import Reveal from "./Reveal"

/**
 * Pinned bloom cinema (the yaros.me flower moment). The section pins for
 * ~2.5 screens while scroll drives two things: a flower of light growing out
 * of the floor fog, and a statement brightening word by word through it.
 * Scrubbing backwards closes the bloom again — the scroll is the timeline.
 *
 * Everything animated is transform/opacity; the glow softness is baked into
 * the gradients, so no filters run during the scrub.
 */

const SEGMENTS = [
  { text: "I build where solid engineering meets" },
  { text: "bold design", className: "serif-accent" },
  { text: "— web experiences that feel" },
  { text: "cinematic,", className: "serif-accent text-[var(--accent)]" },
  { text: "run fast, and hold up in production." },
]

function ScrubWord({ progress, range, className, children }) {
  const opacity = useTransform(progress, range, [0.1, 1])
  return (
    <motion.span style={{ opacity }} className={`inline-block mr-[0.3em] ${className || ""}`}>
      {children}
    </motion.span>
  )
}

/** Static markup shared by the reduced-motion and low-power fallbacks. */
function StaticStatement() {
  return (
    <p className="text-2xl md:text-3xl font-light leading-relaxed text-center max-w-3xl mx-auto">
      {SEGMENTS.map((s, i) => (
        <span key={i} className={s.className}>
          {s.text}{" "}
        </span>
      ))}
    </p>
  )
}

export default function ScrollCinema() {
  const ref = useRef(null)
  const reduced = usePrefersReducedMotion()
  const lowPower = useLowPower()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })

  // Bloom choreography: stem rises first, the flower opens over it, the
  // floor glow spreads last. Numbers are section progress, not seconds.
  const stemScale = useTransform(scrollYProgress, [0.04, 0.38], [0, 1])
  const bloomScale = useTransform(scrollYProgress, [0.18, 0.62], [0.35, 1.12])
  const bloomOpacity = useTransform(scrollYProgress, [0.18, 0.5], [0, 1])
  const coreOpacity = useTransform(scrollYProgress, [0.3, 0.6], [0, 0.9])
  const glowOpacity = useTransform(scrollYProgress, [0.32, 0.7], [0, 1])

  if (reduced || lowPower) {
    // Sticky scrub + a dozen live motion values is desktop-budget work; the
    // fallback is one static glow behind the same statement.
    return (
      <section className="relative py-32 px-6 md:px-16 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
          style={{
            background:
              "radial-gradient(55% 80% at 50% 100%, rgba(180,210,240,0.14), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl">
          <Reveal>
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-center mb-8" style={{ color: "var(--muted)" }}>
              The approach
            </p>
            <StaticStatement />
          </Reveal>
        </div>
      </section>
    )
  }

  const words = SEGMENTS.flatMap((s) =>
    s.text
      .split(" ")
      .filter(Boolean)
      .map((w) => ({ w, className: s.className }))
  )
  // The statement scrubs through the middle of the pin, after the stem has
  // risen and before the section releases.
  const T0 = 0.34
  const T1 = 0.9

  return (
    <section ref={ref} className="relative h-[260vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Floor glow */}
        <motion.div
          aria-hidden="true"
          style={{ opacity: glowOpacity }}
          className="absolute inset-x-0 bottom-0 h-[45vh]"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(50% 100% at 50% 100%, rgba(175,205,240,0.22), rgba(175,205,240,0.06) 55%, transparent 75%)",
            }}
          />
        </motion.div>

        {/* Stem rising out of the fog. Positioning lives on plain wrappers:
            Framer writes its own inline transform, which would clobber the
            Tailwind -translate-* centering if both sat on one element. */}
        <div aria-hidden="true" className="absolute left-1/2 bottom-0 w-[2px] h-[42vh] -translate-x-1/2">
          <motion.div
            style={{ scaleY: stemScale }}
            className="absolute inset-0 origin-bottom"
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(200,225,250,0.0), rgba(200,225,250,0.55) 55%, rgba(220,235,255,0.75))",
              }}
            />
          </motion.div>
        </div>

        {/* Bloom */}
        <div aria-hidden="true" className="absolute left-1/2 top-[34%] w-[52vmin] h-[52vmin] -translate-x-1/2 -translate-y-1/2">
          <motion.div
            style={{ scale: bloomScale, opacity: bloomOpacity }}
            className="absolute inset-0 rounded-full"
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(215,232,252,0.4), rgba(165,198,232,0.14) 45%, transparent 70%)",
              }}
            />
          </motion.div>
        </div>
        <div aria-hidden="true" className="absolute left-1/2 top-[34%] w-[9vmin] h-[9vmin] -translate-x-1/2 -translate-y-1/2">
          <motion.div
            style={{ opacity: coreOpacity }}
            className="absolute inset-0 rounded-full"
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(250,252,255,0.85), rgba(220,235,255,0.25) 55%, transparent 75%)",
              }}
            />
          </motion.div>
        </div>

        {/* Statement, scrubbed word by word */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
          <p className="font-mono text-xs tracking-[0.3em] uppercase mb-10" style={{ color: "var(--muted)" }}>
            The approach
          </p>
          <p
            className="text-2xl md:text-4xl font-light leading-relaxed text-center max-w-3xl"
            aria-label={SEGMENTS.map((s) => s.text).join(" ")}
          >
            <span aria-hidden="true">
              {words.map((item, i) => {
                const start = T0 + (i / words.length) * (T1 - T0)
                const end = Math.min(T1, start + (1.5 / words.length) * (T1 - T0))
                return (
                  <ScrubWord key={i} progress={scrollYProgress} range={[start, end]} className={item.className}>
                    {item.w}
                  </ScrubWord>
                )
              })}
            </span>
          </p>
        </div>

        {/* Timeline: fills as the sequence plays */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-40 h-px overflow-hidden" style={{ background: "var(--line)" }}>
          <motion.div
            className="h-full origin-left"
            style={{ scaleX: scrollYProgress, background: "var(--accent)" }}
          />
        </div>
      </div>
    </section>
  )
}
