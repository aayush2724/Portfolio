/**
 * Portfolio data utilities
 *
 * Priority order:
 * 1. portfolioData.json — refreshed twice a day by GitHub Actions
 * 2. Live GitHub API call — as a real-time refresh on top, where CORS allows it
 */

import staticData from "./portfolioData.json";

// ── Helpers ────────────────────────────────────────────────────────────────────

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
//
// There is deliberately no browser-side LeetCode fetch. leetcode.com/graphql
// answers the CORS preflight without an Access-Control-Allow-Origin header, so
// the call can never succeed from a web page; it only ever fell back to the
// synced JSON while sending every visitor's IP to LeetCode. The GitHub Action
// (.github/scripts/fetch-data.mjs) refreshes the numbers server-side instead.

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
