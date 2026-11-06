/**
 * Markdown content for the site: blog posts and now.md. Pure parsing only;
 * posts.js does the Vite glob so these can be unit-tested in node.
 *
 * Frontmatter is a deliberately small YAML subset: `key: value` lines,
 * quoted or bare strings, and `[a, b]` lists. Enough for a title, a date,
 * a summary and tags without pulling in a parser.
 */

export function parseFrontmatter(raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw)
  if (!m) return { data: {}, body: raw }
  const data = {}
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([\w-]+):\s*(.*)$/.exec(line)
    if (!kv) continue
    const value = kv[2].trim()
    if (/^\[.*\]$/.test(value)) {
      data[kv[1]] = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean)
    } else {
      data[kv[1]] = value.replace(/^["']|["']$/g, "")
    }
  }
  return { data, body: m[2] }
}

/** "2026-11-06-why-my-404-page-is-a-terminal.md" → "why-my-404-page-is-a-terminal" */
export function slugFromPath(path) {
  return path
    .split("/")
    .pop()
    .replace(/\.md$/, "")
    .replace(/^\d{4}-\d{2}-\d{2}-/, "")
}

export function readingTime(body) {
  const words = body.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

/** "2026-11-06" → "6 Nov 2026"; anything unparsable comes back as given. */
export function formatDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || "")) return iso || ""
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
}

/** { "../content/posts/x.md": rawMarkdown } → posts, newest first, drafts dropped. */
export function buildPosts(modules) {
  return Object.entries(modules)
    .map(([path, raw]) => {
      const { data, body } = parseFrontmatter(raw)
      const slug = data.slug || slugFromPath(path)
      return {
        slug,
        title: data.title || slug,
        date: data.date || "",
        summary: data.summary || "",
        tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
        draft: data.draft === "true",
        body: body.trim(),
        minutes: readingTime(body),
      }
    })
    .filter((p) => !p.draft)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)))
}

/** now.md: an `updated` date and one card per `## Heading`. */
export function parseNow(raw) {
  const { data, body } = parseFrontmatter(raw)
  const sections = []
  let current = null
  for (const line of body.split(/\r?\n/)) {
    const h = /^##\s+(.*)$/.exec(line)
    if (h) {
      current = { title: h[1].trim(), body: "" }
      sections.push(current)
    } else if (current) {
      current.body += line + "\n"
    }
  }
  return { updated: data.updated || "", sections: sections.map((s) => ({ ...s, body: s.body.trim() })) }
}
