import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Reveal from "./Reveal"
import CountUp from "./CountUp"
import CommandLabel from "./CommandLabel"
import AsciiBox from "./AsciiBox"
import AnimatedHeading from "./AnimatedHeading"
import GitHubHeatmap from "./GitHubHeatmap"
import { fetchLeetCodeStats } from "../data/leetcodeapi"
import portfolioData from "../data/portfolioData.json"
import { useLowPower } from "../context/motion"

async function fetchGitHubContributions(username) {
  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}`)
    if (!res.ok) return null
    const data = await res.json()
    return data.total?.['2026'] || data.total?.['2025'] || null
  } catch {
    return null
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function CodingStatsBold() {
  // Decorative pulses/spins run forever; a phone should not pay for them.
  const lowPower = useLowPower()
  const [stats, setStats] = useState({
    leetcode: {
      total: portfolioData.leetcode?.stats?.totalSolved || 400,
    },
    github: {
      contributions: portfolioData.githubStats?.contributions || 223,
      repos: portfolioData.github?.length || 12,
    },
    streak: {
      current: portfolioData.leetcode?.streak || 25,
    }
  })

  useEffect(() => {
    const getStats = async () => {
      const [lc, ghContribs] = await Promise.all([
        fetchLeetCodeStats("aayush2724"),
        fetchGitHubContributions("aayush2724")
      ])

      if (lc && lc.stats) {
        setStats(prev => ({
          ...prev,
          leetcode: {
            total: Math.max(lc.stats.totalSolved, 400),
          },
          streak: {
            current: lc.streak,
          },
          github: {
            ...prev.github,
            contributions: ghContribs || prev.github.contributions
          }
        }))
      }
    }
    getStats()
  }, [])

  return (
    <section id="stats" className="relative py-32 px-6 md:px-16 overflow-hidden">
      <div className="mx-auto max-w-6xl">
        
        {/* Header */}
        <Reveal>
          <div className="mb-16">
            <CommandLabel className="mb-3">cat ~/stats.json</CommandLabel>
            <AnimatedHeading
              text="Coding Stats"
              decode
              as="h2"
              className="font-display text-5xl md:text-7xl uppercase leading-none"
            />
          </div>
        </Reveal>

        {/* Stats Grid wrapped in AsciiBox */}
        <AsciiBox label="metrics" className="mb-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
            className="grid md:grid-cols-3 gap-8"
          >
          
          {/* LeetCode */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="border rounded-3xl p-8 group hover:border-[var(--accent)] transition-all duration-300 relative overflow-hidden" 
            style={{ borderColor: "var(--line)" }}
          >
            <motion.div 
              className="absolute -right-10 -top-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity"
              animate={lowPower ? undefined : { rotate: 360 }}
              transition={lowPower ? undefined : { duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <svg width="150" height="150" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 22h20L12 2z"/>
              </svg>
            </motion.div>
            
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <motion.div 
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 rounded-full flex items-center justify-center" 
                style={{ background: "rgba(212, 255, 63, 0.1)" }}
              >
                <span className="text-xl">🧩</span>
              </motion.div>
              <h3 className="font-display text-xl uppercase" style={{ color: "var(--fg)" }}>DSA Stats</h3>
            </div>
            
            <div className="font-display text-5xl mb-6 group-hover:text-[var(--accent)] transition-colors relative z-10" style={{ color: "var(--fg)" }}>
              <CountUp end={stats.leetcode.total} suffix="+" />
            </div>

            <p className="text-sm mb-4 relative z-10" style={{ color: "var(--muted)" }}>Consistency & problem solving</p>

            <p className="text-base font-semibold mb-5 relative z-10" style={{ color: "var(--fg)" }}>
              "I don't count the days. I make the days count."
            </p>

            {/* Topics Covered */}
            <div className="flex flex-wrap gap-2 relative z-10">
              {["Trees", "Graphs", "DP", "Sliding Window", "Backtracking", "Binary Search", "Stacks", "Tries"].map((topic, i) => (
                <motion.span
                  key={topic}
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(212,255,63,0.15)" }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border cursor-default"
                  style={{
                    color: "var(--accent)",
                    borderColor: "rgba(212,255,63,0.2)",
                    background: "rgba(212,255,63,0.05)",
                  }}
                >
                  {topic}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* GitHub */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="border rounded-3xl p-8 group hover:border-white transition-all duration-300 relative overflow-hidden" 
            style={{ borderColor: "var(--line)" }}
          >
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <motion.div 
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                </svg>
              </motion.div>
              <h3 className="font-display text-xl uppercase" style={{ color: "var(--fg)" }}>Open Source</h3>
            </div>
            
            <div className="font-display text-5xl mb-2 group-hover:text-white transition-colors relative z-10" style={{ color: "var(--fg)" }}>
              <CountUp end={stats.github.contributions} suffix="+" />
            </div>
            <p className="text-sm font-mono tracking-widest uppercase mb-6 relative z-10" style={{ color: "var(--muted)" }}>Contributions</p>

            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="border rounded-2xl p-4 bg-white/5 border-white/10">
                <div className="font-display text-2xl" style={{ color: "var(--fg)" }}>
                  <CountUp end={stats.github.repos} />
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>Repositories</div>
              </div>
              <div className="border rounded-2xl p-4 bg-white/5 border-white/10">
                <div className="font-display text-2xl" style={{ color: "var(--fg)" }}>
                  <CountUp end={28} />
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>Stars Earned</div>
              </div>
            </div>
          </motion.div>

          {/* Activity Streak */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="border rounded-3xl p-8 group hover:border-[#ff9900] transition-all duration-300 relative overflow-hidden" 
            style={{ borderColor: "var(--line)" }}
          >
            <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="text-[150px]">🔥</span>
            </div>

            <div className="flex items-center gap-3 mb-4 relative z-10">
              <motion.div 
                animate={lowPower ? undefined : { scale: [1, 1.1, 1] }}
                transition={lowPower ? undefined : { duration: 2, repeat: Infinity }}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-[#ff9900]/10"
              >
                <span className="text-xl">🔥</span>
              </motion.div>
              <h3 className="font-display text-xl uppercase" style={{ color: "var(--fg)" }}>Consistency</h3>
            </div>
            
            <div className="font-display text-5xl mb-2 group-hover:text-[#ff9900] transition-colors relative z-10" style={{ color: "var(--fg)" }}>
              <CountUp end={stats.streak.current} suffix=" Days" />
            </div>
            <p className="text-sm font-mono tracking-widest uppercase mb-6 relative z-10" style={{ color: "var(--muted)" }}>Current Streak</p>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--line)" }}>
                <span className="text-sm" style={{ color: "var(--muted)" }}>Longest Streak</span>
                <span className="font-display text-lg" style={{ color: "var(--fg)" }}>42 Days</span>
              </div>
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--line)" }}>
                <span className="text-sm" style={{ color: "var(--muted)" }}>Active Days</span>
                <span className="font-display text-lg" style={{ color: "var(--fg)" }}>
                  <CountUp end={285} />
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "var(--muted)" }}>Commitment</span>
                <span className="text-xs px-2 py-1 rounded border border-[#ff9900]/30 text-[#ff9900] bg-[#ff9900]/10">Unstoppable</span>
              </div>
            </div>
          </motion.div>

          </motion.div>
        </AsciiBox>

        {/* GitHub Heatmap */}
        <Reveal delay={0.4}>
          <GitHubHeatmap totalContributions={stats.github.contributions} />
        </Reveal>

        {/* Optional: Profile Links */}
        <Reveal delay={0.4}>
          <div className="flex justify-center gap-4 mt-8">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://leetcode.com/aayush2724"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-all duration-300 hover:border-[var(--accent)] hover:text-[var(--accent)]"
              style={{ borderColor: "var(--line)", color: "var(--muted)" }}
            >
              View LeetCode Profile →
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://github.com/aayush2724"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-all duration-300 hover:border-[var(--accent)] hover:text-[var(--accent)]"
              style={{ borderColor: "var(--line)", color: "var(--muted)" }}
            >
              View GitHub Profile →
            </motion.a>
          </div>
        </Reveal>

      </div>
    </section>
  )
}
