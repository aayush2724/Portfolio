import { describe, it, expect } from "vitest"
import { searchPortfolio } from "./portfolioScript"

const first = () => 0 // deterministic: always the first greeting / fallback

describe("scripted portfolio guide (offline fallback)", () => {
  it("greets", () => {
    expect(searchPortfolio("hello", first)).toMatch(/PortfolioBot/)
  })

  it("answers a project by keyword with its repo link", () => {
    const out = searchPortfolio("tell me about deskguard", first)
    expect(out).toMatch(/\*\*DeskGuard\*\*/)
    expect(out).toMatch(/github\.com\/aayush2724\/DeskGuard/)
  })

  it("answers LeetCode questions from synced stats", () => {
    expect(searchPortfolio("what are your leetcode stats", first)).toMatch(/problems solved|LeetCode/)
  })

  it("falls back on unknown questions", () => {
    const out = searchPortfolio("what is the airspeed of a swallow", first)
    expect(out).toMatch(/projects|LeetCode|hackathon/i)
  })

  it("is deterministic for a fixed rng", () => {
    expect(searchPortfolio("hi", first)).toBe(searchPortfolio("hi", first))
  })
})
