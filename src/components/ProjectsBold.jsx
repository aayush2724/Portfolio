import { useState, useRef, useEffect } from "react"
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion"
import { ContainerScroll } from "./ui/container-scroll-animation"
import CommandLabel from "./CommandLabel"
import CaseStudyModal from "./CaseStudyModal"
import { getCaseStudyByName } from "../data/caseStudies"

const PROJECTS = [
  {
    id: 1,
    title: "DeskGuard",
    description: "Workspace security and monitor system that detects unauthorized access using real-time surveillance.",
    tags: ["JavaScript", "Node.js", "OpenCV"],
    link: "https://github.com/aayush2724/DeskGuard",
    demo: "https://deskguard-jade.vercel.app",
    image: "", // Add if available
    badge: "New",
    earthy: "from-[#2d3436] to-[#000000]" // Onyx
  },
  {
    id: 2,
    title: "AlgoVision",
    description: "Interactive algorithm visualizer for understanding complex data structures and sorting algorithms.",
    tags: ["React", "Framer Motion", "Algorithms"],
    link: "https://github.com/aayush2724/AlgoVision",
    image: "", // Add if available
    badge: "Education",
    earthy: "from-[#2c3e50] to-[#000000]" // Midnight
  },
  {
    id: 3,
    title: "LeadForge",
    description: "AI-powered lead generation and management tool for sales teams.",
    tags: ["Python", "AI", "FastAPI"],
    link: "https://github.com/aayush2724/LeadForge",
    image: "/leadforge-hackathon-proof.svg",
    badge: "Hackathon",
    earthy: "from-[#3a3530] to-[#1f1c18]"
  },
  {
    id: 4,
    title: "Beatzy",
    description: "Music collaboration platform with real-time beat sharing and social features for producers.",
    tags: ["React", "Firebase", "Web Audio"],
    link: "https://github.com/aayush2724/Beatzy",
    demo: "https://beatzy-zeta.vercel.app",
    image: "/Beatzy.png",
    badge: "Music Tech",
    earthy: "from-[#3e4a3d] to-[#242b23]" // Olive
  },
  {
    id: 5,
    title: "Citizen Resolver",
    description: "Public complaint resolution platform connecting citizens with government authorities.",
    tags: ["React", "Node.js", "MongoDB"],
    link: "https://github.com/aayush2724/Citizen-Resolver-System",
    demo: "https://civicresolve-jet.vercel.app",
    image: "/citizen-resolver-cover.svg",
    badge: "Government",
    earthy: "from-[#4a3728] to-[#2c1e14]" // Espresso
  },
  {
    id: 6,
    title: "Checkmate",
    description: "Advanced chess platform with real-time matchmaking and AI analysis capabilities.",
    tags: ["Socket.io", "React", "Node.js"],
    link: "https://github.com/aayush2724",
    image: "",
    badge: "Strategy",
    earthy: "from-[#6b4423] to-[#3d2b1f]" // Clay
  },
  {
    id: 7,
    title: "Disaster Relief System",
    description: "Emergency resource coordination platform for disaster management and relief operations.",
    tags: ["React", "Express", "Real-time"],
    link: "https://github.com/aayush2724/Disaster-relief-system",
    image: "/disaster-relief-cover.svg",
    badge: "Critical",
    earthy: "from-[#5a4a3a] to-[#352b21]" // Stone
  },
  {
    id: 8,
    title: "Job Portal",
    description: "Full-stack job board with application tracking and employer-candidate matching.",
    tags: ["TypeScript", "Next.js", "Prisma"],
    link: "https://github.com/aayush2724/Job-Portal",
    image: "/job-portal-cover.svg",
    badge: "Product",
    earthy: "from-[#7a6a4a] to-[#4a3a2a]" // Ochre
  },
  {
    id: 9,
    title: "Chord Detector",
    description: "ML-powered music analysis tool that identifies guitar chords from audio input.",
    tags: ["Python", "ML", "Audio"],
    link: "https://github.com/aayush2724/Chord-Detector",
    image: "/chord-detector-cover.svg",
    badge: "AI/ML",
    earthy: "from-[#4a5a6a] to-[#2a3a4a]" // Slate
  },
  {
    id: 10,
    title: "Visitor Management",
    description: "Secure check-in system for tracking and managing building visitors with QR codes.",
    tags: ["HTML", "PHP", "MySQL"],
    link: "https://github.com/aayush2724/Visitor-Management-System",
    image: "/visitor-management-cover.svg",
    badge: "SaaS",
    earthy: "from-[#5d4037] to-[#3e2723]" // Deep Clay
  },
  {
    id: 11,
    title: "SkillNest",
    description: "Learning platform connecting students with skill-based courses and mentorship.",
    tags: ["React", "Node", "WebRTC"],
    link: "https://github.com/aayush2724/Skillnest",
    image: "/skillnest-cover.svg",
    badge: "Education",
    earthy: "from-[#4b4e53] to-[#2c2e31]" // Charcoal
  },
  {
    id: 12,
    title: "ChatRoom",
    description: "Real-time messaging application with rooms, authentication, and presence indicators.",
    tags: ["Socket.io", "Node", "Express"],
    link: "https://github.com/aayush2724/chatRoom",
    image: "/chatroom-cover.svg",
    badge: "Social",
    earthy: "from-[#3e2723] to-[#1a1110]" // Dark Earth
  },
]

function ProjectCard({ project, onViewDescription, onViewDemo }) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const [showOptions, setShowOptions] = useState(false)
  const hasImage = project.image && project.image !== ""
  const cardRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setShowOptions(false)
      }
    }
    if (showOptions) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showOptions])

  const handleMouseMove = (e) => {
    if (showOptions) return;
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

  const handleCardClick = () => {
    setShowOptions(true);
  }

  return (
    <motion.div
      ref={cardRef}
      style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
      animate={{ rotateX: showOptions ? 0 : rotate.x, rotateY: showOptions ? 0 : rotate.y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { if (!showOptions) { setRotate({ x: 0, y: 0 }); setMousePos({ x: 50, y: 50 }) } }}
      onClick={handleCardClick}
      className="group relative h-[85%] min-w-[320px] md:min-w-[400px] overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A] cursor-pointer snap-center flex-shrink-0 transition-all duration-500 shadow-2xl hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]"
    >
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 overflow-hidden">
        {hasImage ? (
          <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-105">
            <img
              src={project.image}
              alt={project.title}
              className="absolute inset-0 h-full w-full object-cover opacity-40 transition-opacity duration-700 group-hover:opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/80 via-transparent to-[#0A0A0A]/80" />
            <div
              className="absolute inset-0 opacity-40 mix-blend-overlay group-hover:opacity-60 transition-opacity duration-700"
              style={{
                background: `linear-gradient(135deg, ${project.earthy.replace('from-', '').replace('to-', '').split(' ')[0]} 0%, transparent 100%)`
              }}
            />
          </div>
        ) : (
          <div
            className="absolute inset-0 opacity-60 group-hover:opacity-100 transition-opacity duration-700"
            style={{
              background: `
                radial-gradient(ellipse 80% 60% at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.08) 0%, transparent 60%),
                radial-gradient(ellipse 60% 80% at ${100 - mousePos.x}% ${100 - mousePos.y}%, rgba(255,255,255,0.04) 0%, transparent 50%),
                linear-gradient(135deg, ${project.earthy.replace('from-', '').replace('to-', '').split(' ')[0]} 0%, ${project.earthy.split(' ')[1]?.replace('to-', '') || '#000000'} 100%)
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

      {/* Content Wrapper */}
      <div className={`absolute inset-0 p-8 flex flex-col justify-between z-10 transition-all duration-500 ${showOptions ? 'opacity-20 blur-sm scale-95' : 'opacity-100 scale-100'}`} style={{ transform: "translateZ(40px)" }}>
        <div className="flex justify-between items-start">
           <span className="text-[12px] font-mono text-white/50 tracking-widest bg-white/5 px-2 py-1 rounded-md backdrop-blur-sm border border-white/10">{project.id.toString().padStart(2, '0')}</span>
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 border border-white/20 bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full group-hover:text-white group-hover:border-white/40 group-hover:bg-white/10 transition-all duration-500">
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
           
           <div className="flex items-center justify-between pt-6 border-t border-white/10 group-hover:border-white/20 transition-colors duration-500">
              <div className="flex gap-3">
                 {project.tags.slice(0, 2).map(tag => (
                   <span key={tag} className="text-[11px] font-bold uppercase tracking-widest text-white/50 group-hover:text-white/80 transition-colors duration-500">
                     {tag}
                   </span>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Options Overlay */}
      <AnimatePresence>
        {showOptions && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center p-8 gap-6"
            style={{ transform: "translateZ(50px)" }}
          >
            <h4 className="text-white font-display text-2xl uppercase tracking-tight mb-2">Options</h4>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDescription(project);
                setShowOptions(false);
              }}
              className="w-full relative group overflow-hidden rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 transition-all duration-300 p-4 flex flex-col items-center gap-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/80"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              <span className="text-white font-bold uppercase tracking-widest text-sm">View Description</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDemo(project);
                setShowOptions(false);
              }}
              className="w-full relative group overflow-hidden rounded-xl bg-[rgba(212,255,63,0.1)] hover:bg-[rgba(212,255,63,0.2)] border border-[rgba(212,255,63,0.3)] transition-all duration-300 p-4 flex flex-col items-center gap-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(212,255,63,0.1)] to-transparent -translate-x-full group-hover:animate-shimmer" />
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(212,255,63,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              <span className="text-[rgba(212,255,63,0.9)] font-bold uppercase tracking-widest text-sm">
                {project.demo || project.link ? "Live Demo" : "View Code"}
              </span>
            </button>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowOptions(false);
              }}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function ProjectsBold() {
  const [selectedProject, setSelectedProject] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const scrollRef = useRef(null)
  
  const { scrollXProgress } = useScroll({ container: scrollRef })
  const scaleX = useSpring(scrollXProgress, { stiffness: 100, damping: 30 })

  const handleViewDescription = (project) => {
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
    const url = project.demo || project.link
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer")
    }
  }

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' })
    }
  }

  return (
    <section id="projects" className="relative bg-[#080808] py-24 overflow-hidden">
      <ContainerScroll
        titleComponent={
          <div className="flex flex-col items-center mb-20 relative">
             <div className="absolute -top-16 font-display text-[12rem] md:text-[20rem] text-white/[0.01] select-none pointer-events-none uppercase tracking-tighter">
                STUDIO
             </div>

             <CommandLabel className="mb-6 opacity-30">ls ~/projects</CommandLabel>
             <h2 className="font-display text-8xl md:text-[12rem] uppercase leading-none text-center mb-12 tracking-tighter text-white/90">
                Projects
             </h2>
             
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
          className="flex h-full w-full items-center gap-8 overflow-x-auto px-12 py-10 md:px-24 scrollbar-hide snap-x snap-mandatory"
        >
          {PROJECTS.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onViewDescription={handleViewDescription}
              onViewDemo={handleViewDemo}
            />
          ))}
          
          <div className="min-w-[100px] flex-shrink-0" />
        </div>
      </ContainerScroll>
      
      <CaseStudyModal 
        caseStudy={selectedProject} 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
      />
    </section>
  )
}

