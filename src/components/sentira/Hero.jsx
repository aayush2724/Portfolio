import { motion } from "framer-motion"
import ParticleWave from "./ParticleWave"
import { Pill } from "./ui"
import { usePrefersReducedMotion } from "../../context/motion"
import { EASE } from "../../context/ease"

/**
 * The opening screen. Its whole job is the name at display size sitting on the
 * terrain, so everything else is deliberately quiet: one muted sentence, two
 * pills, and a tech strip at the fold line.
 *
 * The terrain occupies the lower 62% of the section and is layered *under* the
 * copy, not behind a scrim — the dots are sparse enough at the horizon that the
 * subtitle stays legible without one, and a scrim would grey the ridges.
 */

const TECH = [
  "React", "TypeScript", "Node.js", "Python", "FastAPI",
  "MongoDB", "PostgreSQL", "Docker", "C++",
]

/** Per-letter rise. Staggering the name is the one flourish the hero gets. */
function AnimatedName({ text, introDone }) {
  const reduced = usePrefersReducedMotion()

  if (reduced) {
    return <span className="font-display display-xl block">{text}</span>
  }

  return (
    <span className="font-display display-xl block" aria-label={text}>
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="inline-block"
          initial={{ y: "42%", opacity: 0 }}
          animate={introDone ? { y: "0%", opacity: 1 } : undefined}
          transition={{
            duration: 0.85,
            delay: 0.08 + i * 0.038,
            ease: EASE.ENTER,
          }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  )
}

export default function Hero({ introDone = true }) {
  const reduced = usePrefersReducedMotion()
  const fade = (delay) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: introDone ? { opacity: 1, y: 0 } : undefined,
          transition: { duration: 0.8, delay, ease: EASE.ENTER },
        }

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pt-24"
    >
      {/* Terrain — lower portion only, bleeding off both edges */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%]">
        <ParticleWave height={1} />
      </div>

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center text-center">
        <h1 className="text-[clamp(64px,13.5vw,170px)]">
          <AnimatedName text="Aayush" introDone={introDone} />
        </h1>

        <motion.p
          {...fade(0.55)}
          className="mt-6 max-w-[34rem] text-[17px] leading-[1.55] md:text-lg"
          style={{ color: "var(--muted)" }}
        >
          I build full-stack products where the AI actually earns its place —
          real-time systems, clean interfaces, and the unglamorous plumbing
          underneath that keeps them running.
        </motion.p>

        <motion.div
          {...fade(0.68)}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <Pill as="a" href="#work">
            View my work
          </Pill>
          <Pill as="a" href="#about" variant="ghost" arrow>
            How I work
          </Pill>
        </motion.div>
      </div>

      {/* Tech strip at the fold — the reference's "Brands we've helped" line */}
      <motion.div
        {...fade(0.9)}
        className="relative z-10 mt-auto w-full pb-10 pt-20 text-center"
      >
        <p className="text-[13px]" style={{ color: "var(--muted)" }}>
          Tools I reach for most:
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
          {TECH.map((t) => (
            <span
              key={t}
              className="text-sm transition-opacity duration-300 hover:opacity-100"
              style={{ color: "var(--faint)" }}
            >
              {t}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
