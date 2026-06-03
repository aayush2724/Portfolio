import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import Reveal from "./Reveal"

function CountUp({ end, duration = 2, suffix = "", prefix = "" }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  useEffect(() => {
    if (!isInView) return
    
    let startTime
    let animationFrame

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      
      // Easing function
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(easeOut * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [isInView, end, duration])

  return (
    <span ref={ref}>
      {prefix}{count}{suffix}
    </span>
  )
}

export default function CodingStatsBold() {
  const [stats] = useState({
    leetcode: {
      total: 403,
      easy: 188,
      medium: 192,
      hard: 23,
    },
    github: {
      contributions: 217, // totalActiveDays from data
      repos: 12,
    },
    streak: {
      current: 25,
    }
  })

  const easyPercent = (stats.leetcode.easy / stats.leetcode.total) * 100
  const mediumPercent = (stats.leetcode.medium / stats.leetcode.total) * 100
  const hardPercent = (stats.leetcode.hard / stats.leetcode.total) * 100

  return (
    <section id="stats" className="relative py-32 px-6 md:px-16">
      <div className="mx-auto max-w-6xl">
        
        {/* Header */}
        <Reveal>
          <div className="mb-16">
            <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "var(--accent)" }}>
              By The Numbers
            </p>
            <h2 className="font-display text-5xl md:text-7xl uppercase leading-none">
              Coding Stats
            </h2>
          </div>
        </Reveal>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* LeetCode */}
          <Reveal delay={0.1}>
            <div className="border rounded-3xl p-8 group hover:border-[var(--accent)] transition-all duration-300" style={{ borderColor: "var(--line)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(212, 255, 63, 0.1)" }}>
                  <span className="text-xl">🧩</span>
                </div>
                <h3 className="font-display text-xl uppercase" style={{ color: "var(--fg)" }}>LeetCode</h3>
              </div>
              
              <div className="font-display text-5xl mb-6 group-hover:text-[var(--accent)] transition-colors" style={{ color: "var(--fg)" }}>
                <CountUp end={stats.leetcode.total} />
              </div>

              <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Problems solved</p>

              {/* Difficulty Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: "var(--muted)" }}>Easy</span>
                  <span style={{ color: "var(--fg)" }}>{stats.leetcode.easy}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: "var(--muted)" }}>Medium</span>
                  <span style={{ color: "var(--fg)" }}>{stats.leetcode.medium}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: "var(--muted)" }}>Hard</span>
                  <span style={{ color: "var(--fg)" }}>{stats.leetcode.hard}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6 h-2 rounded-full overflow-hidden flex" style={{ background: "var(--surface)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${easyPercent}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 }}
                  style={{ background: "rgba(212, 255, 63, 0.6)" }}
                />
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${mediumPercent}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.6 }}
                  style={{ background: "rgba(212, 255, 63, 0.8)" }}
                />
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${hardPercent}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.7 }}
                  style={{ background: "var(--accent)" }}
                />
              </div>
            </div>
          </Reveal>

          {/* GitHub */}
          <Reveal delay={0.2}>
            <div className="border rounded-3xl p-8 group hover:border-[var(--accent)] transition-all duration-300" style={{ borderColor: "var(--line)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(212, 255, 63, 0.1)" }}>
                  <span className="text-xl">🐙</span>
                </div>
                <h3 className="font-display text-xl uppercase" style={{ color: "var(--fg)" }}>GitHub</h3>
              </div>
              
              <div className="font-display text-5xl mb-6 group-hover:text-[var(--accent)] transition-colors" style={{ color: "var(--fg)" }}>
                <CountUp end={stats.github.contributions} />
              </div>

              <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Active coding days this year</p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
                  <span>🟢</span>
                  <span>{stats.github.repos}+ Public repositories</span>
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
                  <span>⭐</span>
                  <span>Active open source contributor</span>
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
                  <span>🔥</span>
                  <span>Daily commit streak</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Streak */}
          <Reveal delay={0.3}>
            <div className="border rounded-3xl p-8 group hover:border-[var(--accent)] transition-all duration-300" style={{ borderColor: "var(--line)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(212, 255, 63, 0.1)" }}>
                  <span className="text-xl">🔥</span>
                </div>
                <h3 className="font-display text-xl uppercase" style={{ color: "var(--fg)" }}>Streak</h3>
              </div>
              
              <div className="font-display text-5xl mb-6 group-hover:text-[var(--accent)] transition-colors" style={{ color: "var(--fg)" }}>
                <CountUp end={stats.streak.current} />
              </div>

              <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Days coding consistently</p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
                  <span>📅</span>
                  <span>Daily problem solving</span>
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
                  <span>💪</span>
                  <span>Consistent practice</span>
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
                  <span>🎯</span>
                  <span>Never skip a day</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Optional: Profile Links */}
        <Reveal delay={0.4}>
          <div className="mt-12 flex flex-wrap gap-4 justify-center">
            <a
              href="https://leetcode.com/aayush2717"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-all duration-300 hover:border-[var(--accent)] hover:text-[var(--accent)]"
              style={{ borderColor: "var(--line)", color: "var(--muted)" }}
            >
              View LeetCode Profile →
            </a>
            <a
              href="https://github.com/aayush2724"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-all duration-300 hover:border-[var(--accent)] hover:text-[var(--accent)]"
              style={{ borderColor: "var(--line)", color: "var(--muted)" }}
            >
              View GitHub Profile →
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
