import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion"
import Reveal from "./Reveal"
import AnimatedHeading from "./AnimatedHeading"
import { usePrefersReducedMotion } from "../context/motion"

const MILESTONES = [
  {
    year: 2023,
    title: "Started Coding Journey",
    description: "Discovered the world of programming. Began learning fundamentals and fell in love with problem-solving.",
    icon: "🎓",
  },
  {
    year: 2024,
    title: "First Projects & Learning",
    description: "Deepened my knowledge in data structures and algorithms. Started exploring web development technologies.",
    icon: "📚",
  },
  {
    year: 2025,
    title: "First Major Projects",
    description: "Built Visitor Management System and ChatRoom app. Learned HTML, PHP, MySQL, and Socket.io. Started shipping real applications.",
    icon: "🚀",
  },
  {
    year: 2025,
    title: "Full-Stack Breakthrough",
    description: "Mastered React, Node.js, and MongoDB. Created Citizen Resolver, Job Portal, and SkillNest platforms. Built end-to-end solutions.",
    icon: "💻",
  },
  {
    year: 2025,
    title: "LeetCode Milestone",
    description: "Crossed 450+ problems solved. Developed strong DSA foundation and competitive programming skills through consistent practice.",
    icon: "🧩",
  },
  {
    year: 2025,
    title: "ML & Advanced Projects",
    description: "Built Chord Detector with ML, Disaster Relief System with real-time features, and LeadForge AI tool. Exploring AI/ML applications.",
    icon: "🤖",
  },
  {
    year: 2026,
    title: "Advanced System Design",
    description: "Built DeskGuard and AlgoVision while focusing on performance, architecture, and production-grade UI engineering.",
    icon: "🛡️",
  },
  {
    year: 2026,
    title: "OWASP Club President",
    description: "Appointed as the President of the OWASP student chapter at NIE. Leading cybersecurity initiatives, organizing workshops, and fostering a community of security enthusiasts.",
    icon: "👑",
  },
  {
    year: 2026,
    title: "Auralis & AI Audio Work",
    description: "Launched Auralis to explore AI-powered audio intelligence and deepen hands-on work with Python, ML workflows, and data pipelines.",
    icon: "🎧",
  },
  {
    year: 2026,
    title: "First Internship — AI Engineer",
    description: "Stepped into industry as an AI engineer intern — building LLM-powered features, RAG pipelines, and agentic workflows, and shipping them to production.",
    icon: "💼",
  },
  {
    year: 2026,
    title: "Current Focus & Goals",
    description: "Building smarter full-stack products that combine strong UX, reliable systems, and practical AI features for real-world impact.",
    icon: "🎯",
  },
]

const YEARS = [2023, 2024, 2025, 2026]

function SectionHeader() {
  return (
    <Reveal>
      <div className="mb-16">
        <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "var(--accent)" }}>
          The Story So Far
        </p>
        <AnimatedHeading
          text="Journey"
          as="h2"
          className="font-display text-5xl md:text-7xl uppercase leading-none"
        />
      </div>
    </Reveal>
  )
}

/**
 * Signature scroll moment: the section pins while vertical scroll drives the
 * milestone cards horizontally. The year rail stays pinned on the left and
 * lights up in --accent as its milestones pass the center.
 */
function HorizontalTimeline() {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const [scrollRange, setScrollRange] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  })

  useEffect(() => {
    const measure = () => {
      if (trackRef.current) {
        const visible = trackRef.current.parentElement?.clientWidth ?? window.innerWidth
        setScrollRange(Math.max(0, trackRef.current.scrollWidth - visible))
      }
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [])

  const x = useTransform(scrollYProgress, [0, 1], [0, -scrollRange])

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(MILESTONES.length - 1, Math.floor(v * MILESTONES.length))
    if (idx !== activeIndex) setActiveIndex(idx)
  })

  const activeYear = MILESTONES[activeIndex].year

  return (
    <section
      id="journey"
      ref={sectionRef}
      className="relative"
      style={{ height: scrollRange ? `calc(100vh + ${scrollRange}px)` : "auto" }}
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden px-6 md:px-16">
        <div className="mx-auto w-full max-w-6xl">
          <SectionHeader />
        </div>

        <div className="flex items-center gap-10 md:gap-16">
          {/* Pinned year rail */}
          <div className="hidden md:flex flex-col gap-4 shrink-0 pl-2">
            {YEARS.map((year) => (
              <motion.div
                key={year}
                className="font-display leading-none cursor-default"
                animate={{
                  color: activeYear === year ? "var(--accent)" : "var(--muted)",
                  fontSize: activeYear === year ? "3rem" : "1.75rem",
                  x: activeYear === year ? 10 : 0,
                  opacity: activeYear === year ? 1 : 0.5,
                }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {year}
              </motion.div>
            ))}
          </div>

          {/* Scroll-driven horizontal track, clipped so cards never slide under the year rail */}
          <div className="flex-1 overflow-hidden py-4 -my-4">
          <motion.div ref={trackRef} style={{ x }} className="flex gap-6 will-change-transform pr-[20vw]">
            {MILESTONES.map((milestone, i) => {
              const isActive = i === activeIndex
              return (
                <motion.article
                  key={i}
                  animate={{
                    borderColor: isActive ? "var(--accent)" : "var(--line)",
                    opacity: isActive ? 1 : 0.55,
                    scale: isActive ? 1 : 0.96,
                  }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="w-[340px] lg:w-[400px] shrink-0 rounded-3xl border p-8 flex flex-col gap-4"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{milestone.icon}</span>
                    <span
                      className="font-display text-lg"
                      style={{ color: isActive ? "var(--accent)" : "var(--muted)" }}
                    >
                      {milestone.year}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl leading-tight" style={{ color: "var(--fg)" }}>
                    {milestone.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                    {milestone.description}
                  </p>
                  <span className="mt-auto font-mono text-xs" style={{ color: "var(--muted)", opacity: 0.6 }}>
                    {String(i + 1).padStart(2, "0")} / {String(MILESTONES.length).padStart(2, "0")}
                  </span>
                </motion.article>
              )
            })}
          </motion.div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mx-auto mt-12 h-px w-full max-w-6xl overflow-hidden" style={{ background: "var(--line)" }}>
          <motion.div
            className="h-full origin-left"
            style={{ background: "var(--accent)", scaleX: scrollYProgress }}
          />
        </div>
      </div>
    </section>
  )
}

/** Fallback for touch devices, small screens, and reduced motion. */
function VerticalTimeline() {
  const [activeYear, setActiveYear] = useState(2023)

  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById("journey")
      if (!section) return

      const rect = section.getBoundingClientRect()
      const scrollProgress = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)))

      const yearIndex = Math.floor(scrollProgress * MILESTONES.length)
      const year = MILESTONES[Math.min(yearIndex, MILESTONES.length - 1)]?.year
      if (year) setActiveYear(year)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section id="journey" className="relative py-32 px-6 md:px-16">
      <div className="mx-auto max-w-6xl">
        <SectionHeader />

        {/* Timeline */}
        <div className="grid md:grid-cols-[200px_1fr] gap-8 md:gap-16">

          {/* Left: Year Sidebar (Sticky on desktop) */}
          <div className="hidden md:block">
            <div className="sticky top-32 space-y-4">
              {YEARS.map((year) => (
                <motion.div
                  key={year}
                  className="font-display text-3xl transition-all duration-300 cursor-default"
                  style={{
                    color: activeYear === year ? "var(--accent)" : "var(--muted)",
                    fontSize: activeYear === year ? "3rem" : "2rem",
                  }}
                  animate={{
                    x: activeYear === year ? 10 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {year}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Milestones */}
          <div className="space-y-12 relative">
            {/* Vertical Line */}
            <div className="absolute left-[19px] top-8 bottom-8 w-px" style={{ background: "var(--line)" }}>
              <motion.div
                className="absolute top-0 left-0 w-full origin-top"
                style={{ background: "var(--accent)" }}
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>

            {MILESTONES.map((milestone, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="flex gap-6 relative">
                  {/* Icon */}
                  <div className="relative z-10 flex-shrink-0">
                    <motion.div
                      className="w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300"
                      style={{
                        borderColor: activeYear === milestone.year ? "var(--accent)" : "var(--line)",
                        background: activeYear === milestone.year ? "var(--accent)" : "var(--bg)",
                      }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <span className="text-lg">{milestone.icon}</span>
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    {/* Mobile Year */}
                    <div className="md:hidden font-display text-xl mb-2" style={{ color: "var(--accent)" }}>
                      {milestone.year}
                    </div>

                    <h3 className="font-display text-2xl mb-2 transition-colors duration-300" style={{
                      color: activeYear === milestone.year ? "var(--fg)" : "var(--muted)"
                    }}>
                      {milestone.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                      {milestone.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function JourneyTimeline() {
  const reduced = usePrefersReducedMotion()
  const [horizontalOk, setHorizontalOk] = useState(false)

  // Pinned horizontal scroll only where it feels right: desktop, mouse, no
  // reduced-motion preference. Everyone else gets the vertical timeline.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px) and (pointer: fine)")
    const update = () => setHorizontalOk(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  return horizontalOk && !reduced ? <HorizontalTimeline /> : <VerticalTimeline />
}
