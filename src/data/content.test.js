import { describe, expect, it } from "vitest"
import { buildPosts, formatDate, parseFrontmatter, parseNow, readingTime, slugFromPath } from "./content"

describe("frontmatter", () => {
  it("parses strings, quoted strings and lists, and leaves the body alone", () => {
    const { data, body } = parseFrontmatter(`---\ntitle: "Hello: world"\ndate: 2026-11-06\ntags: [a, "b c", d]\nfoo bar\n---\n# Body\n\ntext`)
    expect(data).toEqual({ title: "Hello: world", date: "2026-11-06", tags: ["a", "b c", "d"] })
    expect(body).toBe("# Body\n\ntext")
  })
  it("passes through content without frontmatter", () => {
    expect(parseFrontmatter("# Just markdown")).toEqual({ data: {}, body: "# Just markdown" })
  })
})

describe("helpers", () => {
  it("derives slugs, reading time and dates", () => {
    expect(slugFromPath("../content/posts/2026-11-06-why-my-404-page-is-a-terminal.md")).toBe("why-my-404-page-is-a-terminal")
    expect(slugFromPath("notes.md")).toBe("notes")
    expect(readingTime("one two three")).toBe(1)
    expect(readingTime(Array(650).fill("w").join(" "))).toBe(3)
    expect(formatDate("2026-11-06")).toBe("6 Nov 2026")
    expect(formatDate("soon")).toBe("soon")
    expect(formatDate(undefined)).toBe("")
  })
})

describe("buildPosts", () => {
  it("orders newest first, drops drafts and fills defaults", () => {
    const posts = buildPosts({
      "../content/posts/2026-01-01-old.md": "---\ntitle: Old\ndate: 2026-01-01\n---\nbody",
      "../content/posts/2026-11-06-new.md": "---\ntitle: New\ndate: 2026-11-06\nsummary: s\ntags: [x]\n---\nbody",
      "../content/posts/2026-12-01-draft.md": "---\ntitle: Draft\ndate: 2026-12-01\ndraft: true\n---\nbody",
      "../content/posts/untitled.md": "no frontmatter at all",
    })
    expect(posts.map((p) => p.slug)).toEqual(["new", "old", "untitled"])
    expect(posts[0]).toMatchObject({ title: "New", summary: "s", tags: ["x"], minutes: 1, body: "body" })
    expect(posts[2]).toMatchObject({ title: "untitled", tags: [], date: "" })
  })
})

describe("parseNow", () => {
  it("splits cards on second-level headings", () => {
    const now = parseNow("---\nupdated: 2026-11-06\n---\nintro ignored\n\n## Building\n- a\n- b\n\n## Learning\ntext\n")
    expect(now.updated).toBe("2026-11-06")
    expect(now.sections).toEqual([
      { title: "Building", body: "- a\n- b" },
      { title: "Learning", body: "text" },
    ])
  })
})
