import { useCallback, useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Reveal from "./Reveal"
import CommandLabel from "./CommandLabel"
import AnimatedHeading from "./AnimatedHeading"
import { usePrefersReducedMotion, useLowPower } from "../context/motion"
import { EASE, DUR } from "../context/ease"

const TESTIMONIALS = [
  {
    id: 1,
    name: "Kaki Harshita",
    role: "Hackathon Teammate · Panic-At-The-Deadline",
    text: "Aayush is the kind of teammate who turns chaos into shipped products. During ThinkRoot x Vortex'26, he built the entire LeadForge backend in under 8 hours while I handled the frontend. His ability to stay calm under pressure is unmatched.",
    avatar: "KH",
  },
  {
    id: 2,
    name: "NIE Faculty",
    role: "The National Institute of Engineering, Mysore",
    text: "Aayush consistently demonstrates strong problem-solving skills and a genuine passion for building impactful software. His work on the Citizen Resolver System showed real-world application of full-stack development for civic tech.",
    avatar: "NF",
  },
  {
    id: 3,
    name: "Open Source Contributor",
    role: "GitHub Community",
    text: "I've reviewed several of Aayush's repositories. His code is clean, well-documented, and follows best practices. The AlgoVision project in particular is a great educational resource that makes algorithms accessible.",
    avatar: "OC",
  },
]

const AUTOPLAY_MS = 6500

// Slide direction: +1 → next enters from the right, -1 → prev enters from left.
const variants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 64 : -64 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -64 : 64 }),
}

function Card({ t }) {
  return (
    <figure
      className="rounded-3xl border p-8 md:p-12"
      style={{
        borderColor: "rgba(212, 255, 63, 0.2)",
        background: "rgba(212, 255, 63, 0.05)",
      }}
    >
      <div
        className="font-display text-6xl leading-none mb-4"
        style={{ color: "var(--accent)", opacity: 0.3 }}
        aria-hidden="true"
      >
        "
      </div>
      <blockquote className="text-lg md:text-2xl leading-relaxed mb-8 font-light" style={{ color: "var(--fg)" }}>
        {t.text}
      </blockquote>
      <figcaption className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0"
          style={{ background: "rgba(212, 255, 63, 0.1)", color: "var(--accent)" }}
        >
          {t.avatar}
        </div>
        <div>
          <p className="font-display font-semibold" style={{ color: "var(--fg)" }}>
            {t.name}
          </p>
          <p className="font-mono text-xs" style={{ color: "var(--muted)" }}>
            {t.role}
          </p>
        </div>
      </figcaption>
    </figure>
  )
}

function Arrow({ dir, onClick }) {
  const isPrev = dir < 0
  return (
    <button
      onClick={onClick}
      aria-label={isPrev ? "Previous testimonial" : "Next testimonial"}
      className="flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)]"
      style={{ borderColor: "var(--line)", color: "var(--muted)" }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {isPrev ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
      </svg>
    </button>
  )
}

export default function Testimonials() {
  const [[index, dir], setState] = useState([0, 0])
  const [paused, setPaused] = useState(false)
  const reduced = usePrefersReducedMotion()
  const lowPower = useLowPower()
  const count = TESTIMONIALS.length

  const go = useCallback(
    (dir) => setState(([i]) => [(i + dir + count) % count, dir]),
    [count]
  )
  const goTo = useCallback(
    (next) => setState(([i]) => [next, next > i ? 1 : -1]),
    []
  )

  // Autoplay — pauses on hover/focus, and never runs under reduced motion.
  useEffect(() => {
    if (paused || reduced) return
    const t = setInterval(() => go(1), AUTOPLAY_MS)
    return () => clearInterval(t)
  }, [paused, reduced, go])

  const current = TESTIMONIALS[index]

  return (
    <section id="testimonials" className="relative py-32 px-6 md:px-16">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <Reveal>
          <div className="mb-14">
            <CommandLabel className="mb-6">cat testimonials.md</CommandLabel>
            <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "var(--accent)" }}>
              What People Say
            </p>
            <AnimatedHeading
              text="Testimonials"
              as="h2"
              className="font-display text-5xl md:text-7xl uppercase leading-none"
            />
          </div>
        </Reveal>

        {/* Carousel */}
        <Reveal delay={0.1} fade>
          <div
            className="relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
            role="region"
            aria-roledescription="carousel"
            aria-label="Testimonials"
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") go(-1)
              if (e.key === "ArrowRight") go(1)
            }}
            tabIndex={0}
          >
            {/* Live region announces the current slide for screen readers */}
            <div className="relative overflow-hidden" aria-live="polite">
              {reduced ? (
                <Card t={current} />
              ) : (
                <AnimatePresence mode="wait" custom={dir}>
                  <motion.div
                    key={current.id}
                    custom={dir}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: DUR.enter, ease: EASE.ENTER }}
                    drag={lowPower ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, info) => {
                      if (info.offset.x < -60) go(1)
                      else if (info.offset.x > 60) go(-1)
                    }}
                  >
                    <Card t={current} />
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Controls */}
            <div className="mt-8 flex items-center justify-between">
              <Arrow dir={-1} onClick={() => go(-1)} />

              <div className="flex items-center gap-3" role="tablist" aria-label="Choose testimonial">
                {TESTIMONIALS.map((t, i) => (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={index === i}
                    aria-label={`Testimonial ${i + 1}: ${t.name}`}
                    onClick={() => goTo(i)}
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: index === i ? "28px" : "8px",
                      background: index === i ? "var(--accent)" : "var(--line)",
                    }}
                  />
                ))}
              </div>

              <Arrow dir={1} onClick={() => go(1)} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
