import { motion } from "framer-motion"
import { usePrefersReducedMotion } from "../context/motion"

/**
 * Word-by-word reveal for headings.
 *   <AnimatedHeading text="Hi, I'm Aayush" as="h1" className="text-5xl font-bold" />
 */
export default function AnimatedHeading({ text, className = "", as = "h2" }) {
  const reduced = usePrefersReducedMotion()
  const words = text.split(" ")
  const MotionTag = motion[as] || motion.h2

  if (reduced) {
    const Tag = as
    return <Tag className={className}>{text}</Tag>
  }

  return (
    <MotionTag
      className={className}
      style={{ perspective: 600 }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ staggerChildren: 0.08 }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.25em]"
          variants={{
            hidden: { opacity: 0, y: "0.6em", rotateX: -40 },
            visible: {
              opacity: 1,
              y: "0em",
              rotateX: 0,
              transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] },
            },
          }}
        >
          {word}
        </motion.span>
      ))}
    </MotionTag>
  )
}
