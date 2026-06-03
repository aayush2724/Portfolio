import { motion } from "framer-motion"

const SKILLS = [
  "React", "TypeScript", "Node.js", "Express", "MongoDB", "PostgreSQL",
  "Python", "FastAPI", "Next.js", "Tailwind CSS", "Three.js", "Framer Motion",
  "Git", "Docker", "AWS", "Firebase", "REST APIs", "GraphQL",
  "Redux", "Socket.io", "JWT", "OAuth", "WebRTC", "Prisma",
  "HTML", "CSS", "JavaScript", "SQL", "NoSQL", "Linux"
]

function MarqueeRow({ skills, direction = "left", duration = 40 }) {
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
        {duplicated.map((skill, i) => (
          <div
            key={i}
            className="inline-flex items-center px-5 py-2.5 rounded-full border text-sm font-medium transition-all duration-300 hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-ink)] hover:scale-105 cursor-default"
            style={{
              borderColor: "var(--line)",
              color: "var(--muted)",
            }}
          >
            {skill}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export default function SkillsMarquee() {
  const row1 = SKILLS.slice(0, 15)
  const row2 = SKILLS.slice(15)

  return (
    <section id="skills" className="relative py-32 overflow-hidden">
      <div className="px-6 md:px-16 mb-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "var(--accent)" }}>
            Tech Stack
          </p>
          <h2 className="font-display text-5xl md:text-7xl uppercase leading-none">
            Skills
          </h2>
        </div>
      </div>

      {/* Row 1 - Left */}
      <MarqueeRow skills={row1} direction="left" duration={35} />
      
      {/* Row 2 - Right */}
      <MarqueeRow skills={row2} direction="right" duration={30} />
    </section>
  )
}
