/**
 * Portfolio Data Sync Script
 * Fetches LeetCode stats (via unofficial API, all accounts combined) and GitHub repos
 * Writes to src/data/portfolioData.json for use by the portfolio site
 * Runs via GitHub Actions — no CORS issues since it's server-side
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { syncLeetCode, parseUsernames } from '../../src/data/leetcodeSync.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Comma-separated, from a repo secret; every account's activity is combined (see leetcodeSync.js).
const LEETCODE_USERNAMES = parseUsernames(process.env.LEETCODE_USERNAMES);
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'aayush2724';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

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

/**
 * Compact calendar for the heatmap: only non-zero days are kept, so a year of
 * activity is a few KB in the JSON instead of 365 entries of mostly zeros.
 */
function compactCalendar(days) {
  const out = { from: null, to: null, days: {} };
  for (const { date, count } of days) {
    if (!date) continue;
    if (count) out.days[date] = count;
    if (!out.from || date < out.from) out.from = date;
    if (!out.to || date > out.to) out.to = date;
  }
  return out.from ? out : null;
}

async function fetchGitHubContributions(username) {
  // 1. GraphQL (requires token — GITHUB_TOKEN is always present in Actions)
  if (GITHUB_TOKEN) {
    const query = `
      query($username:String!) {
        user(login: $username) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
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
      const cal = data?.data?.user?.contributionsCollection?.contributionCalendar;
      if (cal?.totalContributions !== undefined) {
        const days = (cal.weeks || []).flatMap(w =>
          w.contributionDays.map(d => ({ date: d.date, count: d.contributionCount }))
        );
        return { contributions: cal.totalContributions, calendar: compactCalendar(days) };
      }
    } catch (err) {
      console.error('❌ GitHub GraphQL contributions fetch failed:', err.message);
    }
  }

  // 2. Fallback: public contributions API (no token needed), last 365 days
  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);
    const data = await res.json();
    const days = Array.isArray(data.contributions) ? data.contributions : [];
    const calendar = compactCalendar(days);
    const contributions = data.total?.lastYear ?? days.reduce((n, d) => n + (d.count || 0), 0);
    if (contributions || calendar) return { contributions, calendar };
  } catch (err) {
    console.error('❌ GitHub public contributions fetch failed:', err.message);
  }
  return null;
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🔄 Fetching portfolio data...');

  const outPath = resolve(__dirname, '../../src/data/portfolioData.json');

  // A source that fails this run keeps its last synced value — writing null
  // would blank that section of the live site until the next good run.
  let previous = {};
  try {
    previous = JSON.parse(readFileSync(outPath, 'utf8'));
  } catch {
    previous = {};
  }

  const [leetcode, github, githubActivity] = await Promise.all([
    syncLeetCode(LEETCODE_USERNAMES),
    fetchGitHub(GITHUB_USERNAME),
    fetchGitHubContributions(GITHUB_USERNAME)
  ]);

  const output = {
    lastUpdated: new Date().toISOString(),
    leetcode: leetcode ?? previous.leetcode ?? null,
    github: github ?? previous.github ?? [],
    githubStats: {
      ...(previous.githubStats || {}),
      contributions: githubActivity?.contributions ?? previous.githubStats?.contributions ?? 0,
      calendar: githubActivity?.calendar ?? previous.githubStats?.calendar ?? null,
    }
  };

  writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n');

  console.log(`✅ Data written to ${outPath}`);
  if (leetcode) console.log(`   LeetCode: ${leetcode.stats.totalSolved} solved across ${LEETCODE_USERNAMES.length} accounts`);
  else console.log('   LeetCode: fetch failed, kept previous values');
  if (github) console.log(`   GitHub: ${github.length} repos fetched`);
  if (githubActivity) {
    const days = Object.keys(githubActivity.calendar?.days || {}).length;
    console.log(`   GitHub: ${githubActivity.contributions} contributions, ${days} active days in calendar`);
  } else console.log('   GitHub contributions: fetch failed, kept previous values');
}

main();
