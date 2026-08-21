import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion"
import { usePrefersReducedMotion } from "../context/motion"

/**
 * 3D tilt + glare card for project tiles.
 *   <TiltCard className="p-6 bg-white/5">...</TiltCard>
 *  - max: maximum tilt in degrees
 */
export default function TiltCard({ children, className = "", max = 12 }) {
  const reduced = usePrefersReducedMotion()

  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)

  const rotateX = useSpring(useTransform(my, [0, 1], [max, -max]), {
    stiffness: 200,
    damping: 20,
  })
  const rotateY = useSpring(useTransform(mx, [0, 1], [-max, max]), {
    stiffness: 200,
    damping: 20,
  })

  // spotlight follows the cursor
  const glareX = useTransform(mx, [0, 1], ["0%", "100%"])
  const glareY = useTransform(my, [0, 1], ["0%", "100%"])
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(163,230,53,0.15), transparent 50%)`

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const handleMove = (e) => {
    if (reduced) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    mx.set(x / rect.width)
    my.set(y / rect.height)
    mouseX.set(x)
    mouseY.set(y)
  }

  const reset = () => {
    mx.set(0.5)
    my.set(0.5)
    mouseX.set(0)
    mouseY.set(0)
  }

  if (reduced) {
    return <div className={"rounded-2xl " + className}>{children}</div>
  }

  const cssMouseX = useMotionTemplate`${mouseX}px`
  const cssMouseY = useMotionTemplate`${mouseY}px`

  return (
    <motion.div
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ 
        rotateX, 
        rotateY, 
        transformStyle: "preserve-3d", 
        transformPerspective: 1000,
        "--mouse-x": cssMouseX,
        "--mouse-y": cssMouseY
      }}
      className={"relative rounded-2xl will-change-transform overflow-hidden " + className}
    >
      {/* spotlight overlay */}
      <motion.div
        aria-hidden
        style={{ background: glare }}
        className="pointer-events-none absolute inset-0 rounded-2xl z-10 transition-opacity duration-300"
      />
      {/* content lifted slightly off the surface for depth */}
      <div style={{ transform: "translateZ(40px)" }} className="relative">
        {children}
      </div>
    </motion.div>
  )
}
