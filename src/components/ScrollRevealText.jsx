import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { usePrefersReducedMotion } from "../context/motion"

/**
 * Scroll-linked word reveal: every word starts dim and brightens to full as it
 * crosses the viewport, tied directly to scroll position (not a one-shot
 * trigger). Scrubbing back re-dims — the text feels attached to the scroll.
 *
 * Opacity is the only animated property, so each frame is a compositor-cheap
 * style write even with a few dozen words.
 *
 * Pass `text` for a single run, or `segments` when parts need their own
 * styling (e.g. an accent-coloured phrase):
 *
 *   <ScrollRevealText
 *     as="h2"
 *     segments={[
 *       { text: "Building things that solve" },
 *       { text: "real problems.", className: "text-[var(--accent)]" },
 *     ]}
 *   />
 */

function Word({ progress, range, className, children }) {
  const opacity = useTransform(progress, range, [0.14, 1])
  return (
    <motion.span style={{ opacity }} className={`inline-block mr-[0.25em] ${className || ""}`}>
      {children}
    </motion.span>
  )
}

export default function ScrollRevealText({
  text,
  segments,
  className = "",
  as: Tag = "p",
}) {
  const ref = useRef(null)
  const reduced = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    // Reveal runs while the block travels from 90% to 40% of the viewport —
    // fully bright well before it reaches the fold's midpoint.
    offset: ["start 0.9", "start 0.4"],
  })

  const segs = segments || [{ text }]

  if (reduced) {
    return (
      <Tag className={className}>
        {segs.map((s, i) => (
          <span key={i} className={s.className}>
            {s.text}{" "}
          </span>
        ))}
      </Tag>
    )
  }

  const words = segs.flatMap((s) =>
    s.text
      .split(" ")
      .filter(Boolean)
      .map((w) => ({ w, className: s.className }))
  )

  return (
    <Tag ref={ref} className={className} aria-label={segs.map((s) => s.text).join(" ")}>
      <span aria-hidden="true">
        {words.map((item, i) => {
          const start = i / words.length
          // Each word's ramp overlaps the next ~50% so the sweep reads as a
          // wave rather than a typewriter.
          const end = Math.min(1, start + 1.5 / words.length)
          return (
            <Word key={i} progress={scrollYProgress} range={[start, end]} className={item.className}>
              {item.w}
            </Word>
          )
        })}
      </span>
    </Tag>
  )
}
