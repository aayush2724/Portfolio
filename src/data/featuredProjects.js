/**
 * The featured project deck rendered by the Projects carousel.
 *
 * It lives here rather than inside ProjectsBold because the Tech Stack
 * section needs the tags too — its "build your stack" tray counts how many
 * projects the assembled stack matches. Two copies of the tag list would
 * drift the moment a project is added.
 */
export const FEATURED_PROJECTS = [
  {
    id: 1,
    title: "Auralis",
    description: "AI-powered audio intelligence project focused on extracting meaning and structure from complex sound inputs.",
    tags: ["Python", "AI/ML", "Audio"],
    link: "https://github.com/aayush2724/auralisAI",
    demo: "https://auralis-client-five.vercel.app",
    image: "/auralis-800.jpg",
    badge: "Sound Intelligence",
    earthy: "from-[#1a2a3f] to-[#0b1017]"
  },
  {
    id: 2,
    title: "DeskGuard",
    description: "Workspace security and monitor system that detects unauthorized access using real-time surveillance.",
    tags: ["JavaScript", "Node.js", "OpenCV"],
    link: "https://github.com/aayush2724/DeskGuard",
    demo: "https://deskguard-jade.vercel.app",
    image: "/deskguard-800.jpg",
    badge: "Computer Vision",
    earthy: "from-[#2d3436] to-[#000000]"
  },
  {
    id: 5,
    title: "Beatzy",
    description: "Music collaboration platform with real-time beat sharing and social features for producers.",
    tags: ["React", "Firebase", "Web Audio"],
    link: "https://github.com/aayush2724/Beatzy",
    demo: "https://beatzy-zeta.vercel.app",
    image: "/Beatzy-800.jpg",
    badge: "Live Collab",
    earthy: "from-[#3e4a3d] to-[#242b23]"
  },
  {
    id: 6,
    title: "Citizen Resolver",
    description: "Public complaint resolution platform connecting citizens with government authorities.",
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
    description: "Interactive algorithm visualizer for understanding complex data structures and sorting algorithms.",
    tags: ["React", "Framer Motion", "Algorithms"],
    link: "https://github.com/aayush2724/AlgoVision",
    image: "",
    badge: "DSA Visualizer",
    earthy: "from-[#2c3e50] to-[#000000]"
  },
  {
    id: 4,
    title: "LeadForge",
    description: "AI-powered lead generation and management tool for sales teams.",
    tags: ["Python", "AI", "FastAPI"],
    link: "https://github.com/aayush2724/LeadForge",
    demo: "https://lead-forge-rust.vercel.app",
    image: "/leadforge-hackathon-proof.svg",
    badge: "🏆 3rd Place NIT",
    earthy: "from-[#3a3530] to-[#1f1c18]"
  },
  {
    id: 14,
    title: "MindFlow",
    description: "AI-powered student burnout detection platform with real-time wellness telemetry, counselor dashboards, and intervention alerts for educational institutions.",
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
    description: "Full-stack job board with application tracking and employer-candidate matching.",
    tags: ["TypeScript", "Next.js", "Prisma"],
    link: "https://github.com/aayush2724/Job-Portal",
    image: "/job-portal-cover.svg",
    badge: "Career Platform",
    earthy: "from-[#7a6a4a] to-[#4a3a2a]"
  },
  {
    id: 10,
    title: "Chord Detector",
    description: "ML-powered music analysis tool that identifies guitar chords from audio input.",
    tags: ["Python", "ML", "Audio"],
    link: "https://github.com/aayush2724/Chord-Detector",
    image: "/chord-detector-cover.svg",
    badge: "Guitar × ML",
    earthy: "from-[#4a5a6a] to-[#2a3a4a]"
  },
  {
    id: 11,
    title: "Visitor Management",
    description: "Biometric-secured check-in system for tracking and managing building visitors with QR codes and real-time dashboards.",
    tags: ["HTML", "PHP", "MySQL"],
    link: "https://github.com/aayush2724/CheckMate",
    image: "/vms-800.jpg",
    badge: "QR Check-in",
    earthy: "from-[#0a1a12] to-[#001a0d]"
  },
]

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
