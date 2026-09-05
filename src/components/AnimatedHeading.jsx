import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { usePrefersReducedMotion } from "../context/motion"
import { EASE } from "../context/ease"

/**
 * Section headings.
 *
 * Default: each word slides up from behind an overflow-hidden clip with a
 * slight settle-skew, staggered word by word.
 *
 * `decode`: the heading resolves out of a character scramble instead — the
 * terminal register, matching the shell. Reserved for a few key headings;
 * used everywhere it stops reading as a signature and starts reading as noise.
 *
 *   <AnimatedHeading text="Projects" decode as="h2" className="..." />
 */

const SCRAMBLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@%$&<>/[]{}"

function DecodeHeading({ text, className, as: Tag }) {
  const [display, setDisplay] = useState(text)
  const [started, setStarted] = useState(false)
  const ref = useRef(null)

  // Start once, when the heading enters the viewport.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          obs.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    let frame = 0
    const total = 24
    const timer = setInterval(() => {
      frame++
      const revealed = Math.floor((frame / total) * text.length)
      let out = ""
      for (let i = 0; i < text.length; i++) {
        if (i < revealed || text[i] === " ") out += text[i]
        else out += SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)]
      }
      setDisplay(out)
      if (frame >= total) {
        clearInterval(timer)
        setDisplay(text)
      }
    }, 36)
    return () => clearInterval(timer)
  }, [started, text])

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {/* aria-label carries the real text; the scramble is presentation only */}
      <span aria-hidden="true">{display}</span>
    </Tag>
  )
}

export default function AnimatedHeading({ text, className = "", as = "h2", decode = false }) {
  const reduced = usePrefersReducedMotion()
  const words = text.split(" ")
  const MotionTag = motion[as] || motion.h2

  if (reduced) {
    const Tag = as
    return <Tag className={className}>{text}</Tag>
  }

  if (decode) {
    return <DecodeHeading text={text} className={className} as={as} />
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
            className="inline-block mr-[0.25em]"
            variants={{
              hidden: { y: "110%", skewY: 6 },
              visible: {
                y: "0%",
                skewY: 0,
                transition: { duration: 0.7, ease: EASE.ENTER },
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
