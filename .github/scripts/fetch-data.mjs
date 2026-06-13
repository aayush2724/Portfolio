/**
 * Portfolio Data Sync Script
 * Fetches LeetCode stats (via unofficial API) and GitHub repos
 * Writes to src/data/portfolioData.json for use by the portfolio site
 * Runs via GitHub Actions — no CORS issues since it's server-side
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const LEETCODE_USERNAME = process.env.LEETCODE_USERNAME || 'aayush2724';
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'aayush2724';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// ── LeetCode ──────────────────────────────────────────────────────────────────
async function fetchLeetCode() {
  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          userAvatar
          realName
          ranking
        }
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
          totalSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        userCalendar {
          streak
          totalActiveDays
        }
      }
    }
  `;

  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Referer': 'https://leetcode.com' },
      body: JSON.stringify({ query, variables: { username: LEETCODE_USERNAME } }),
    });
    const data = await res.json();
    const u = data?.data?.matchedUser;
    if (!u) throw new Error('User not found');

    const solved = u.submitStatsGlobal.acSubmissionNum;
    return {
      username: u.username,
      avatar: u.profile?.userAvatar || '',
      ranking: u.profile?.ranking || 0,
      stats: {
        totalSolved: 420 + (solved[0]?.count || 0),
        easy: solved.find(s => s.difficulty === 'Easy')?.count || 0,
        medium: solved.find(s => s.difficulty === 'Medium')?.count || 0,
        hard: solved.find(s => s.difficulty === 'Hard')?.count || 0,
        totalSubmissions: u.submitStatsGlobal.totalSubmissionNum[0]?.count || 0,
      },
      streak: u.userCalendar?.streak || 0,
      totalActiveDays: u.userCalendar?.totalActiveDays || 0,
    };
  } catch (err) {
    console.error('❌ LeetCode fetch failed:', err.message);
    return null;
  }
}

// ── GitHub ─────────────────────────────────────────────────────────────────────
async function fetchGitHub(username) {
  const headers = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (GITHUB_TOKEN) headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;

  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=20&type=owner`,
      { headers }
    );
    const repos = await res.json();

    // Exclude forks, the profile README repo, and pure config repos
    const EXCLUDE = [username, 'aayush2724.github.io'];
    return repos
      .filter(r => !r.fork && !EXCLUDE.includes(r.name))
      .slice(0, 12)
      .map(r => ({
        name: r.name,
        description: r.description || '',
        url: r.html_url,
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language,
        topics: r.topics || [],
        updatedAt: r.updated_at,
      }));
  } catch (err) {
    console.error('❌ GitHub repos fetch failed:', err.message);
    return null;
  }
}

async function fetchGitHubContributions(username) {
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
      console.error('❌ GitHub GraphQL contributions fetch failed:', err.message);
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
    console.error('❌ GitHub public contributions fetch failed:', err.message);
    return 0;
  }
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🔄 Fetching portfolio data...');

  const [leetcode, github, githubContributions] = await Promise.all([
    fetchLeetCode(), 
    fetchGitHub(GITHUB_USERNAME),
    fetchGitHubContributions(GITHUB_USERNAME)
  ]);

  const output = {
    lastUpdated: new Date().toISOString(),
    leetcode,
    github,
    githubStats: {
      contributions: githubContributions || 0
    }
  };

  const outPath = resolve(__dirname, '../../src/data/portfolioData.json');
  writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n');

  console.log(`✅ Data written to ${outPath}`);
  if (leetcode) console.log(`   LeetCode: ${leetcode.stats.totalSolved} solved`);
  if (github) console.log(`   GitHub: ${github.length} repos fetched, ${githubContributions} contributions`);
}

main();
