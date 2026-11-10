import { useState, useEffect, useCallback, lazy, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ContainerScroll } from "./ui/container-scroll-animation"
import ProjectStage from "./ProjectStage"
import Parallax from "./Parallax"
import { sceneNumber } from "./SectionHead"
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




const DECK_RETURN = "deck:return"

/** The project id to reopen the deck on, read once per return. */
function readDeckReturn() {
  try {
    return sessionStorage.getItem(DECK_RETURN)
  } catch {
    return null
  }
}

/**
 * Into a case study with a shared-element morph: the screenshot on the deck
 * and the cover on the page carry the same view-transition-name, so the
 * browser grows one into the other while the rest crossfades. Where the View
 * Transitions API is missing (or motion is reduced) it is a plain route change.
 * The new state is captured once the page's cover exists (capped, so a slow
 * chunk can't freeze the screen).
 */
function openCaseStudy(id) {
  const go = () => {
    window.location.hash = `#/work/${id}`
  }
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  if (!document.startViewTransition || reduced) return go()
  document.startViewTransition(() => {
    go()
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true, force: true })
    else window.scrollTo(0, 0)
    // Event-driven, not frame-polled: resolves the moment the cover mounts,
    // or after 1.2 s — well inside the browser's own DOM-update timeout.
    return new Promise((resolve) => {
      const ready = () => document.querySelector("[data-vt='case-cover']")
      if (ready()) return resolve()
      let cap = 0
      const obs = new MutationObserver(() => ready() && done())
      const done = () => {
        obs.disconnect()
        clearTimeout(cap)
        resolve()
      }
      obs.observe(document.body, { childList: true, subtree: true })
      cap = setTimeout(done, 1200)
    })
  })
}

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
  // Coming back from a case study (its "cd ~/projects" or the browser's Back):
  // reopen the deck on the project the visitor left from.
  const [[index, direction], setDeck] = useState(() => {
    const id = readDeckReturn()
    const at = id == null ? -1 : filterProjectsBySkills([]).findIndex((p) => String(p.id) === id)
    return [Math.max(0, at), 1]
  })

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

  // ...and put the stage back in view once this section has mounted.
  // The key is cleared inside the timer, not before it: StrictMode runs this
  // effect twice in development, and clearing early left the second run with
  // nothing to restore.
  useEffect(() => {
    if (readDeckReturn() == null) return undefined
    const t = setTimeout(() => {
      try {
        sessionStorage.removeItem(DECK_RETURN)
      } catch {
        // nothing to clear
      }
      const stage = document.querySelector("#projects [data-cursor='Drag']")
      if (!stage) return
      const r = stage.getBoundingClientRect()
      const y = window.scrollY + r.top - Math.max(0, (window.innerHeight - r.height) / 2)
      if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true })
      else window.scrollTo(0, y)
    }, 150)
    return () => clearTimeout(t)
  }, [])

  // Warm the case-study chunk while idle, so the first morph isn't waiting on a download.
  useEffect(() => {
    const ric = window.requestIdleCallback || ((fn) => setTimeout(fn, 1500))
    const id = ric(() => import("./CaseStudyPage"))
    return () => (window.cancelIdleCallback || clearTimeout)(id)
  }, [])

  const handleViewDescription = (project) => {
    setModalLayoutId(`project-card-${project.id}`)
    const caseStudy = getCaseStudyByName(project.title)
    if (caseStudy) {
      // A project with a case study has its own page (#/work/:id): the full
      // README in a reading layout, linkable and shareable. The modal stays
      // for projects without one.
      try {
        sessionStorage.setItem(DECK_RETURN, String(project.id))
      } catch {
        // no storage — the deck simply starts at the front on return
      }
      openCaseStudy(caseStudy.id)
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
    <section id="projects" className="relative bg-[#060608]/80 py-24 overflow-hidden">
      <ContainerScroll
        titleComponent={
          <div className="flex flex-col items-center mb-20 relative">
             <Parallax speed={0.15} className="absolute -top-16 pointer-events-none">
               {/* Watermark drawn from a pseudo-element: at 1% opacity it is
                   decoration, not text, and must not be read or contrast-checked. */}
               <div
                 aria-hidden="true"
                 data-text="STUDIO"
                 className="font-display text-[12rem] md:text-[20rem] text-white/[0.01] select-none uppercase tracking-tighter before:content-[attr(data-text)]"
               />
             </Parallax>

             <p className="mb-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] md:text-[11px]" style={{ color: "var(--muted)" }}>
               <span style={{ color: "var(--accent)" }}>{sceneNumber("projects")}</span>
               <span aria-hidden="true" className="h-px w-8" style={{ background: "var(--line)" }} />
               <span className="normal-case tracking-[0.08em]">~/projects</span>
               <span aria-hidden="true" className="h-px w-8" style={{ background: "var(--line)" }} />
               <span>{total} builds</span>
             </p>
             <AnimatedHeading
               text="Projects"
               letters
               as="h2"
               className="font-display text-[clamp(3.5rem,16vw,12rem)] uppercase leading-none text-center mb-12 tracking-tighter text-white/90"
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
                      className="ml-2 text-white/70 hover:text-white transition-colors underline text-xs"
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60 group-hover:text-white transition-colors"><path d="m15 18-6-6 6-6"/></svg>
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60 group-hover:text-white transition-colors"><path d="m9 18 6-6-6-6"/></svg>
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
            <div className="font-mono text-sm" style={{ color: "var(--muted)" }}>$ grep -l &quot;{filterSkills.join("|")}&quot; ~/projects → 0 results</div>
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
