import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import AnimatedHeading from "./AnimatedHeading"

const SKILLS = [
  "React", "TypeScript", "Next.js", "Node.js", "Express", "FastAPI",
  "Python", "C++", "MongoDB", "PostgreSQL", "Redis", "Prisma",
  "Framer Motion", "Three.js", "WebSockets", "Socket.io", "JWT", "OAuth",
  "Docker", "Git", "Vercel", "Firebase", "REST APIs", "DSA",
  "Tailwind CSS", "LangChain", "OpenCV", "Bun", "SQL", "Linux"
]

function MarqueeRow({ skills, direction = "left", duration = 40, activeFilter }) {
  // Duplicate items for seamless loop
  const duplicated = [...skills, ...skills]
  
  return (
    <div className="relative overflow-hidden py-4">
      <motion.div
        className="flex gap-4 whitespace-nowrap"
        animate={{
          x: direction === "left" ? [0, -50 + "%"] : [-50 + "%", 0]
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {duplicated.map((skill, i) => {
          const isActive = activeFilter && activeFilter.toLowerCase() === skill.toLowerCase()
          return (
            <div
              key={i}
              onClick={() => {
                if (isActive) {
                  window.dispatchEvent(new CustomEvent('clear-filter'))
                } else {
                  window.dispatchEvent(new CustomEvent('filter-projects', { detail: { skill } }))
                  document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              className="inline-flex items-center px-5 py-2.5 rounded-full border text-sm font-medium transition-all duration-300 hover:scale-105 cursor-pointer"
              style={{
                borderColor: isActive ? "var(--accent)" : "var(--line)",
                backgroundColor: isActive ? "var(--accent)" : "transparent",
                color: isActive ? "var(--accent-ink)" : "var(--muted)",
              }}
            >
              {skill}
            </div>
          )
        })}
      </motion.div>
    </div>
  )
}

export default function SkillsMarquee() {
  const row1 = SKILLS.slice(0, 15)
  const row2 = SKILLS.slice(15)
  
  const [activeFilter, setActiveFilter] = useState(null)

  useEffect(() => {
    const handleFilter = (e) => setActiveFilter(e.detail.skill)
    const handleClear = () => setActiveFilter(null)
    window.addEventListener('filter-projects', handleFilter)
    window.addEventListener('clear-filter', handleClear)
    return () => {
      window.removeEventListener('filter-projects', handleFilter)
      window.removeEventListener('clear-filter', handleClear)
    }
  }, [])

  return (
    <section id="skills" className="relative py-32 overflow-hidden">
      <div className="px-6 md:px-16 mb-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "var(--accent)" }}>
            Tech Stack
          </p>
          <AnimatedHeading
            text="Skills"
            as="h2"
            className="font-display text-5xl md:text-7xl uppercase leading-none"
          />
        </div>
      </div>

      {/* Row 1 - Left */}
      <MarqueeRow skills={row1} direction="left" duration={35} activeFilter={activeFilter} />
      
      {/* Row 2 - Right */}
      <MarqueeRow skills={row2} direction="right" duration={30} activeFilter={activeFilter} />
    </section>
  )
}
