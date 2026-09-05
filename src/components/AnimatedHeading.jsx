import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { usePrefersReducedMotion, useLowPower } from "../context/motion"
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
 *
 * `cinematic`: words sharpen out of a blur while rising — the film-title
 * register. Blur is GPU-expensive, so low-power devices get the same timing
 * with fade+rise only.
 *
 *   <AnimatedHeading text="Testimonials" cinematic as="h2" className="..." />
 */

const SCRAMBLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@%$&<>/[]{}"

/**
 * `*word*` in `text` marks that word as an editorial serif accent — one
 * italic lowercase serif word set inside the caps around it (the yaros.me
 * register). Styling lives in `.serif-accent` in index.css.
 */
function parseWords(text) {
  return text.split(" ").map((w) => {
    const m = w.match(/^\*(.+)\*$/)
    return m ? { word: m[1], accent: true } : { word: w, accent: false }
  })
}

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

export default function AnimatedHeading({ text, className = "", as = "h2", decode = false, cinematic = false }) {
  const reduced = usePrefersReducedMotion()
  const lowPower = useLowPower()
  const words = parseWords(text)
  const plain = words.map((w) => w.word).join(" ")
  const MotionTag = motion[as] || motion.h2

  if (reduced) {
    const Tag = as
    return (
      <Tag className={className}>
        {words.map((w, i) => (
          <span key={i} className={w.accent ? "serif-accent" : undefined}>
            {w.word}
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </Tag>
    )
  }

  if (decode) {
    return <DecodeHeading text={plain} className={className} as={as} />
  }

  if (cinematic) {
    return (
      <MotionTag
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ staggerChildren: 0.09 }}
      >
        {words.map(({ word, accent }, i) => (
          <motion.span
            key={i}
            className={"inline-block mr-[0.25em]" + (accent ? " serif-accent" : "")}
            variants={{
              hidden: {
                opacity: 0,
                y: 24,
                filter: lowPower ? "blur(0px)" : "blur(14px)",
              },
              visible: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { duration: 0.9, ease: EASE.ENTER },
              },
            }}
          >
            {word}
          </motion.span>
        ))}
      </MotionTag>
    )
  }

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ staggerChildren: 0.08 }}
    >
      {words.map(({ word, accent }, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
          <motion.span
            className={"inline-block mr-[0.25em]" + (accent ? " serif-accent" : "")}
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
