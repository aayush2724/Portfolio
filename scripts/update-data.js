import fs from "fs/promises";
import path from "path";

const DATA_PATH = path.resolve("./src/data/portfolioData.json");
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
    }))
    .slice(0, 12);
}

async function fetchLiveLeetCode(username) {
  if (!username) return null;
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

  const res = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { username } }),
  });
  if (!res.ok) throw new Error(`LeetCode HTTP ${res.status}`);
  const data = await res.json();
  if (data.errors) throw new Error(data.errors[0].message);
  const u = data.data.matchedUser;
  if (!u) throw new Error("LeetCode user not found");

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
      totalSolved: u.submitStatsGlobal.acSubmissionNum[0]?.count || 0,
      easy:
        u.submitStatsGlobal.acSubmissionNum.find((s) => s.difficulty === "Easy")
          ?.count || 0,
      medium:
        u.submitStatsGlobal.acSubmissionNum.find((s) => s.difficulty === "Medium")
          ?.count || 0,
      hard:
        u.submitStatsGlobal.acSubmissionNum.find((s) => s.difficulty === "Hard")
          ?.count || 0,
      totalSubmissions: u.submitStatsGlobal.totalSubmissionNum[0]?.count || 0,
    },
    streak: u.userCalendar?.streak || 0,
    totalActiveDays: u.userCalendar?.totalActiveDays || 0,
    calendar,
  };
}

async function main() {
  const staticData = await readStatic();

  // GitHub
  const ghUser = extractGithubUsername(staticData) || process.env.GITHUB_USER;
  let github = staticData.github || [];
  try {
    const live = await fetchGitHubRepos(ghUser);
    if (live && live.length) github = live;
    console.log(`Fetched ${github.length} repos for ${ghUser}`);
  } catch (err) {
    console.warn("GitHub sync failed, keeping static list:", err.message);
  }

  // LeetCode
  const lcUser = staticData?.leetcode?.username || process.env.LEETCODE_USER;
  let leetcode = staticData.leetcode || null;
  try {
    const liveLc = await fetchLiveLeetCode(lcUser);
    if (liveLc) {
      leetcode = {
        ...leetcode,
        username: liveLc.username,
        avatar: liveLc.avatar || leetcode?.avatar || null,
        stats: liveLc.stats,
        streak: liveLc.streak,
        totalActiveDays: liveLc.totalActiveDays,
      };
    }
    console.log(`Fetched LeetCode stats for ${lcUser}`);
  } catch (err) {
    console.warn("LeetCode sync failed, keeping static values:", err.message);
  }

  const out = {
    ...staticData,
    lastUpdated: new Date().toISOString(),
    leetcode,
    github,
  };

  await writeStatic(out);
  console.log("Updated", DATA_PATH);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
