# Aayush's Portfolio

Personal portfolio built with React, Vite and Tailwind CSS.

🔗 **Live:** [aayush-2724.vercel.app](https://aayush-2724.vercel.app/)

## What's in it

- Hero, projects (with per-project case-study routes at `#/work/<id>`), about, tech stack, live coding stats, journey, achievements, testimonials, contact
- A terminal-style shell (`Ctrl+K` / `⌘K`) and a scripted "PortfolioBot" guide — both run entirely in the browser
- Custom `404` page and a [privacy policy](https://aayush-2724.vercel.app/privacy) that describes exactly what the site does and doesn't collect
- Security headers (CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS) configured in `vercel.json`

The current LeetCode and GitHub numbers are on the live site; they are synced
twice a day, so this README deliberately does not repeat them.

## Tech stack

React 18 · Vite 5 · Tailwind CSS 3 · Framer Motion · Lenis · three.js / react-three-fiber (lazy-loaded, desktop only) · Vercel Web Analytics

Fonts are self-hosted: Inter, JetBrains Mono and Instrument Serif via
[@fontsource](https://fontsource.org/) (SIL Open Font License) and Clash Display
from `public/fonts/` (Indian Type Foundry, [Fontshare free licence](https://www.fontshare.com/licenses/itf-ffl)).

## Scripts

```bash
npm install
npm run dev        # Vite dev server
npm run build      # production build → dist/
npm run preview    # serve dist/ with the production security headers applied
npm run lint       # ESLint (react, react-hooks, jsx-a11y)
npm run test       # Vitest unit tests
npm run check      # lint + test + build
npm run sync-data  # refresh src/data/portfolioData.json locally (see below)
```

## Data sync

`src/data/portfolioData.json` holds the LeetCode stats, recent repos and the
GitHub contribution calendar. It is rewritten by
`.github/workflows/sync-data.yml` (00:00 and 12:00 UTC, and on push to `main`)
via `.github/scripts/fetch-data.mjs`, then committed back. `npm run sync-data`
does the same thing locally.

Every headline number on the site is derived from that file in
`src/data/stats.js`, so nothing is typed twice.

> **⚠️ LeetCode total.** `src/data/syncConfig.js` defines
> `LEETCODE_SOLVED_OFFSET`, which is added to the account's API count before it
> is published. The JSON records the raw figure as `apiSolved` next to
> `totalSolved`. Set the offset to `0` to publish the raw account number.

## Environment variables

The site itself needs **no** environment variables. The sync script reads:

| Variable | Where | Purpose |
| --- | --- | --- |
| `GITHUB_TOKEN` | Provided automatically by GitHub Actions | Raises the GitHub API rate limit and enables the contributions GraphQL query. Optional locally. |
| `GITHUB_USERNAME` / `LEETCODE_USERNAME` | Workflow env (optional locally) | Account names to sync; default to `aayush2724`. |

Nothing is read from a `.env` file at build time, and `.env*` is git-ignored.

## Deployment (Vercel)

- Framework preset: Vite. Build command `npm run build`, output `dist/`.
- `vercel.json` sets `cleanUrls` (so `/privacy.html` is served at `/privacy`),
  the security headers, and long-lived caching for `/assets` and `/fonts`.
- `404.html` is built as a second entry and Vercel serves it with a `404`
  status for any unknown path.
- Web Analytics is wired through `@vercel/analytics`; it only reports when the
  feature is switched on for the project in the Vercel dashboard.

The content-security policy allows exactly the hosts the page talks to
(GitHub raw/API for READMEs, the contributions calendar API, Vercel's analytics
script). Add any new third-party origin to `vercel.json` before using it, or the
browser will block the request.

## Project structure

```
index.html / 404.html / privacy.html   # Vite HTML entries
src/App.jsx                            # hash router: home and #/work/:id
src/components/                        # sections, dialogs, shell, bot
src/context/                           # motion hooks, focus trap, easing
src/data/                              # synced JSON, stats, projects, case studies
src/lib/safeUrl.js                     # URL allow-list for README content
public/                                # static assets, fonts, resume, icons
scripts/og/                            # source pages for the share image + icons
```

## Links

- 💻 **GitHub:** [github.com/aayush2724](https://github.com/aayush2724)
- 💼 **LinkedIn:** [linkedin.com/in/aayush2724](https://linkedin.com/in/aayush2724)
