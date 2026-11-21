/**
 * The featured project deck rendered by the Projects carousel.
 *
 * It lives here rather than inside ProjectsBold because the Tech Stack
 * section needs the tags too — its "build your stack" tray counts how many
 * projects the assembled stack matches. Two copies of the tag list would
 * drift the moment a project is added.
 */
import { applyOverlay } from "./published.js"
import { slugForFeaturedId } from "./projectSlugs.js"

const FEATURED_SOURCE = [
  {
    id: 1,
    title: "Auralis",
    description: "A sales chat assistant that uses prospect context to answer objections. Built with LangGraph, retrieval augmented generation, and WebSockets.",
    tags: ["Python", "FastAPI", "LangGraph", "RAG", "Redis"],
    link: "https://github.com/aayush2724/Auralis",
    demo: "https://auralis-client-five.vercel.app",
    image: "/auralis-800.jpg",
    badge: "Sales Intelligence",
    earthy: "from-[#1a2a3f] to-[#0b1017]"
  },
  {
    id: 2,
    title: "DeskGuard",
    description: "A library desk booking system with a live seat map, QR check-in, and automatic release of no-show reservations.",
    tags: ["Node.js", "PostgreSQL", "Redis", "SSE"],
    link: "https://github.com/aayush2724/DeskGuard",
    demo: "https://deskguard-jade.vercel.app",
    image: "/deskguard-800.jpg",
    badge: "Real-Time Booking",
    earthy: "from-[#2d3436] to-[#000000]"
  },
  {
    id: 5,
    title: "Beatzy",
    description: "Identify a track and inspect its tempo, key, chords, mood, and genre through one music analysis interface.",
    tags: ["React", "Web Audio", "ACRCloud"],
    link: "https://github.com/aayush2724/Beatzy",
    demo: "https://beatzy-zeta.vercel.app",
    image: "/Beatzy-800.jpg",
    badge: "Audio Fingerprinting",
    earthy: "from-[#3e4a3d] to-[#242b23]"
  },
  {
    id: 6,
    title: "Citizen Resolver",
    description: "A public service portal for submitting complaints and following their progress with local authorities.",
    tags: ["React", "Node.js", "MongoDB"],
    link: "https://github.com/aayush2724/Citizen-Resolver-System",
    demo: "https://civicresolve-jet.vercel.app",
    image: "/civicresolve-800.jpg",
    badge: "Civic Tech",
    earthy: "from-[#4a3728] to-[#2c1e14]"
  },
  {
    id: 3,
    title: "AlgoVision",
    description: "Explore algorithms step by step with animated traces, operation counts, side by side comparisons, and an in-browser Python runner.",
    tags: ["Python", "FastAPI", "Three.js", "Pyodide"],
    link: "https://github.com/aayush2724/AlgoVision",
    demo: "https://algo-vision-vert.vercel.app/",
    image: "/algovision-800.jpg",
    badge: "474 Tracers",
    earthy: "from-[#2c3e50] to-[#000000]"
  },
  {
    id: 4,
    title: "LeadForge",
    description: "A lead research and tracking tool built during the NIT Trichy hackathon, where the team placed third.",
    tags: ["Python", "AI", "FastAPI"],
    link: "https://github.com/aayush2724/LeadForge",
    demo: "https://leadforge-876cf6-11q5x.thinkroot.app/",
    image: "/leadforge-hackathon-proof.svg",
    badge: "3rd Place NIT",
    earthy: "from-[#3a3530] to-[#1f1c18]"
  },
  {
    id: 14,
    title: "MindFlow",
    description: "A student wellness dashboard that tracks burnout signals and helps counselors review cases and follow up.",
    tags: ["React", "Node.js", "Firebase"],
    link: "https://github.com/aayush2724/MindFlow",
    demo: "https://mind-flow-psi.vercel.app",
    image: "/mindflow-800.jpg",
    badge: "Burnout Predictor",
    earthy: "from-[#0d1f2d] to-[#00dbe722]"
  },
  {
    id: 9,
    title: "Job Portal",
    description: "A job board for browsing roles, managing applications, and connecting candidates with employers.",
    tags: ["TypeScript", "Next.js", "Prisma"],
    link: "https://github.com/aayush2724/Job-Portal",
    image: "/job-portal-cover.svg",
    badge: "Career Platform",
    earthy: "from-[#7a6a4a] to-[#4a3a2a]"
  },
  {
    id: 10,
    title: "Chord Detector",
    description: "Analyze an audio clip and identify the guitar chords with a machine learning model.",
    tags: ["Python", "ML", "Audio"],
    link: "https://github.com/aayush2724/Chord-Detector",
    image: "/chord-detector-cover.svg",
    badge: "Guitar × ML",
    earthy: "from-[#4a5a6a] to-[#2a3a4a]"
  },
  {
    id: 11,
    title: "Visitor Management",
    description: "A visitor check-in system with QR passes, biometric verification, and a live dashboard.",
    tags: ["HTML", "PHP", "MySQL"],
    link: "https://github.com/aayush2724/CheckMate",
    image: "/vms-800.jpg",
    badge: "QR Check-in",
    earthy: "from-[#0a1a12] to-[#001a0d]"
  },
]

/**
 * Published overrides are applied by slug (src/data/published.js). The deck is
 * never extended automatically — a new card needs artwork — so only field
 * overrides apply here. Tag overrides also move the Tech Stack tray counts.
 */
export const FEATURED_PROJECTS = applyOverlay(FEATURED_SOURCE, "featured", (p) => slugForFeaturedId(p.id))

/**
 * A stack tool matches a project tag when either side contains the other,
 * case-insensitively: "SQL" should find "PostgreSQL" and "AI" should find
 * "AI/ML". Exact-match-only left most of the stack matching nothing, which
 * made the tray feel broken; the containment rule is deliberately forgiving.
 * Single characters are excluded so "C" doesn't match everything.
 */
export function skillMatchesTag(skill, tag) {
  const s = skill.toLowerCase().trim()
  const t = tag.toLowerCase().trim()
  if (s === t) return true
  if (s.length < 2 || t.length < 2) return false
  return s.includes(t) || t.includes(s)
}

/** How many of `skills` a project covers — drives both filtering and ranking. */
export function projectMatchCount(project, skills) {
  return skills.filter((skill) => project.tags.some((tag) => skillMatchesTag(skill, tag))).length
}

/**
 * Projects matching ANY of `skills`, best match first. OR rather than AND:
 * with a five-tool stack an AND filter empties the grid almost every time.
 */
export function filterProjectsBySkills(skills) {
  if (!skills.length) return FEATURED_PROJECTS
  return FEATURED_PROJECTS.map((p) => ({ p, n: projectMatchCount(p, skills) }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .map((x) => x.p)
}

/** Featured projects tagged with a single tool — the per-chip count in the tray. */
export function countProjectsForSkill(skill) {
  return FEATURED_PROJECTS.filter((p) => p.tags.some((tag) => skillMatchesTag(skill, tag))).length
}
