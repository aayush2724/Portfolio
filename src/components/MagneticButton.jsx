import { motion, useMotionValue, useSpring } from "framer-motion"
import { usePrefersReducedMotion } from "../context/motion"

/**
 * Button gently pulled toward the cursor.
 *   <MagneticButton onClick={...}>Get in touch</MagneticButton>
 */
export default function MagneticButton({
  children,
  className = "",
  strength = 0.4,
  ...props
}) {
  const reduced = usePrefersReducedMotion()
  const x = useSpring(useMotionValue(0), { stiffness: 200, damping: 15 })
  const y = useSpring(useMotionValue(0), { stiffness: 200, damping: 15 })

  const handleMove = (e) => {
    if (reduced) return
    const rect = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength)
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength)
  }

  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      style={{ x, y }}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      whileTap={{ scale: 0.96 }}
      className={
        "px-6 py-3 rounded-full font-medium text-white " +
        "bg-violet-600 hover:bg-violet-500 transition-colors " +
        className
      }
      {...props}
    >
      {children}
    </motion.button>
  )
}
