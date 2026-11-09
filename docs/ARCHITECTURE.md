# Portfolio Intelligence Agent — Architecture

Status: **Milestone 0 — current-state assessment and proposed design, awaiting owner review.**
Last updated: 2026-11-08. Reviewed by the advisor subagent (Opus) on 2026-11-08; its required changes are folded in and listed in §13.

---

## Part I — Current state (what exists today, verified by reading the repo)

### 1. Frontend

| Aspect | Finding |
|---|---|
| Framework | React 18.2 + Vite 5.4, plain JSX (no TypeScript). `"type": "module"`. |
| Styling | Tailwind 3.4 + PostCSS/autoprefixer; design tokens as CSS custom properties in `src/index.css`. |
| Motion | framer-motion 11; Lenis smooth scroll on fine-pointer devices (`src/context/motion.js`); shared easing/duration vocabulary in `src/context/ease.js`. |
| 3D | three + @react-three/fiber + drei, lazy-loaded only (`CinemaStage`, `LazyDevPage`). |
| Routing | Hand-rolled hash router in `src/App.jsx`: `#/work/:id` (case study page), `#/blog[/:slug]`, otherwise home. No router library. Anchor links (`#projects`) keep working. |
| Entry points | `index.html` (app), `404.html` (terminal treasure hunt), `privacy.html`; all three are Vite inputs (`vite.config.js`). |
| Lazy loading | Below-the-fold sections and `PortfolioBot`, `CaseStudyPage`, `BlogPage` are `React.lazy`. |
| Tests | Vitest, `environment: "node"`, `include: ["src/**/*.test.js"]`; 7 files / 61 tests, all passing. No jsdom, no Testing Library. |
| Lint | ESLint 9 flat config with react, react-hooks, jsx-a11y; 0 errors / 4 warnings today. |
| Build | `npm run check` = lint + test + build; build ~10 s; main chunk 137 KB gzip, three.js chunk 217 KB gzip (lazy). |

### 2. Existing components the agent will build on

| Component | Why it matters |
|---|---|
| `src/components/PortfolioBot.jsx` (405 lines) | A **scripted regex chatbot** with a floating launcher (bottom-right, `fixed`, safe-area aware), a mobile "tuck" that hides the launcher while the 3D room (`#hq`) fills the phone screen, a dialog panel with `role="dialog"`, `aria-live` log, suggestion chips, typing indicator, clear action, focus hand-back to the launcher. Labelled "scripted guide · not a live AI". Mounted on the **home route only**. This is the shell the live assistant grows into. |
| `src/components/GithubReadme.jsx` → `renderMarkdown(md, ctx)` | Safe-subset Markdown → React: headings, fenced code with language label, GFM tables, lists/task lists, blockquotes, inline code/bold/italic/strike, links and images through `src/lib/safeUrl.js` (protocol allow-list), no `innerHTML`. Also used by the blog and Now section. **Reusable for assistant replies** with one addition (see §7.4: an `images: false` / link allow-list context flag). |
| `src/components/ProjectStage.jsx` | The project card: one project on a lit stage; **action row under the artwork** with "Description" and "Live Demo" buttons — the natural home for a third **Ask AI** action. |
| `src/components/CaseStudyBody.jsx` | Header (name, badge, tags, **View Source / Live Demo action row**) + live README. Used by both `CaseStudyModal` and the `#/work/:id` page, so one edit adds "Ask about this project" to both. |
| `src/components/Shell.jsx` | ⌘K terminal with `ls/cd/cat/open/whoami/stats/socials/blog/sudo`. Optional `ask <question>` command = third entry point. |
| `src/context/useFocusTrap.js`, `src/context/overlay.js`, `src/context/motion.js` | Focus trap with focus return, overlay counter that pauses the WebGL room, low-power gate. The assistant panel and admin dialogs reuse all three. |
| `src/components/Terminal.jsx`, `CommandLabel.jsx`, `AsciiBox.jsx` | Terminal-styled primitives; the admin dashboard can use `Terminal`/`AsciiBox` for logs and metrics so it stays in the site's register. |

### 3. Project data (the knowledge the assistant must ground on)

Three files describe overlapping project sets and have drifted:

| File | Shape | Used by |
|---|---|---|
| `src/data/caseStudies.js` (13 entries, string ids) | `id, name, tagline, badge, cover, problem{…}, approach{…}, stack{frontend,backend,database,infrastructure,tools}, role{…}, outcomes{metrics,impact}, challenges[], links{github,demo,demo_note}, tags, updatedAt` | `CaseStudyPage`, `CaseStudyModal` (via `getCaseStudyByName(project.title)` in `ProjectsBold.jsx`), `Shell` |
| `src/data/projects.js` (13 entries, keyed by `name`) | `name, desc, tags, gh, demo, badge, highlight, updatedAt, updated` | `PortfolioBot` |
| `src/data/featuredProjects.js` (10 entries, numeric ids) | `id, title, description, tags, link, demo, image, badge, earthy` + skill-matching helpers | `ProjectsBold`/`ProjectStage` deck, `SkillsMarquee` "build your stack" counts |
| `src/data/portfolioData.json` | Auto-synced: LeetCode stats + 12 recent repos + contribution calendar | `stats.js`, `CodingStatsBold`, `Shell`, `PortfolioBot` |

**Join key today:** the deck joins to case studies by *title* (`ProjectsBold.jsx:57`). There is no shared slug. Crosswalk and drift (full table in `IMPLEMENTATION_PLAN.md` §M1):

- Auralis → `aayush2724/Auralis` (case study, projects.js) vs `aayush2724/auralisAI` (featured deck). `auralisAI` is a **fork of a teammate's repo**; `Auralis` is the source repo and canonical.
- MindFlow → two contradictory descriptions; repo is a **fork of a teammate's repo**; present in projects.js and the deck, absent from case studies.
- Visitor Management → case study and deck link to `aayush2724/CheckMate`; projects.js links to `Visitor-Management-System`, which GitHub **redirects to CheckMate** (renamed). Two projects, one repo.
- `chatRoom` is private → its case-study README fetch fails to the fallback text.
- Translog (private; the flagship internship project), Vetra (public, deployed) and UrjaSetu (public, early) exist on GitHub with **no portfolio entry**.
- Hackathon claims in the scripted bot are unverifiable from repositories.

### 4. Build, deploy, CI

- **Vercel** project `portfolio` (team `aayush2724s-projects`), Git integration on `main`, Vite preset, root `.`, Node 24. Production: https://aayush-2724.vercel.app. `vercel.json`: `cleanUrls`, long-cache headers for `/assets` and `/fonts`, and a **strict CSP**: `default-src 'self'; script-src 'self' https://va.vercel-scripts.com; style-src 'self'; img-src 'self' data: blob: https:; connect-src 'self' https://raw.githubusercontent.com https://api.github.com https://github-contributions-api.jogruber.de https://ws.audioscrobbler.com; frame-src 'none'; …`. `vite preview` mirrors these headers.
- **GitHub Actions** `.github/workflows/sync-data.yml`: twice daily + on push to `main`, runs `.github/scripts/fetch-data.mjs`, commits `portfolioData.json` with `[skip ci]`. It pushes **without rebasing**, so a commit landing on `main` during a run (e.g., a merged agent PR) makes that push fail (`IMPLEMENTATION_PLAN.md` M1 adds `git pull --rebase`).
- Env today: `VITE_LASTFM_USER`, `VITE_LASTFM_API_KEY` (Vite-inlined; Last.fm key is read-only by design).
- No backend, no `api/` directory, no serverless functions.

### 5. Security posture already in place

Strict CSP and security headers at the edge; self-hosted fonts; README links/images allow-listed; no `innerHTML`; privacy page; `.env*` git-ignored; the September 2026 stealer incident was remediated (commit `18afa12`), and a signature scan of tracked source is clean with no install-time npm scripts.

### 6. Design system assessment (what the new UI must obey)

- **Tokens** (`:root` in `src/index.css`): `--bg #09090b`, `--surface #131316`, `--fg #f3f3f5`, `--muted #92929c`, `--line rgb(243 243 245 / .10)`, `--accent #d4ff3f` (acid lime), `--accent-ink #09090b`, `--ember #ff9900` (hot secondary, used sparingly), `--ok #52d273` (status dots only). `*-rgb` twins enable `/alpha` tints. Tailwind maps these to `bg-bg`, `text-fg`, `text-muted`, `border-line`, `bg-accent/10`, etc.
- **Type:** Clash Display (uppercase display headings, tight tracking), Inter (body), JetBrains Mono (metadata, labels, terminal), Instrument Serif italic as a single-word accent. Section eyebrows are `CommandLabel` shell commands (`ls ~/projects`).
- **Motion:** `EASE.ENTER [0.16,1,0.3,1]`, `EASE.EXIT`, `EASE.SHARP`, `DUR.enter 0.62 / exit 0.3 / sharp 0.18`. Exits shorter than entrances. `prefers-reduced-motion` collapses animation globally. Low-power gate strips blur/blend on phones.
- **Surfaces:** cards are planes lifted off the page (`bg-[var(--surface)]`, `border-[var(--line)]`, `rounded-xl/2xl`), terminal windows with traffic-light dots, pills for CTAs. Accent is reserved for prompts/carets/active states, not decoration.
- **Constraints:** CSP `style-src 'self'` → no `<style>` tags or inline style attributes in HTML (React `style={{}}` via CSSOM is fine, as used today); no `backdrop-filter` reliance (stripped on phones); dialogs use `useFocusTrap` + `useOverlay` + `data-lenis-prevent` for inner scroll; z-index ladder: shell backdrop 90/95, case-study modal 100/101, bot launcher 50, loader 9999.
- **Verification widths:** 390, 768, 1440, 1920 (the launcher's mobile tuck and the third card button must be checked at each).

---

## Part II — Proposed architecture

### 7. System overview

```
                 ┌────────────────────────────── Vercel (static) ──────────────────────────────┐
                 │  Existing Vite SPA                                                          │
 Visitor ───────▶│  • PortfolioBot → live assistant (SSE client, renderMarkdown, fallback)      │
                 │  • Ask AI on ProjectStage / CaseStudyBody / Shell `ask`                     │
 Owner ─────────▶│  • #/admin lazy route (login, repos, sync runs, changes, suggestions, audit) │
                 └───────────────┬───────────────────────────────────────┬─────────────────────┘
                                 │ HTTPS (CORS pinned, CSP connect-src)  │ Bearer JWT
                                 ▼                                       ▼
┌────────────────────────── Render: FastAPI modular monolith (backend/) ────────────────────────┐
│ api/public ── assistant (router → tools → evidence → generate → ground → SSE), projects       │
│ api/admin ─── auth, repositories, sync, suggestions (approve/reject/edit/publish/rollback),   │
│               audit, status                                                                   │
│ api/webhooks/github (HMAC, idempotent by delivery id)            [added after polling works]  │
│ knowledge/ ── projects, sources, facts(+status), versions, retrieval (SQL + tsvector)          │
│ github/ ───── httpx client (ETag/conditional), poller, changed-file fetcher (size-capped)      │
│ analysis/ ─── LangGraph StateGraph: detect→fetch→classify→analyse→validate→knowledge→suggest  │
│               (Postgres checkpointer; graph ENDS at suggest)                                   │
│ suggestions/  Postgres state machine: pending→approved→published | rejected | failed          │
│ publishing/ ─ deterministic overlay edit → branch → PR (GITHUB_PUBLISH_TOKEN)                 │
│ llm/ ──────── provider adapter (LangChain init_chat_model) + budget + fake for tests          │
│ scheduler/ ── optional APScheduler (paid instance) OR external trigger endpoint hit by a       │
│               scheduled GitHub Actions job (free instance), both advisory-locked              │
│ observability/ structlog JSON, llm_calls, audit_logs, /healthz, /api/v1/admin/status          │
└───────────────┬──────────────────────────────────────────────────────────┬────────────────────┘
                │ asyncpg (direct, non-pooler endpoint for locks/checkpointer) │ httpx
                ▼                                                          ▼
        Neon PostgreSQL                                          api.github.com (read token)
                                                                 github.com PRs (publish token)
```

**Why a separate Python service and not Vercel functions:** FastAPI + LangGraph are Python; the sync/analysis jobs are long-running and scheduled; Vercel Hobby crons are once-a-day and functions are execution-limited. A single Render web service holds the API and the analysis worker in one process with no queue infrastructure (owner decision, 2026-11-08). Render's **free** instance spins down after ~15 minutes idle, which has two consequences the design absorbs: (1) an in-process scheduler cannot be relied on, so `SCHEDULER_ENABLED=false` there and syncs are triggered by a scheduled GitHub Actions workflow (`.github/workflows/agent-sync.yml`, every 6 h) calling `POST /api/v1/admin/sync/all` with a dedicated `SYNC_TRIGGER_TOKEN`; the request itself wakes the instance; (2) the first assistant reply after idle waits for a cold start (~30–60 s), so the UI shows a "waking up" state and falls back to the scripted engine if the API does not answer in time. Upgrading to Render's Starter instance (always-on) removes both and enables `SCHEDULER_ENABLED=true`; nothing else changes.

**Why a monorepo `backend/` directory:** one place for docs, one PR per change that touches API + UI, one issue tracker. Vercel builds the root Vite app; `backend/` is inert to it. Guards (M1): `.vercelignore` with `backend/`, `backend/**` added to the ESLint `ignores`, `.venv/` and `__pycache__/` git-ignored, and **never a root `api/` directory** (Vercel would deploy it as serverless functions).

### 7.1 Workflow A — visitor interaction (no LangGraph)

```
message ─▶ validate (len ≤ 800, session, rate limit, budget)
        ─▶ intent router (deterministic first: project name match, "compare", "which projects … skill",
           "architecture", "repo/url"; one structured-output LLM plan ONLY when intent is ambiguous,
           choosing ≤ 3 tools from the fixed set with args validated against DB enums)
        ─▶ tools run in code (parameterised SQL / tsvector; never LLM-built SQL)
        ─▶ evidence pack (facts with status + source refs, ≤ ~6k tokens, deterministic order)
        ─▶ answer generation (streamed; system prompt + evidence pack as data block + last ≤ 12 turns)
        ─▶ grounding filter (strip any citation/URL not in the evidence pack; log grounding rate)
        ─▶ SSE: token deltas, then a final `sources` event, then `done` (or `error` / `limited`)
```

The LLM writes prose from evidence; it does not choose SQL or free-form tool arguments. This keeps latency low, cost bounded, behaviour identical across providers, and makes injection via visitor text inert (there is no tool it can steer).

### 7.2 Workflow B — GitHub intelligence (LangGraph StateGraph)

```
trigger (poll tick | webhook | manual sync)
  → detect_activity   compare pushed_at / default-branch head SHA to repository_sync_runs; list new commits,
                      PRs (merged), releases since last cursor; write github_events (idempotent)
  → fetch_context     per event: commit metadata, file list, changed files ≤ 60 files / ≤ 40 KB each /
                      ≤ 400 KB total (text only), README at that SHA; skip binaries, lockfiles, generated paths
  → classify          deterministic pre-filter (paths, size, message patterns) then structured LLM classification
                      → event_type, meaningfulness, affected_modules, confidence
  → analyse           structured LLM analysis over changed files → implementation evidence, technologies,
                      findings split into verified / uncertain
  → validate          every evidence file path must exist in the fetched set; URLs must be
                      github.com/<owner>/<repo>/blob/<sha>/…; confidence ∈ [0,1]; reject → needs_review
  → update_knowledge  diff against current project_knowledge; write a new knowledge_versions row (never
                      overwrite); facts get status implemented/partial/planned by evidence class
  → suggest           if portfolio_relevance ≥ medium: draft portfolio_update_suggestions (status pending)
                      with current vs proposed, reason, evidence, confidence
  → END               (approval is a human process that can take weeks; it lives in the Postgres state
                      machine, not in a suspended graph)
```

Checkpointing: LangGraph's Postgres checkpointer, keyed by `github_events.id`, so a crash mid-analysis resumes at the last node. Retries with backoff on GitHub/LLM transient errors. Each node records timing and tokens into `llm_calls` / `repository_sync_runs`.

### 7.3 Workflow C — approval and publishing (deterministic service)

`pending → approved (edited text allowed, recorded) → published` or `→ rejected`, or `published` fails → `failed` (retryable). Publish = `publishing/overlay.py` applies the approved fields to the overlay JSON (§8), validates against the schema, pushes branch `agent/publish-<id>`, opens a PR with evidence and rollback notes, records `published_updates`. Rollback = same path with the previous field values.

### 7.4 Frontend integration points

| Change | File(s) | Notes |
|---|---|---|
| Live assistant | `src/components/PortfolioBot.jsx` → split into `src/components/assistant/{Assistant.jsx, Launcher.jsx, Panel.jsx, Message.jsx, Sources.jsx}` + `src/lib/assistantClient.js` (SSE) + `src/lib/portfolioScript.js` (the **existing regex engine extracted first and unit-tested**, kept as offline fallback) | Keep launcher position/tuck, dialog semantics, focus hand-back. Label switches to "live · grounded in the repos" only when the API is configured and healthy. Mount on **all** routes in `App.jsx`. |
| Markdown rendering | `src/components/GithubReadme.jsx` `renderMarkdown` gets ctx `{ images: false, linkHosts: [...] }` | Assistant replies and admin views render **no images** (CSP `img-src https:` would otherwise allow tracking pixels) and only links to github.com / the portfolio / project demo hosts from the evidence set. |
| Ask AI on cards | `src/components/ProjectStage.jsx` action row (3rd button), `src/components/CaseStudyBody.jsx` action row | Dispatch `window` event `assistant:open` with `{ projectSlug }`; the assistant listens. Check 390/768/1440/1920. |
| Shell | `src/components/Shell.jsx` `ask <question>` | Opens the assistant with the question pre-filled. |
| Slug map | `src/data/projectSlugs.js` (new) | Canonical slug ↔ caseStudies id ↔ projects.js name ↔ featuredProjects id ↔ repo. Exported for the assistant and the overlay. |
| Overlay | `src/data/published/projects.published.json` (new, agent-maintained) + `src/data/published.js` (new, applies it) | Applied **inside** `caseStudies.js`, `projects.js`, `featuredProjects.js` exports so no component changes. Schema-tested. The JSON is imported with `with { type: "json" }` and the data modules use explicit `.js` extensions so plain Node can load them (seed exporter, data-sync script). **Shipped in M1.** |
| Admin | `src/admin/**` lazy route `#/admin` in `App.jsx` | Functional dashboard in the site's tokens; bearer token in memory/sessionStorage; `src/lib/adminClient.js`. |
| Tests | `vite.config.js` include `src/**/*.test.{js,jsx}`; per-file `// @vitest-environment jsdom`; add `jsdom`, `@testing-library/react`, `@testing-library/user-event` devDeps | Existing 61 node tests unchanged. |
| CSP / env | `vercel.json` `connect-src` + API origin; `VITE_API_URL` set in Vercel (build-time) | `vite preview` picks the header up automatically. |
| Sync workflow | `.github/workflows/sync-data.yml` add `git pull --rebase origin main` before push | Prevents rejected pushes when an agent PR merges mid-run. |

### 8. Publishing model: slug map + typed overlay

The site's project copy stays in its three source files; the agent never edits them. It maintains **one** JSON file:

```jsonc
// src/data/published/projects.published.json
{
  "$schema": "./projects.published.schema.json",
  "version": 3,
  "updatedAt": "2026-11-20T10:00:00Z",
  "projects": {
    "auralis": {
      "featured":   { "description": "...", "tags": ["Python","FastAPI","LangGraph","RAG","Redis"], "badge": "Sales Intelligence", "link": "https://github.com/aayush2724/Auralis", "demo": "https://…" },
      "projects":   { "desc": "...", "tags": [...], "highlight": "...", "gh": "...", "demo": "...", "badge": "Latest" },
      "caseStudy":  { "badge": "Latest", "tagline": "...", "tags": [...], "links": { "github": "...", "demo": "...", "demo_note": "..." } },
      "provenance": { "suggestionId": "…", "publishedAt": "…", "sources": ["https://github.com/aayush2724/Auralis/blob/<sha>/README.md#…"] }
    }
  },
  "additions": [
    { "slug": "vetra", "name": "Vetra", "desc": "...", "tags": [...], "gh": "https://github.com/aayush2724/Vetra", "demo": "https://vetra-lyart-omega.vercel.app", "badge": null }
  ]
}
```

Rules (from the advisor review):

- **Field allow-list = fields actually rendered.** Featured: `description, tags, badge, link, demo` (read in `ProjectStage.jsx`). projects.js: `desc, tags, highlight, gh, demo, badge`. Case study: `badge, tagline, tags, links.{github,demo,demo_note}`. **Never** `title`/`name` (the deck→case-study join is by title), never `id`, `image`, `earthy`, `cover`, nor the case-study prose blocks (they are not rendered anymore).
- `tags` edits also move the Tech Stack tray counts (`SkillsMarquee` via `featuredProjects.js` helpers); the suggestion detail view shows that side effect.
- `additions` (new projects such as Vetra) append to the **case-study list** (`caseStudies.js`: `id, name, tagline, badge, tags, links`), which needs no artwork and is what makes a project *visible*: it gets a `#/work/<slug>` page with its live README, appears in the shell's `ls projects/` and in the prev/next navigation. The same addition is mirrored into the `projects.js` list, which after M2 feeds only the assistant's scripted fallback (its other importer, `sentira/About.jsx`, is dead code), so a `projects`-only publish would look like it did nothing. Adding to the featured deck (artwork, gradient, position) stays a manual step the suggestion detail view points out.
- `src/data/published.js` exports `applyOverlay(entries, keyOf)`; each data module wraps its export. A schema test (`src/data/published.test.js`) validates the JSON on every `npm test`, so a bad publish fails CI before it deploys.
- Each PR touches only this file; the PR body links the suggestion, evidence and approver.

### 9. Admin dashboard

Lazy `#/admin` route inside the SPA (one deploy, same tokens; nothing but the login screen renders without a valid session; authorisation is entirely server-side). Pages: **Overview** (health, spend today, queue counts), **Repositories** (add/remove/toggle/sync now/last run), **Sync runs**, **Changes** (analysed events with findings and evidence), **Suggestions** (queue; detail with current vs proposed diff, evidence, edit, approve, reject, publish), **Published** (history, rollback), **Audit log**. Uses `Terminal`/`AsciiBox` for logs and metrics to keep the register.

### 10. Hosting and environments

| Piece | Choice | Notes |
|---|---|---|
| Frontend | Vercel (unchanged) | Add `VITE_API_URL`; CSP `connect-src` += API origin |
| API + worker | Render web service, root directory `backend/`, Docker runtime; blueprint in `render.yaml` | Free instance: `SCHEDULER_ENABLED=false`, syncs via GitHub Actions cron + `SYNC_TRIGGER_TOKEN`; Starter instance: `SCHEDULER_ENABLED=true`. uvicorn `--no-access-log`; client address = `X-Forwarded-For` entry `TRUSTED_PROXY_HOPS` from the right (assumed 1 on Render), verified in M6 by comparing requests from two networks |
| Database | Neon PostgreSQL | Use the **direct** (non-`-pooler`) connection string for advisory locks and the LangGraph checkpointer; pooled is fine for request traffic |
| Secrets | Render environment variables / Vercel project settings | Never in the repo |
| Staging | Optional second Render service + Vercel preview; CORS allows preview origins only when `APP_ENV=staging` | |

### 11. LLM provider and models

**Decided 2026-11-08: OpenRouter** (`LLM_PROVIDER=openrouter`, `LLM_BASE_URL=https://openrouter.ai/api/v1`, `LLM_API_KEY` = the owner's OpenRouter key). OpenRouter exposes an OpenAI-compatible chat API, so the adapter (`backend/app/llm/provider.py`, shipped in M2) is a ~200-line httpx client for `POST /chat/completions`: JSON or SSE, `usage: {include: true}` so OpenRouter reports tokens and cost per call, `response_format: json_object` for the planning call, OpenRouter's `HTTP-Referer`/`X-Title` attribution headers, typed errors (timeout, rate-limited, auth, retryable 5xx). No LangChain dependency; the LangGraph workflow in M3 orchestrates plain async functions that call the same provider. `LLM_PROVIDER=fake` (non-production only) swaps in a scripted provider for local development and tests. Two slots: `LLM_CHAT_MODEL` (visitor answers, latency-sensitive) and `LLM_ANALYSIS_MODEL` (repository analysis, quality-sensitive). **Defaults (owner decisions 2026-11-09, measured live):** chat and analysis use `nvidia/nemotron-3.5-super-vl:free`, sent with OpenRouter's fallback list `recursive/flint-v1.0:free`, `google/gemma-4-31b-it:free` because any single free model can be throttled upstream (Gemma was, all afternoon). Nemotron is a reasoning model: `reasoning: {effort: "minimal", exclude: true}`, a 4,000-token output cap and a 45 s answer deadline keep answers complete (first text ~5–15 s). Private repositories are excluded entirely (`INCLUDE_PRIVATE_REPOS=false`); Translog is out of scope for now. When the provider refuses or fails a chat call the stream ends with `error {code: llm_rate_limited | llm_unavailable | llm_error | llm_timeout}` and the client answers from the scripted guide; `llm_unavailable` (402 no credits / 404 model withdrawn) also switches the visit to offline mode; alternatives and prices in `.env.example`. The daily budget cap bounds spend regardless of model.

Reference first-party prices for Anthropic models (from the bundled API reference, cached 2026-06-24; OpenRouter's per-token prices for the same models are close to these):

| Model id | Input $/M | Output $/M |
|---|---|---|
| `claude-opus-5` | 5.00 | 25.00 |
| `claude-sonnet-5` | 2.00 | 10.00 |
| `claude-haiku-4-5` | 1.00 | 5.00 |

Through OpenRouter the equivalent ids are prefixed `anthropic/`; the owner chooses the pair (decision D5, provider decided, models pending). Rough per-unit cost at ~3k input / 400 output tokens per visitor answer: Opus 5 ≈ $0.025, Sonnet 5 ≈ $0.010, Haiku 4.5 ≈ $0.005. A repository analysis of one meaningful push (~25k in / 3k out): Opus 5 ≈ $0.20, Sonnet 5 ≈ $0.08. With the default daily budget cap of $2.00 the worst case is bounded regardless of model. Prompt caching of the stable system prompt + evidence pack is applied where the provider supports it.

### 12. Observability

structlog JSON to stdout (Railway captures); request id per call; `llm_calls` (workflow, model, tokens, cost, latency, outcome); `repository_sync_runs` durations; grounding-filter hit rate; suggestion approval rate; `/healthz` (DB + scheduler heartbeat) and `/api/v1/admin/status` (spend today, queue sizes, last sync per repo, error counts). No keys, tokens, IPs or full visitor messages in logs.

### 13. Decision log

| # | Decision | Status | Rationale |
|---|---|---|---|
| A1 | Separate FastAPI service in `backend/` (monorepo), not Vercel functions | Proposed | Python + LangGraph, long jobs, scheduler; one deploy per side |
| A2 | **Render** for the API (owner decision 2026-11-08); free-tier spin-down handled by an external sync trigger + wake-tolerant UI | Decided | Advisor had flagged spin-down; design absorbs it, Starter instance removes it |
| A3 | Neon Postgres; direct endpoint for locks/checkpointer | Proposed (advisor) | Advisory locks and checkpointer need session semantics |
| A4 | LangGraph only for Workflow B; graph ends at `suggest`; approval is a DB state machine | Proposed (advisor) | Approvals take weeks; interrupts would pin state |
| A5 | Workflow A: code-driven routing/tools, LLM writes from evidence; single structured plan call only when ambiguous | Proposed (advisor) | Bounded, provider-independent, injection-inert |
| A6 | Overlay JSON + slug map + rendered-field allow-list; never edit titles; applied inside data modules | Proposed (advisor) | Deck↔case-study join is by title; zero component edits |
| A7 | Polling first, webhooks after | Proposed (advisor) | Webhooks need per-repo setup and admin hook scope |
| A8 | Publish as PR, auto-merge off | Proposed | Second review surface + preview deploy |
| A9 | Admin inside the SPA at `#/admin` | Proposed | One deploy; authz server-side |
| A10 | Visitor transcripts not stored by default; metrics only; `STORE_CONVERSATIONS` opt-in with privacy-page update | Proposed (advisor) | Privacy page is unreviewed; minimise data |
| A11 | Assistant Markdown renders no images; links allow-listed | Proposed (advisor) | `img-src https:` is an exfiltration channel |
| A12 | **Translog excluded for now** (owner, 2026-11-09, revising the 2026-11-08 decision to ingest it): public repositories only, `INCLUDE_PRIVATE_REPOS=false`; private repos are neither ingested nor analysed. The assistant answers Translog questions from the site's public copy only (profile entry), and says the repository is private | Decided | Owner decision |
| A14 | **OpenRouter** as LLM provider (owner decision 2026-11-08); OpenAI-compatible adapter; model ids chosen in M2 | Decided | Owner has the key |
| A15 | The `CheckMate` repository is the **Visitor Management** system (verified from its README); `visitor-management` → `aayush2724/CheckMate`; the chess "CheckMate" entries have no repository and are kept as `claimed` pending the owner's call | Decided (evidence) | Resolves D4 |
| A13 | Existing scripted engine extracted to a tested module and kept as fallback | Shipped (M1/M2) | Preserve behaviour; offline mode |
| A16 | Workflow A as built (M2): deterministic router → fixed tool set with validated args → evidence pack → one streamed generation → grounding filter; a JSON planning call only for ambiguous questions, and even then slugs are validated against the public project list | Shipped | Bounded, cheap, injection-inert |
| A17 | Grounded streaming: raw deltas stream for latency, the client renders them with images off and a per-answer link-host allow-list, then swaps in the server's grounded `final` text | Shipped | Streaming UX without ungrounded links persisting |

---

## Part III — Database schema proposal

PostgreSQL 16 (Neon). All tables have `id uuid primary key default gen_random_uuid()`, `created_at timestamptz not null default now()`, and `updated_at` where rows mutate. Statuses are PostgreSQL enums. Managed by Alembic; **no `create_all` at startup**.

### 14. Tables

**Knowledge**

| Table | Key columns | Constraints / indexes |
|---|---|---|
| `projects` | `slug text`, `name`, `tagline`, `summary`, `status` (active/archived/candidate), `is_featured bool`, `attribution` (sole/co-built/contributor), `canonical_repo_id → monitored_repositories` (nullable), `demo_url`, `sort_order int` | `unique(slug)`; `name` immutable after creation (title join) |
| `project_sources` | `project_id → projects`, `kind` (readme/file/commit/pr/release/portfolio_copy/manual), `repo_full_name`, `path`, `ref_sha`, `url`, `title`, `content_hash`, `fetched_at`, `content text` (for readme/file ≤ 64 KB), `etag` | `unique(project_id, kind, repo_full_name, path, ref_sha)`; index `(project_id, kind)` |
| `project_knowledge` | `project_id`, `fact_type` (description/architecture/component/feature/technology/decision/api/data_flow/challenge/milestone/metric), `key text`, `value jsonb`, `status` (implemented/partial/planned/claimed), `confidence numeric(3,2)`, `current_version_id → knowledge_versions`, `search tsvector` (generated) | `unique(project_id, fact_type, key)`; GIN on `search`; index `(project_id, status)` |
| `knowledge_versions` | `knowledge_id → project_knowledge`, `version int`, `value jsonb`, `status`, `confidence`, `evidence jsonb` (array of `{source_id, excerpt, url}`), `produced_by` (seed/readme_ingest/analysis/admin), `analysed_change_id` (nullable), `supersedes_version_id` | `unique(knowledge_id, version)`; append-only |
| `project_skills` | `project_id`, `skill text`, `strength` (weak/medium/strong), `evidence jsonb` | `unique(project_id, skill)`; index `(skill)` |

**GitHub intelligence**

| Table | Key columns | Constraints / indexes |
|---|---|---|
| `monitored_repositories` | `owner`, `name`, `full_name` (generated), `default_branch`, `is_private`, `enabled bool`, `project_id` (nullable), `poll_cursor_sha`, `poll_cursor_at`, `etag_commits`, `etag_releases`, `last_sync_run_id`, `added_by` | `unique(owner, name)` |
| `repository_sync_runs` | `repository_id`, `trigger` (schedule/manual/webhook), `status` (running/succeeded/failed/skipped), `started_at`, `finished_at`, `events_found int`, `api_calls int`, `error text` | index `(repository_id, started_at desc)` |
| `github_events` | `repository_id`, `kind` (push/commit/pull_request/release), `external_id text` (commit SHA / PR number / release id / delivery id), `delivery_id text` (nullable), `payload jsonb` (trimmed), `occurred_at`, `processing_status` (new/queued/analysed/ignored/failed/needs_review), `ignore_reason` | `unique(repository_id, kind, external_id)`; `unique(delivery_id)` where not null; index `(processing_status)` |
| `analysed_changes` | `event_id → github_events` (unique), `repository_id`, `event_type` (feature/endpoint/refactor/schema/integration/performance/bugfix/release/docs/other), `summary`, `affected_modules text[]`, `technologies text[]`, `implementation_evidence jsonb`, `verified_findings jsonb`, `uncertain_findings jsonb`, `portfolio_relevance` (none/low/medium/high), `confidence`, `requires_human_review bool`, `injection_flag bool`, `model`, `tokens_in`, `tokens_out`, `cost_usd` | index `(repository_id, created_at desc)` |

**Suggestions and publishing**

| Table | Key columns | Constraints / indexes |
|---|---|---|
| `portfolio_update_suggestions` | `project_id`, `analysed_change_id` (nullable for seed/claim reviews), `category` (feature/stack/description/architecture/milestone/repository_info/ordering/new_project/unverified_claim), `target` (featured/projects/case_study/addition), `field_path text`, `current_content jsonb`, `proposed_content jsonb`, `edited_content jsonb` (nullable), `reason`, `evidence jsonb`, `source_url`, `confidence`, `status` (pending/approved/rejected/published/failed), `decided_at`, `decided_by`, `decision_note`, `publish_error` | index `(status, created_at desc)`; `unique(project_id, target, field_path, analysed_change_id)` prevents duplicate drafts for one change |
| `approval_records` | `suggestion_id`, `action` (approve/reject/edit/publish/rollback/retry), `actor`, `before jsonb`, `after jsonb`, `note` | index `(suggestion_id, created_at)` |
| `published_updates` | `suggestion_id`, `overlay_version int`, `branch`, `pr_number int`, `pr_url`, `commit_sha`, `applied_fields jsonb`, `previous_fields jsonb` (for rollback), `status` (pr_open/merged/rolled_back/failed), `merged_at` | `unique(suggestion_id)`; index `(status)` |

**Admin, visitors, operations**

| Table | Key columns | Constraints / indexes |
|---|---|---|
| `admin_users` | `username`, `password_hash`, `last_login_at`, `disabled bool` | `unique(username)`; exactly one row seeded from env |
| `admin_sessions` | `jti text`, `admin_id`, `expires_at`, `revoked_at` | `unique(jti)`; index `(expires_at)` |
| `visitor_sessions` | `session_key text` (client UUID, hashed), `first_seen_at`, `last_seen_at`, `message_count int`, `project_context_slug` | `unique(session_key)`; rows older than 30 days deleted nightly |
| `conversation_messages` | `session_id`, `role`, `intent`, `project_slug`, `tools_used text[]`, `tokens_in`, `tokens_out`, `latency_ms`, `grounding_dropped int`, `outcome` (ok/limited/error), `content text` (**null unless `STORE_CONVERSATIONS=true`**) | index `(session_id, created_at)`; 30-day retention |
| `llm_calls` | `workflow` (assistant_plan/assistant_answer/classify/analyse/suggest), `provider`, `model`, `tokens_in`, `tokens_out`, `cached_tokens`, `cost_usd`, `latency_ms`, `outcome`, `ref_id` | index `(created_at)`; feeds the status page and the daily budget |
| `audit_logs` | `actor` (admin/system/visitor), `action`, `target_type`, `target_id`, `before jsonb`, `after jsonb`, `request_id`, `ip_hash` | index `(created_at desc)`, `(target_type, target_id)` |
| `langgraph_checkpoints` / `_writes` | Owned by the LangGraph Postgres checkpointer | Created by its own setup routine inside an Alembic migration |

Retention jobs (nightly, scheduler): visitor sessions/messages > 30 days; `llm_calls` > 180 days; rate-limit counters are in-memory.

---

## Part IV — API contract proposal

Base path `/api/v1`. JSON everywhere except SSE. Errors use one envelope: `{"error": {"code": "rate_limited", "message": "…", "request_id": "…"}}`. All responses carry `X-Request-Id`. Public routes are CORS-restricted to the portfolio origin; admin routes require `Authorization: Bearer <jwt>`.

### 15. Public

| Method & path | Purpose | Request → response |
|---|---|---|
| `GET /healthz` | Liveness/readiness | `{status, db, scheduler, version}` |
| `GET /api/v1/projects` | Project list for the assistant UI and future use; candidates excluded, private repos redacted (see `SECURITY.md` §2) | `[{slug, name, tagline, status, attribution, repo_url, repo_is_private, demo_url, technologies, …}]` |
| `GET /api/v1/projects/{slug}` | One project with its facts grouped by type | `{…summary, summary, repo_description, facts: {type: [{type, key, value, status, confidence, version, evidence}]}}` |
| `GET /api/v1/projects/{slug}/knowledge?type=architecture&status=implemented` | Facts filtered by type and/or status, with evidence | `{slug, count, facts: […]}` |
| `GET /api/v1/assistant/status` | Is the live assistant available? | `{live, reason (not_configured | budget_exhausted), provider, model}` — the panel probes this on first open (which also wakes a sleeping free-tier instance) |
| `POST /api/v1/assistant/chat` | Streamed answer (**shipped in M2**) | Body `{session_id (uuid), message (≤800), project_slug?, history: [{role, content}] (≤12)}` → `text/event-stream`: `meta {intent, project_slug, tools, evidence_count, link_hosts, plan_source}` · `delta {text}`… · `final {text, grounding_dropped}` (the grounded text the client swaps in) · `sources [{id, title, url, kind, project}]` · `done {message_id, tokens_in, tokens_out, latency_ms, model, outcome}`; on failure `error {code, message}` then `done {outcome: error}`. `: keep-alive` comments every 10 s while waiting. Limits are checked **before** the stream opens: `429 rate_limited`/`session_limited` with `Retry-After`, `503 budget_exhausted`, `503 assistant_offline`. |
| `POST /api/v1/assistant/feedback` | Thumbs up/down per answer | `{session_id, message_id, rating: -1|1}` → 204; 404 unless the message belongs to that session |

Rate-limit responses: `429` with `Retry-After`; budget exhausted: `503` with `{"error": {"code": "budget_exhausted"}}` (the UI shows the "resting" state).

### 16. Administrative (Bearer JWT)

| Method & path | Purpose |
|---|---|
| `POST /api/v1/admin/auth/login` | `{username, password}` → `{token, expires_at}`; rate-limited |
| `POST /api/v1/admin/auth/logout` | Revokes the session `jti` |
| `GET /api/v1/admin/status` | Spend today/7d, queue counts, last sync per repo, error counts, scheduler heartbeat |
| `GET/POST /api/v1/admin/repositories` | List; add `{owner, name, project_slug?, enabled}` (validates the repo exists and is reachable with the configured token) |
| `PATCH/DELETE /api/v1/admin/repositories/{id}` | Enable/disable, link to project; remove |
| `POST /api/v1/admin/repositories/{id}/sync` | Manual sync → `{sync_run_id}` (202) |
| `GET /api/v1/admin/sync-runs?repository_id=` | Paginated runs |
| `GET /api/v1/admin/changes?repository_id=&status=` | Analysed changes with findings and evidence |
| `GET /api/v1/admin/changes/{id}` | Full record incl. uncertain findings and injection flag |
| `GET /api/v1/admin/suggestions?status=pending` | Queue |
| `GET /api/v1/admin/suggestions/{id}` | Detail: current vs proposed, evidence, side effects (e.g., tag count changes), history |
| `POST /api/v1/admin/suggestions/{id}/edit` | `{edited_content}` → records an `approval_records` edit |
| `POST /api/v1/admin/suggestions/{id}/approve` · `/reject` | `{note?}`; state-machine checked |
| `POST /api/v1/admin/suggestions/{id}/publish` | Applies overlay, opens PR → `{pr_url, branch}`; on failure status `failed` + error |
| `POST /api/v1/admin/published/{id}/rollback` | Opens a PR restoring `previous_fields` |
| `GET /api/v1/admin/published` | Publication history with PR state |
| `GET /api/v1/admin/knowledge/{slug}` | Facts with versions; `GET …/claims` lists `claimed` facts awaiting evidence |
| `GET /api/v1/admin/audit-logs?actor=&action=` | Paginated audit trail |

### 17. Webhooks (server-to-server, outside `/api/v1`, no JWT)

| Method & path | Purpose |
|---|---|
| `POST /api/webhooks/github` | (M6, optional) Authenticated by HMAC-SHA256 over the raw body with `GITHUB_WEBHOOK_SECRET`, not by a bearer token; excluded from CORS. Returns 200 + `{accepted: bool}`; idempotent by `X-GitHub-Delivery`; deliveries for unmonitored repositories are acknowledged and dropped. |

Versioning: breaking changes go to `/api/v2`; additive fields are allowed in v1. OpenAPI is served at `/api/v1/openapi.json` only when `APP_ENV != production` or behind admin auth.
