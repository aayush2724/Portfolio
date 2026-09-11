import { useState, useEffect, useCallback, lazy, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ContainerScroll } from "./ui/container-scroll-animation"
import ProjectStage from "./ProjectStage"
import Parallax from "./Parallax"
import CommandLabel from "./CommandLabel"
import CaseStudyModal from "./CaseStudyModal"
import { getCaseStudyByName } from "../data/caseStudies"
import { filterProjectsBySkills } from "../data/featuredProjects"
import AnimatedHeading from "./AnimatedHeading"

/**
 * The "lazy dev" easter-egg modal pulls in three.js + drei (~260KB gzip).
 * Statically importing it kept that in the eager graph, so Vite modulepreloaded
 * the WebGL bundle on every phone that never opens the modal.
 */
const LazyDevPage = lazy(() => import("./LazyDevPage"))




export default function ProjectsBold() {
  const [selectedProject, setSelectedProject] = useState(null)
  const [modalLayoutId, setModalLayoutId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [lazyDevOpen, setLazyDevOpen] = useState(false)
  // Latches true on first open so the lazy chunk stays mounted for its exit.
  const [lazyDevMounted, setLazyDevMounted] = useState(false)
  const [lazyDevProject, setLazyDevProject] = useState(null)
  // A stack assembled in the Tech Stack tray, not a single chip: the
  // section listens for the whole set and shows best-matching projects first.
  const [filterSkills, setFilterSkills] = useState([])
  // The deck is paged rather than scrolled now, so position is an index and a
  // direction (which way the next card should enter from) instead of a scrollLeft.
  const [[index, direction], setDeck] = useState([0, 1])

  useEffect(() => {
    const handleFilter = (e) => {
      // `skills` is the current protocol; `skill` is kept for any single-chip
      // caller that predates the tray.
      const next = e.detail?.skills ?? (e.detail?.skill ? [e.detail.skill] : [])
      setFilterSkills(next)
      // A new filter yields a different deck; start it at the front.
      setDeck([0, 1])
    }
    const handleClear = () => setFilterSkills([])
    window.addEventListener('filter-projects', handleFilter)
    window.addEventListener('clear-filter', handleClear)
    return () => {
      window.removeEventListener('filter-projects', handleFilter)
      window.removeEventListener('clear-filter', handleClear)
    }
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
      setLazyDevMounted(true)
      setLazyDevOpen(true)
    }
  }

  const filteredProjects = filterProjectsBySkills(filterSkills)
  const total = filteredProjects.length

  /* Wraps at both ends so the deck never dead-ends on an inert arrow.
     useCallback because ProjectStage binds it to a window keydown listener. */
  const step = useCallback(
    (delta) => {
      setDeck(([i]) => {
        if (total < 1) return [0, delta]
        return [(i + delta + total) % total, delta]
      })
    },
    [total]
  )

  /* Clearing a filter can shrink the deck under the current index — clamp
     rather than render an undefined project. */
  const safeIndex = total ? Math.min(index, total - 1) : 0

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
               letters
               as="h2"
               className="font-display text-8xl md:text-[12rem] uppercase leading-none text-center mb-12 tracking-tighter text-white/90"
             />
             
             <AnimatePresence>
                {filterSkills.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-8 flex flex-wrap items-center justify-center gap-3"
                  >
                    <span className="text-white/60">Filtered by:</span>
                    {filterSkills.map((skill) => (
                      <motion.span
                        key={skill}
                        layout
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        className="px-4 py-1.5 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] font-bold text-sm tracking-wider uppercase"
                      >
                        {skill}
                      </motion.span>
                    ))}
                    <button 
                      onClick={() => {
                        setFilterSkills([])
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
                  onClick={() => step(-1)}
                  aria-label="Previous project"
                  className="group h-12 w-12 rounded-full border border-white/5 flex items-center justify-center hover:border-white/20 transition-all bg-white/[0.02]"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/20 group-hover:text-white transition-colors"><path d="m15 18-6-6 6-6"/></svg>
                </button>

                {/* Discrete segments rather than a continuous bar: the deck now
                    pages, so a smooth fill would imply a precision it no longer has. */}
                <div className="flex items-center gap-1.5" aria-hidden="true">
                   {filteredProjects.map((p, i) => (
                     <span
                       key={p.id}
                       className="h-[2px] rounded-full transition-all duration-500"
                       style={{
                         width: i === safeIndex ? 26 : 12,
                         background: i === safeIndex ? "var(--accent)" : "rgba(255,255,255,0.18)",
                       }}
                     />
                   ))}
                </div>

                <button
                  onClick={() => step(1)}
                  aria-label="Next project"
                  className="group h-12 w-12 rounded-full border border-white/5 flex items-center justify-center hover:border-white/20 transition-all bg-white/[0.02]"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/20 group-hover:text-white transition-colors"><path d="m9 18 6-6-6-6"/></svg>
                </button>
             </div>
          </div>
        }
      >
        {total > 0 ? (
          <ProjectStage
            project={filteredProjects[safeIndex]}
            index={safeIndex}
            total={total}
            direction={direction}
            onStep={step}
            onViewDescription={handleViewDescription}
            onViewDemo={handleViewDemo}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full flex flex-col items-center justify-center text-center text-white/50 space-y-4"
          >
            <div className="text-4xl">🔍</div>
            <p>No projects found matching {filterSkills.map((s) => `"${s}"`).join(" or ")}</p>
            <button
              onClick={() => {
                setFilterSkills([])
                window.dispatchEvent(new CustomEvent('clear-filter'))
              }}
              className="px-4 py-2 mt-4 border border-white/10 rounded-full hover:bg-white/5 hover:text-white transition-all"
            >
              View All Projects
            </button>
          </motion.div>
        )}
      </ContainerScroll>
      
      <CaseStudyModal
        caseStudy={selectedProject}
        layoutId={modalLayoutId}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      {/* Mounted on first open and kept mounted afterwards: the component owns
          its own AnimatePresence, so unmounting on close would cut the exit. */}
      {lazyDevMounted && (
        <Suspense fallback={null}>
          <LazyDevPage
            isOpen={lazyDevOpen}
            onClose={() => setLazyDevOpen(false)}
            projectTitle={lazyDevProject?.title ?? ""}
            githubLink={lazyDevProject?.link ?? "https://github.com/aayush2724"}
          />
        </Suspense>
      )}
    </section>
  )
}
