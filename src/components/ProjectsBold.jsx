import { useState } from "react"
import Coverflow3D from "./Coverflow3D"
import CommandLabel from "./CommandLabel"
import CaseStudyModal from "./CaseStudyModal"
import { getCaseStudyByName } from "../data/caseStudies"

const PROJECTS = [
  {
    id: 1,
    title: "Citizen Resolver",
    description: "Public complaint resolution platform connecting citizens with government authorities.",
    tags: ["React", "Node.js", "MongoDB"],
    link: "https://github.com/aayush2724/Citizen-Resolver-System",
    image: "/citizen-resolver-cover.svg"
  },
  {
    id: 2,
    title: "Disaster Relief System",
    description: "Emergency resource coordination platform for disaster management and relief operations.",
    tags: ["React", "Express", "Real-time"],
    link: "https://github.com/aayush2724/Disaster-relief-system",
    image: "/disaster-relief-cover.svg"
  },
  {
    id: 3,
    title: "Job Portal",
    description: "Full-stack job board with application tracking and employer-candidate matching.",
    tags: ["TypeScript", "Next.js", "Prisma"],
    link: "https://github.com/aayush2724/Job-Portal",
    image: "/job-portal-cover.svg"
  },
  {
    id: 4,
    title: "Chord Detector",
    description: "ML-powered music analysis tool that identifies guitar chords from audio input.",
    tags: ["Python", "ML", "Audio"],
    link: "https://github.com/aayush2724/Chord-Detector",
    image: "/chord-detector-cover.svg"
  },
  {
    id: 5,
    title: "Visitor Management",
    description: "Secure check-in system for tracking and managing building visitors with QR codes.",
    tags: ["HTML", "PHP", "MySQL"],
    link: "https://github.com/aayush2724/Visitor-Management-System",
    image: "/visitor-management-cover.svg"
  },
  {
    id: 6,
    title: "SkillNest",
    description: "Learning platform connecting students with skill-based courses and mentorship.",
    tags: ["React", "Node", "WebRTC"],
    link: "https://github.com/aayush2724/Skillnest",
    image: "/skillnest-cover.svg"
  },
  {
    id: 7,
    title: "ChatRoom",
    description: "Real-time messaging application with rooms, authentication, and presence indicators.",
    tags: ["Socket.io", "Node", "Express"],
    link: "https://github.com/aayush2724/chatRoom",
    image: "/chatroom-cover.svg"
  },
  {
    id: 8,
    title: "LeadForge",
    description: "AI-powered lead generation and management tool for sales teams.",
    tags: ["Python", "AI", "FastAPI"],
    link: "https://github.com/aayush2724/LeadForge",
    image: "/leadforge-hackathon-proof.svg"
  },
]

export default function ProjectsBold() {
  const [selectedProject, setSelectedProject] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleProjectClick = (projectTitle) => {
    const caseStudy = getCaseStudyByName(projectTitle)
    if (caseStudy) {
      setSelectedProject(caseStudy)
      setModalOpen(true)
    }
  }

  // Map projects to include click handler
  const projectsWithHandlers = PROJECTS.map(project => ({
    ...project,
    onCardClick: () => handleProjectClick(project.title)
  }))

  return (
    <section id="projects" className="relative py-28">
      <div className="mb-10 px-6 md:px-16">
        <CommandLabel className="mb-3">ls ~/projects --featured</CommandLabel>
        <h2 className="font-display text-5xl md:text-7xl uppercase leading-none">Projects</h2>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Drag, scroll, or use ← → to explore. Click the centered card for case study.
        </p>
      </div>
      <Coverflow3D projects={projectsWithHandlers} onProjectClick={handleProjectClick} />
      
      <CaseStudyModal 
        caseStudy={selectedProject} 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
      />
    </section>
  )
}
