import { useEffect, useState, useRef } from "react"
import { safeHref, safeImageSrc } from "../lib/safeUrl"

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

  // One deadline for the whole lookup: a hung CDN must not leave the modal
  // showing a cursor forever when the fallback copy is already available.
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20000)
  const opts = { signal: controller.signal }

  try {
    // Happy path: raw README, no rate limit.
    for (const name of README_NAMES) {
      const r = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${name}`,
        opts
      )
      if (r.ok) {
        const text = await r.text()
        if (text.trim()) return store({ kind: "readme", text })
      }
    }

    // No README file found — one best-effort API call for the description.
    try {
      const meta = await fetch(`https://api.github.com/repos/${owner}/${repo}`, opts)
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
  } finally {
    clearTimeout(timer)
  }
}

/* ── markdown → React (safe subset) ─────────────────────────────────── */

/**
 * Bases for README-relative URLs: images resolve against the raw file host,
 * links against the repo's file browser. Every URL then passes through the
 * allow-list in src/lib/safeUrl.js — README content is not authored here, so
 * a `javascript:` link in it must never reach an href.
 */
function bases(ctx) {
  // Site-authored markdown (the blog, now.md) resolves relative URLs against the site itself.
  if (ctx.base) return { raw: ctx.base, blob: ctx.base }
  return {
    raw: `https://raw.githubusercontent.com/${ctx.owner}/${ctx.repo}/HEAD/`,
    blob: `https://github.com/${ctx.owner}/${ctx.repo}/blob/HEAD/`,
  }
}

/**
 * Links may be limited to an allow-list of hosts (ctx.linkHosts): the assistant
 * passes the hosts its evidence came from, so an answer can never point away
 * from the repositories. Fragment links and mailto: stay allowed; anything
 * else off-list renders as plain text.
 */
function allowHref(href, ctx) {
  if (!href || !ctx?.linkHosts) return href
  if (href.startsWith("#") || href.startsWith("mailto:")) return href
  try {
    const host = new URL(href).hostname
    return ctx.linkHosts.some((h) => host === h || host.endsWith(`.${h}`)) ? href : null
  } catch {
    return null
  }
}

/** Build a sanitised <img> for `![alt](src)`, or the alt text when the URL is not allowed. */
function imageNode(alt, src, ctx, key) {
  // ctx.images === false: the caller (the assistant) renders no images at all — the
  // site CSP allows img-src https:, so an image URL would be a tracking channel.
  if (ctx?.images === false) return alt || null
  const safe = safeImageSrc(src, bases(ctx).raw)
  if (!safe) return alt || null
  return (
    <img
      key={key}
      src={safe}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className="my-2 inline-block max-w-full rounded-lg"
    />
  )
}

/**
 * Inline markdown: code, linked images (the badge idiom `[![alt](img)](href)`),
 * images, links, bold, italic, strikethrough.
 */
function renderInline(text, ctx, keyBase) {
  const nodes = []
  let rest = text
  let k = 0
  const RX =
    /(`[^`]+`)|(\[!\[[^\]]*\]\([^)\s]+\)\]\([^)\s]+\))|(!\[[^\]]*\]\([^)\s]+\))|(\[[^\]]+\]\([^)\s]+\))|(\*\*[^*]+\*\*|__[^_]+__)|(\*[^*\s][^*]*\*|_[^_\s][^_]*_)|(~~[^~]+~~)/
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
      const lim = /\[!\[([^\]]*)\]\(([^)\s]+)\)\]\(([^)\s]+)\)/.exec(tok)
      const img = imageNode(lim[1], lim[2], ctx, `${key}-img`)
      const href = allowHref(safeHref(lim[3], bases(ctx).blob), ctx)
      if (img == null) {
        /* nothing renderable */
      } else if (href) {
        nodes.push(
          <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="inline-block align-middle">
            {img}
          </a>
        )
      } else {
        nodes.push(img)
      }
    } else if (m[3]) {
      const im = /!\[([^\]]*)\]\(([^)\s]+)\)/.exec(tok)
      const img = imageNode(im[1], im[2], ctx, key)
      if (img != null) nodes.push(img)
    } else if (m[4]) {
      const lm = /\[([^\]]+)\]\(([^)\s]+)\)/.exec(tok)
      const href = allowHref(safeHref(lm[2], bases(ctx).blob), ctx)
      if (href) {
        nodes.push(
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] underline decoration-[var(--accent)]/40 underline-offset-2 hover:decoration-[var(--accent)]"
          >
            {renderInline(lm[1], ctx, key)}
          </a>
        )
      } else {
        // Unsafe or unparseable target: keep the label, drop the link.
        nodes.push(...renderInline(lm[1], ctx, key))
      }
    } else if (m[5]) {
      nodes.push(<strong key={key} className="text-[var(--fg)]">{tok.slice(2, -2)}</strong>)
    } else if (m[6]) {
      nodes.push(<em key={key}>{tok.slice(1, -1)}</em>)
    } else if (m[7]) {
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
/** The few entities README HTML actually uses, decoded inside <pre> blocks. */
const ENTITIES = { "&lt;": "<", "&gt;": ">", "&amp;": "&", "&quot;": '"', "&#39;": "'", "&nbsp;": " " }

function stripHtml(md) {
  return md
    // <pre> keeps its lines: it becomes a fence (marked "pre") before the tag
    // strip below would flatten it into wrapped prose. READMEs use it for
    // block-letter banners, which only read with every line intact.
    .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, body) => {
      const text = body.replace(/<[^>]+>/g, "").replace(/&(?:lt|gt|amp|quot|#39|nbsp);/g, (e) => ENTITIES[e])
      return "\n```pre\n" + text.replace(/^\n+|\n+$/g, "") + "\n```\n"
    })
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

/** Heading text without markdown syntax (links, emphasis, code). */
function plainHeading(text) {
  return text
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .trim()
}

/**
 * GitHub's anchor for a heading: lower-case, emoji and punctuation dropped,
 * spaces to hyphens — so a README's own "[Architecture](#-architecture)"
 * links land on the heading rendered here.
 */
export function readmeSlug(text) {
  return plainHeading(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s/g, "-")
}

/** The README's `##` sections, for a contents list: [{ text, slug }]. */
export function readmeHeadings(md) {
  const out = []
  let fenced = false
  for (const line of stripHtml(md).split("\n")) {
    if (/^\s*```/.test(line)) fenced = !fenced
    const m = !fenced && /^##\s+(.*)/.exec(line)
    if (!m) continue
    const text = plainHeading(m[1]).replace(/^[^\p{L}\p{N}]+/u, "").trim()
    if (text) out.push({ text, slug: readmeSlug(m[1]) })
  }
  return out
}

/**
 * Status badges and deploy buttons (shields.io, CI badges, "Deploy to X"):
 * useful on GitHub, a wall of coloured pills on a case-study page.
 */
const BADGE = /(shields\.io|badgen\.net|badge\.svg|badge\.fury|codecov\.io|deploy-to-render|render\.com\/images\/deploy|vercel\.com\/button|railway\.app\/button|herokucdn\.com\/deploy)/i
function stripBadges(md) {
  return md
    .replace(/\[!\[[^\]]*\]\(([^)]*)\)\]\([^)]*\)/g, (all, src) => (BADGE.test(src) ? "" : all))
    .replace(/!\[[^\]]*\]\(([^)]*)\)/g, (all, src) => (BADGE.test(src) ? "" : all))
}

/** Exported for the blog and the Now section, which render markdown the site itself authors. */
export function renderMarkdown(md, ctx) {
  const clean = ctx?.badges === false ? stripBadges(stripHtml(md)) : stripHtml(md)
  const lines = clean.split("\n")
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
      // Block-letter art (box-drawing and block glyphs): set tight, in the
      // accent, centred and unboxed, so it reads as the banner it was drawn as.
      if (lang === "pre" && /[█▀▄░▒▓╔╗╚╝═║]/.test(buf.join(""))) {
        // A page that already titles the project (the case study) skips it.
        if (ctx?.banners === false) continue
        out.push(
          <div key={k++} className="my-6 overflow-x-auto" aria-hidden="true">
            <pre className="mx-auto w-max font-mono text-[6px] leading-[1.2] text-[var(--accent)] sm:text-[9px] md:text-[11px]">
              {buf.join("\n")}
            </pre>
          </div>
        )
        continue
      }
      out.push(
        <div key={k++} className="my-4 overflow-hidden rounded-lg border border-[var(--line)] bg-black/40">
          {lang && lang !== "pre" && (
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
      // READMEs are demoted two levels (their h1 is not the page's h1); the
      // blog passes headingShift: 0 so its `##` sections are real h2s.
      const Tag = `h${Math.min(h[1].length + (ctx.headingShift ?? 2), 6)}`
      out.push(
        <Tag
          key={k++}
          id={ctx?.anchors ? `readme-${readmeSlug(h[2])}` : undefined}
          className={H_STYLES[level] + (ctx?.anchors ? " scroll-mt-28" : "")}
        >
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

/**
 * `article`: the case-study page's reading mode — heading anchors, badge
 * walls dropped, and in-README fragment links ("#-architecture") scrolled to
 * in place, since a bare "#…" would change the hash route and leave the page.
 * `onMarkdown(md)` hands the loaded README up (the page builds its contents
 * list from it).
 */
export default function GithubReadme({ repoUrl, fallback, article = false, onMarkdown }) {
  const [state, setState] = useState({ status: "loading", md: null, repoGone: false })
  const repo = parseRepo(repoUrl)
  // Latest callback without re-running the fetch when the parent re-renders.
  const onMd = useRef(onMarkdown)
  useEffect(() => {
    onMd.current = onMarkdown
  })

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
        if (res.kind === "readme") {
          setState({ status: "ok", md: res.text, repoGone: false })
          onMd.current?.(res.text)
        }
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

  if (!article) return <div className="readme-body">{renderMarkdown(state.md, repo)}</div>

  const onClick = (e) => {
    const a = e.target.closest?.("a[href^='#']")
    if (!a) return
    const id = a.getAttribute("href").slice(1)
    if (id.startsWith("/")) return // a real route
    e.preventDefault()
    const el = document.getElementById(`readme-${id}`)
    if (!el) return
    // In the modal the dialog scrolls, not the page Lenis drives.
    if (window.__lenis && !el.closest('[role="dialog"]')) window.__lenis.scrollTo(el, { offset: -96 })
    else el.scrollIntoView({ behavior: "smooth", block: "start" })
  }
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- delegation only; the links themselves stay focusable and keyboard-activated
    <div className="readme-body" onClick={onClick}>
      {renderMarkdown(state.md, { ...repo, anchors: true, badges: false, banners: false })}
    </div>
  )
}
