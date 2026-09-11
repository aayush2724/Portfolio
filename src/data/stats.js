import portfolioData from "./portfolioData.json"

/**
 * Every headline number on the site, derived in one place.
 *
 * These used to be typed by hand wherever they appeared, and they drifted:
 * the LeetCode count was simultaneously 726 (hero), 637 (about) and 531 (bot),
 * and the repo count was 12 in one place and 23 in another. Copy that states a
 * number now imports it from here instead, so a data sync moves every surface
 * at once and there is exactly one thing to be wrong.
 *
 * Fallbacks are deliberately conservative — if the synced JSON is ever missing
 * a field, a modest true-ish number is better than an inflated one.
 */

const lc = portfolioData.leetcode ?? {}
const gh = portfolioData.githubStats ?? {}

/** Problems solved on LeetCode. */
export const LEETCODE_SOLVED = lc.stats?.totalSolved ?? 700

/** Difficulty split. Note this is the raw per-difficulty count from the API. */
export const LEETCODE_SPLIT = {
  easy: lc.stats?.easy ?? 0,
  medium: lc.stats?.medium ?? 0,
  hard: lc.stats?.hard ?? 0,
}

export const LEETCODE_STREAK = lc.streak ?? 0
export const LEETCODE_ACTIVE_DAYS = lc.totalActiveDays ?? 0
export const LEETCODE_URL = `https://leetcode.com/${lc.username ?? "aayush2724"}`

/**
 * Own (non-fork) public repositories.
 *
 * NOT `portfolioData.github.length` — that array is capped at the 12 most
 * recently pushed repos for display, so using its length as a count understated
 * the real total. `githubStats.publicRepos` is written by the sync script from
 * the full list before that cap is applied.
 */
export const REPO_COUNT = gh.publicRepos ?? portfolioData.github?.length ?? 12

/** The repos actually rendered in the GitHub strip (the capped list). */
export const RECENT_REPOS = portfolioData.github ?? []

export const CONTRIBUTIONS = gh.contributions ?? 0

/** Not synced from anywhere — hand-maintained, so it lives here with the rest. */
export const HACKATHONS = 3

/** ISO timestamp of the last successful data sync. */
export const LAST_SYNCED = portfolioData.lastUpdated ?? null
