/**
 * GitHub contribution calendar → heatmap grid.
 *
 * Two inputs normalise to the same grid:
 *   • the compact synced shape written by .github/scripts/fetch-data.mjs —
 *     { from: "YYYY-MM-DD", to: "YYYY-MM-DD", days: { "YYYY-MM-DD": count } }
 *     (only non-zero days are stored, so the JSON stays small);
 *   • the flat [{ date, count }] list the runtime contributions API returns.
 *
 * Output is whole Sunday-to-Saturday columns, GitHub-style, with days outside
 * the range left as null so the first and last columns can be partial.
 */

const DAY_MS = 86_400_000

const toUTC = (iso) => new Date(`${iso}T00:00:00Z`)
const isoOf = (date) => date.toISOString().slice(0, 10)

export function normalizeCalendar(input) {
  if (!input) return null
  if (Array.isArray(input)) {
    const days = {}
    let from = null
    let to = null
    for (const { date, count } of input) {
      if (!date) continue
      if (count) days[date] = count
      if (!from || date < from) from = date
      if (!to || date > to) to = date
    }
    return from ? { from, to, days } : null
  }
  if (input.from && input.to && input.days) return input
  return null
}

/** The last 52 full weeks with nothing in them — what renders when no data ever arrived. */
function emptyCalendar() {
  const to = new Date()
  const from = new Date(to.getTime() - 364 * DAY_MS)
  return { from: isoOf(from), to: isoOf(to), days: {} }
}

/**
 * Colour level per day. GitHub buckets non-zero days by quartile so a quiet
 * account still shows contrast; when every active day has the same count the
 * quartiles collapse and a max-scaled bucket takes over.
 */
function makeLeveller(days) {
  const counts = Object.values(days).filter(Boolean).sort((a, b) => a - b)
  if (!counts.length) return () => 0
  const at = (p) => counts[Math.min(counts.length - 1, Math.floor(p * counts.length))]
  const q = [at(0.25), at(0.5), at(0.75)]
  const max = counts[counts.length - 1]
  if (q[0] === q[2]) {
    return (count) => (count ? Math.max(1, Math.ceil((count / max) * 4)) : 0)
  }
  return (count) => {
    if (!count) return 0
    if (count <= q[0]) return 1
    if (count <= q[1]) return 2
    if (count <= q[2]) return 3
    return 4
  }
}

export function buildGrid(calendar) {
  const cal = normalizeCalendar(calendar) ?? emptyCalendar()
  const level = makeLeveller(cal.days)

  const start = toUTC(cal.from)
  const end = toUTC(cal.to)
  // Back up to the Sunday on or before `from` so every column is a whole week.
  const firstSunday = new Date(start.getTime() - start.getUTCDay() * DAY_MS)

  const weeks = []
  let total = 0
  for (let t = firstSunday.getTime(); t <= end.getTime(); t += 7 * DAY_MS) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(t + d * DAY_MS)
      if (date < start || date > end) {
        week.push(null)
        continue
      }
      const iso = isoOf(date)
      const count = cal.days[iso] || 0
      total += count
      week.push({ date: iso, count, level: level(count) })
    }
    weeks.push(week)
  }
  return { weeks, total, hasData: Object.keys(cal.days).length > 0 }
}
