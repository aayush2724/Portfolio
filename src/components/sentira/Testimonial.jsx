import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Reveal from "../Reveal"
import { Card } from "./ui"
import { EASE, DUR } from "../../context/ease"
import { usePrefersReducedMotion } from "../../context/motion"

/**
 * Quote panel beside an image panel. The quote is set in the display serif at
 * near-heading size — in the reference this is the largest body-ish text on the
 * page, and shrinking it to a normal blockquote loses the whole effect.
 *
 * Three quotes share one frame. The frame is a fixed min-height so advancing
 * between quotes of different lengths doesn't shift the image panel beside it.
 */

const QUOTES = [
  {
    id: 1,
    text: "Aayush is the kind of teammate who turns chaos into shipped products. During ThinkRoot x Vortex'26 he built the entire LeadForge backend in under 8 hours while I handled the front end.",
    name: "Kaki Harshita",
    role: "Hackathon teammate",
  },
  {
    id: 2,
    text: "He consistently demonstrates strong problem-solving and a genuine passion for building impactful software. Citizen Resolver showed real-world full-stack development applied to civic tech.",
    name: "NIE Faculty",
    role: "The National Institute of Engineering, Mysore",
  },
  {
    id: 3,
    text: "I've reviewed several of his repositories. The code is clean, well documented and follows best practices — AlgoVision in particular is a genuinely good educational resource.",
    name: "Open Source Contributor",
    role: "GitHub community",
  },
]

const variants = {
  enter: (dir) => ({ opacity: 0, y: dir > 0 ? 24 : -24 }),
  center: { opacity: 1, y: 0 },
  exit: (dir) => ({ opacity: 0, y: dir > 0 ? -24 : 24 }),
}

export default function Testimonial() {
  const [[index, dir], setState] = useState([0, 1])
  const reduced = usePrefersReducedMotion()
  const q = QUOTES[index]

  const go = (step) =>
    setState(([i]) => [(i + step + QUOTES.length) % QUOTES.length, step])

  return (
    <section className="relative px-5 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1180px]">
        <Reveal>
          <div className="grid gap-4 md:grid-cols-[1.1fr_1fr]">
            {/* Quote panel */}
            <Card className="flex min-h-[420px] flex-col p-8 md:p-10">
              <span
                className="font-display select-none text-[64px] leading-[0.5]"
                style={{ color: "var(--accent)" }}
                aria-hidden="true"
              >
                &rdquo;
              </span>

              <div className="relative mt-10 flex-1">
                <AnimatePresence mode="wait" custom={dir} initial={false}>
                  <motion.blockquote
                    key={q.id}
                    custom={dir}
                    variants={reduced ? undefined : variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: DUR.enter, ease: EASE.ENTER }}
                    className="font-display text-[26px] leading-[1.3] md:text-[32px]"
                  >
                    {q.text}
                  </motion.blockquote>
                </AnimatePresence>
              </div>

              <div className="mt-10 flex items-end justify-between gap-6">
                <figcaption>
                  <p className="text-[15px] font-semibold">{q.name}</p>
                  <p className="mt-0.5 text-sm" style={{ color: "var(--muted)" }}>
                    {q.role}
                  </p>
                </figcaption>

                <div className="flex shrink-0 gap-2">
                  {[
                    { icon: ArrowLeft, step: -1, label: "Previous quote" },
                    { icon: ArrowRight, step: 1, label: "Next quote" },
                  ].map(({ icon: Icon, step, label }) => (
                    <button
                      key={label}
                      onClick={() => go(step)}
                      aria-label={label}
                      className="flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-300 hover:brightness-125"
                      style={{ background: "var(--surface-2)", color: "var(--fg)" }}
                    >
                      <Icon size={15} />
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Image panel */}
            <Card className="relative min-h-[420px] overflow-hidden">
              <picture>
                <source srcSet="/Beatzy-800.webp" type="image/webp" />
                <img
                  src="/Beatzy-800.jpg"
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ filter: "saturate(0.85) brightness(0.9)" }}
                />
              </picture>
            </Card>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
