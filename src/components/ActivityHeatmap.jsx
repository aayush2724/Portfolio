import { useEffect, useMemo, useRef, useState } from "react"
import { buildGrid } from "../data/contributions"

/** Five-step scale from an "r,g,b" triple; level 0 is the shared empty cell. */
const levelsFor = (rgb) => [
  "rgba(255,255,255,0.03)",
  `rgba(${rgb},0.15)`,
  `rgba(${rgb},0.35)`,
  `rgba(${rgb},0.6)`,
  `rgba(${rgb},0.9)`,
]

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""]

const MIN_CELL = 10
const MAX_CELL = 20
const MIN_GAP = 3
const MAX_GAP = 5
const MONTH_ROW = 16
const RAIL_W = 32 // weekday labels + their gap to the grid

const formatDate = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })

/**
 * Year-long activity calendar — the GitHub contributions and the combined
 * LeetCode submissions both render through it. `calendar` is the synced or
 * live per-day data (see src/data/contributions.js); `fallbackTotal` only
 * backs the header when no calendar has arrived yet. `unit` is the singular
 * noun for one count ("contribution", "submission").
 *
 * The grid fits its card instead of scrolling. On a wide screen the cells and
 * gaps grow so the year spans the row (centred once they hit their cap); on a
 * phone the oldest weeks are dropped so the most recent activity is what shows.
 */
export default function ActivityHeatmap({
  title,
  icon,
  unit,
  color = "212,255,63",
  note,
  calendar,
  fallbackTotal = 0,
}) {
  const [hovered, setHovered] = useState(null)
  const [width, setWidth] = useState(0)
  const measureRef = useRef(null)

  const { weeks, total, hasData } = useMemo(() => buildGrid(calendar), [calendar])
  const levels = useMemo(() => levelsFor(color), [color])
  const plural = (n) => (n === 1 ? unit : `${unit}s`)

  useEffect(() => {
    const el = measureRef.current
    if (!el || typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const { cell, gap, visible } = useMemo(() => {
    const n = weeks.length
    const avail = width - RAIL_W
    if (avail <= 0 || !n) return { cell: 11, gap: MIN_GAP, visible: weeks }
    const fits = Math.floor((avail + MIN_GAP) / (MIN_CELL + MIN_GAP))
    if (fits < n) return { cell: MIN_CELL, gap: MIN_GAP, visible: weeks.slice(n - fits) }
    const step = Math.min(Math.floor((avail + MIN_GAP) / n), MAX_CELL + MAX_GAP)
    const g = Math.min(MAX_GAP, Math.max(MIN_GAP, Math.round(step * 0.2)))
    return { cell: step - g, gap: g, visible: weeks }
  }, [weeks, width])

  // The tooltip is addressed by column index, which a re-slice invalidates.
  useEffect(() => setHovered(null), [visible])

  // A month label sits over the first column that contains a day of that
  // month. Only the leading partial column can collide with the next month,
  // and there the newer month wins — it's the one the columns mostly belong to.
  const monthLabels = useMemo(() => {
    const labels = []
    let lastMonth = -1
    visible.forEach((week, i) => {
      const day = week.find(Boolean)
      if (!day) return
      const month = Number(day.date.slice(5, 7)) - 1
      if (month === lastMonth) return
      lastMonth = month
      const prev = labels[labels.length - 1]
      if (prev && i - prev.col < 3) labels.pop()
      labels.push({ col: i, label: MONTHS[month] })
    })
    return labels
  }, [visible])

  const step = cell + gap
  const radius = Math.max(2, Math.round(cell / 6))
  const gridWidth = visible.length * step - gap
  const headline = hasData ? total : fallbackTotal
  const truncated = visible.length < weeks.length
  const legendCell = Math.min(cell, 14)

  return (
    <div
      className="rounded-3xl border p-6 md:p-8"
      style={{ borderColor: "var(--line)", background: "var(--surface)" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 mb-5">
        <div className="flex items-center gap-3">
          <span className="text-xl" aria-hidden="true">{icon}</span>
          <span className="font-display text-sm uppercase tracking-wider" style={{ color: "var(--fg)" }}>
            {title}
          </span>
        </div>
        <span className="font-mono text-xs" style={{ color: "var(--muted)" }}>
          {headline.toLocaleString()} {plural(headline)} in the last year
        </span>
      </div>

      {/* Measured at full width; the block inside centres once cells hit their cap */}
      <div ref={measureRef} role="img" aria-label={`${title}: ${headline} ${plural(headline)} in the last year`}>
        <div className="mx-auto flex" style={{ width: RAIL_W + gridWidth }} onMouseLeave={() => setHovered(null)}>
          {/* Weekday rail */}
          <div
            aria-hidden="true"
            className="flex flex-col shrink-0 font-mono text-[10px]"
            style={{ width: RAIL_W, paddingTop: MONTH_ROW, gap, color: "var(--muted)", opacity: 0.95 }}
          >
            {DAY_LABELS.map((label, i) => (
              <span key={i} className="leading-none" style={{ height: cell }}>
                {label}
              </span>
            ))}
          </div>

          <div className="relative" style={{ width: gridWidth }}>
            <div className="relative font-mono text-[10px]" style={{ height: MONTH_ROW, color: "var(--muted)", opacity: 0.95 }}>
              {monthLabels.map((m) => (
                <span key={m.col} className="absolute top-0 leading-none" style={{ left: m.col * step }}>
                  {m.label}
                </span>
              ))}
            </div>

            <div className="flex" style={{ gap }}>
              {visible.map((week, wi) => (
                <div key={week.find(Boolean)?.date ?? wi} className="flex flex-col" style={{ gap }}>
                  {week.map((day, di) =>
                    day ? (
                      /* The whole grid is one role="img" with a text summary;
                         per-cell tooltips are a pointer-only enhancement, and
                         365 focusable cells would be unusable by keyboard. */
                      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                      <div
                        key={day.date}
                        className="transition-transform duration-150 hover:scale-150 hover:z-10 relative"
                        style={{ width: cell, height: cell, borderRadius: radius, background: levels[day.level] }}
                        onMouseEnter={() => setHovered({ w: wi, d: di, day })}
                        onClick={() =>
                          setHovered((h) => (h && h.day.date === day.date ? null : { w: wi, d: di, day }))
                        }
                      />
                    ) : (
                      <div key={`pad-${wi}-${di}`} style={{ width: cell, height: cell }} />
                    ),
                  )}
                </div>
              ))}
            </div>

            {hovered && (
              <div
                className="absolute z-20 px-3 py-2 rounded-lg border font-mono text-xs whitespace-nowrap pointer-events-none"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--line)",
                  color: "var(--fg)",
                  top: MONTH_ROW + hovered.d * step - 8,
                  // Keep the bubble inside the card at either edge.
                  ...(hovered.w < visible.length * 0.2
                    ? { left: hovered.w * step, transform: "translateY(-100%)" }
                    : hovered.w > visible.length * 0.8
                      ? { right: (visible.length - 1 - hovered.w) * step, transform: "translateY(-100%)" }
                      : { left: hovered.w * step + cell / 2, transform: "translate(-50%, -100%)" }),
                }}
              >
                <span style={{ color: `rgb(${color})` }}>{hovered.day.count}</span>
                {` ${plural(hovered.day.count)}`} on {formatDate(hovered.day.date)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 mt-4">
        <span className="font-mono text-[10px]" style={{ color: "var(--muted)", opacity: 0.95 }}>
          {[note, truncated && `last ${visible.length} weeks`].filter(Boolean).join(" · ")}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px]" style={{ color: "var(--muted)", opacity: 0.95 }}>Less</span>
          {levels.map((bg, i) => (
            <div key={i} className="rounded-[2px]" style={{ width: legendCell, height: legendCell, background: bg }} />
          ))}
          <span className="font-mono text-[10px]" style={{ color: "var(--muted)", opacity: 0.95 }}>More</span>
        </div>
      </div>
    </div>
  )
}
