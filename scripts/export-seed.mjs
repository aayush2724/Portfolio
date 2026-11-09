/**
 * Export the portfolio's project copy as the backend's seed file.
 *
 *   node scripts/export-seed.mjs            → backend/seeds/projects.seed.json
 *
 * Reads the three data files through the same modules the site uses (so the
 * published overlay is already applied) plus the slug map, and writes one
 * record per canonical slug. The backend seeds every statement here as a
 * `claimed` fact — portfolio copy is a claim until README/source evidence
 * confirms it — with a source pointing at the data file in this repository.
 */
import { writeFileSync, mkdirSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { PROJECT_SLUGS } from "../src/data/projectSlugs.js"
import { caseStudies } from "../src/data/caseStudies.js"
import { projects } from "../src/data/projects.js"
import { FEATURED_PROJECTS } from "../src/data/featuredProjects.js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, "../backend/seeds/projects.seed.json")
const SOURCE_REPO = "aayush2724/Portfolio"
const SOURCE_REF = "main"

/** "Team of 2 — with Kaki Harshita" → co_built; "Solo" → sole; unknown → null. */
function attributionFromTeam(teamSize) {
  if (!teamSize) return null
  const t = teamSize.toLowerCase()
  if (/\bsolo\b|individual|alone|^1\b|one person/.test(t)) return "sole"
  const m = /team of (\d+)/.exec(t)
  if ((m && Number(m[1]) > 1) || /\bwith\b|pair|co-/.test(t)) return "co_built"
  return null
}

const records = Object.entries(PROJECT_SLUGS).map(([slug, meta], index) => {
  const caseStudy = meta.caseStudyId ? caseStudies.find((c) => c.id === meta.caseStudyId) ?? null : null
  const project = meta.projectName ? projects.find((p) => p.name === meta.projectName) ?? null : null
  const featured = meta.featuredId != null ? FEATURED_PROJECTS.find((f) => f.id === meta.featuredId) ?? null : null
  const attribution = meta.attribution ? meta.attribution.replace("-", "_") : attributionFromTeam(caseStudy?.role?.teamSize)
  return {
    slug,
    name: meta.name,
    status: meta.status,
    attribution,
    repo: meta.repo,
    repoUrl: meta.repo ? `https://github.com/${meta.repo}` : null,
    demoUrl: caseStudy?.links?.demo ?? project?.demo ?? featured?.demo ?? null,
    tagline: caseStudy?.tagline ?? featured?.badge ?? null,
    isFeatured: featured != null,
    sortOrder: featured ? FEATURED_PROJECTS.indexOf(featured) : 100 + index,
    sources: {
      caseStudy: caseStudy ? "src/data/caseStudies.js" : null,
      project: project ? "src/data/projects.js" : null,
      featured: featured ? "src/data/featuredProjects.js" : null,
    },
    caseStudy,
    project,
    featured,
  }
})

const out = {
  generatedAt: new Date().toISOString(),
  sourceRepo: SOURCE_REPO,
  sourceRef: SOURCE_REF,
  projects: records,
}
mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n")
console.log(`wrote ${records.length} projects → ${OUT}`)
