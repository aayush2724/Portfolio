/**
 * Published-content overlay.
 *
 * The Portfolio Intelligence Agent never edits caseStudies.js, projects.js or
 * featuredProjects.js. When the owner approves a suggestion, the backend
 * writes the approved fields into src/data/published/projects.published.json
 * (via a pull request) and this module applies them — inside each data
 * module's export, so no component knows the overlay exists.
 *
 * Only fields that components actually render may be overridden; see the
 * allow-lists below and the JSON schema next to the data file. Titles are
 * never overridden because ProjectsBold joins the deck to case studies by
 * title. `validateOverlay` mirrors the schema in plain JS so the data file is
 * checked by `npm test` without a schema library.
 */
// The import attribute lets plain Node (scripts/export-seed.mjs, the data sync) load
// this module too; Vite and Vitest accept it as well.
import overlay from "./published/projects.published.json" with { type: "json" }
import { PROJECT_SLUGS, SLUG_PATTERN } from "./projectSlugs.js"

export const PUBLISHED = overlay

export const FEATURED_FIELDS = ["description", "tags", "badge", "link", "demo"]
export const PROJECTS_FIELDS = ["desc", "tags", "highlight", "gh", "demo", "badge"]
export const CASE_STUDY_FIELDS = ["badge", "tagline", "tags", "links"]
export const CASE_STUDY_LINK_FIELDS = ["github", "demo", "demo_note"]
const TARGET_FIELDS = { featured: FEATURED_FIELDS, projects: PROJECTS_FIELDS, caseStudy: CASE_STUDY_FIELDS }

/** Fields that must never appear in an overlay, whatever the target. */
export const FORBIDDEN_FIELDS = ["title", "name", "id", "image", "cover", "earthy", "problem", "approach", "role", "outcomes", "challenges"]

const REPO_URL = /^https:\/\/github\.com\/aayush2724\/[\w.-]+$/
const HTTPS_URL = /^https:\/\//

function patchFor(slug, target, source = PUBLISHED) {
  const entry = source?.projects?.[slug]?.[target]
  return entry && typeof entry === "object" ? entry : null
}

/**
 * Returns a new array with each entry's allowed fields overridden by the
 * overlay for its slug. Entries without a slug or without a patch pass
 * through untouched (same object), so the common case costs nothing.
 */
export function applyOverlay(entries, target, slugOf, source = PUBLISHED) {
  const allowed = TARGET_FIELDS[target]
  if (!allowed) throw new Error(`applyOverlay: unknown target "${target}"`)
  return entries.map((entry) => {
    const slug = slugOf(entry)
    const patch = slug ? patchFor(slug, target, source) : null
    if (!patch) return entry
    const next = { ...entry }
    for (const field of allowed) {
      if (!(field in patch)) continue
      if (field === "links") next.links = { ...(entry.links || {}), ...pick(patch.links, CASE_STUDY_LINK_FIELDS) }
      else if (field === "tags") next.tags = Array.isArray(patch.tags) && patch.tags.length ? [...patch.tags] : entry.tags
      else next[field] = patch[field]
    }
    return next
  })
}

function pick(obj, keys) {
  const out = {}
  if (!obj) return out
  for (const k of keys) if (k in obj) out[k] = obj[k]
  return out
}

/**
 * New projects the owner has published, shaped for a target. Case-study
 * additions are what make a project visible (a #/work/<slug> page with the
 * live README, the shell's `ls projects/`, prev/next); projects.js additions
 * feed the assistant's scripted fallback. The featured deck is never
 * extended automatically — it needs artwork.
 */
export function publishedAdditions(target, source = PUBLISHED) {
  // The file is validated in CI, but a bad merge must degrade to "no additions",
  // never to a crashed home page: only well-formed entries are shaped.
  const list = (Array.isArray(source?.additions) ? source.additions : []).filter(
    (a) => a && typeof a === "object" && typeof a.slug === "string" && typeof a.name === "string" && Array.isArray(a.tags)
  )
  if (target === "caseStudy") {
    return list.map((a) => ({
      id: a.slug,
      name: a.name,
      tagline: a.tagline ?? "",
      badge: a.badge ?? null,
      cover: null,
      links: { github: a.repoUrl ?? null, demo: a.demoUrl ?? null, demo_note: a.demoNote ?? null },
      tags: [...a.tags],
      updatedAt: a.updatedAt ?? null,
      published: true,
    }))
  }
  if (target === "projects") {
    return list.map((a) => ({
      name: a.name,
      desc: a.desc ?? a.tagline ?? "",
      tags: [...a.tags],
      gh: a.repoUrl ?? null,
      demo: a.demoUrl ?? null,
      badge: a.badge ?? null,
      highlight: a.highlight ?? a.tagline ?? "",
      updatedAt: a.updatedAt ?? null,
      updated: null,
      published: true,
    }))
  }
  return []
}

/**
 * Plain-JS mirror of projects.published.schema.json. Returns a list of
 * human-readable problems; empty means valid.
 */
export function validateOverlay(source) {
  const errors = []
  const err = (m) => errors.push(m)
  if (!source || typeof source !== "object") return ["overlay is not an object"]
  if (!Number.isInteger(source.version) || source.version < 1) err("version must be a positive integer")
  if (typeof source.updatedAt !== "string" || Number.isNaN(Date.parse(source.updatedAt))) err("updatedAt must be an ISO date-time")
  if (!source.projects || typeof source.projects !== "object" || Array.isArray(source.projects)) err("projects must be an object")
  if (!Array.isArray(source.additions)) err("additions must be an array")
  for (const key of Object.keys(source)) {
    if (!["$schema", "version", "updatedAt", "projects", "additions"].includes(key)) err(`unknown top-level key "${key}"`)
  }

  const checkText = (where, v, max) => {
    if (typeof v !== "string" || !v.trim()) err(`${where} must be a non-empty string`)
    else if (v.length > max) err(`${where} exceeds ${max} characters`)
  }
  const checkTags = (where, v) => {
    if (!Array.isArray(v) || v.length < 1 || v.length > 10) err(`${where} must be 1–10 tags`)
    else for (const t of v) if (typeof t !== "string" || !t.trim() || t.length > 32) err(`${where} has an invalid tag`)
  }
  const checkRepo = (where, v) => { if (typeof v !== "string" || !REPO_URL.test(v)) err(`${where} must be https://github.com/aayush2724/<repo>`) }
  const checkDemo = (where, v) => { if (v !== null && (typeof v !== "string" || !HTTPS_URL.test(v))) err(`${where} must be an https URL or null`) }
  const checkBadge = (where, v) => { if (v !== null && (typeof v !== "string" || v.length > 60)) err(`${where} must be a short string or null`) }

  const slugs = PROJECT_SLUGS
  for (const [slug, targets] of Object.entries(source.projects || {})) {
    if (!SLUG_PATTERN.test(slug)) err(`"${slug}" is not a valid slug`)
    else if (!slugs[slug]) err(`"${slug}" is not a known project slug`)
    if (!targets || typeof targets !== "object") { err(`${slug}: targets must be an object`); continue }
    for (const [target, patch] of Object.entries(targets)) {
      if (target === "provenance") continue
      const allowed = TARGET_FIELDS[target]
      if (!allowed) { err(`${slug}: unknown target "${target}"`); continue }
      if (!patch || typeof patch !== "object") { err(`${slug}.${target}: must be an object`); continue }
      for (const field of Object.keys(patch)) {
        if (FORBIDDEN_FIELDS.includes(field)) err(`${slug}.${target}.${field}: this field may never be published`)
        else if (!allowed.includes(field)) err(`${slug}.${target}.${field}: not a rendered field`)
      }
      const w = (f) => `${slug}.${target}.${f}`
      if ("description" in patch) checkText(w("description"), patch.description, 400)
      if ("desc" in patch) checkText(w("desc"), patch.desc, 400)
      if ("highlight" in patch) checkText(w("highlight"), patch.highlight, 400)
      if ("tagline" in patch) checkText(w("tagline"), patch.tagline, 160)
      if ("tags" in patch) checkTags(w("tags"), patch.tags)
      if ("badge" in patch) checkBadge(w("badge"), patch.badge)
      if ("link" in patch) checkRepo(w("link"), patch.link)
      if ("gh" in patch) checkRepo(w("gh"), patch.gh)
      if ("demo" in patch) checkDemo(w("demo"), patch.demo)
      if ("links" in patch) {
        const links = patch.links
        if (!links || typeof links !== "object") err(`${w("links")} must be an object`)
        else {
          for (const k of Object.keys(links)) if (!CASE_STUDY_LINK_FIELDS.includes(k)) err(`${w("links")}.${k}: unknown link field`)
          if ("github" in links) checkRepo(`${w("links")}.github`, links.github)
          if ("demo" in links) checkDemo(`${w("links")}.demo`, links.demo)
          if ("demo_note" in links && links.demo_note !== null) checkText(`${w("links")}.demo_note`, links.demo_note, 160)
        }
      }
    }
  }

  const seen = new Set()
  if (Array.isArray(source.additions) && source.additions.length > 50) err("additions: at most 50 entries")
  for (const [i, a] of (source.additions || []).entries()) {
    const w = (f) => `additions[${i}].${f}`
    if (!a || typeof a !== "object") { err(`additions[${i}] must be an object`); continue }
    if (typeof a.slug !== "string" || !SLUG_PATTERN.test(a.slug)) err(w("slug") + " is not a valid slug")
    else if (seen.has(a.slug)) err(w("slug") + " is duplicated")
    else seen.add(a.slug)
    if (slugs[a.slug]?.caseStudyId) err(`${w("slug")}: "${a.slug}" already has a case study; publish an override instead`)
    checkText(w("name"), a.name, 60)
    checkText(w("tagline"), a.tagline, 160)
    checkText(w("desc"), a.desc, 400)
    checkTags(w("tags"), a.tags)
    checkRepo(w("repoUrl"), a.repoUrl)
    if ("demoUrl" in a) checkDemo(w("demoUrl"), a.demoUrl)
    if ("badge" in a) checkBadge(w("badge"), a.badge)
    if ("highlight" in a && a.highlight !== null) checkText(w("highlight"), a.highlight, 400)
    if ("demoNote" in a && a.demoNote !== null) checkText(w("demoNote"), a.demoNote, 160)
    for (const k of Object.keys(a)) {
      if (!["slug", "name", "tagline", "desc", "highlight", "tags", "repoUrl", "demoUrl", "demoNote", "badge", "updatedAt", "provenance"].includes(k)) err(`${w(k)}: unknown field`)
    }
  }
  return errors
}
