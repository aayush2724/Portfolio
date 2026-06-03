import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { usePrefersReducedMotion } from "../context/motion"

/**
 * Vertical parallax tied to scroll position.
 *   <Parallax speed={0.3}><img .../></Parallax>
 *  - speed: drift amount (0.1 subtle → 0.6 strong)
 */
export default function Parallax({ children, speed = 0.3, className = "" }) {
  const ref = useRef(null)
  const reduced = usePrefersReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const distance = speed * 100
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`-${distance}%`, `${distance}%`]
  )

  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}
