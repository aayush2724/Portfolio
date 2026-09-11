import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight, ArrowUpRight, Github } from "lucide-react"
import Reveal from "../Reveal"
import { Card, Pill, SectionHead } from "./ui"
import { FEATURED_PROJECTS } from "../../data/featuredProjects"
import { EASE, DUR } from "../../context/ease"
import { usePrefersReducedMotion } from "../../context/motion"

/**
 * The case-study stage. One project at a time, framed inside a much wider panel
 * whose background is a blown-up, blurred copy of the same image — that halo is
 * what makes a 16:9 screenshot fill a full-bleed section without being stretched.
 *
 * The neighbouring indices bleed in at the panel's left and right edges. They
 * are the only affordance saying "there are more", so they stay visible rather
 * than appearing on hover.
 */

/* Six is where the stage stops earning its width — beyond that the index peeks
   lose meaning and a grid would serve better. The rest live on GitHub. */
const SLIDES = FEATURED_PROJECTS.filter((p) => p.image).slice(0, 6)

const variants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
}

function Index({ n, side }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute top-1/2 hidden -translate-y-1/2 select-none font-display text-[56px] leading-none md:block ${
        side === "left" ? "left-6" : "right-6"
      }`}
      style={{ color: "rgba(255,255,255,0.28)" }}
    >
      {n}
    </span>
  )
}

export default function Work() {
  const [[index, dir], setState] = useState([0, 1])
  const reduced = usePrefersReducedMotion()

  const go = (step) =>
    setState(([i]) => [(i + step + SLIDES.length) % SLIDES.length, step])

  const p = SLIDES[index]
  const label = (i) => String(((i + SLIDES.length) % SLIDES.length) + 1).padStart(2, "0")

  return (
    <section id="work" className="relative py-28 md:py-36">
      <div className="mx-auto max-w-[1180px] px-5 md:px-10">
        <div className="mb-14 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <Reveal>
            <SectionHead
              label="Selected work"
              align="left"
              lines={["Real problems,", "shipped solutions."]}
            />
          </Reveal>
          <Reveal delay={0.1}>
            <Pill
              as="a"
              href="https://github.com/aayush2724?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
            >
              View all on GitHub
            </Pill>
          </Reveal>
        </div>
      </div>

      {/* Stage */}
      <div className="mx-auto max-w-[1180px] px-5 md:px-10">
        <Card className="relative overflow-hidden p-5 md:p-10">
          {/* Blurred halo, redrawn per slide so the panel takes the project's
              own colour. Scaled past its box so the blur has no visible edge. */}
          <AnimatePresence initial={false}>
            <motion.div
              key={`bg-${p.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: EASE.ENTER }}
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${p.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(46px) saturate(1.25)",
                transform: "scale(1.35)",
                opacity: 0.55,
              }}
            />
          </AnimatePresence>
          <div className="absolute inset-0" style={{ background: "rgba(6,6,6,0.45)" }} />

          <Index n={label(index - 1)} side="left" />
          <Index n={label(index + 1)} side="right" />

          <div className="relative mx-auto max-w-[760px]">
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.article
                key={p.id}
                custom={dir}
                variants={reduced ? undefined : variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: DUR.enter, ease: EASE.ENTER }}
                className="relative aspect-[16/11] overflow-hidden rounded-card"
              >
                <img
                  src={p.image}
                  alt={p.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {/* Two scrims, not one: the top carries the title block and the
                    bottom carries the badge, and a single full-height gradient
                    would wash out the middle of the screenshot. */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(6,6,6,0.78) 0%, rgba(6,6,6,0.12) 40%, rgba(6,6,6,0.1) 58%, rgba(6,6,6,0.85) 100%)",
                  }}
                />

                <div className="absolute inset-x-0 top-0 p-6 md:p-8">
                  <h3 className="font-display text-[34px] leading-none md:text-[42px]">
                    {p.title}
                  </h3>
                  <p
                    className="mt-3 max-w-sm text-sm leading-[1.55]"
                    style={{ color: "var(--muted)" }}
                  >
                    {p.description}
                  </p>
                </div>

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 md:p-8">
                  <div className="flex flex-wrap gap-2">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-chip px-2.5 py-1 text-xs leading-none"
                        style={{
                          background: "rgba(255,255,255,0.12)",
                          color: "var(--fg)",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <p
                    className="font-display shrink-0 text-right text-lg leading-none md:text-2xl"
                    style={{ color: "var(--fg)" }}
                  >
                    {p.badge}
                  </p>
                </div>
              </motion.article>
            </AnimatePresence>

            {/* Controls */}
            <div className="mt-6 flex items-center justify-between gap-4">
              <div className="flex gap-2">
                {[
                  { icon: ArrowLeft, step: -1, label: "Previous project" },
                  { icon: ArrowRight, step: 1, label: "Next project" },
                ].map(({ icon: Icon, step, label: aria }) => (
                  <button
                    key={aria}
                    onClick={() => go(step)}
                    aria-label={aria}
                    className="flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300 hover:brightness-125"
                    style={{ background: "var(--surface-2)", color: "var(--fg)" }}
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                {p.demo && (
                  <Pill
                    as="a"
                    href={p.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="!px-4 !py-2.5 !text-sm"
                  >
                    Live demo
                    <ArrowUpRight size={14} className="-ml-1" />
                  </Pill>
                )}
                <Pill
                  as="a"
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="ghost"
                  className="!px-4 !py-2.5 !text-sm"
                >
                  <Github size={14} className="-mr-0.5" />
                  Source
                </Pill>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
