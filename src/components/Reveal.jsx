import { motion } from "framer-motion"
import { usePrefersReducedMotion } from "../context/motion"

/**
 * Scroll-into-view reveal. Wrap any section/element.
 *   <Reveal><h2>About</h2></Reveal>
 *
 * Props:
 *  - delay: stagger delay in seconds
 *  - y: starting offset in px
 *  - direction: "up" | "down" | "left" | "right"
 */
export default function Reveal({
  children,
  delay = 0,
  y = 40,
  direction = "up",
  className = "",
}) {
  const reduced = usePrefersReducedMotion()

  const offset = {
    up: { y, x: 0 },
    down: { y: -y, x: 0 },
    left: { x: y, y: 0 },
    right: { x: -y, y: 0 },
  }[direction]

  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  )
}
