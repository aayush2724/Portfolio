/**
 * Portfolio data utilities
 *
 * Priority order:
 * 1. portfolioData.json — updated daily by GitHub Actions (no CORS issues)
 * 2. Live API call — as a real-time refresh on top
 */

import staticData from "./portfolioData.json";

// ── Helpers ────────────────────────────────────────────────────────────────────

function parseStatic() {
  if (!staticData?.leetcode) return null;
  return staticData.leetcode;
}

function parseStaticGitHub() {
  if (!staticData?.github) return [];
  return staticData.github.map((r) => ({
    name: r.name,
    description: r.description || "No description",
    url: r.url,
    stars: r.stars,
    forks: r.forks || 0,
    language: r.language,
    topics: r.topics || [],
    updatedAt: new Date(r.updatedAt).toLocaleDateString(),
  }));
}

// ── LeetCode ───────────────────────────────────────────────────────────────────

export const fetchLeetCodeStats = async (username) => {
  const cached = parseStatic();
  try {
    const live = await tryLiveLeetCode(username);
    return { ...live, __live: true };
  } catch {
    return cached ? { ...cached, __live: false } : null;
  }
};

async function tryLiveLeetCode(username) {
  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile { userAvatar realName }
        submitStatsGlobal {
          acSubmissionNum { difficulty count submissions }
          totalSubmissionNum { difficulty count submissions }
        }
        userCalendar { streak totalActiveDays submissionCalendar }
      }
    }
  `;

  const response = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { username } }),
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (data.errors) throw new Error(data.errors[0].message);
  const u = data.data.matchedUser;
  if (!u) throw new Error("User not found");

  let calendar = {};
  try {
    const parsed = JSON.parse(u.userCalendar?.submissionCalendar || "{}");
    calendar = Object.fromEntries(
      Object.entries(parsed).map(([ts, count]) => {
        const date = new Date(Number(ts) * 1000).toISOString().slice(0, 10);
        return [date, Number(count) || 0];
      }),
    );
  } catch {
    calendar = {};
  }

  return {
    username: u.username,
    avatar: u.profile?.userAvatar,
    realName: u.profile?.realName || username,
    stats: {
      totalSolved: 420 + (u.submitStatsGlobal.acSubmissionNum[0]?.count || 0),
      easy:
        u.submitStatsGlobal.acSubmissionNum.find((s) => s.difficulty === "Easy")
          ?.count || 0,
      medium:
        u.submitStatsGlobal.acSubmissionNum.find(
          (s) => s.difficulty === "Medium",
        )?.count || 0,
      hard:
        u.submitStatsGlobal.acSubmissionNum.find((s) => s.difficulty === "Hard")
          ?.count || 0,
      totalSubmissions: 440 + (u.submitStatsGlobal.totalSubmissionNum[0]?.count || 0),
    },
    streak: u.userCalendar?.streak || 0,
    totalActiveDays: u.userCalendar?.totalActiveDays || 0,
    calendar,
  };
}

// ── GitHub ─────────────────────────────────────────────────────────────────────

export const fetchGitHubProjects = async (username) => {
  // Prefer live GitHub data so deleted/renamed repos disappear immediately.
  const cached = parseStaticGitHub();

  try {
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=12`,
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const repos = await response.json();
    return repos
      .filter((r) => !r.fork)
      .map((r) => ({
        name: r.name,
        description: r.description || "No description",
        url: r.html_url,
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language,
        topics: r.topics || [],
        updatedAt: new Date(r.updated_at).toLocaleDateString(),
      }));
  } catch (err) {
    console.error("GitHub fetch failed:", err);
    // Fall back to last synced static data when live API fails.
    return cached;
  }
};

export const fetchGitHubContributions = async (username) => {
  try {
    const res = await fetch(`https://github-contributions.vercel.app/api/v1/${username}`);
    const data = await res.json();
    const currentYear = new Date().getFullYear().toString();
    const yearData = data.years?.find(y => y.year === currentYear);
    return yearData?.total || 0;
  } catch (err) {
    console.error("GitHub contributions fetch failed:", err);
    return staticData.githubStats?.contributions || 0;
  }
};

// ── Meta ───────────────────────────────────────────────────────────────────────

/** Returns the ISO timestamp when data was last synced by CI */
export const getLastSyncTime = () => staticData?.lastUpdated || null;
