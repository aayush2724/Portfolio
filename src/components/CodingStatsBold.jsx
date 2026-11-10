import { useEffect, useMemo, useState } from "react"
import {
  LEETCODE_SOLVED,
  LEETCODE_SPLIT,
  LEETCODE_ACTIVE_DAYS,
  LEETCODE_STREAK,
  REPO_COUNT,
  CONTRIBUTIONS,
  CONTRIBUTION_CALENDAR,
  LEETCODE_CALENDAR,
} from "../data/stats"
import Reveal from "./Reveal"
import CountUp from "./CountUp"
import SectionHead from "./SectionHead"
import ActivityHeatmap from "./ActivityHeatmap"
import { normalizeCalendar } from "../data/contributions"

/**
 * Live contribution calendar for the last 365 days. The synced JSON already
 * renders a real grid on first paint; this refreshes it with today's activity.
 * Times out after 20s so a dead third party never holds a request open for the
 * life of the page — the synced numbers are already on screen. The budget is
 * generous on purpose: on a weak GPU the WebGL backdrop can block the main
 * thread for several seconds right after load, and a response that arrived
 * during that stall must still be processed rather than aborted.
 */
async function fetchGitHubContributions(username) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20000)
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
      { signal: controller.signal }
    )
    if (!res.ok) return null
    const data = await res.json()
    const total = data.total?.lastYear || null
    const days = Array.isArray(data.contributions) ? data.contributions : null
    return total || days ? { total, days } : null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

const TOPICS = ["Trees", "Graphs", "DP", "Sliding window", "Backtracking", "Binary search", "Stacks", "Tries"]
const MAPS = [
  { key: "github", label: "GitHub" },
  { key: "leetcode", label: "LeetCode" },
]

/** One figure in the strip: index + label rail, the number, its breakdown. */
function Figure({ n, label, i, children }) {
  return (
    <Reveal delay={i * 0.08} className="h-full">
      <div
        className={`h-full py-10 ${i ? "border-t md:border-l md:border-t-0 md:pl-10" : ""} ${i < 2 ? "md:pr-10" : ""}`}
        style={{ borderColor: "var(--line)" }}
      >
        <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
          <span style={{ color: "var(--accent)" }}>{n}</span>
          {label}
        </p>
        {children}
      </div>
    </Reveal>
  )
}

const Big = ({ children }) => (
  <div className="mt-6 font-display leading-none tracking-tight text-[clamp(3.5rem,6.5vw,6.5rem)]" style={{ color: "var(--fg)" }}>
    {children}
  </div>
)

const Sub = ({ children }) => (
  <p className="mt-4 text-sm md:text-[15px]" style={{ color: "var(--muted)" }}>
    {children}
  </p>
)

export default function CodingStatsBold() {
  // LeetCode numbers come straight from the synced JSON. They are NOT fetched
  // from the browser: leetcode.com/graphql sends no CORS headers, so that
  // request failed on every visit and only ever fell back to the same JSON —
  // while still sending each visitor's IP to LeetCode for nothing.
  const [map, setMap] = useState("github")
  const [stats, setStats] = useState({
    github: {
      contributions: CONTRIBUTIONS,
      calendar: CONTRIBUTION_CALENDAR,
      repos: REPO_COUNT,
    },
  })

  useEffect(() => {
    let cancelled = false
    fetchGitHubContributions("aayush2724").then((gh) => {
      if (cancelled || !gh) return
      setStats((prev) => ({
        ...prev,
        github: {
          ...prev.github,
          contributions: gh.total || prev.github.contributions,
          calendar: gh.days || prev.github.calendar,
        },
      }))
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Days with at least one contribution in the calendar on screen — a number
  // the data actually backs, unlike the hand-typed figure it replaces.
  const githubActiveDays = useMemo(() => {
    const days = normalizeCalendar(stats.github.calendar)?.days ?? {}
    return Object.values(days).filter(Boolean).length
  }, [stats.github.calendar])

  return (
    <section id="stats" className="relative py-32 px-6 md:px-16 overflow-hidden">
      <div className="mx-auto max-w-6xl 2xl:max-w-[88vw]">
        
        <SectionHead id="stats" path="~/stats.json" meta="synced daily" title="Coding *stats*" />

        {/* Three figures on a rule — the numbers are the design */}
        <div className="grid border-y md:grid-cols-3" style={{ borderColor: "var(--line)" }}>
          <Figure n="01" label="Problems solved" i={0}>
            <Big>
              <CountUp end={LEETCODE_SOLVED} suffix="+" />
            </Big>
            <Sub>
              Easy {LEETCODE_SPLIT.easy} · Medium {LEETCODE_SPLIT.medium} · Hard {LEETCODE_SPLIT.hard}
            </Sub>
            <p className="mt-4 font-mono text-[11px] uppercase leading-relaxed tracking-[0.14em]" style={{ color: "var(--muted)" }}>
              {TOPICS.join(" · ")}
            </p>
          </Figure>
          <Figure n="02" label="Contributions, last 12 months" i={1}>
            <Big>
              <CountUp end={stats.github.contributions} suffix="+" />
            </Big>
            <Sub>
              {stats.github.repos} public repos · {githubActiveDays} active days
            </Sub>
          </Figure>
          <Figure n="03" label="Day LeetCode streak" i={2}>
            <Big>
              <CountUp end={LEETCODE_STREAK} />
            </Big>
            <Sub>{LEETCODE_ACTIVE_DAYS} active days in total</Sub>
          </Figure>
        </div>

        {/* One activity map, two sources */}
        <Reveal delay={0.2}>
          <div className="mt-14 flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2" role="group" aria-label="Activity source">
              {MAPS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  aria-pressed={map === m.key}
                  onClick={() => setMap(m.key)}
                  className="rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors"
                  style={
                    map === m.key
                      ? { borderColor: "var(--accent)", color: "var(--accent)" }
                      : { borderColor: "var(--line)", color: "var(--muted)" }
                  }
                >
                  {m.label}
                </button>
              ))}
            </div>
            <a
              href="https://github.com/aayush2724"
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline font-mono text-[11px] uppercase tracking-[0.16em] transition-colors hover:text-[var(--fg)]"
              style={{ color: "var(--muted)" }}
            >
              github.com/aayush2724 ↗
            </a>
          </div>
          <div className="mt-5">
            {map === "github" ? (
              <ActivityHeatmap
                title="GitHub contributions"
                unit="contribution"
                calendar={stats.github.calendar}
                fallbackTotal={stats.github.contributions}
              />
            ) : (
              <ActivityHeatmap
                title="LeetCode submissions"
                unit="submission"
                color="var(--ember-rgb)"
                note="2 accounts combined"
                calendar={LEETCODE_CALENDAR}
              />
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
