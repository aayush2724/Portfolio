import { describe, it, expect } from "vitest"
import { PUBLISHED, validateOverlay, applyOverlay, publishedAdditions, FORBIDDEN_FIELDS } from "./published"
import { caseStudies, getCaseStudyById } from "./caseStudies"
import { projects } from "./projects"
import { FEATURED_PROJECTS } from "./featuredProjects"

const base = () => ({ version: 1, updatedAt: "2026-11-08T00:00:00Z", projects: {}, additions: [] })

describe("published overlay file", () => {
  it("the shipped overlay validates", () => {
    expect(validateOverlay(PUBLISHED)).toEqual([])
  })

  it("an empty overlay leaves every data module unchanged", () => {
    // With no patches, applyOverlay must hand back the same objects.
    const same = applyOverlay(FEATURED_PROJECTS, "featured", () => "auralis", base())
    expect(same[0]).toBe(FEATURED_PROJECTS[0])
    expect(publishedAdditions("caseStudy", base())).toEqual([])
    expect(caseStudies.length).toBeGreaterThan(0)
    expect(projects.length).toBeGreaterThan(0)
  })
})

describe("validateOverlay", () => {
  it("rejects titles and other never-published fields", () => {
    const o = base()
    o.projects.auralis = { featured: { title: "Renamed" }, caseStudy: { name: "X" } }
    const errors = validateOverlay(o)
    expect(errors.some((e) => e.includes("featured.title"))).toBe(true)
    expect(errors.some((e) => e.includes("caseStudy.name"))).toBe(true)
    for (const f of ["title", "name", "image"]) expect(FORBIDDEN_FIELDS).toContain(f)
  })

  it("rejects unknown slugs, unknown targets and non-rendered fields", () => {
    const o = base()
    o.projects["not-a-project"] = { featured: { description: "x" } }
    o.projects.auralis = { deck: { description: "x" }, projects: { updatedAt: "2026-01-01" } }
    const errors = validateOverlay(o)
    expect(errors.some((e) => e.includes("not a known project slug"))).toBe(true)
    expect(errors.some((e) => e.includes('unknown target "deck"'))).toBe(true)
    expect(errors.some((e) => e.includes("projects.updatedAt"))).toBe(true)
  })

  it("only accepts repository links on the owner's GitHub and https demos", () => {
    const o = base()
    o.projects.auralis = {
      featured: { link: "https://github.com/someone-else/Auralis", demo: "http://insecure.example" },
      caseStudy: { links: { github: "javascript:alert(1)" } },
    }
    const errors = validateOverlay(o)
    expect(errors.filter((e) => e.includes("github.com/aayush2724")).length).toBe(2)
    expect(errors.some((e) => e.includes("featured.demo"))).toBe(true)
  })

  it("accepts a well-formed override and addition", () => {
    const o = base()
    o.projects.auralis = {
      featured: { description: "Updated copy", tags: ["Python", "FastAPI"], badge: "Latest", link: "https://github.com/aayush2724/Auralis", demo: null },
      caseStudy: { tagline: "AI sales intelligence", links: { demo_note: null } },
      provenance: { suggestionId: "abc", publishedAt: "2026-11-09T00:00:00Z", sources: ["https://github.com/aayush2724/Auralis/blob/abc/README.md"] },
    }
    o.additions.push({ slug: "vetra", name: "Vetra", tagline: "Edge animal diagnostics", desc: "On-device disease diagnosis for farm animals.", tags: ["Python", "MQTT"], repoUrl: "https://github.com/aayush2724/Vetra", demoUrl: "https://vetra-lyart-omega.vercel.app", badge: null })
    expect(validateOverlay(o)).toEqual([])
  })

  it("rejects over-long addition fields and too many additions", () => {
    const o = base()
    o.additions.push({ slug: "vetra", name: "Vetra", tagline: "t", desc: "d", tags: ["x"], repoUrl: "https://github.com/aayush2724/Vetra", highlight: "h".repeat(401), demoNote: "n".repeat(161) })
    const errors = validateOverlay(o)
    expect(errors.some((e) => e.includes("highlight"))).toBe(true)
    expect(errors.some((e) => e.includes("demoNote"))).toBe(true)
    const many = base()
    for (let i = 0; i < 51; i++) many.additions.push({ slug: `p-${i}`, name: "P", tagline: "t", desc: "d", tags: ["x"], repoUrl: "https://github.com/aayush2724/P" })
    expect(validateOverlay(many).some((e) => e.includes("at most 50"))).toBe(true)
  })

  it("refuses an addition for a project that already has a case study", () => {
    const o = base()
    o.additions.push({ slug: "auralis", name: "Auralis", tagline: "t", desc: "d", tags: ["x"], repoUrl: "https://github.com/aayush2724/Auralis" })
    expect(validateOverlay(o).some((e) => e.includes("already has a case study"))).toBe(true)
  })
})

describe("applyOverlay", () => {
  it("overrides only allowed fields and merges case-study links", () => {
    const o = base()
    o.projects.auralis = {
      featured: { description: "New deck copy", tags: ["A", "B"], title: "IGNORED" },
      caseStudy: { badge: "Updated", links: { demo_note: "note" } },
    }
    const deck = applyOverlay(FEATURED_PROJECTS, "featured", (p) => (p.title === "Auralis" ? "auralis" : null), o)
    const a = deck.find((p) => p.title === "Auralis")
    expect(a.description).toBe("New deck copy")
    expect(a.tags).toEqual(["A", "B"])
    expect(a.title).toBe("Auralis")
    expect(a.image).toBe(FEATURED_PROJECTS.find((p) => p.title === "Auralis").image)

    const cs = applyOverlay(caseStudies, "caseStudy", (c) => c.id, o).find((c) => c.id === "auralis")
    expect(cs.badge).toBe("Updated")
    expect(cs.links.github).toBe(getCaseStudyById("auralis").links.github)
    expect(cs.links.demo_note).toBe("note")
    expect(cs.name).toBe("Auralis")
  })

  it("ignores malformed additions and empty tag overrides instead of crashing", () => {
    const o = base()
    o.additions.push({ slug: "broken" }, null, { slug: "vetra", name: "Vetra", tagline: "t", desc: "d", tags: ["Python"], repoUrl: "https://github.com/aayush2724/Vetra" })
    expect(publishedAdditions("caseStudy", o).map((a) => a.id)).toEqual(["vetra"])
    o.projects.auralis = { featured: { tags: [] } }
    const deck = applyOverlay(FEATURED_PROJECTS, "featured", (p) => (p.title === "Auralis" ? "auralis" : null), o)
    expect(deck.find((p) => p.title === "Auralis").tags).toEqual(FEATURED_PROJECTS.find((p) => p.title === "Auralis").tags)
  })

  it("shapes additions for the case-study list and the projects list", () => {
    const o = base()
    o.additions.push({ slug: "vetra", name: "Vetra", tagline: "Edge Dx", desc: "Desc", tags: ["Python"], repoUrl: "https://github.com/aayush2724/Vetra", demoUrl: null, badge: "New" })
    const [cs] = publishedAdditions("caseStudy", o)
    expect(cs).toMatchObject({ id: "vetra", name: "Vetra", tagline: "Edge Dx", badge: "New", links: { github: "https://github.com/aayush2724/Vetra", demo: null }, published: true })
    const [pj] = publishedAdditions("projects", o)
    expect(pj).toMatchObject({ name: "Vetra", desc: "Desc", gh: "https://github.com/aayush2724/Vetra", highlight: "Edge Dx" })
    expect(publishedAdditions("featured", o)).toEqual([])
  })
})
