import { motion, useScroll, useTransform } from "framer-motion"
import { useState } from "react"
import { TypingTerminal } from "./Terminal"
import MagneticButton from "./MagneticButton"
import CountUp from "./CountUp"
import { usePrefersReducedMotion, useLowPower } from "../context/motion"
import portfolioData from "../data/portfolioData.json"

const EASE = [0.22, 1, 0.36, 1]

/**
 * One letter of the kinetic name. The outer span handles the intro rise
 * (clip reveal), the inner span carries the scroll-linked settle so the
 * two transforms never fight over the same property.
 *
 * `lite` drops the scroll-linked layer entirely. The full version creates three
 * motion values per letter (33 across the name), each writing transform+opacity
 * to its own span on every scroll frame — far too much for a phone.
 */
function KineticLetter({ ch, i, scrollY, delay, reduced, introDone, lite }) {
  const y = useTransform(scrollY, [0, 500], [0, -(18 + i * 12)])
  const opacity = useTransform(scrollY, [0, 320 + i * 35], [1, 0.1])
  const skewX = useTransform(scrollY, [0, 500], [0, -(1.5 + i * 0.5)])

  if (reduced) return <span className="inline-block">{ch}</span>

  // Intro rise still plays on mobile; only the per-frame scroll work is cut.
  if (lite) {
    return (
      <span className="inline-block overflow-hidden align-bottom">
        <motion.span
          className="inline-block"
          initial={{ y: "110%" }}
          animate={{ y: introDone ? "0%" : "110%" }}
          transition={{ duration: 0.7, delay, ease: EASE }}
        >
          {ch}
        </motion.span>
      </span>
    )
  }

  return (
    <span className="inline-block overflow-hidden align-bottom">
      <motion.span
        className="inline-block will-change-transform"
        initial={{ y: "110%" }}
        animate={{ y: introDone ? "0%" : "110%" }}
        transition={{ duration: 0.7, delay, ease: EASE }}
      >
        <motion.span className="inline-block" style={{ y, opacity, skewX }}>
          {ch}
        </motion.span>
      </motion.span>
    </span>
  )
}

function KineticLine({ text, className = "", scrollY, baseDelay, reduced, introDone, lite }) {
  return (
    <span className={"block " + className} aria-hidden="true">
      {text.split("").map((ch, i) => (
        <KineticLetter
          key={i}
          ch={ch}
          i={i}
          scrollY={scrollY}
          delay={baseDelay + i * 0.045}
          reduced={reduced}
          introDone={introDone}
          lite={lite}
        />
      ))}
    </span>
  )
}

export default function HeroBold({ introDone = true }) {
  const reduced = usePrefersReducedMotion()
  const lowPower = useLowPower()
  const { scrollY } = useScroll()
  const hintOpacity = useTransform(scrollY, [0, 100], [1, 0])
  // Parallax: text column climbs faster than the portrait, so the layers
  // separate against the fixed grid/shader background. Desktop only — on a
  // phone this forces a main-thread transform write every scroll frame.
  const textY = useTransform(scrollY, [0, 600], [0, -90])
  const portraitY = useTransform(scrollY, [0, 600], [0, 50])
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const leetcodeSolved = portfolioData.leetcode?.stats?.totalSolved || 400
  const projectsShipped = portfolioData.github?.length || 12
  const showStats = introDone || reduced
  const heavy = !reduced && !lowPower

  // Intro helper: fade-rise gated on the loader having fully exited.
  const intro = (delay) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: introDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
          transition: { duration: 0.6, delay, ease: EASE },
        }

  return (
    <section id="hero" className="relative flex min-h-screen items-center px-6 md:px-16 py-20">
      <div className="w-full max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">

        {/* Left: Text Content */}
        <motion.div style={heavy ? { y: textY } : undefined} className="flex flex-col justify-center">
          {/* Eyebrow */}
          <motion.p
            {...intro(0)}
            className="mb-6 text-xs md:text-sm tracking-[0.35em] text-[var(--accent)]"
          >
            CS STUDENT · FULL-STACK DEVELOPER · OWASP PRESIDENT
          </motion.p>

          {/* Kinetic name: letters rise on intro, un-settle with stagger on scroll */}
          <h1
            aria-label="Aayush Kumar"
            className="font-display uppercase leading-[0.82] text-[16vw] md:text-[8vw] lg:text-[7vw]"
          >
            <KineticLine
              text="Aayush"
              scrollY={scrollY}
              baseDelay={0.1}
              reduced={reduced}
              introDone={introDone}
              lite={lowPower}
            />
            <KineticLine
              text="Kumar"
              className="text-[var(--accent)]"
              scrollY={scrollY}
              baseDelay={0.25}
              reduced={reduced}
              introDone={introDone}
              lite={lowPower}
            />
          </h1>

          {/* Stats */}
          <motion.div
            {...intro(0.6)}
            className="mt-8 flex flex-wrap gap-x-10 gap-y-2 text-sm md:text-base text-[var(--muted)]"
          >
            <span>
              <b className="text-[var(--fg)]">
                {showStats ? <CountUp end={leetcodeSolved} suffix="+" /> : "0"}
              </b>{" "}
              DSA Problems Solved
            </span>
            <span>
              <b className="text-[var(--fg)]">
                {showStats ? <CountUp end={projectsShipped} duration={1.4} suffix="+" /> : "0"}
              </b>{" "}
              Projects Shipped
            </span>
            <span>
              <b className="text-[var(--fg)]">
                {showStats ? <CountUp end={3} duration={1} suffix="×" /> : "0"}
              </b>{" "}
              Hackathon Finalist
            </span>
          </motion.div>

          {/* Terminal */}
          <motion.div
            {...intro(0.75)}
            className="mt-8 max-w-lg"
          >
            <TypingTerminal
              className="h-[380px] sm:h-[320px]"
              title="aayush@portfolio — zsh"
              path="~"
              steps={[
                { cmd: "whoami", out: "Aayush Kumar — CS student, full-stack dev & OWASP President" },
                { cmd: "cat skills.txt", out: "React · Next.js · Node · Python · C++ · LangChain · OpenCV" },
                { cmd: "ls projects/", out: "auralis  deskguard  mindflow  leadforge  beatzy  civicresolve" },
                { cmd: "cat achievements.txt", out: "🏆 3rd @ NIT Trichy · GS Hackathon · Samsung ennovateX" },
                { cmd: "echo $ROLE", out: "President — OWASP Student Chapter, NIE Mysore" },
                { cmd: "./launch --status", out: "🚀 open to internships & collaboration" },
              ]}
            />
          </motion.div>

          {/* CTA */}
          <motion.div {...intro(0.9)} className="mt-10 w-fit">
            <MagneticButton
              as={motion.a}
              href="#projects"
              className="inline-flex w-fit items-center gap-3 rounded-full bg-[var(--accent)] px-7 py-3 text-sm font-semibold uppercase tracking-wider text-[var(--accent-ink)] transition-all duration-300 hover:gap-5"
            >
              View work →
            </MagneticButton>
          </motion.div>
        </motion.div>

        {/* Right: Portrait */}
        <motion.div
          style={heavy ? { y: portraitY } : undefined}
          initial={reduced ? false : { opacity: 0, scale: 0.94, x: 40 }}
          animate={
            reduced
              ? {}
              : introDone
                ? { opacity: 1, scale: 1, x: 0 }
                : { opacity: 0, scale: 0.94, x: 40 }
          }
          transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
          className="relative flex justify-center md:justify-end"
        >
          {/* Accent glow background. Animating scale on a 100px blur re-rasterizes
              a full-size gaussian every frame, so phones get a static glow. */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={
              heavy
                ? { opacity: imageLoaded ? [0.1, 0.2, 0.1] : 0, scale: [1, 1.1, 1] }
                : { opacity: imageLoaded ? 0.15 : 0, scale: 1 }
            }
            transition={
              heavy
                ? {
                    opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                    scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                  }
                : { duration: 0.6 }
            }
            className={heavy ? "absolute inset-0 blur-[100px]" : "absolute inset-0 blur-[60px]"}
            style={{
              background: `radial-gradient(circle at center, var(--accent), transparent 60%)`,
            }}
          />

          {/* Portrait container */}
          <motion.div
            className="relative w-full max-w-md"
            animate={heavy ? { y: [0, -10, 0] } : {}}
            transition={
              heavy
                ? { duration: 4, repeat: Infinity, ease: "easeInOut" }
                : undefined
            }
          >
            {/* Animated border — the conic sweep is a continuous repaint, desktop only */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: introDone ? 1 : 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="absolute -inset-[3px] rounded-3xl"
            >
              <motion.div
                animate={heavy ? { rotate: 360 } : {}}
                transition={
                  heavy
                    ? { duration: 8, repeat: Infinity, ease: "linear" }
                    : undefined
                }
                className="absolute inset-0 rounded-3xl"
                style={{
                  background: `conic-gradient(from 0deg, var(--accent), transparent 60%, transparent 80%, var(--accent))`,
                }}
              />
            </motion.div>

            {/* Image container with tilt on hover */}
            <motion.div
              className="relative rounded-3xl overflow-hidden"
              style={{ background: "var(--surface)" }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              whileHover={heavy ? { scale: 1.02, rotateY: 5, rotateX: -5 } : undefined}
              transition={{ duration: 0.3 }}
            >
              {/* Responsive portrait: a phone pulls the 448px webp (~24KB) instead
                  of the original 3072x4080 JPEG, cutting decode by ~26x. */}
              <picture>
                <source
                  type="image/webp"
                  srcSet="/portrait-448.webp 448w, /portrait-896.webp 896w"
                  sizes="(max-width: 768px) 90vw, 448px"
                />
                <source
                  type="image/jpeg"
                  srcSet="/portrait-448.jpg 448w, /portrait-896.jpg 896w"
                  sizes="(max-width: 768px) 90vw, 448px"
                />
                <motion.img
                  src="/portrait-896.jpg"
                  alt="Portrait of Aayush Kumar - Full-stack developer and CS student"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  width={896}
                  height={1190}
                  className="w-full h-auto object-cover"
                  style={{ aspectRatio: "3/4" }}
                  initial={
                    heavy
                      ? { scale: 1.15, filter: "grayscale(1) brightness(0.7)" }
                      : false
                  }
                  animate={
                    heavy
                      ? {
                          scale: isHovered ? 1.05 : 1,
                          filter: isHovered
                            ? "grayscale(0) brightness(1)"
                            : imageLoaded
                              ? "grayscale(1) brightness(0.9)"
                              : "grayscale(1) brightness(0.7)",
                        }
                      : {}
                  }
                  transition={{ scale: { duration: 0.3 }, filter: { duration: 0.4 } }}
                  onLoad={() => setImageLoaded(true)}
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.parentElement.style.background = `linear-gradient(135deg, var(--surface), var(--bg))`
                  }}
                />
              </picture>

              {/* Overlay gradient */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(to top, var(--bg) 0%, transparent 40%)`,
                  opacity: 0.6,
                }}
              />

              {/* Shine effect on hover */}
              {heavy && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(110deg, transparent 40%, rgba(212, 255, 63, 0.1) 50%, transparent 60%)`,
                    backgroundSize: "200% 100%",
                  }}
                  initial={{ backgroundPosition: "-200% 0" }}
                  whileHover={{ backgroundPosition: "200% 0" }}
                  transition={{ duration: 0.8 }}
                />
              )}
            </motion.div>

            {/* Floating badge with pulse */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={
                introDone
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: 20, scale: 0.8 }
              }
              transition={{ duration: 0.6, delay: 1.1, ease: EASE }}
              whileHover={heavy ? { scale: 1.05, y: -2 } : undefined}
              className={
                "absolute -bottom-4 -left-4 px-5 py-3 rounded-2xl border cursor-pointer" +
                (heavy ? " backdrop-blur-xl" : "")
              }
              style={{
                background: heavy ? "rgba(10, 10, 11, 0.9)" : "#0d0d0f",
                borderColor: "var(--line)",
              }}
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={heavy ? { scale: [1, 1.3, 1], opacity: [1, 0.6, 1] } : {}}
                  transition={
                    heavy
                      ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                      : undefined
                  }
                  className="w-2 h-2 rounded-full"
                  style={{ background: "var(--accent)" }}
                />
                <p
                  className="text-xs font-mono tracking-wider"
                  style={{ color: "var(--accent)" }}
                >
                  Available for opportunities
                </p>
              </div>
            </motion.div>

            {/* Floating particles */}
            {heavy && [...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  background: "var(--accent)",
                  opacity: 0.4,
                  left: `${20 + i * 30}%`,
                  top: `${30 + i * 20}%`,
                }}
                animate={{
                  y: [-20, -40, -20],
                  x: [0, 10, 0],
                  opacity: [0, 0.6, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.8,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        style={heavy ? { opacity: hintOpacity } : undefined}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--accent)] pointer-events-none"
      >
        <motion.span
          animate={heavy ? { y: [0, 8, 0] } : {}}
          transition={
            heavy ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : undefined
          }
          className="text-xs tracking-widest uppercase"
        >
          Scroll
        </motion.span>
        <motion.svg
          animate={heavy ? { y: [0, 6, 0] } : {}}
          transition={
            heavy
              ? { duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }
              : undefined
          }
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </motion.svg>
      </motion.div>
    </section>
  )
}
