import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import Reveal from "./Reveal"

const LEVELS = [
  "rgba(255,255,255,0.03)",
  "rgba(212,255,63,0.15)",
  "rgba(212,255,63,0.35)",
  "rgba(212,255,63,0.6)",
  "rgba(212,255,63,0.9)",
]

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

function generateYearData(totalContributions) {
  const weeks = 52
  const days = 7
  const grid = []
  let remaining = totalContributions

  for (let w = 0; w < weeks; w++) {
    const week = []
    for (let d = 0; d < days; d++) {
      const maxPerDay = Math.min(8, Math.ceil(remaining / (weeks * days - (w * days + d)) * 2.5))
      const rand = Math.random()
      let level
      if (remaining <= 0 || rand < 0.35) {
        level = 0
      } else if (rand < 0.55) {
        level = 1
      } else if (rand < 0.75) {
        level = 2
      } else if (rand < 0.9) {
        level = 3
      } else {
        level = 4
      }
      const contribs = level === 0 ? 0 : Math.min(remaining, Math.ceil(Math.random() * maxPerDay) || 1)
      remaining -= contribs
      week.push({ level, contribs })
    }
    grid.push(week)
  }
  return grid
}

export default function GitHubHeatmap({ totalContributions = 535 }) {
  const [hovered, setHovered] = useState(null)

  const grid = useMemo(() => generateYearData(totalContributions), [totalContributions])

  const monthLabels = useMemo(() => {
    const labels = []
    let lastMonth = -1
    for (let w = 0; w < grid.length; w++) {
      const monthIndex = Math.floor((w / 52) * 12)
      if (monthIndex !== lastMonth) {
        labels.push({ week: w, label: MONTHS[monthIndex] })
        lastMonth = monthIndex
      }
    }
    return labels
  }, [grid])

  return (
    <Reveal delay={0.1}>
      <div className="rounded-3xl border p-6 md:p-8 overflow-x-auto" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">🟩</span>
            <span className="font-display text-sm uppercase tracking-wider" style={{ color: "var(--fg)" }}>
              GitHub Contributions
            </span>
          </div>
          <span className="font-mono text-xs" style={{ color: "var(--muted)" }}>
            {totalContributions} contributions in the last year
          </span>
        </div>

        {/* Month labels */}
        <div className="flex ml-0 mb-1" style={{ paddingLeft: "2px" }}>
          {monthLabels.map((m) => (
            <span
              key={m.week}
              className="font-mono text-[9px] absolute"
              style={{
                color: "var(--muted)",
                left: `${2 + (m.week / 52) * 100}%`,
                opacity: 0.6,
              }}
            >
              {m.label}
            </span>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="mt-5 flex gap-[3px]">
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => (
                <motion.div
                  key={`${wi}-${di}`}
                  className="rounded-[2px] cursor-default relative"
                  style={{
                    width: 11,
                    height: 11,
                    background: LEVELS[day.level],
                  }}
                  whileHover={{ scale: 1.6 }}
                  onMouseEnter={() => setHovered({ w: wi, d: di, contribs: day.contribs })}
                  onMouseLeave={() => setHovered(null)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Tooltip */}
        {hovered && (
          <div
            className="fixed z-50 px-3 py-2 rounded-lg border font-mono text-xs pointer-events-none"
            style={{
              background: "var(--surface)",
              borderColor: "var(--line)",
              color: "var(--fg)",
              top: 0,
              left: 0,
            }}
          >
            <span style={{ color: "var(--accent)" }}>{hovered.contribs}</span> contributions
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4 justify-end">
          <span className="font-mono text-[9px]" style={{ color: "var(--muted)", opacity: 0.6 }}>Less</span>
          {LEVELS.map((color, i) => (
            <div
              key={i}
              className="rounded-[2px]"
              style={{ width: 11, height: 11, background: color }}
            />
          ))}
          <span className="font-mono text-[9px]" style={{ color: "var(--muted)", opacity: 0.6 }}>More</span>
        </div>
      </div>
    </Reveal>
  )
}
