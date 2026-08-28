import { motion } from "framer-motion"
import { usePrefersReducedMotion } from "../context/motion"

/**
 * Standard scroll-reveal wrapper: fade + rise, triggered once at 30% visibility.
 * Use `Stagger` + `StaggerItem` when several children should cascade in.
 */
export default function Reveal({
  children,
  delay = 0,
  duration = 0.6,
  y = 30,
  className = ""
}) {
  const reduced = usePrefersReducedMotion()

  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/** Parent that staggers its StaggerItem children into view. */
export function Stagger({ children, className = "", stagger = 0.08 }) {
  const reduced = usePrefersReducedMotion()

  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{ visible: { transition: { staggerChildren: stagger } } }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className = "", y = 30 }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
