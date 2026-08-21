import React, { forwardRef, useRef } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { usePrefersReducedMotion } from "../context/motion"

/**
 * Component gently pulled toward the cursor.
 * Wraps any motion element and applies magnetic spring physics.
 */
const MagneticButton = forwardRef(({
  children,
  className = "",
  strength = 0.3,
  as: Component = motion.button,
  ...props
}, ref) => {
  const reduced = usePrefersReducedMotion()
  const fallbackRef = useRef(null)
  const activeRef = ref || fallbackRef

  const x = useSpring(useMotionValue(0), { stiffness: 150, damping: 15, mass: 0.1 })
  const y = useSpring(useMotionValue(0), { stiffness: 150, damping: 15, mass: 0.1 })

  const handleMouseMove = (e) => {
    if (reduced || !activeRef.current) return
    const rect = activeRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) * strength)
    y.set((e.clientY - centerY) * strength)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <Component
      ref={activeRef}
      style={{ x, y, ...props.style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={!reduced ? { scale: 0.96 } : undefined}
      className={className}
      {...props}
    >
      {children}
    </Component>
  )
})

MagneticButton.displayName = "MagneticButton"

export default MagneticButton
