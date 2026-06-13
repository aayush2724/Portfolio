import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Reveal from "./Reveal"

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
    description: "Built DeskGuard and AlgoVision. Focused on building highly performant and scalable web applications with advanced security features.",
    icon: "🛡️",
  },
  {
    year: 2026,
    title: "Current Focus & Goals",
    description: "Deepening expertise in full-stack architecture and AI integration. Actively seeking opportunities to build impactful software at scale.",
    icon: "🎯",
  },
]

export default function JourneyTimeline() {
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

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const years = [2023, 2024, 2025, 2026]

  return (
    <section id="journey" className="relative py-32 px-6 md:px-16">
      <div className="mx-auto max-w-6xl">
        
        {/* Header */}
        <Reveal>
          <div className="mb-16">
            <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "var(--accent)" }}>
              The Story So Far
            </p>
            <h2 className="font-display text-5xl md:text-7xl uppercase leading-none">
              Journey
            </h2>
          </div>
        </Reveal>

        {/* Timeline */}
        <div className="grid md:grid-cols-[200px_1fr] gap-8 md:gap-16">
          
          {/* Left: Year Sidebar (Sticky on desktop) */}
          <div className="hidden md:block">
            <div className="sticky top-32 space-y-4">
              {years.map((year) => (
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
                viewport={{ once: false, margin: "-20%" }}
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
