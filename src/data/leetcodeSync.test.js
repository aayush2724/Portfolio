import { describe, expect, it } from "vitest"
import { longestStreak, mergeLeetCodeAccounts, parseUsernames } from "./leetcodeSync"

const account = (username, solved, days) => ({
  username,
  solved,
  easy: 1,
  medium: 2,
  hard: 3,
  submissions: 10,
  days,
})

describe("longestStreak", () => {
  it("finds the longest run of consecutive days", () => {
    expect(longestStreak({ "2026-01-01": 1, "2026-01-02": 1, "2026-01-04": 1 })).toBe(2)
    expect(longestStreak({})).toBe(0)
  })
})

describe("mergeLeetCodeAccounts", () => {
  const today = new Date("2026-10-04T12:00:00Z")
  const merged = mergeLeetCodeAccounts(
    [
      account("a", 418, { "2026-09-01": 2, "2026-09-02": 1, "2020-01-01": 9 }),
      account("b", 337, { "2026-09-02": 4, "2026-09-03": 1 }),
    ],
    today,
  )

  it("sums the solved counts", () => {
    expect(merged.stats).toEqual({ totalSolved: 755, easy: 2, medium: 4, hard: 6, totalSubmissions: 20 })
  })

  it("merges calendars per day over the last year only", () => {
    expect(merged.calendar).toEqual({
      from: "2025-10-05",
      to: "2026-10-04",
      days: { "2026-09-01": 2, "2026-09-02": 5, "2026-09-03": 1 },
    })
  })

  it("counts shared days once and lets a streak span accounts", () => {
    expect(merged.totalActiveDays).toBe(3)
    expect(merged.streak).toBe(3)
  })

  it("publishes nothing that identifies an account", () => {
    expect(JSON.stringify(merged)).not.toMatch(/"(a|b)"/)
  })
})

describe("parseUsernames", () => {
  it("splits a comma list and is empty when unset", () => {
    expect(parseUsernames(" x , y ")).toEqual(["x", "y"])
    expect(parseUsernames(undefined)).toEqual([])
  })
})
