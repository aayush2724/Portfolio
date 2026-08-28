import { useEffect, useRef, useState } from "react"
import { useInView } from "framer-motion"
import { usePrefersReducedMotion } from "../context/motion"

/**
 * Number that counts up with an ease-out when it enters the viewport.
 *   <CountUp end={400} suffix="+" />
 * Shared by the hero stats row and CodingStatsBold.
 */
export default function CountUp({ end, duration = 2, suffix = "", prefix = "" }) {
  const reduced = usePrefersReducedMotion()
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  // Inset only the bottom edge — an all-sides inset (e.g. "-100px") never
  // fires for elements within 100px of the left edge on narrow viewports.
  const isInView = useInView(ref, { once: true, margin: "0px 0px -80px 0px" })

  useEffect(() => {
    if (isNaN(end)) return
    if (reduced) {
      setCount(end)
      return
    }
    if (!isInView) return

    let startTime
    let animationFrame

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)

      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(easeOut * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [isInView, end, duration, reduced])

  return (
    <span ref={ref}>
      {prefix}{count}{suffix}
    </span>
  )
}
