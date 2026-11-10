import { describe, it, expect } from "vitest"
import {
  PROJECT_SLUGS,
  PROJECT_SLUG_LIST,
  SLUG_PATTERN,
  slugForCaseStudyId,
  slugForFeaturedId,
  slugForProjectName,
  repoUrl,
} from "./projectSlugs"
import { caseStudies } from "./caseStudies"
import { projects } from "./projects"
import { FEATURED_PROJECTS } from "./featuredProjects"

describe("project slug map", () => {
  it("every slug is well-formed and every repo is owner/name", () => {
    for (const slug of PROJECT_SLUG_LIST) {
      expect(slug).toMatch(SLUG_PATTERN)
      const repo = PROJECT_SLUGS[slug].repo
      if (repo !== null) expect(repo).toMatch(/^[\w.-]+\/[\w.-]+$/)
    }
  })

  it("maps every case study to exactly one slug", () => {
    for (const cs of caseStudies) {
      const slug = slugForCaseStudyId(cs.id)
      expect(slug, `case study ${cs.id}`).not.toBeNull()
    }
    const ids = PROJECT_SLUG_LIST.map((s) => PROJECT_SLUGS[s].caseStudyId).filter(Boolean)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("maps every featured deck entry to exactly one slug", () => {
    for (const p of FEATURED_PROJECTS) {
      expect(slugForFeaturedId(p.id), `featured #${p.id} ${p.title}`).not.toBeNull()
    }
    const ids = PROJECT_SLUG_LIST.map((s) => PROJECT_SLUGS[s].featuredId).filter((x) => x != null)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("maps every projects.js entry to exactly one slug", () => {
    for (const p of projects) {
      expect(slugForProjectName(p.name), `project ${p.name}`).not.toBeNull()
    }
    const names = PROJECT_SLUG_LIST.map((s) => PROJECT_SLUGS[s].projectName).filter(Boolean)
    expect(new Set(names).size).toBe(names.length)
  })

  it("uses the verified canonical repositories", () => {
    expect(repoUrl("auralis")).toBe("https://github.com/aayush2724/Auralis")
    expect(repoUrl("visitor-management")).toBe("https://github.com/aayush2724/CheckMate")
    expect(repoUrl("checkmate")).toBeNull()
    expect(repoUrl("nope")).toBeNull()
  })

  it("data files agree with the canonical repository where they link one", () => {
    // The deck used to link Auralis at a fork; keep the three files honest.
    const featured = FEATURED_PROJECTS.find((p) => p.title === "Auralis")
    expect(featured.link).toBe(repoUrl("auralis"))
    const visitor = projects.find((p) => p.name === "Visitor Management System")
    expect(visitor.gh).toBe(repoUrl("visitor-management"))
  })
})
