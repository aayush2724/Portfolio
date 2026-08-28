import { useState, useRef, useEffect } from "react"
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion"
import { ContainerScroll } from "./ui/container-scroll-animation"
import Parallax from "./Parallax"
import CommandLabel from "./CommandLabel"
import CaseStudyModal from "./CaseStudyModal"
import LazyDevPage from "./LazyDevPage"
import { getCaseStudyByName } from "../data/caseStudies"
import AnimatedHeading from "./AnimatedHeading"

const PROJECTS = [
  {
    id: 1,
    title: "Auralis",
    description: "AI-powered audio intelligence project focused on extracting meaning and structure from complex sound inputs.",
    tags: ["Python", "AI/ML", "Audio"],
    link: "https://github.com/aayush2724/Auralis",
    demo: "https://auralis-client-five.vercel.app",
    image: "/auralis.png",
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
    image: "/deskguard.png",
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
    image: "/Beatzy.png",
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
    image: "/civicresolve.jpg",
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
    image: "/mindflow.png",
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
    link: "https://github.com/aayush2724/Visitor-Management-System",
    image: "/vms.png",
    badge: "QR Check-in",
    earthy: "from-[#0a1a12] to-[#001a0d]"
  },
]



function extractGradientColors(earthy) {
  const colors = earthy?.match(/#(?:[0-9a-fA-F]{3}){1,2}/g) || []
  return {
    primary: colors[0] || "#1f2937",
    secondary: colors[1] || "#000000",
  }
}

function ProjectCard({ project, index, onViewDescription, onViewDemo }) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)
  const hasImage = project.image && project.image !== ""
  const cardRef = useRef(null)
  const { primary, secondary } = extractGradientColors(project.earthy)

  const handleMouseMove = (e) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 25
    const rotateY = (centerX - x) / 25
    setRotate({ x: rotateX, y: rotateY })
    setMousePos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 })
  }

  return (
    <motion.div
      ref={cardRef}
      layoutId={`project-card-${project.id}`}
      data-cursor="View"
      style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
      animate={{ rotateX: isHovered ? rotate.x * 0.4 : rotate.x, rotateY: isHovered ? rotate.y * 0.4 : rotate.y }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setRotate({ x: 0, y: 0 }); setMousePos({ x: 50, y: 50 }) }}
      className="group relative h-[88%] min-w-[320px] md:min-w-[400px] overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A] cursor-pointer snap-center flex-shrink-0 transition-all duration-500 shadow-[0_24px_80px_rgba(0,0,0,0.55)] hover:-translate-y-2 hover:border-white/25 hover:shadow-[0_34px_110px_rgba(0,0,0,0.72)]"
    >
      <div className="absolute inset-[1px] rounded-[22px] border border-white/5 pointer-events-none" />
      <motion.div
        aria-hidden
        className="absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-30"
        style={{ background: primary }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 overflow-hidden">
        {hasImage ? (
          <motion.div 
            className="absolute -inset-4 transition-transform duration-1000 group-hover:scale-[1.08]"
            animate={{ 
              x: isHovered ? rotate.y * -20 : 0, 
              y: isHovered ? rotate.x * -20 : 0 
            }}
            transition={{ type: "spring", stiffness: 100, damping: 30 }}
          >
            {/* base state: dimmed duotone — crossfades to full-color on hover/focus */}
            <img
              src={project.image}
              alt={project.title}
              className="absolute inset-0 h-full w-full object-cover opacity-60 grayscale contrast-110 transition-all duration-700 group-hover:opacity-100 group-hover:grayscale-0 group-hover:contrast-100 group-focus-within:opacity-100 group-focus-within:grayscale-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/60 via-transparent to-[#0A0A0A]/60" />
            <div
              className="absolute inset-0 opacity-40 mix-blend-overlay group-hover:opacity-60 transition-opacity duration-700"
              style={{
                background: `linear-gradient(135deg, ${primary} 0%, transparent 100%)`
              }}
            />
          </motion.div>
        ) : (
          <div
            className="absolute inset-0 opacity-60 group-hover:opacity-100 transition-opacity duration-700"
            style={{
              background: `
                radial-gradient(ellipse 80% 60% at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.08) 0%, transparent 60%),
                radial-gradient(ellipse 60% 80% at ${100 - mousePos.x}% ${100 - mousePos.y}%, rgba(255,255,255,0.04) 0%, transparent 50%),
                linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)
              `,
            }}
          />
        )}
        {/* Mesh noise overlay for texture */}
        <div className="absolute inset-0 opacity-[0.2] mix-blend-overlay" style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/></svg>")`,
        }} />
      </div>

      {/* Hover glow border */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(300px circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.06) 0%, transparent 60%)`,
        }}
      />

      {/* Top edge glow line */}
      <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:via-white/40 transition-all duration-500" />

      {/* Left edge glow line */}
      <div className="absolute left-0 top-[10%] bottom-[10%] w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent group-hover:via-white/30 transition-all duration-500" />

      {/* Normal card content — blurs on hover */}
      <div
        className="absolute inset-0 p-8 flex flex-col justify-between z-10 transition-all duration-500 group-hover:opacity-0 group-hover:scale-95"
        style={{ transform: "translateZ(40px)" }}
      >
        <div className="flex justify-between items-start">
           <span className="text-[12px] font-mono text-white/50 tracking-widest bg-white/5 px-2 py-1 rounded-md backdrop-blur-sm border border-white/10">{String(index + 1).padStart(2, '0')}</span>
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 border border-white/20 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full">
             {project.badge}
           </span>
        </div>
        <div className="space-y-4">
           <div className="space-y-3">
              <h3 className="font-display text-4xl uppercase tracking-tighter text-white leading-none drop-shadow-lg">
                {project.title}
              </h3>
              <p className="text-[14px] text-white/70 leading-relaxed line-clamp-2 max-w-[95%] font-medium">
                {project.description}
              </p>
           </div>
           <div className="flex items-center justify-between pt-6 border-t border-white/10 transition-colors duration-500">
              <div className="flex gap-2.5 flex-wrap">
                 {project.tags.slice(0, 3).map(tag => (
                   <span key={tag} className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/70 bg-white/[0.08] border border-white/10 rounded-full px-2.5 py-1">
                     {tag}
                   </span>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* ── HOVER OVERLAY ──────────────────────────────────────── */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-50 flex flex-col justify-between p-8 rounded-3xl"
            style={{
              background: "linear-gradient(160deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%)",
              backdropFilter: "blur(8px)",
              transform: "translateZ(50px)",
            }}
          >
            {/* Header */}
            <div className="flex justify-between items-start">
              <span
                className="text-[10px] font-black uppercase tracking-[0.25em] px-3 py-1 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${primary}33, ${primary}11)`,
                  border: `1px solid ${primary}55`,
                  color: primary,
                }}
              >
                {project.badge}
              </span>
              <span className="text-[11px] font-mono text-white/30 tracking-widest">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>

            {/* Description block */}
            <div className="flex-1 flex flex-col justify-center gap-5 py-4">
              <h3 className="font-display text-3xl uppercase tracking-tighter text-white leading-none">
                {project.title}
              </h3>

              <p className="text-[15px] text-white/75 leading-relaxed font-medium">
                {project.description}
              </p>

              {/* Tags */}
              <div className="flex gap-2 flex-wrap">
                {project.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-[10px] font-bold uppercase tracking-[0.15em] rounded-full px-2.5 py-1"
                    style={{
                      background: `${primary}18`,
                      border: `1px solid ${primary}44`,
                      color: primary,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
              {/* View Description */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onViewDescription(project)
                }}
                className="group/btn w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.85)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.13)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)" }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                View Description
              </button>

              {/* Live Link */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onViewDemo(project)
                }}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, rgba(212,255,63,0.18), rgba(150,255,63,0.08))",
                  border: "1px solid rgba(212,255,63,0.4)",
                  color: "rgba(212,255,63,0.95)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                Live Demo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function ProjectsBold() {
  const [selectedProject, setSelectedProject] = useState(null)
  const [modalLayoutId, setModalLayoutId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [lazyDevOpen, setLazyDevOpen] = useState(false)
  const [lazyDevProject, setLazyDevProject] = useState(null)
  const [filterSkill, setFilterSkill] = useState(null)
  const scrollRef = useRef(null)
  
  const { scrollXProgress } = useScroll({ container: scrollRef })
  const scaleX = useSpring(scrollXProgress, { stiffness: 100, damping: 30 })

  useEffect(() => {
    const handleFilter = (e) => {
      setFilterSkill(e.detail.skill)
      // Scroll to start of container when filter changes
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' })
      }
    }
    window.addEventListener('filter-projects', handleFilter)
    return () => window.removeEventListener('filter-projects', handleFilter)
  }, [])

  const handleViewDescription = (project) => {
    setModalLayoutId(`project-card-${project.id}`)
    const caseStudy = getCaseStudyByName(project.title)
    if (caseStudy) {
      setSelectedProject(caseStudy)
      setModalOpen(true)
    } else {
      // Fallback if no specific case study
      setSelectedProject(project)
      setModalOpen(true)
    }
  }

  const handleViewDemo = (project) => {
    if (project.demo) {
      // Has a live deployment — open it
      window.open(project.demo, "_blank", "noopener,noreferrer")
    } else {
      // No deployment — show the funny lazy dev page
      setLazyDevProject(project)
      setLazyDevOpen(true)
    }
  }

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' })
    }
  }

  const filteredProjects = filterSkill 
    ? PROJECTS.filter(p => p.tags.some(t => t.toLowerCase() === filterSkill.toLowerCase()))
    : PROJECTS

  return (
    <section id="projects" className="relative bg-[#080808] py-24 overflow-hidden">
      <ContainerScroll
        titleComponent={
          <div className="flex flex-col items-center mb-20 relative">
             <Parallax speed={0.15} className="absolute -top-16 pointer-events-none">
               <div className="font-display text-[12rem] md:text-[20rem] text-white/[0.01] select-none uppercase tracking-tighter">
                  STUDIO
               </div>
             </Parallax>

             <CommandLabel className="mb-6 opacity-30">ls ~/projects</CommandLabel>
             <AnimatedHeading
               text="Projects"
               as="h2"
               className="font-display text-8xl md:text-[12rem] uppercase leading-none text-center mb-12 tracking-tighter text-white/90"
             />
             
             <AnimatePresence>
                {filterSkill && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-8 flex items-center gap-3"
                  >
                    <span className="text-white/60">Filtered by:</span>
                    <span className="px-4 py-1.5 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] font-bold text-sm tracking-wider uppercase">
                      {filterSkill}
                    </span>
                    <button 
                      onClick={() => {
                        setFilterSkill(null)
                        window.dispatchEvent(new CustomEvent('clear-filter'))
                      }}
                      className="ml-2 text-white/40 hover:text-white transition-colors underline text-xs"
                    >
                      Clear Filter
                    </button>
                  </motion.div>
                )}
             </AnimatePresence>

             <div className="flex items-center gap-10">
                <button 
                  onClick={() => scroll('left')}
                  className="group h-12 w-12 rounded-full border border-white/5 flex items-center justify-center hover:border-white/20 transition-all bg-white/[0.02]"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/20 group-hover:text-white transition-colors"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                
                <div className="h-[1px] w-32 bg-white/5 relative overflow-hidden">
                   <motion.div style={{ scaleX }} className="absolute inset-0 bg-white/40 origin-left" />
                </div>

                <button 
                  onClick={() => scroll('right')}
                  className="group h-12 w-12 rounded-full border border-white/5 flex items-center justify-center hover:border-white/20 transition-all bg-white/[0.02]"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/20 group-hover:text-white transition-colors"><path d="m9 18 6-6-6-6"/></svg>
                </button>
             </div>
          </div>
        }
      >
        <div
          ref={scrollRef}
          data-cursor="Drag"
          className="flex h-full w-full items-center gap-8 overflow-x-auto px-12 py-10 md:px-24 scrollbar-hide snap-x snap-mandatory"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4 }}
                  className="snap-center h-full flex items-center shrink-0"
                >
                  <ProjectCard 
                    project={project} 
                    index={index}
                    onViewDescription={handleViewDescription}
                    onViewDemo={handleViewDemo}
                  />
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full flex flex-col items-center justify-center text-center text-white/50 space-y-4"
              >
                <div className="text-4xl">🔍</div>
                <p>No projects found matching "{filterSkill}"</p>
                <button 
                  onClick={() => {
                    setFilterSkill(null)
                    window.dispatchEvent(new CustomEvent('clear-filter'))
                  }}
                  className="px-4 py-2 mt-4 border border-white/10 rounded-full hover:bg-white/5 hover:text-white transition-all"
                >
                  View All Projects
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="min-w-[100px] flex-shrink-0" />
        </div>
      </ContainerScroll>
      
      <CaseStudyModal
        caseStudy={selectedProject}
        layoutId={modalLayoutId}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      <LazyDevPage
        isOpen={lazyDevOpen}
        onClose={() => setLazyDevOpen(false)}
        projectTitle={lazyDevProject?.title ?? ""}
        githubLink={lazyDevProject?.link ?? "https://github.com/aayush2724"}
      />
    </section>
  )
}
