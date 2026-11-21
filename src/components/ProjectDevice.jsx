import { AnimatePresence, motion, useSpring } from "framer-motion"
import "./project-device.css"

const artwork = {
  enter: dir => ({
    clipPath: dir > 0 ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)",
    scale: 1.07, zIndex: 1,
  }),
  center: { clipPath: "inset(0% 0% 0% 0%)", scale: 1, zIndex: 1 },
  exit: { opacity: [1, 1], zIndex: 0 },

}

export default function ProjectDevice({ project, srcSet, background, onOpen, direction, reduced }) {
  const pitch = useSpring(-5, { stiffness: 180, damping: 24 })
  const yaw = useSpring(-12, { stiffness: 180, damping: 24 })

  function tilt(event) {
    if (reduced || event.pointerType !== "mouse") return
    const box = event.currentTarget.getBoundingClientRect()
    pitch.set(-5 - ((event.clientY - box.top) / box.height - 0.5) * 10)
    yaw.set(-12 + ((event.clientX - box.left) / box.width - 0.5) * 16)
  }

  return (
    <button type="button" className="project-device lg:order-2"
      aria-label={`Open the case study for ${project.title}`}
      onPointerMove={tilt}
      onPointerLeave={() => { pitch.set(-5); yaw.set(-12) }}
      onClick={onOpen}>
      <span className="project-device-shadow" aria-hidden="true" />
      <motion.span className="project-device-body"
        style={{ rotateX: reduced ? -5 : pitch, rotateY: reduced ? -12 : yaw }}>
        <span className="project-device-lid">
          <span className="project-device-screen" style={{ background, viewTransitionName: "project-cover" }}>
            <AnimatePresence initial={false} custom={direction}>
              <motion.span key={project.id} className="project-screen-frame" style={{ background }}
                custom={direction} variants={reduced ? undefined : artwork}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: reduced ? 0 : 0.9, ease: [0.3, 0.65, 0.3, 1] }}>
                {project.image && (
              <picture>
                {srcSet && <source type="image/webp" srcSet={srcSet} sizes="(min-width: 1024px) 42vw, 80vw" />}
                <img src={project.image} alt="" decoding="async" draggable="false" />
              </picture>
                )}
              </motion.span>
            </AnimatePresence>
          </span>
        </span>
        <span className="project-device-base" aria-hidden="true">
          <span className="project-device-keys">
            {[14, 14, 13, 12, 7].map((count, row) => (
              <span key={row} className="project-key-row">
                {Array.from({ length: count }, (_, i) => <i key={i} />)}
              </span>
            ))}
          </span>
          <span className="project-device-trackpad" />
        </span>
      </motion.span>
    </button>
  )
}
