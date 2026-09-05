import { useEffect, useState } from "react"

/**
 * Fetches and renders a repo's real README from the GitHub API.
 *
 * The project modal used to show hand-written case-study copy; the README is
 * the source of truth the repo owner actually maintains, so it can never drift
 * into claims the code doesn't back up.
 *
 * - Raw markdown via api.github.com (CORS-enabled, no token needed)
 * - Cached in sessionStorage so each repo is fetched once per visit
 * - Rendered with a small safe-subset markdown renderer that builds React
 *   elements directly — no innerHTML, so README content can't inject markup
 */

const memCache = new Map()

function parseRepo(url) {
  const m = /github\.com\/([^/]+)\/([^/#?]+)/.exec(url || "")
  return m ? { owner: m[1], repo: m[2].replace(/\.git$/, "") } : null
}

/**
 * Resolve a repo's README.
 *
 * Fetches from raw.githubusercontent.com, NOT api.github.com: the API caps
 * unauthenticated callers at 60 requests/hour per IP, so a visitor opening a
 * few projects would exhaust it and every README would 403 into "empty". The
 * raw file host is CDN-served with no such limit.
 *
 * Tries the common README filenames on the default branch (HEAD). If none
 * exist, makes ONE best-effort API call for the repo's description as a
 * fallback (rare — most repos have a README — so the rate limit isn't a
 * concern here). Result cached as { kind, text }.
 */
const README_NAMES = [
  "README.md",
  "readme.md",
  "Readme.md",
  "README.markdown",
  "README.rst",
  "README.txt",
  "README",
]

async function fetchReadme(owner, repo) {
  const key = `gh-readme:${owner}/${repo}`
  if (memCache.has(key)) return memCache.get(key)
  try {
    const cached = sessionStorage.getItem(key)
    if (cached) {
      const parsed = JSON.parse(cached)
      memCache.set(key, parsed)
      return parsed
    }
  } catch {
    /* storage unavailable or stale format — fall through to network */
  }

  const store = (val) => {
    memCache.set(key, val)
    try {
      sessionStorage.setItem(key, JSON.stringify(val))
    } catch {
      /* quota exceeded — memory cache still holds it */
    }
    return val
  }

  // Happy path: raw README, no rate limit.
  for (const name of README_NAMES) {
    const r = await fetch(
      `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${name}`
    )
    if (r.ok) {
      const text = await r.text()
      if (text.trim()) return store({ kind: "readme", text })
    }
  }

  // No README file found — one best-effort API call for the description.
  try {
    const meta = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
    if (meta.status === 404) {
      const err = new Error("repo not found")
      err.repoGone = true
      throw err
    }
    if (meta.ok) {
      const data = await meta.json()
      if (data.description) return store({ kind: "description", text: data.description })
    }
  } catch (e) {
    if (e.repoGone) throw e
    /* API rate-limited or offline — fall through to the generic error */
  }
  throw new Error("no readme or description")
}

/* ── markdown → React (safe subset) ─────────────────────────────────── */

/** Resolve README-relative image paths against the repo's raw file host. */
function resolveUrl(src, owner, repo) {
  if (/^(https?:)?\/\//.test(src) || src.startsWith("data:")) return src
  return `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${src.replace(/^\.?\//, "")}`
}

/** Inline markdown: code, images, links, bold, italic, strikethrough. */
function renderInline(text, ctx, keyBase) {
  const nodes = []
  let rest = text
  let k = 0
  const RX =
    /(`[^`]+`)|(!\[[^\]]*\]\([^)\s]+\))|(\[[^\]]+\]\([^)\s]+\))|(\*\*[^*]+\*\*|__[^_]+__)|(\*[^*\s][^*]*\*|_[^_\s][^_]*_)|(~~[^~]+~~)/
  while (rest) {
    const m = RX.exec(rest)
    if (!m) {
      nodes.push(rest)
      break
    }
    if (m.index > 0) nodes.push(rest.slice(0, m.index))
    const tok = m[0]
    const key = `${keyBase}-${k++}`
    if (m[1]) {
      nodes.push(
        <code key={key} className="rounded bg-white/[0.06] border border-[var(--line)] px-1.5 py-0.5 text-[0.85em] text-[var(--accent)]">
          {tok.slice(1, -1)}
        </code>
      )
    } else if (m[2]) {
      const im = /!\[([^\]]*)\]\(([^)\s]+)\)/.exec(tok)
      nodes.push(
        <img
          key={key}
          src={resolveUrl(im[2], ctx.owner, ctx.repo)}
          alt={im[1]}
          loading="lazy"
          className="my-2 inline-block max-w-full rounded-lg"
        />
      )
    } else if (m[3]) {
      const lm = /\[([^\]]+)\]\(([^)\s]+)\)/.exec(tok)
      nodes.push(
        <a
          key={key}
          href={lm[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--accent)] underline decoration-[var(--accent)]/40 underline-offset-2 hover:decoration-[var(--accent)]"
        >
          {renderInline(lm[1], ctx, key)}
        </a>
      )
    } else if (m[4]) {
      nodes.push(<strong key={key} className="text-[var(--fg)]">{tok.slice(2, -2)}</strong>)
    } else if (m[5]) {
      nodes.push(<em key={key}>{tok.slice(1, -1)}</em>)
    } else if (m[6]) {
      nodes.push(<del key={key}>{tok.slice(2, -2)}</del>)
    }
    rest = rest.slice(m.index + tok.length)
  }
  return nodes
}

/**
 * Pre-pass: convert common README HTML (<img>, <br>) to markdown equivalents,
 * strip every other tag. We never render raw HTML, so this only affects how
 * much of an HTML-heavy README survives — not safety.
 */
function stripHtml(md) {
  return md
    .replace(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi, "![]($1)")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<details[^>]*>|<\/details>|<summary[^>]*>|<\/summary>/gi, "\n")
    .replace(/<[^>]+>/g, "")
}

const H_STYLES = {
  1: "font-display text-3xl uppercase mt-8 mb-4 text-[var(--fg)]",
  2: "font-display text-2xl uppercase mt-8 mb-3 text-[var(--accent)]",
  3: "text-lg font-semibold mt-6 mb-2 text-[var(--fg)]",
  4: "text-base font-semibold mt-4 mb-2 text-[var(--fg)]",
}

function renderMarkdown(md, ctx) {
  const lines = stripHtml(md).split("\n")
  const out = []
  let i = 0
  let k = 0

  while (i < lines.length) {
    const line = lines[i]

    // fenced code — with the language label the README declared on the fence
    const fence = /^\s*```+\s*([\w+-]*)/.exec(line)
    if (fence) {
      const lang = fence[1]
      const buf = []
      i++
      while (i < lines.length && !/^\s*```/.test(lines[i])) buf.push(lines[i++])
      i++
      out.push(
        <div key={k++} className="my-4 overflow-hidden rounded-lg border border-[var(--line)] bg-black/40">
          {lang && (
            <div className="border-b border-[var(--line)] bg-white/[0.02] px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
              {lang}
            </div>
          )}
          <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-[var(--muted)]">
            {buf.join("\n")}
          </pre>
        </div>
      )
      continue
    }

    // heading
    const h = /^(#{1,6})\s+(.*)/.exec(line)
    if (h) {
      const level = Math.min(h[1].length, 4)
      const Tag = `h${Math.min(h[1].length + 2, 6)}` // demote: README h1 ≠ page h1
      out.push(
        <Tag key={k++} className={H_STYLES[level]}>
          {renderInline(h[2].trim(), ctx, `h${k}`)}
        </Tag>
      )
      i++
      continue
    }

    // hr
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      out.push(<hr key={k++} className="my-6 border-[var(--line)]" />)
      i++
      continue
    }

    // blockquote
    if (/^\s*>/.test(line)) {
      const buf = []
      while (i < lines.length && /^\s*>/.test(lines[i]))
        buf.push(lines[i++].replace(/^\s*>\s?/, ""))
      out.push(
        <blockquote key={k++} className="my-4 border-l-2 border-[var(--accent)] pl-4 text-[var(--muted)] italic">
          {renderInline(buf.join(" "), ctx, `q${k}`)}
        </blockquote>
      )
      continue
    }

    // table — parse GitHub-flavoured markdown pipe tables into a real <table>.
    // (Was dumped as a monospace <pre> blob before; project READMEs like
    // Beatzy and DeskGuard lead with tables, so this is the most-seen block.)
    if (/^\s*\|.*\|/.test(line) && /^\s*\|?[\s:*-]*-[\s:|*-]*$/.test(lines[i + 1] || "")) {
      const rowCells = (row) =>
        row
          .trim()
          .replace(/^\|/, "")
          .replace(/\|\s*$/, "")
          .split(/(?<!\\)\|/)
          .map((c) => c.replace(/\\\|/g, "|").trim())

      const headCells = rowCells(lines[i])
      const aligns = rowCells(lines[i + 1]).map((c) => {
        const l = c.startsWith(":")
        const r = c.endsWith(":")
        return r && l ? "center" : r ? "right" : "left"
      })
      i += 2
      const bodyRows = []
      while (i < lines.length && /^\s*\|.*\|/.test(lines[i])) bodyRows.push(rowCells(lines[i++]))

      out.push(
        <div key={k++} className="my-5 overflow-x-auto rounded-lg border border-[var(--line)]">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] bg-white/[0.03]">
                {headCells.map((c, ci) => (
                  <th
                    key={ci}
                    style={{ textAlign: aligns[ci] || "left" }}
                    className="px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-wider text-[var(--fg)]"
                  >
                    {renderInline(c, ctx, `th${k}-${ci}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, ri) => (
                <tr
                  key={ri}
                  className="border-b border-[var(--line)]/50 last:border-0 transition-colors hover:bg-white/[0.02]"
                >
                  {headCells.map((_, ci) => (
                    <td
                      key={ci}
                      style={{ textAlign: aligns[ci] || "left" }}
                      className="px-4 py-2.5 align-top text-[var(--muted)]"
                    >
                      {renderInline(row[ci] || "", ctx, `td${k}-${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      continue
    }

    // a stray pipe line that is not a real table — render as plain text below

    // list (flat; nesting collapses to one level)
    if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*([-*+]|\d+\.)\s+/, ""))
        i++
      }
      out.push(
        <ul key={k++} className="my-3 space-y-1.5">
          {items.map((item, j) => {
            const task = /^\[([ xX])\]\s+(.*)/.exec(item)
            return (
              <li key={j} className="flex items-start gap-2 text-sm text-[var(--muted)]">
                <span className="mt-0.5 text-[var(--accent)]">
                  {task ? (task[1] === " " ? "☐" : "☑") : "▸"}
                </span>
                <span>{renderInline(task ? task[2] : item, ctx, `li${k}-${j}`)}</span>
              </li>
            )
          })}
        </ul>
      )
      continue
    }

    // blank
    if (!line.trim()) {
      i++
      continue
    }

    // paragraph — merge consecutive text lines
    const buf = [line]
    i++
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(\s*([-*+]|\d+\.)\s+|#{1,6}\s|\s*```|\s*>|\s*\|)/.test(lines[i])
    ) {
      buf.push(lines[i++])
    }
    out.push(
      <p key={k++} className="my-3 text-sm leading-relaxed text-[var(--muted)]">
        {renderInline(buf.join(" "), ctx, `p${k}`)}
      </p>
    )
  }
  return out
}

/* ── component ──────────────────────────────────────────────────────── */

export default function GithubReadme({ repoUrl, fallback }) {
  const [state, setState] = useState({ status: "loading", md: null, repoGone: false })
  const repo = parseRepo(repoUrl)

  useEffect(() => {
    const r = parseRepo(repoUrl)
    if (!r) {
      setState({ status: "error", md: null, repoGone: false })
      return
    }
    let cancelled = false
    setState({ status: "loading", md: null, repoGone: false })
    fetchReadme(r.owner, r.repo)
      .then((res) => {
        if (cancelled) return
        if (res.kind === "readme") setState({ status: "ok", md: res.text, repoGone: false })
        else setState({ status: "desc", md: res.text, repoGone: false })
      })
      .catch((err) => {
        if (cancelled) return
        setState({ status: "error", md: null, repoGone: !!err.repoGone })
      })
    return () => {
      cancelled = true
    }
  }, [repoUrl])

  if (state.status === "loading") {
    return (
      <div className="my-6 rounded-lg border border-[var(--line)] bg-[var(--surface)]/40 p-5 font-mono text-sm text-[var(--muted)]">
        <span className="text-[var(--accent)]">$</span> curl{" "}
        {repo ? `github.com/${repo.owner}/${repo.repo}/README.md` : "README.md"}
        <span className="ml-1 inline-block h-[1em] w-[0.5ch] translate-y-[0.15em] animate-pulse bg-[var(--accent)]" />
      </div>
    )
  }

  // Repo has no README but does have a description — render that, honestly
  // labelled, instead of pretending there's nothing.
  if (state.status === "desc") {
    return (
      <div className="my-6 rounded-lg border border-[var(--line)] bg-[var(--surface)]/40 p-5">
        <p className="text-sm leading-relaxed text-[var(--muted)]">{state.md}</p>
        <p className="mt-3 font-mono text-xs text-[var(--muted)]">
          (repo description — this repo has no README yet)
        </p>
      </div>
    )
  }

  if (state.status === "error") {
    return (
      <div className="my-6 rounded-lg border border-[var(--line)] bg-[var(--surface)]/40 p-5">
        {fallback && (
          <p className="mb-4 text-sm leading-relaxed text-[var(--muted)]">{fallback}</p>
        )}
        <p className="font-mono text-xs text-[var(--muted)]">
          {state.repoGone
            ? "this repo is no longer on GitHub"
            : "couldn't load the README right now"}
          {repoUrl && !state.repoGone && (
            <>
              {" — "}
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] underline underline-offset-2"
              >
                read it on GitHub →
              </a>
            </>
          )}
        </p>
      </div>
    )
  }

  return <div className="readme-body">{renderMarkdown(state.md, repo)}</div>
}
