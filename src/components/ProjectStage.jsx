import { useEffect, useRef } from "react"
import { motion, AnimatePresence, useReducedMotion, useSpring } from "framer-motion"
import ProjectDevice from "./ProjectDevice"
import { useLowPower } from "../context/motion"
import { openAssistant } from "../lib/assistantEvents"
import { slugForFeaturedId } from "../data/projectSlugs"

/**
 * "/auralis-800.jpg" -> "/auralis-400.webp" for the responsive <source>.
 * Returns null for covers with no raster variant (the SVGs), so we don't
 * advertise an SVG as image/webp and hand the browser an undecodable source.
 */
export function webpSrcSet(src) {
  if (!/-800\.(jpg|jpeg|png)$/i.test(src)) return null
  const at = (w) => src.replace(/-800\.(jpg|jpeg|png)$/i, `-${w}.webp`)
  return `${at(400)} 400w, ${at(800)} 800w`
}

function gradientFrom(earthy) {
  const c = earthy?.match(/#(?:[0-9a-fA-F]{3}){1,2}/g) || []
  return `linear-gradient(135deg, ${c[0] || "#1f2937"} 0%, ${c[1] || "#000000"} 100%)`
}

const settle = { duration: 0.56, ease: [0.18, 0.85, 0.24, 1] }
const caption = {
  enter: dir => ({ y: dir * 16, opacity: 0 }),
  center: { y: 0, opacity: 1, transition: settle },
  exit: { opacity: 0, pointerEvents: "none", transition: { duration: 0.1 } },
}

export default function ProjectStage({
  project,
  projectIndex,
  total,
  direction,
  onStep,
  onViewDescription,
  onViewDemo,
}) {
  const lowPower = useLowPower()
  const reduced = useReducedMotion()
  const finish = gradientFrom(project.earthy)
  const stageRef = useRef(null)

  const pitch = useSpring(0, { stiffness: 180, damping: 25 })
  const yaw = useSpring(0, { stiffness: 180, damping: 25 })

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined

    let previousTime = -Infinity
    let previousDirection = 0
    const browseByWheel = (event) => {
      if (event.ctrlKey) return
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
      event.preventDefault()
      event.stopPropagation()
      if (!delta || total < 2) return
      const dir = Math.sign(delta)
      const now = performance.now()
      const newGesture = now - previousTime > 110 || dir !== previousDirection
      previousTime = now
      previousDirection = dir
      if (newGesture) onStep(dir)
    }

    stage.addEventListener("wheel", browseByWheel, { capture: true, passive: false })
    return () => stage.removeEventListener("wheel", browseByWheel, true)
  }, [onStep, total])

  function tilt(event) {
    if (reduced || lowPower || event.pointerType !== "mouse") return
    const box = event.currentTarget.getBoundingClientRect()
    pitch.set((0.5 - (event.clientY - box.top) / box.height) * 6)
    yaw.set(((event.clientX - box.left) / box.width - 0.5) * 7)
  }

  return (
    <div ref={stageRef} data-lenis-prevent-wheel className="project-perspective" onPointerMove={tilt} onPointerLeave={() => {
      pitch.set(0)
      yaw.set(0)
    }}>
      <motion.div className="project-shell" style={lowPower ? undefined : { rotateX: pitch, rotateY: yaw }}>

        <motion.div
          drag={total > 1 ? "x" : false}
          style={{ touchAction: "pan-y", perspective: "1400px" }}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.14}
          onDragEnd={(_, info) => {
            if (info.offset.x < -70) onStep(1)
            else if (info.offset.x > 70) onStep(-1)
          }}
          data-cursor="Drag"
          className="relative flex w-full items-center"
        >
          <div className="project-layout mx-auto flex h-full w-full flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-stretch">
              <ProjectDevice
                direction={direction}
                reduced={reduced}
                project={project}
                srcSet={webpSrcSet(project.image || "")}
                background={finish}
                onOpen={() => onViewDescription(project)}
              />

            <div className="relative grid min-w-0 lg:order-1">
              <AnimatePresence initial={false} mode="popLayout" custom={direction}>
              <motion.div key={project.id} custom={direction} variants={reduced ? undefined : caption} initial="enter" animate="center" exit="exit" className="project-copy flex min-w-0 flex-col justify-center lg:order-1">
                <span className="project-edition">{String(projectIndex + 1).padStart(2, "0")} <span aria-hidden="true">/</span> {project.badge}</span>
                <h3 className="project-title">
                  {project.title}
                </h3>
                <p className="mt-4 max-w-prose text-base leading-relaxed text-white/75 md:text-lg">
                  {project.description}
                </p>
                <ul aria-label="Technologies" className="project-tags">
                  {project.tags.map(tag => <li key={tag}>{tag}</li>)}
                </ul>

                {/* One primary action, two quiet ones; the row wraps rather
                    than spilling out of a narrow column. */}
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 lg:mt-7">
                  <button
                    onClick={() => onViewDemo(project)}
                    aria-label={`Open the live demo of ${project.title}`}
                    className="project-action project-action-primary"
                  >
                    Live demo ↗
                  </button>
                  <button
                    onClick={() => onViewDescription(project)}
                    aria-label={`Read the description of ${project.title}`}
                    className="project-action project-action-secondary"
                  >
                    Read more →
                  </button>
                  <button
                    onClick={() => openAssistant({ projectSlug: slugForFeaturedId(project.id) })}
                    aria-label={`Ask the assistant about ${project.title}`}
                    className="project-action project-action-secondary"
                  >
                    Ask AI
                  </button>
                </div>
              </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
