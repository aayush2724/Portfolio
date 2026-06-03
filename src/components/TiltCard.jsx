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

  // glare follows the cursor
  const glareX = useTransform(mx, [0, 1], ["0%", "100%"])
  const glareY = useTransform(my, [0, 1], ["0%", "100%"])
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.25), transparent 45%)`

  const handleMove = (e) => {
    if (reduced) return
    const rect = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - rect.left) / rect.width)
    my.set((e.clientY - rect.top) / rect.height)
  }

  const reset = () => {
    mx.set(0.5)
    my.set(0.5)
  }

  if (reduced) {
    return <div className={"rounded-2xl " + className}>{children}</div>
  }

  return (
    <motion.div
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", transformPerspective: 1000 }}
      className={"relative rounded-2xl will-change-transform " + className}
    >
      {/* glare overlay */}
      <motion.div
        aria-hidden
        style={{ background: glare }}
        className="pointer-events-none absolute inset-0 rounded-2xl"
      />
      {/* content lifted slightly off the surface for depth */}
      <div style={{ transform: "translateZ(40px)" }} className="relative">
        {children}
      </div>
    </motion.div>
  )
}
