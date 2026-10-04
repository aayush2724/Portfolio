/**
 * LeetCode sync shared by the two data-sync scripts
 * (.github/scripts/fetch-data.mjs and scripts/update-data.js). Never imported
 * by the site itself — leetcode.com/graphql sends no CORS headers.
 *
 * The practice is split across two accounts, so every published LeetCode
 * figure is the two combined:
 *   • solved / easy / medium / hard / submissions — summed;
 *   • the activity calendar — merged per day (submissions summed);
 *   • active days and streak — recomputed from the merged calendar, so a day
 *     active on both accounts counts once and a streak can span accounts.
 *
 * The account names are deliberately not in this repository: they come from
 * the LEETCODE_USERNAMES secret (comma-separated), and neither the synced JSON
 * nor the logs record which accounts were combined.
 */

const DAY_MS = 86_400_000
const isoOf = (date) => date.toISOString().slice(0, 10)

const QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      submitStatsGlobal {
        acSubmissionNum { difficulty count }
        totalSubmissionNum { difficulty count }
      }
      userCalendar { submissionCalendar }
    }
  }
`

/** One account's numbers plus its { "YYYY-MM-DD": submissions } calendar. Throws on failure. */
export async function fetchLeetCodeAccount(username) {
  const res = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", Referer: "https://leetcode.com" },
    body: JSON.stringify({ query: QUERY, variables: { username } }),
  })
  if (!res.ok) throw new Error(`LeetCode HTTP ${res.status} for ${username}`)
  const data = await res.json()
  if (data.errors) throw new Error(`${username}: ${data.errors[0].message}`)
  const u = data?.data?.matchedUser
  if (!u) throw new Error(`LeetCode user ${username} not found`)

  const ac = u.submitStatsGlobal.acSubmissionNum
  const bucket = (name) => ac.find((s) => s.difficulty === name)?.count || 0

  const days = {}
  const raw = JSON.parse(u.userCalendar?.submissionCalendar || "{}")
  for (const [ts, count] of Object.entries(raw)) {
    const n = Number(count) || 0
    if (n) days[isoOf(new Date(Number(ts) * 1000))] = n
  }

  return {
    solved: bucket("All"),
    easy: bucket("Easy"),
    medium: bucket("Medium"),
    hard: bucket("Hard"),
    submissions: u.submitStatsGlobal.totalSubmissionNum[0]?.count || 0,
    days,
  }
}

/** Longest run of consecutive active dates in a { date: count } map. */
export function longestStreak(days) {
  const dates = Object.keys(days).filter((d) => days[d]).sort()
  let best = 0
  let run = 0
  let prev = null
  for (const d of dates) {
    const t = Date.parse(`${d}T00:00:00Z`)
    run = prev !== null && t - prev === DAY_MS ? run + 1 : 1
    best = Math.max(best, run)
    prev = t
  }
  return best
}

/**
 * Combine accounts into the shape portfolioData.json carries under `leetcode`.
 * The calendar spans the last 365 days ending `today`, in the compact
 * { from, to, days } shape the heatmap reads (src/data/contributions.js).
 */
export function mergeLeetCodeAccounts(accounts, today = new Date()) {
  const to = isoOf(today)
  const from = isoOf(new Date(Date.parse(`${to}T00:00:00Z`) - 364 * DAY_MS))

  const days = {}
  const stats = { totalSolved: 0, easy: 0, medium: 0, hard: 0, totalSubmissions: 0 }
  for (const a of accounts) {
    stats.totalSolved += a.solved
    stats.easy += a.easy
    stats.medium += a.medium
    stats.hard += a.hard
    stats.totalSubmissions += a.submissions
    for (const [date, count] of Object.entries(a.days)) {
      if (date >= from && date <= to) days[date] = (days[date] || 0) + count
    }
  }

  return {
    stats,
    streak: longestStreak(days),
    totalActiveDays: Object.keys(days).length,
    calendar: { from, to, days },
  }
}

/**
 * Fetch every account and merge them. All-or-nothing: if any account fails
 * the result is null and the caller keeps the last synced values — a partial
 * sum would silently publish a number hundreds of problems too low.
 */
export async function syncLeetCode(usernames) {
  if (!usernames.length) {
    console.error("❌ LeetCode skipped: LEETCODE_USERNAMES is not set")
    return null
  }
  try {
    const accounts = await Promise.all(usernames.map(fetchLeetCodeAccount))
    return mergeLeetCodeAccounts(accounts)
  } catch {
    // The error can name an account, and Actions logs are public.
    console.error("❌ LeetCode fetch failed for one of the accounts")
    return null
  }
}

/** Usernames from the comma-separated LEETCODE_USERNAMES value. */
export const parseUsernames = (value) =>
  (value || "").split(",").map((s) => s.trim()).filter(Boolean)
