import { motion } from "framer-motion"
import { usePrefersReducedMotion, useLowPower } from "../context/motion"
import { EASE, DUR } from "../context/ease"

/**
 * Scroll reveal: fade + short rise, triggered once when 20% of the block is in
 * view.
 *
 * (An earlier version used a clip-path wipe. It looked sharp but proved
 * unreliable — lazy-mounted sections could miss their whileInView trigger and
 * stay clipped to nothing, leaving whole blocks invisible. A fade never hides
 * content that way, so reliability wins here.)
 *
 * `direction` and `fade` are accepted for call-site compatibility but no longer
 * change the mechanism.
 */
export default function Reveal({
  children,
  delay = 0,
  duration = DUR.enter,
  direction = "up",
  fade = false,
  y = 28,
  className = "",
}) {
  const reduced = usePrefersReducedMotion()
  const lowPower = useLowPower()

  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      initial={{ opacity: 0, y: lowPower ? 12 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, delay, ease: EASE.ENTER }}
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

export function StaggerItem({ children, className = "", y = 28 }) {
  const lowPower = useLowPower()

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: lowPower ? 12 : y },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: DUR.enter, ease: EASE.ENTER },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
