import { motion, useScroll, useSpring } from "framer-motion"

/** Thin gradient progress bar fixed to the top of the viewport. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[100]
                 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400"
    />
  )
}
