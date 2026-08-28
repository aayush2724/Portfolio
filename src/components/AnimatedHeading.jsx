import { motion } from "framer-motion"
import { usePrefersReducedMotion } from "../context/motion"

/**
 * Mask/clip reveal for headings: each word slides up from behind an
 * overflow-hidden clip with a slight settle-skew, staggered word by word.
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
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ staggerChildren: 0.08 }}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
          <motion.span
            className="inline-block mr-[0.25em] will-change-transform"
            variants={{
              hidden: { y: "110%", skewY: 6 },
              visible: {
                y: "0%",
                skewY: 0,
                transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  )
}
