/**
 * Canonical project identity.
 *
 * Project copy lives in three files that grew separately — caseStudies.js
 * (string ids), projects.js (keyed by name) and featuredProjects.js (numeric
 * ids) — and the only join between them was the project title. This map is
 * the single key the assistant, the published-content overlay and the
 * backend knowledge base all use. Nothing here is rendered; it is identity
 * only. Attribution is recorded where it is known from the case-study role
 * or from the repository being a fork of a teammate's; `null` means the
 * assistant says nothing about authorship beyond "in Aayush's account".
 *
 * `repo` is the verified canonical GitHub repository (owner/name), not
 * whatever link happens to be in a data file: the deck used to point Auralis
 * at a fork, and the `CheckMate` repository is the visitor-management system,
 * not the chess project (checked against its README, 2026-11-08).
 */
export const PROJECT_SLUGS = {
  auralis: {
    name: "Auralis",
    caseStudyId: "auralis",
    projectName: "Auralis",
    featuredId: 1,
    repo: "aayush2724/Auralis",
    attribution: "co-built",
    status: "active",
  },
  deskguard: {
    name: "DeskGuard",
    caseStudyId: "deskguard",
    projectName: "DeskGuard",
    featuredId: 2,
    repo: "aayush2724/DeskGuard",
    attribution: null,
    status: "active",
  },
  algovision: {
    name: "AlgoVision",
    caseStudyId: "algovision",
    projectName: "AlgoVision",
    featuredId: 3,
    repo: "aayush2724/AlgoVision",
    attribution: null,
    status: "active",
  },
  leadforge: {
    name: "LeadForge",
    caseStudyId: "leadforge",
    projectName: "LeadForge",
    featuredId: 4,
    repo: "aayush2724/LeadForge",
    attribution: "co-built",
    status: "active",
  },
  beatzy: {
    name: "Beatzy",
    caseStudyId: "beatzy",
    projectName: "Beatzy",
    featuredId: 5,
    repo: "aayush2724/Beatzy",
    attribution: null,
    status: "active",
  },
  "citizen-resolver": {
    name: "Citizen Resolver",
    caseStudyId: "citizen-resolver",
    projectName: "Citizen Resolver System",
    featuredId: 6,
    repo: "aayush2724/Citizen-Resolver-System",
    attribution: null,
    status: "active",
  },
  "chord-detector": {
    name: "Chord Detector",
    caseStudyId: "chord-detector",
    projectName: "Chord Detector",
    featuredId: 10,
    repo: "aayush2724/Chord-Detector",
    attribution: null,
    status: "active",
  },
  "job-portal": {
    name: "Job Portal",
    caseStudyId: "job-portal",
    projectName: "Job Portal",
    featuredId: 9,
    repo: "aayush2724/Job-Portal",
    attribution: null,
    status: "active",
  },
  "visitor-management": {
    name: "Visitor Management",
    caseStudyId: "visitor-management",
    projectName: "Visitor Management System",
    featuredId: 11,
    repo: "aayush2724/CheckMate",
    attribution: null,
    status: "active",
  },
  // The chess project. No repository has been found for it: the `CheckMate`
  // repository is the visitor-management system above.
  checkmate: {
    name: "CheckMate",
    caseStudyId: "checkmate",
    projectName: "CheckMate",
    featuredId: null,
    repo: null,
    attribution: null,
    status: "active",
  },
  "disaster-relief": {
    name: "Disaster Relief System",
    caseStudyId: "disaster-relief",
    projectName: "Disaster Relief System",
    featuredId: null,
    repo: "aayush2724/Disaster-relief-system",
    attribution: null,
    status: "active",
  },
  skillnest: {
    name: "SkillNest",
    caseStudyId: "skillnest",
    projectName: null,
    featuredId: null,
    repo: "aayush2724/Skillnest",
    attribution: null,
    status: "active",
  },
  chatroom: {
    name: "ChatRoom",
    caseStudyId: "chatroom",
    projectName: null,
    featuredId: null,
    repo: "aayush2724/chatRoom",
    attribution: null,
    status: "active",
  },
  mindflow: {
    name: "MindFlow",
    caseStudyId: null,
    projectName: "MindFlow",
    featuredId: 14,
    repo: "aayush2724/MindFlow",
    attribution: "co-built",
    status: "active",
  },
  medverify: {
    name: "MedVerify",
    caseStudyId: null,
    projectName: "MedVerify",
    featuredId: null,
    repo: "aayush2724/MedVerify",
    attribution: null,
    status: "active",
  },
  // Not in any data file yet: public repositories known from GitHub. The
  // knowledge base holds them as candidates until the owner publishes them.
  // Private repositories (Translog) are deliberately absent (owner, 2026-11-09).
  vetra: {
    name: "Vetra",
    caseStudyId: null,
    projectName: null,
    featuredId: null,
    repo: "aayush2724/Vetra",
    attribution: null,
    status: "candidate",
  },
  urjasetu: {
    name: "UrjaSetu",
    caseStudyId: null,
    projectName: null,
    featuredId: null,
    repo: "aayush2724/UrjaSetu",
    attribution: null,
    status: "candidate",
  },
}

export const PROJECT_SLUG_LIST = Object.keys(PROJECT_SLUGS)

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function findSlug(predicate) {
  const hit = Object.entries(PROJECT_SLUGS).find(([, p]) => predicate(p))
  return hit ? hit[0] : null
}

/** caseStudies.js id → slug (identical today, but keep the indirection). */
export function slugForCaseStudyId(id) {
  return findSlug((p) => p.caseStudyId === id)
}

/** featuredProjects.js numeric id → slug. */
export function slugForFeaturedId(id) {
  return findSlug((p) => p.featuredId === id)
}

/** projects.js `name` → slug. */
export function slugForProjectName(name) {
  return findSlug((p) => p.projectName === name)
}

/** Verified repository URL for a slug, or null when the project has none. */
export function repoUrl(slug) {
  const repo = PROJECT_SLUGS[slug]?.repo
  return repo ? `https://github.com/${repo}` : null
}
