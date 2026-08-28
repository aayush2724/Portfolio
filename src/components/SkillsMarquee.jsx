import { useState, useEffect } from "react"
import AnimatedHeading from "./AnimatedHeading"

const SKILLS = [
  "React", "TypeScript", "Next.js", "Node.js", "Express", "FastAPI",
  "Python", "C++", "MongoDB", "PostgreSQL", "Redis", "Prisma",
  "Framer Motion", "Three.js", "WebSockets", "Socket.io", "JWT", "OAuth",
  "Docker", "Git", "Vercel", "Firebase", "REST APIs", "DSA",
  "Tailwind CSS", "LangChain", "OpenCV", "Bun", "SQL", "Linux"
]

function MarqueeChip({ skill, isActive }) {
  const toggle = () => {
    if (isActive) {
      window.dispatchEvent(new CustomEvent('clear-filter'))
    } else {
      window.dispatchEvent(new CustomEvent('filter-projects', { detail: { skill } }))
      document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Active chip keeps inline accent colors; idle chips use classes so the
  // hover invert-to-accent can take effect.
  return (
    <button
      type="button"
      onClick={toggle}
      data-cursor="Filter"
      className={
        "inline-flex items-center px-5 py-2.5 rounded-full border text-sm font-medium transition-all duration-300 hover:scale-110 cursor-pointer " +
        (isActive
          ? ""
          : "border-[var(--line)] text-[var(--muted)] bg-transparent hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-ink)]")
      }
      style={
        isActive
          ? {
              borderColor: "var(--accent)",
              backgroundColor: "var(--accent)",
              color: "var(--accent-ink)",
            }
          : undefined
      }
    >
      {skill}
    </button>
  )
}

function MarqueeRow({ skills, direction = "left", duration = 40, activeFilter }) {
  // Two identical halves make the -50% keyframe loop seamless
  const half = (keyPrefix) => (
    <div className="flex gap-4 pr-4 whitespace-nowrap">
      {skills.map((skill) => (
        <MarqueeChip
          key={`${keyPrefix}-${skill}`}
          skill={skill}
          isActive={activeFilter && activeFilter.toLowerCase() === skill.toLowerCase()}
        />
      ))}
    </div>
  )

  return (
    <div className="marquee-row relative overflow-hidden py-4">
      <div
        className={`marquee-track flex w-max ${direction === "right" ? "marquee-reverse" : ""}`}
        style={{ "--marquee-duration": `${duration}s` }}
      >
        {half("a")}
        {half("b")}
      </div>
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
