import { describe, expect, it } from "vitest"
import { buildGrid, normalizeCalendar } from "./contributions"

describe("normalizeCalendar", () => {
  it("accepts the compact synced shape untouched", () => {
    const cal = { from: "2026-01-01", to: "2026-01-07", days: { "2026-01-03": 2 } }
    expect(normalizeCalendar(cal)).toBe(cal)
  })

  it("compacts the flat API list and drops zero days", () => {
    const out = normalizeCalendar([
      { date: "2026-01-02", count: 0 },
      { date: "2026-01-01", count: 3 },
      { date: "2026-01-03", count: 1 },
    ])
    expect(out).toEqual({ from: "2026-01-01", to: "2026-01-03", days: { "2026-01-01": 3, "2026-01-03": 1 } })
  })

  it("returns null for empty or malformed input", () => {
    expect(normalizeCalendar(null)).toBeNull()
    expect(normalizeCalendar([])).toBeNull()
    expect(normalizeCalendar({ nope: true })).toBeNull()
  })
})

describe("buildGrid", () => {
  it("pads to whole Sunday-to-Saturday weeks and totals the counts", () => {
    // 2026-01-01 is a Thursday, so the first column has three leading nulls.
    // 2026-01-09 is a Friday, so the second column has a trailing null.
    const { weeks, total, hasData } = buildGrid({
      from: "2026-01-01",
      to: "2026-01-09",
      days: { "2026-01-01": 4, "2026-01-09": 1 },
    })
    expect(hasData).toBe(true)
    expect(total).toBe(5)
    expect(weeks).toHaveLength(2)
    expect(weeks[0].slice(0, 4)).toEqual([null, null, null, null])
    expect(weeks[0][4]).toMatchObject({ date: "2026-01-01", count: 4 })
    expect(weeks[1][5]).toMatchObject({ date: "2026-01-09", count: 1 })
    expect(weeks[1][6]).toBeNull()
  })

  it("renders an empty year when no calendar ever arrived", () => {
    const { weeks, total, hasData } = buildGrid(null)
    expect(hasData).toBe(false)
    expect(total).toBe(0)
    expect(weeks.length).toBeGreaterThanOrEqual(52)
  })
})
