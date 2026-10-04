import fs from "fs/promises";
import path from "path";
import { syncLeetCode, parseUsernames } from "../src/data/leetcodeSync.js";

const DATA_PATH = path.resolve("./src/data/portfolioData.json");
const RECENT_REPO_LIMIT = 12; // repos kept for the GitHub strip
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || null;

async function readStatic() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read static data:", err);
    return {};
  }
}

async function writeStatic(obj) {
  const pretty = JSON.stringify(obj, null, 2) + "\n";
  await fs.writeFile(DATA_PATH, pretty, "utf8");
}

function extractGithubUsername(staticData) {
  const first = staticData?.github?.[0];
  if (!first?.url) return null;
  const m = first.url.match(/github.com\/([^/]+)/);
  return m ? m[1] : null;
}

async function fetchGitHubRepos(username) {
  if (!username) return [];
  const url = `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`;
  const headers = { Accept: "application/vnd.github.v3+json" };
  if (GITHUB_TOKEN) headers.Authorization = `token ${GITHUB_TOKEN}`;

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GitHub HTTP ${res.status}`);
  const repos = await res.json();
  // Returns every own repo; the caller records the true count and only then
  // caps the list for display. Slicing here is what made `github.length` read
  // as a repo count when it was really a display cap.
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
      updatedAt: new Date(r.updated_at).toISOString(),
    }));
}

async function fetchGitHubContributions(username) {
  if (!username) return 0;
  
  // 1. Try GraphQL API (requires token)
  if (GITHUB_TOKEN) {
    const query = `
      query($username:String!) {
        user(login: $username) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
            }
          }
        }
      }
    `;

    try {
      const res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables: { username } }),
      });
      const data = await res.json();
      const count = data?.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions;
      if (count !== undefined) return count;
    } catch (err) {
      console.warn("GitHub GraphQL contributions fetch failed:", err.message);
    }
  }

  // 2. Fallback: Try a public contributions API (no token needed)
  try {
    const res = await fetch(`https://github-contributions.vercel.app/api/v1/${username}`);
    const data = await res.json();
    const currentYear = new Date().getFullYear().toString();
    const yearData = data.years?.find(y => y.year === currentYear);
    return yearData?.total || 0;
  } catch (err) {
    console.warn("GitHub public contributions fetch failed:", err.message);
    return 0;
  }
}

async function main() {
  const staticData = await readStatic();

  // GitHub
  const ghUser = extractGithubUsername(staticData) || process.env.GITHUB_USER || "aayush2724";
  let github = staticData.github || [];
  let githubStats = staticData.githubStats || { contributions: 0 };

  try {
    const [repos, contributions] = await Promise.all([
      fetchGitHubRepos(ghUser),
      fetchGitHubContributions(ghUser)
    ]);
    if (repos && repos.length) {
      // Real total first, display list second — see src/data/stats.js.
      githubStats.publicRepos = repos.length;
      github = repos.slice(0, RECENT_REPO_LIMIT);
    }
    githubStats.contributions = contributions || githubStats.contributions;
    console.log(`Fetched ${github.length} repos and ${contributions} contributions for ${ghUser}`);
  } catch (err) {
    console.warn("GitHub sync failed, keeping static list:", err.message);
  }

  // LeetCode — every account combined; a failed fetch keeps the static values.
  const lcUsers = parseUsernames(process.env.LEETCODE_USERNAMES);
  const leetcode = (await syncLeetCode(lcUsers)) ?? staticData.leetcode ?? null;
  console.log(`LeetCode: ${leetcode?.stats?.totalSolved ?? "—"} solved across ${lcUsers.length} accounts`);

  const out = {
    ...staticData,
    lastUpdated: new Date().toISOString(),
    leetcode,
    github,
    githubStats,
  };

  await writeStatic(out);
  console.log("Updated", DATA_PATH);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
